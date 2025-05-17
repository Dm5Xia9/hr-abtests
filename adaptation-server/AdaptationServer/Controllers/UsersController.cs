using AdaptationServer.Data;
using AdaptationServer.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using System.Security.Cryptography;

namespace AdaptationServer.Controllers;

// DTO classes
public class EmployeeTrackDTO
{
    public Guid TrackId { get; set; }
    public Guid? MentorId { get; set; }
    public DateTime AssignedDate { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    public string Status { get; set; } = null!;
}

public class EmployeeDTO
{
    public required Guid Id { get; set; }
    public string FullName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? Phone { get; set; }
    public required Guid? DepartmentId { get; set; }
    public required Guid? PositionId { get; set; }
    public required DateTime? HireDate { get; set; }
    public required DateTime? LastLogin { get; set; }
    public required string Role { get; set; }
    public required Guid CurrentCompanyId { get; set; }
    public required DateTime CreateAt { get; set; }
    public required IEnumerable<EmployeeTrackDTO> AssignedTracks { get; set; } = [];
}

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
    public async Task<ActionResult<EmployeeDTO>> GetCurrentUser()
    {
        var (_, companyId) = await GetUserAndCompanyId();
        if (!companyId.HasValue)
        {
            return BadRequest(new { message = "User does not have a current company" });
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
        {
            return NotFound(new { message = "User not found" });
        }

        var user = await _context.Users
            .Include(u => u.CurrentCompany)
            .Include(p => p.CompanyMemberships)
            .Include(p => p.AssignedTracks)
            .FirstOrDefaultAsync(u => u.Id == userGuid);

        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        return Ok(Map(user, companyId.Value));
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<User>>> GetUsers()
    {
        var (_, companyId) = await GetUserAndCompanyId();
        if (!companyId.HasValue)
        {
            return BadRequest(new { message = "User does not have a current company" });
        }

        var employees = await _context.Users
            .Where(u => u.CompanyMemberships.Any(cm => cm.CompanyProfileId == companyId.Value))
            .Include(u => u.AssignedTracks)
            .Include(p => p.CompanyMemberships)
            .ToListAsync();

        return Ok(employees.Select(p => Map(p, companyId.Value)));
    }

    private EmployeeDTO Map(User u, Guid companyId)
    {
        return new EmployeeDTO
        {
            Id = u.Id,
            FullName = u.CompanyMemberships.First(p => p.CompanyProfileId == companyId).FullName ?? u.Name,
            Email = u.Email!,
            Phone = u.CompanyMemberships.First(p => p.CompanyProfileId == companyId).Phone,
            DepartmentId = u.CompanyMemberships.First(p => p.CompanyProfileId == companyId).DepartmentId,
            PositionId = u.CompanyMemberships.First(p => p.CompanyProfileId == companyId).PositionId,
            HireDate = u.CompanyMemberships.First(p => p.CompanyProfileId == companyId).HireDate,
            CreateAt = u.CreatedAt,
            CurrentCompanyId = u.CurrentCompanyId.Value,
            LastLogin = u.LastLogin,
            Role = u.CompanyMemberships.First(p => p.CompanyProfileId == companyId).Role,
            AssignedTracks = u.AssignedTracks.Select(t => new EmployeeTrackDTO
            {
                TrackId = t.TrackId,
                MentorId = t.MentorId,
                AssignedDate = t.AssignedDate,
                StartDate = t.StartDate,
                CompletedDate = t.CompletedDate,
                Status = t.Status
            })
        };
    }



    private EmployeeDTO Map(User u, CompanyMember member, Guid companyId)
    {
        return new EmployeeDTO
        {
            Id = u.Id,
            FullName = member.FullName ?? u.Name,
            Email = u.Email!,
            Phone = member.Phone,
            DepartmentId = member.DepartmentId,
            PositionId = member.PositionId,
            HireDate = member.HireDate,
            CreateAt = u.CreatedAt,
            CurrentCompanyId = u.CurrentCompanyId.Value,
            LastLogin = u.LastLogin,
            Role = member.Role,
            AssignedTracks = u.AssignedTracks.Select(t => new EmployeeTrackDTO
            {
                TrackId = t.TrackId,
                MentorId = t.MentorId,
                AssignedDate = t.AssignedDate,
                StartDate = t.StartDate,
                CompletedDate = t.CompletedDate,
                Status = t.Status
            })
        };
    }

    [HttpPost]
    public async Task<ActionResult<EmployeeDTO>> CreateUser([FromBody] CreateEmployeeRequest request)
    {
        var (_, companyId) = await GetUserAndCompanyId();
        if (!companyId.HasValue)
        {
            return BadRequest(new { message = "User does not have a current company" });
        }

        // Verify position and department exist in the same company
        if (request.PositionId.HasValue)
        {
            var position = await _context.Positions
                .FirstOrDefaultAsync(p => p.Id == request.PositionId.Value && p.CompanyProfileId == companyId.Value);

            if (position == null)
            {
                return BadRequest(new { message = "Position not found" });
            }
        }

        if (request.DepartmentId.HasValue)
        {
            var department = await _context.Departments
                .FirstOrDefaultAsync(d => d.Id == request.DepartmentId.Value && d.CompanyProfileId == companyId.Value);

            if (department == null)
            {
                return BadRequest(new { message = "Department not found" });
            }
        }

        // Check if user with this email already exists
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (existingUser != null)
        {
            // Add user to company if not already a member
            var existingMembership = await _context.CompanyMembers
                .FirstOrDefaultAsync(cm => cm.UserId == existingUser.Id && cm.CompanyProfileId == companyId.Value);

            if (existingMembership == null)
            {
                // Add user to company as an employee role
                existingMembership = new CompanyMember
                {
                    UserId = existingUser.Id,
                    CompanyProfileId = companyId.Value,
                    Role = "employee",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    FullName = request.FullName,
                    Phone = request.Phone,
                    PositionId = request.PositionId,
                    DepartmentId = request.DepartmentId,
                    HireDate = request.HireDate.ToUniversalTime()
                };

                _context.CompanyMembers.Add(existingMembership);
            }

            await _context.SaveChangesAsync();

            return Ok(Map(existingUser, existingMembership, companyId.Value));
        }
        else
        {
            // Create a temporary password
            var password = GenerateIdentityPassword();

            // Create a new user account with employee information
            var newUser = new User
            {
                UserName = request.Email,
                Email = request.Email,
                Name = request.FullName,
                CreatedAt = DateTime.UtcNow,
                CurrentCompanyId = companyId.Value
            };

            var result = await _userManager.CreateAsync(newUser, password);

            if (result.Succeeded)
            {
                // Add user to company as an employee
                var membership = new CompanyMember
                {
                    UserId = newUser.Id,
                    CompanyProfileId = companyId.Value,
                    Role = "employee",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    FullName = request.FullName,
                    Phone = request.Phone,
                    PositionId = request.PositionId,
                    DepartmentId = request.DepartmentId,
                    HireDate = request.HireDate.ToUniversalTime(),
                };

                _context.CompanyMembers.Add(membership);
                await _context.SaveChangesAsync();

                // TODO: Send email with temporary password


                return Ok(Map(newUser, membership, companyId.Value));
            }
            else
            {
                // Handle user creation error
                return BadRequest(new { message = $"Failed to create user account: {string.Join(", ", result.Errors.Select(e => e.Description))}" });
            }
        }
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
    public async Task<ActionResult<EmployeeDTO>> UpdateUser(Guid id, [FromBody] UpdateEmployeeRequest request)
    {
        var (_, companyId) = await GetUserAndCompanyId();
        if (!companyId.HasValue)
        {
            return BadRequest(new { message = "User does not have a current company" });
        }

        var user = await _context.Users
            .Include(u => u.AssignedTracks)
            .FirstOrDefaultAsync(u => u.Id == id &&
                u.CompanyMemberships.Any(cm => cm.CompanyProfileId == companyId.Value));

        if (user == null)
        {
            return NotFound(new { message = "Employee not found" });
        }

        // Verify position and department exist in the same company
        if (request.PositionId.HasValue)
        {
            var position = await _context.Positions
                .FirstOrDefaultAsync(p => p.Id == request.PositionId.Value && p.CompanyProfileId == companyId.Value);

            if (position == null)
            {
                return BadRequest(new { message = "Position not found" });
            }
        }

        if (request.DepartmentId.HasValue)
        {
            var department = await _context.Departments
                .FirstOrDefaultAsync(d => d.Id == request.DepartmentId.Value && d.CompanyProfileId == companyId.Value);

            if (department == null)
            {
                return BadRequest(new { message = "Department not found" });
            }
        }

        var existingMembership = await _context.CompanyMembers
            .FirstOrDefaultAsync(cm => cm.UserId == user.Id && cm.CompanyProfileId == companyId.Value);
        if (existingMembership == null)
        {
            return BadRequest(new { message = "Department not found" });
        }

        // Update user with new employee information
        if (!string.IsNullOrEmpty(request.FullName))
            existingMembership.FullName = request.FullName;

        if (!string.IsNullOrEmpty(request.Phone))
            existingMembership.Phone = request.Phone;

        existingMembership.PositionId = request.PositionId;
        existingMembership.DepartmentId = request.DepartmentId;

        if (request.HireDate.HasValue)
            existingMembership.HireDate = request.HireDate.Value.ToUniversalTime();

        await _context.SaveChangesAsync();

        return Ok(Map(user, existingMembership, companyId.Value));
    }


    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var (_, companyId) = await GetUserAndCompanyId();
        if (!companyId.HasValue)
        {
            return BadRequest(new { message = "User does not have a current company" });
        }

        // Get the company membership rather than the user
        var membership = await _context.CompanyMembers
            .FirstOrDefaultAsync(cm => cm.UserId == id && cm.CompanyProfileId == companyId.Value);

        if (membership == null)
        {
            return NotFound(new { message = "Employee not found in this company" });
        }

        // Remove company membership (we don't delete the user)
        _context.CompanyMembers.Remove(membership);

        // Remove assigned tracks for this user in this company
        var tracks = await _context.EmployeeTracks
            .Include(et => et.Track)
            .Where(et => et.UserId == id && et.Track.CompanyProfileId == companyId.Value)
            .ToListAsync();

        _context.EmployeeTracks.RemoveRange(tracks);

        await _context.SaveChangesAsync();

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

        return Ok();
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


    [HttpPost("{id}/track")]
    public async Task<ActionResult<EmployeeDTO>> AssignTrack(Guid id, [FromBody] AssignTrackRequest request)
    {
        var (_, companyId) = await GetUserAndCompanyId();
        if (!companyId.HasValue)
        {
            return BadRequest(new { message = "User does not have a current company" });
        }

        var user = await _context.Users
            .Include(u => u.AssignedTracks)
            .FirstOrDefaultAsync(u => u.Id == id &&
                u.CompanyMemberships.Any(cm => cm.CompanyProfileId == companyId.Value));

        if (user == null)
        {
            return NotFound(new { message = "Employee not found" });
        }

        var track = await _context.Tracks
            .FirstOrDefaultAsync(t => t.Id == request.TrackId && t.CompanyProfileId == companyId.Value);

        if (track == null)
        {
            return BadRequest(new { message = "Track not found or does not belong to this company" });
        }

        // Check if mentor exists in company if specified
        if (request.MentorId.HasValue)
        {
            var mentorIsMember = await _context.CompanyMembers
                .AnyAsync(cm => cm.UserId == request.MentorId && cm.CompanyProfileId == companyId.Value);

            if (!mentorIsMember)
            {
                return BadRequest(new { message = "Mentor not found in this company" });
            }
        }

        // Check if the track is already assigned to the employee
        var existingTrack = user.AssignedTracks.FirstOrDefault(et => et.TrackId == request.TrackId);
        if (existingTrack != null)
        {
            // Update mentor if needed
            if (request.MentorId != existingTrack.MentorId)
            {
                existingTrack.MentorId = request.MentorId;
            }

            await _context.SaveChangesAsync();
        }
        else
        {
            // Create the new employee track association
            var employeeTrack = new UserTrack
            {
                UserId = user.Id,
                TrackId = track.Id,
                MentorId = request.MentorId,
                AssignedDate = DateTime.UtcNow,
                StartDate = request.StartDate?.ToUniversalTime(),
                Status = "in_progress"
            };

            _context.EmployeeTracks.Add(employeeTrack);
            await _context.SaveChangesAsync();
        }

        // Reload user with tracks for response
        await _context.Entry(user).ReloadAsync();
        await _context.Entry(user).Collection(u => u.AssignedTracks).LoadAsync();

        var existingMembership = await _context.CompanyMembers
            .FirstOrDefaultAsync(cm => cm.UserId == user.Id && cm.CompanyProfileId == companyId.Value);

        if (existingMembership == null)
        {
            return BadRequest(new { message = "Department not found" });
        }

        return Ok(Map(user, existingMembership, companyId.Value));
    }

    [HttpDelete("{id}/track/{trackId}")]
    public async Task<ActionResult<EmployeeDTO>> RemoveTrack(Guid id, Guid trackId)
    {
        var (_, companyId) = await GetUserAndCompanyId();
        if (!companyId.HasValue)
        {
            return BadRequest(new { message = "User does not have a current company" });
        }

        var user = await _context.Users
            .Include(u => u.AssignedTracks)
            .FirstOrDefaultAsync(u => u.Id == id &&
                u.CompanyMemberships.Any(cm => cm.CompanyProfileId == companyId.Value));

        if (user == null)
        {
            return NotFound(new { message = "Employee not found" });
        }

        // Find the track assignment
        var employeeTrack = user.AssignedTracks.FirstOrDefault(et => et.TrackId == trackId);
        if (employeeTrack == null)
        {
            return BadRequest(new { message = "Track is not assigned to this employee" });
        }

        _context.EmployeeTracks.Remove(employeeTrack);
        await _context.SaveChangesAsync();

        // Reload user with tracks for response
        await _context.Entry(user).ReloadAsync();
        await _context.Entry(user).Collection(u => u.AssignedTracks).LoadAsync();

        var existingMembership = await _context.CompanyMembers
            .FirstOrDefaultAsync(cm => cm.UserId == user.Id && cm.CompanyProfileId == companyId.Value);

        if (existingMembership == null)
        {
            return BadRequest(new { message = "Department not found" });
        }

        return Ok(Map(user, existingMembership, companyId.Value));
    }

    [HttpGet("{id}/tracks")]
    public async Task<ActionResult<IEnumerable<EmployeeTrackDTO>>> GetEmployeeTracks(Guid id)
    {
        var (_, companyId) = await GetUserAndCompanyId();
        if (!companyId.HasValue)
        {
            return BadRequest(new { message = "User does not have a current company" });
        }

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == id &&
                u.CompanyMemberships.Any(cm => cm.CompanyProfileId == companyId.Value));

        if (user == null)
        {
            return NotFound(new { message = "Employee not found" });
        }

        var employeeTracks = await _context.EmployeeTracks
            .Include(et => et.Track)
            .Where(et => et.UserId == id && et.Track.CompanyProfileId == companyId.Value)
            .Select(t => new EmployeeTrackDTO
            {
                TrackId = t.TrackId,
                MentorId = t.MentorId,
                AssignedDate = t.AssignedDate,
                StartDate = t.StartDate,
                CompletedDate = t.CompletedDate,
                Status = t.Status
            })
            .ToListAsync();

        return Ok(employeeTracks);
    }

    [HttpPost("{id}/track/{trackId}/mentor")]
    public async Task<ActionResult<EmployeeTrackDTO>> AssignMentorToTrack(Guid id, Guid trackId, [FromBody] AssignMentorRequest request)
    {
        var (_, companyId) = await GetUserAndCompanyId();
        if (!companyId.HasValue)
        {
            return BadRequest(new { message = "User does not have a current company" });
        }

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == id &&
                u.CompanyMemberships.Any(cm => cm.CompanyProfileId == companyId.Value));

        if (user == null)
        {
            return NotFound(new { message = "Employee not found" });
        }

        var employeeTrack = await _context.EmployeeTracks
            .Include(et => et.Track)
            .Include(et => et.Mentor)
            .FirstOrDefaultAsync(et => et.UserId == id && et.TrackId == trackId && et.Track.CompanyProfileId == companyId.Value);

        if (employeeTrack == null)
        {
            return NotFound(new { message = "Track not assigned to this employee" });
        }

        // Verify mentor exists and is a member of the same company
        var mentorIsMember = await _context.CompanyMembers
            .AnyAsync(cm => cm.UserId == request.MentorId && cm.CompanyProfileId == companyId.Value);

        if (!mentorIsMember)
        {
            return NotFound(new { message = "Mentor not found in this company" });
        }

        employeeTrack.MentorId = request.MentorId;
        await _context.SaveChangesAsync();

        var trackDto = new EmployeeTrackDTO
        {
            TrackId = employeeTrack.TrackId,
            MentorId = employeeTrack.MentorId,
            AssignedDate = employeeTrack.AssignedDate,
            StartDate = employeeTrack.StartDate,
            CompletedDate = employeeTrack.CompletedDate,
            Status = employeeTrack.Status
        };

        return Ok(trackDto);
    }

    [HttpDelete("{id}/track/{trackId}/mentor")]
    public async Task<ActionResult<EmployeeTrackDTO>> RemoveMentorFromTrack(Guid id, Guid trackId)
    {
        var (_, companyId) = await GetUserAndCompanyId();
        if (!companyId.HasValue)
        {
            return BadRequest(new { message = "User does not have a current company" });
        }

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == id &&
                u.CompanyMemberships.Any(cm => cm.CompanyProfileId == companyId.Value));

        if (user == null)
        {
            return NotFound(new { message = "Employee not found" });
        }

        var employeeTrack = await _context.EmployeeTracks
            .Include(et => et.Track)
            .FirstOrDefaultAsync(et => et.UserId == id && et.TrackId == trackId && et.Track.CompanyProfileId == companyId.Value);

        if (employeeTrack == null)
        {
            return NotFound(new { message = "Track not assigned to this employee" });
        }

        employeeTrack.MentorId = null;
        await _context.SaveChangesAsync();

        var trackDto = new EmployeeTrackDTO
        {
            TrackId = employeeTrack.TrackId,
            MentorId = employeeTrack.MentorId,
            AssignedDate = employeeTrack.AssignedDate,
            StartDate = employeeTrack.StartDate,
            CompletedDate = employeeTrack.CompletedDate,
            Status = employeeTrack.Status
        };

        return Ok(trackDto);
    }
}

public class CreateUserRequest
{
    public string Email { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? Role { get; set; }
    public Guid? CompanyProfileId { get; set; }
}

public class ChangeRoleRequest
{
    public string Role { get; set; } = null!;
}

public class CreateEmployeeRequest
{
    [Required]
    public string FullName { get; set; } = null!;

    public Guid? PositionId { get; set; }

    public Guid? DepartmentId { get; set; }

    [Required, EmailAddress]
    public string Email { get; set; } = null!;

    public string? Phone { get; set; }

    public DateTime HireDate { get; set; }
}

public class UpdateEmployeeRequest
{
    public string? FullName { get; set; }
    public Guid? PositionId { get; set; }
    public Guid? DepartmentId { get; set; }
    public string? Phone { get; set; }
    public DateTime? HireDate { get; set; }
}

public class AssignTrackRequest
{
    public Guid TrackId { get; set; }
    public DateTime? StartDate { get; set; }
    public Guid? MentorId { get; set; }
}

public class AssignMentorRequest
{
    public Guid MentorId { get; set; }
}

public class AccessLinkResponse
{
    public string AccessLink { get; set; } = null!;
}