using AdaptationServer.Data;
using AdaptationServer.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace AdaptationServer.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AuthController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly IConfiguration _configuration;
    private readonly ApplicationDbContext _context;

    public AuthController(
        UserManager<User> userManager,
        SignInManager<User> signInManager,
        IConfiguration configuration,
        ApplicationDbContext context)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _configuration = configuration;
        _context = context;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequest model)
    {
        var user = await _userManager.FindByEmailAsync(model.Email);
        if (user == null)
        {
            return Unauthorized(new { message = "Invalid credentials" });
        }

        var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);
        if (!result.Succeeded)
        {
            return Unauthorized(new { message = "Invalid credentials" });
        }

        // Update last login
        user.LastLogin = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);

        // Get user's company role if they have a current company
        string role = "guest";
        if (user.CurrentCompanyId.HasValue)
        {
            var companyMember = await _context.CompanyMembers
                .FirstOrDefaultAsync(cm => cm.UserId == user.Id && cm.CompanyProfileId == user.CurrentCompanyId);
            if (companyMember != null)
            {
                role = companyMember.Role;
            }
        }

        // Create claims for the user
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email!),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Role, role)
        };

        // Add company claim if available
        if (user.CurrentCompanyId.HasValue)
        {
            claims.Add(new Claim("CompanyId", user.CurrentCompanyId.Value.ToString()));
        }

        // Sign in the user using cookies
        var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        var authProperties = new AuthenticationProperties
        {
            IsPersistent = true,
            ExpiresUtc = DateTimeOffset.UtcNow.AddDays(30)
        };

        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            new ClaimsPrincipal(claimsIdentity),
            authProperties);

        // Also generate a JWT token for clients that prefer token-based auth
        var token = GenerateJwtToken(user, role);

        return Ok(new LoginResponse
        {
            Token = token,
            User = new
            {
                Id = user.Id.ToString(),
                Email = user.Email,
                Name = user.Name,
                Role = role,
                CreatedAt = user.CreatedAt.ToString("o"),
                LastLogin = user.LastLogin?.ToString("o"),
                CurrentCompanyId = user.CurrentCompanyId?.ToString()
            }
        });
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] RegisterRequest model)
    {
        var existUser = await _userManager.FindByEmailAsync(model.Email);
        if (existUser != null)
        {
            if (model.CompanyProfileId != null && model.Role != null)
            {
                var includedUser = _context.Users
                .Include(p => p.CompanyMemberships)
                .FirstOrDefault(p => p.Id == existUser.Id);

                if (includedUser!.CompanyMemberships.Any(p => p.CompanyProfileId == model.CompanyProfileId.Value))
                {
                    return BadRequest(new { message = "User already added" });
                }


                var companyMember = new CompanyMember
                {
                    UserId = includedUser.Id,
                    CompanyProfileId = model.CompanyProfileId.Value,
                    Role = model.Role!,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.CompanyMembers.Add(companyMember);

                await _context.SaveChangesAsync();

                return Ok();
            }

            return BadRequest(new { message = "Email already exists" });
        }

        var user = new User
        {
            UserName = model.Email,
            Email = model.Email,
            Name = model.Name,
            CreatedAt = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(user, model.Password);
        if (!result.Succeeded)
        {
            return BadRequest(new { message = "Failed to create user", errors = result.Errors });
        }

        // If company profile ID is provided, create company membership
        if (model.CompanyProfileId.HasValue)
        {
            var companyProfile = await _context.CompanyProfiles.FindAsync(model.CompanyProfileId.Value);
            if (companyProfile != null)
            {
                var companyMember = new CompanyMember
                {
                    UserId = user.Id,
                    CompanyProfileId = companyProfile.Id,
                    Role = model.Role ?? "member",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.CompanyMembers.Add(companyMember);

                // Set as current company
                user.CurrentCompanyId = companyProfile.Id;
                await _userManager.UpdateAsync(user);

                await _context.SaveChangesAsync();
            }
        }

        return Ok(new { message = "User created successfully" });
    }
    //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
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return Ok(new { message = "Logged out successfully" });
    }

    private string GenerateJwtToken(User user, string role)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email!),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Role, role)
        };

        // Add company claim if available
        if (user.CurrentCompanyId.HasValue)
        {
            claims.Add(new Claim("CompanyId", user.CurrentCompanyId.Value.ToString()));
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires = DateTime.Now.AddMinutes(Convert.ToDouble(_configuration["Jwt:ExpiryInMinutes"]));

        var token = new JwtSecurityToken(
            _configuration["Jwt:Issuer"],
            _configuration["Jwt:Audience"],
            claims,
            expires: expires,
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

public class LoginRequest
{
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
}

public class RegisterRequest
{
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? Role { get; set; }
    public Guid? CompanyProfileId { get; set; }
}

public class LoginResponse
{
    public string Token { get; set; } = null!;
    public object User { get; set; } = null!;
}