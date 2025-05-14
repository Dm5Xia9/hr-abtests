using AdaptationServer.Data;
using AdaptationServer.Models;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Npgsql;
using System.Security.Claims;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddHttpContextAccessor();

var dataSourceBuilder = new NpgsqlDataSourceBuilder(builder.Configuration.GetConnectionString("DefaultConnection"));
dataSourceBuilder.EnableDynamicJson();
var dataSource = dataSourceBuilder.Build();
// Configure DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseNpgsql(dataSource);
});

builder.Services.AddScoped<DbContext>(p => p.GetRequiredService<ApplicationDbContext>());
// Configure Identity
builder.Services.AddIdentity<User, IdentityRole<Guid>>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequiredLength = 8;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// Configure Authentication
builder.Services.AddAuthentication(options =>
{
    // Set both options to allow multiple authentication types
    options.DefaultAuthenticateScheme = "MultiScheme";
    options.DefaultChallengeScheme = "MultiScheme";
    options.DefaultScheme = "MultiScheme";
})
// Add multi-scheme authentication handler
.AddPolicyScheme("MultiScheme", "Cookie or JWT", options =>
{
    options.ForwardDefaultSelector = context =>
    {
        // Check if the request contains the JWT bearer token
        string authorization = context.Request.Headers.Authorization;
        if (!string.IsNullOrEmpty(authorization) && authorization.StartsWith("Bearer "))
            return JwtBearerDefaults.AuthenticationScheme;

        // Otherwise use cookies
        return CookieAuthenticationDefaults.AuthenticationScheme;
    };
})
.AddCookie(CookieAuthenticationDefaults.AuthenticationScheme, options =>
{
    options.Cookie.Name = "AdaptationServer.Auth";
    options.Cookie.HttpOnly = true;
    options.ExpireTimeSpan = TimeSpan.FromDays(30);
    options.SlidingExpiration = true;
    options.Cookie.SameSite = SameSiteMode.Lax; // Change to Strict in production with HTTPS

    // For API responses
    options.Events.OnRedirectToLogin = context =>
    {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        return Task.CompletedTask;
    };
    options.Events.OnRedirectToAccessDenied = context =>
    {
        context.Response.StatusCode = StatusCodes.Status403Forbidden;
        return Task.CompletedTask;
    };
})
.AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not found")))
    };
});

// Configure Authorization
builder.Services.AddScoped<IAuthorizationHandler, CompanyRoleHandler>();
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireAdminRole", policy =>
        policy.Requirements.Add(new CompanyRoleRequirement("admin")));

    options.AddPolicy("RequireManagerRole", policy =>
        policy.Requirements.Add(new CompanyRoleRequirement(new[] { "admin", "manager" })));

    options.AddPolicy("RequireObserverRole", policy =>
        policy.Requirements.Add(new CompanyRoleRequirement(new[] { "admin", "manager", "observer" })));
});

// Configure Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Adaptation Admin API",
        Version = "v1",
        Description = "API for managing employee adaptation process"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer"
    });

    c.AddSecurityDefinition("Cookie", new OpenApiSecurityScheme
    {
        Description = "Cookie authentication",
        Name = "Cookie",
        In = ParameterLocation.Cookie,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "cookie"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        },
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Cookie"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(
                builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ??
                new[] { "http://localhost:5173" })
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials(); // Important for cookies
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

//// Apply migrations at startup
//using (var scope = app.Services.CreateScope())
//{
//    var services = scope.ServiceProvider;
//    try
//    {
//        var context = services.GetRequiredService<ApplicationDbContext>();
//        context.Database.Migrate();
//    }
//    catch (Exception ex)
//    {
//        var logger = services.GetRequiredService<ILogger<Program>>();
//        logger.LogError(ex, "An error occurred while migrating the database.");
//    }
//}

app.Run();

// Authorization Classes
public class CompanyRoleRequirement : IAuthorizationRequirement
{
    public string[] AllowedRoles { get; }

    public CompanyRoleRequirement(string role)
    {
        AllowedRoles = new[] { role };
    }

    public CompanyRoleRequirement(string[] roles)
    {
        AllowedRoles = roles;
    }
}

public class CompanyRoleHandler : AuthorizationHandler<CompanyRoleRequirement>
{
    private readonly ApplicationDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CompanyRoleHandler(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        CompanyRoleRequirement requirement)
    {
        if (!context.User.Identity!.IsAuthenticated)
        {
            return;
        }

        var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
        {
            return;
        }

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userGuid);

        if (user == null || !user.CurrentCompanyId.HasValue)
        {
            return;
        }

        var companyMember = await _context.CompanyMembers
            .FirstOrDefaultAsync(cm => cm.UserId == userGuid && cm.CompanyProfileId == user.CurrentCompanyId);

        if (companyMember != null && requirement.AllowedRoles.Contains(companyMember.Role))
        {
            context.Succeed(requirement);
        }
    }
}
