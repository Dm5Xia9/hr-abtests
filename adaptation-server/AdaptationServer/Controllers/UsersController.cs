using AdaptationServer.Data;
using AdaptationServer.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Security.Cryptography;

namespace AdaptationServer.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly ApplicationDbContext _context;

    public UsersController(UserManager<User> userManager, ApplicationDbContext context)
    {
        _userManager = userManager;
        _context = context;
    }

    [HttpGet("current")]
    public async Task<ActionResult<User>> GetCurrentUser()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
        {
            return NotFound(new { message = "User not found" });
        }

        var user = await _context.Users
            .Include(u => u.CurrentCompany)
            .FirstOrDefaultAsync(u => u.Id == userGuid);

        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        var companyMember = await _context.CompanyMembers
            .FirstOrDefaultAsync(cm => cm.UserId == user.Id && cm.CompanyProfileId == user.CurrentCompanyId);

        return Ok(new
        {
            id = user.Id.ToString(),
            email = user.Email,
            name = user.Name,
            role = companyMember?.Role ?? "guest",
            createdAt = user.CreatedAt.ToString("o"),
            lastLogin = user.LastLogin?.ToString("o"),
            currentCompanyId = user.CurrentCompanyId?.ToString()
        });
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<User>>> GetUsers()
    {
        var (_, companyId) = await GetUserAndCompanyId();
        if (!companyId.HasValue)
        {
            return BadRequest(new { message = "User does not have a current company" });
        }

        var users = (await _context.Users
            .Include(p => p.CompanyMemberships)
            .Where(p => p.CompanyMemberships.Any(p => p.CompanyProfileId == companyId))
            .ToListAsync())
            .Select(u => new
            {
                id = u.Id.ToString(),
                email = u.Email,
                name = u.Name,
                createdAt = u.CreatedAt.ToString("o"),
                lastLogin = u.LastLogin?.ToString("o"),
                currentCompanyId = u.CurrentCompanyId?.ToString(),
                role = u.CompanyMemberships
                    .First(p => p.CompanyProfileId == companyId)
                    .Role
            });

        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<User>> GetUser(Guid id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        // Get the user's role in their current company
        string? role = null;
        if (user.CurrentCompanyId.HasValue)
        {
            var companyMember = await _context.CompanyMembers
                .FirstOrDefaultAsync(cm => cm.UserId == user.Id && cm.CompanyProfileId == user.CurrentCompanyId);
            role = companyMember?.Role;
        }

        return Ok(new
        {
            id = user.Id.ToString(),
            email = user.Email,
            name = user.Name,
            role = role ?? "guest",
            createdAt = user.CreatedAt.ToString("o"),
            lastLogin = user.LastLogin?.ToString("o"),
            currentCompanyId = user.CurrentCompanyId?.ToString()
        });
    }

    [HttpPost]
    public async Task<ActionResult<User>> CreateUser([FromBody] CreateUserRequest request)
    {
        if (await _userManager.FindByEmailAsync(request.Email) != null)
        {
            return BadRequest(new { message = "Email already exists" });
        }

        var user = new User
        {
            UserName = request.Email,
            Email = request.Email,
            Name = request.Name,
            CreatedAt = DateTime.UtcNow
        };

        var guid = GenerateIdentityPassword();

        var result = await _userManager.CreateAsync(user, guid);
        if (!result.Succeeded)
        {
            return BadRequest(new { message = "Failed to create user", errors = result.Errors });
        }

        // If company ID is provided, create the company membership
        if (request.CompanyProfileId.HasValue)
        {
            var companyProfile = await _context.CompanyProfiles.FindAsync(request.CompanyProfileId.Value);
            if (companyProfile != null)
            {
                var companyMember = new CompanyMember
                {
                    UserId = user.Id,
                    CompanyProfileId = companyProfile.Id,
                    Role = request.Role ?? "member",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.CompanyMembers.Add(companyMember);

                // Set as current company
                user.CurrentCompanyId = companyProfile.Id;
                _context.Entry(user).State = EntityState.Modified;

                await _context.SaveChangesAsync();
            }
        }

        return CreatedAtAction(nameof(GetUser), new { id = user.Id }, new
        {
            id = user.Id.ToString(),
            email = user.Email,
            name = user.Name,
            role = request.Role ?? "guest",
            createdAt = user.CreatedAt.ToString("o"),
            currentCompanyId = user.CurrentCompanyId?.ToString()
        });
    }

    private async Task<(Guid userId, Guid? companyId)> GetUserAndCompanyId()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await _context.Users.FindAsync(userId);
        return (userId, user?.CurrentCompanyId);
    }


    public static string GenerateIdentityPassword(int length = 12)
    {
        const string validChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()_-+=[{]};:<>|./?";

        // Generate cryptographically secure random bytes
        byte[] randomBytes = new byte[length];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(randomBytes);
        }

        // Convert bytes to characters
        char[] chars = new char[length];
        for (int i = 0; i < length; i++)
        {
            chars[i] = validChars[randomBytes[i] % validChars.Length];
        }

        string password = new string(chars);

        // Verify that the password meets Identity requirements
        if (!password.Any(char.IsDigit) ||
            !password.Any(char.IsLower) ||
            !password.Any(char.IsUpper) ||
            !password.Any(c => !char.IsLetterOrDigit(c)))
        {
            // If not compliant, generate another password
            return GenerateIdentityPassword(length);
        }

        return password;
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserRequest request)
    {
        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        user.Name = request.Name;
        user.Email = request.Email;
        user.UserName = request.Email;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            return BadRequest(new { message = "Failed to update user", errors = result.Errors });
        }

        // Get the user's role in their current company
        string? role = null;
        if (user.CurrentCompanyId.HasValue)
        {
            var companyMember = await _context.CompanyMembers
                .FirstOrDefaultAsync(cm => cm.UserId == user.Id && cm.CompanyProfileId == user.CurrentCompanyId);
            role = companyMember?.Role;
        }

        return Ok(new
        {
            id = user.Id.ToString(),
            email = user.Email,
            name = user.Name,
            role = role ?? "guest",
            createdAt = user.CreatedAt.ToString("o"),
            lastLogin = user.LastLogin?.ToString("o"),
            currentCompanyId = user.CurrentCompanyId?.ToString()
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        var result = await _userManager.DeleteAsync(user);
        if (!result.Succeeded)
        {
            return BadRequest(new { message = "Failed to delete user", errors = result.Errors });
        }

        return NoContent();
    }

    [HttpPost("{id}/reset-password")]
    public async Task<IActionResult> ResetPassword(Guid id)
    {
        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var newPassword = GenerateRandomPassword();
        var result = await _userManager.ResetPasswordAsync(user, token, newPassword);

        if (!result.Succeeded)
        {
            return BadRequest(new { message = "Failed to reset password", errors = result.Errors });
        }

        // TODO: Send email with new password
        // For now, we'll return it in the response (in production, this should be sent via email)
        return Ok(new { message = "Password reset successful", newPassword });
    }

    [HttpPut("{id}/role")]
    public async Task<IActionResult> ChangeRole(Guid id, [FromBody] ChangeRoleRequest request)
    {
        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        if (!user.CurrentCompanyId.HasValue)
        {
            return BadRequest(new { message = "User does not have a current company" });
        }

        var companyMember = await _context.CompanyMembers
            .FirstOrDefaultAsync(cm => cm.UserId == user.Id && cm.CompanyProfileId == user.CurrentCompanyId);

        if (companyMember == null)
        {
            return NotFound(new { message = "User is not a member of the current company" });
        }

        companyMember.Role = request.Role;
        companyMember.UpdatedAt = DateTime.UtcNow;

        _context.Entry(companyMember).State = EntityState.Modified;
        await _context.SaveChangesAsync();

        return Ok(new
        {
            id = user.Id.ToString(),
            email = user.Email,
            name = user.Name,
            role = companyMember.Role,
            createdAt = user.CreatedAt.ToString("o"),
            lastLogin = user.LastLogin?.ToString("o"),
            currentCompanyId = user.CurrentCompanyId?.ToString()
        });
    }

    private string GenerateRandomPassword()
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
        var random = new Random();
        var password = new char[12];

        for (int i = 0; i < password.Length; i++)
        {
            password[i] = chars[random.Next(chars.Length)];
        }

        return new string(password);
    }
}

public class CreateUserRequest
{
    public string Email { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? Role { get; set; }
    public Guid? CompanyProfileId { get; set; }
}

public class UpdateUserRequest
{
    public string Email { get; set; } = null!;
    public string Name { get; set; } = null!;
}

public class ChangeRoleRequest
{
    public string Role { get; set; } = null!;
}