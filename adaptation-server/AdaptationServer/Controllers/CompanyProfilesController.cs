using AdaptationServer.Data;
using AdaptationServer.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AdaptationServer.Controllers;

[ApiController]
[Route("api/company-profiles")]
[Authorize]
public class CompanyProfilesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CompanyProfilesController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/company-profiles
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CompanyProfile>>> GetCompanyProfiles()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
        {
            return NotFound(new { message = "User not found" });
        }

        // Get company profiles where the user is a member
        var companyProfiles = await _context.CompanyMembers
            .Where(cm => cm.UserId == userGuid)
            .Select(cm => new
            {
                id = cm.CompanyProfile.Id.ToString(),
                name = cm.CompanyProfile.Name,
                description = cm.CompanyProfile.Description,
                logoUrl = cm.CompanyProfile.LogoUrl,
                industry = cm.CompanyProfile.Industry,
                size = cm.CompanyProfile.Size,
                createdAt = cm.CompanyProfile.CreatedAt.ToString("o"),
                updatedAt = cm.CompanyProfile.UpdatedAt.ToString("o"),
                ownerId = cm.CompanyProfile.OwnerId.ToString()
            })
            .ToListAsync();

        return Ok(companyProfiles);
    }

    // GET: api/company-profiles/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<CompanyProfile>> GetCompanyProfile(Guid id)
    {
        var companyProfile = await _context.CompanyProfiles.FindAsync(id);
        if (companyProfile == null)
        {
            return NotFound(new { message = "Company profile not found" });
        }

        return Ok(new
        {
            id = companyProfile.Id.ToString(),
            name = companyProfile.Name,
            description = companyProfile.Description,
            logoUrl = companyProfile.LogoUrl,
            industry = companyProfile.Industry,
            size = companyProfile.Size,
            createdAt = companyProfile.CreatedAt.ToString("o"),
            updatedAt = companyProfile.UpdatedAt.ToString("o"),
            ownerId = companyProfile.OwnerId.ToString()
        });
    }

    // POST: api/company-profiles
    [HttpPost]
    public async Task<ActionResult<CompanyProfile>> CreateCompanyProfile([FromBody] CreateCompanyProfileRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
        {
            return NotFound(new { message = "User not found" });
        }

        var user = await _context.Users.FindAsync(userGuid);
        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        var now = DateTime.UtcNow;
        var companyProfile = new CompanyProfile
        {
            Name = request.Name,
            Description = request.Description,
            LogoUrl = request.LogoUrl,
            Industry = request.Industry,
            Size = request.Size,
            CreatedAt = now,
            UpdatedAt = now,
            OwnerId = userGuid
        };

        _context.CompanyProfiles.Add(companyProfile);
        await _context.SaveChangesAsync();

        // Create a company member record for the owner
        var companyMember = new CompanyMember
        {
            UserId = userGuid,
            CompanyProfileId = companyProfile.Id,
            Role = "admin", // Owner gets admin role
            CreatedAt = now,
            UpdatedAt = now
        };

        _context.CompanyMembers.Add(companyMember);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCompanyProfile), new { id = companyProfile.Id }, new
        {
            id = companyProfile.Id.ToString(),
            name = companyProfile.Name,
            description = companyProfile.Description,
            logoUrl = companyProfile.LogoUrl,
            industry = companyProfile.Industry,
            size = companyProfile.Size,
            createdAt = companyProfile.CreatedAt.ToString("o"),
            updatedAt = companyProfile.UpdatedAt.ToString("o"),
            ownerId = companyProfile.OwnerId.ToString()
        });
    }

    // PUT: api/company-profiles/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCompanyProfile(Guid id, [FromBody] UpdateCompanyProfileRequest request)
    {
        var companyProfile = await _context.CompanyProfiles.FindAsync(id);
        if (companyProfile == null)
        {
            return NotFound(new { message = "Company profile not found" });
        }

        // In a real implementation, verify that the user has permission to update this company

        if (request.Name != null)
            companyProfile.Name = request.Name;
        if (request.Description != null)
            companyProfile.Description = request.Description;
        if (request.LogoUrl != null)
            companyProfile.LogoUrl = request.LogoUrl;
        if (request.Industry != null)
            companyProfile.Industry = request.Industry;
        if (request.Size != null)
            companyProfile.Size = request.Size;

        companyProfile.UpdatedAt = DateTime.UtcNow;

        _context.Entry(companyProfile).State = EntityState.Modified;
        await _context.SaveChangesAsync();

        return Ok(new
        {
            id = companyProfile.Id.ToString(),
            name = companyProfile.Name,
            description = companyProfile.Description,
            logoUrl = companyProfile.LogoUrl,
            industry = companyProfile.Industry,
            size = companyProfile.Size,
            createdAt = companyProfile.CreatedAt.ToString("o"),
            updatedAt = companyProfile.UpdatedAt.ToString("o"),
            ownerId = companyProfile.OwnerId.ToString()
        });
    }

    // DELETE: api/company-profiles/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCompanyProfile(Guid id)
    {
        var companyProfile = await _context.CompanyProfiles.FindAsync(id);
        if (companyProfile == null)
        {
            return NotFound(new { message = "Company profile not found" });
        }

        // In a real implementation, verify that the user has permission to delete this company

        _context.CompanyProfiles.Remove(companyProfile);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // POST: api/company-profiles/switch
    [HttpPost("switch")]
    public async Task<IActionResult> SwitchCompanyProfile([FromBody] SwitchCompanyProfileRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
        {
            return NotFound(new { message = "User not found" });
        }

        var companyProfileId = Guid.Parse(request.CompanyProfileId);
        var companyProfile = await _context.CompanyProfiles.FindAsync(companyProfileId);
        if (companyProfile == null)
        {
            return NotFound(new { message = "Company profile not found" });
        }

        var user = await _context.Users.FindAsync(userGuid);
        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        // Verify that the user is a member of the company
        var isMember = await _context.CompanyMembers
            .AnyAsync(cm => cm.UserId == userGuid && cm.CompanyProfileId == companyProfileId);
        if (!isMember)
        {
            return BadRequest(new { message = "User is not a member of this company" });
        }

        // Update the user's current company
        user.CurrentCompanyId = companyProfileId;
        _context.Entry(user).State = EntityState.Modified;
        await _context.SaveChangesAsync();

        return Ok(new
        {
            companyProfile = new
            {
                id = companyProfile.Id.ToString(),
                name = companyProfile.Name,
                description = companyProfile.Description,
                logoUrl = companyProfile.LogoUrl,
                industry = companyProfile.Industry,
                size = companyProfile.Size,
                createdAt = companyProfile.CreatedAt.ToString("o"),
                updatedAt = companyProfile.UpdatedAt.ToString("o"),
                ownerId = companyProfile.OwnerId.ToString()
            }
        });
    }

    // GET: api/company-profiles/current
    [HttpGet("current")]
    public async Task<ActionResult<CompanyProfile>> GetCurrentCompanyProfile()
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

        if (user.CurrentCompany == null)
        {
            return Ok(null);
        }

        return Ok(new
        {
            id = user.CurrentCompany.Id.ToString(),
            name = user.CurrentCompany.Name,
            description = user.CurrentCompany.Description,
            logoUrl = user.CurrentCompany.LogoUrl,
            industry = user.CurrentCompany.Industry,
            size = user.CurrentCompany.Size,
            createdAt = user.CurrentCompany.CreatedAt.ToString("o"),
            updatedAt = user.CurrentCompany.UpdatedAt.ToString("o"),
            ownerId = user.CurrentCompany.OwnerId.ToString()
        });
    }
}

public class CreateCompanyProfileRequest
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string? LogoUrl { get; set; }
    public string? Industry { get; set; }
    public string? Size { get; set; }
}

public class UpdateCompanyProfileRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? LogoUrl { get; set; }
    public string? Industry { get; set; }
    public string? Size { get; set; }
}

public class SwitchCompanyProfileRequest
{
    public string CompanyProfileId { get; set; } = null!;
}