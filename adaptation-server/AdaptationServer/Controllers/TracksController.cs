using AdaptationServer.Data;
using AdaptationServer.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;

namespace AdaptationServer.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TracksController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public TracksController(ApplicationDbContext context)
    {
        _context = context;
    }

    private async Task<(Guid userId, Guid? companyId)> GetUserAndCompanyId()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await _context.Users.FindAsync(userId);
        return (userId, user?.CurrentCompanyId);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Track>>> GetTracks()
    {
        var (_, companyId) = await GetUserAndCompanyId();
        if (!companyId.HasValue)
        {
            return BadRequest(new { message = "User does not have a current company" });
        }

        return await _context.Tracks
            .Where(t => t.CompanyProfileId == companyId.Value)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Track>> GetTrack(Guid id)
    {
        var (_, companyId) = await GetUserAndCompanyId();
        if (!companyId.HasValue)
        {
            return BadRequest(new { message = "User does not have a current company" });
        }

        var track = await _context.Tracks
            .FirstOrDefaultAsync(t => t.Id == id && t.CompanyProfileId == companyId.Value);

        if (track == null)
        {
            return NotFound(new { message = "Track not found" });
        }

        return track;
    }

    [HttpPost]
    public async Task<ActionResult<Track>> CreateTrack([FromBody] CreateTrackRequest request)
    {
        var (_, companyId) = await GetUserAndCompanyId();
        if (!companyId.HasValue)
        {
            return BadRequest(new { message = "User does not have a current company" });
        }

        var track = new Track
        {
            Title = request.Title,
            Description = request.Description,
            Milestones = JsonSerializer.SerializeToDocument(request.Milestones),
            CompanyProfileId = companyId.Value
        };

        _context.Tracks.Add(track);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTrack), new { id = track.Id }, track);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTrack(Guid id, [FromBody] CreateTrackRequest request)
    {
        var (_, companyId) = await GetUserAndCompanyId();
        if (!companyId.HasValue)
        {
            return BadRequest(new { message = "User does not have a current company" });
        }

        var track = await _context.Tracks
            .FirstOrDefaultAsync(t => t.Id == id && t.CompanyProfileId == companyId.Value);

        if (track == null)
        {
            return NotFound(new { message = "Track not found" });
        }

        track.Title = request.Title;
        track.Description = request.Description;
        track.Milestones = JsonSerializer.SerializeToDocument(request.Milestones);

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await TrackExistsInCompany(id, companyId.Value))
            {
                return NotFound(new { message = "Track not found" });
            }
            throw;
        }

        return Ok(track);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTrack(Guid id)
    {
        var (_, companyId) = await GetUserAndCompanyId();
        if (!companyId.HasValue)
        {
            return BadRequest(new { message = "User does not have a current company" });
        }

        var track = await _context.Tracks
            .FirstOrDefaultAsync(t => t.Id == id && t.CompanyProfileId == companyId.Value);

        if (track == null)
        {
            return NotFound(new { message = "Track not found" });
        }

        // Check if track is assigned to employees
        var isAssigned = await _context.Employees
            .AnyAsync(e => e.AssignedTrackId == id && e.CompanyProfileId == companyId.Value);
            
        if (isAssigned)
        {
            return BadRequest(new { message = "Cannot delete track that is assigned to employees" });
        }

        _context.Tracks.Remove(track);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private async Task<bool> TrackExistsInCompany(Guid id, Guid companyId)
    {
        return await _context.Tracks.AnyAsync(t => t.Id == id && t.CompanyProfileId == companyId);
    }
}

public class CreateTrackRequest
{
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public JsonDocument Milestones { get; set; } = null!;
}