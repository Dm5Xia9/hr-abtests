using AdaptationServer.Data;
using AdaptationServer.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using System.Text;
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


    [HttpGet("available")]
    public async Task<ActionResult<IEnumerable<TrackBasicDTO>>> GetAvailableTracks()
    {
        var (userId, companyId) = await GetUserAndCompanyId();
        if (!companyId.HasValue)
        {
            return BadRequest(new { message = "User does not have a current company" });
        }

        var assignedTracks = await _context.EmployeeTracks
            .Include(et => et.Track)
            .Include(et => et.Mentor)
            .Where(et => et.UserId == userId && et.Track.CompanyProfileId == companyId.Value)
            .Select(et => new TrackBasicDTO
            {
                Id = et.TrackId,
                Title = et.Track.Title,
                Description = et.Track.Description,
                Status = et.Status,
                AssignedDate = et.AssignedDate,
                StartDate = et.StartDate,
                CompletedDate = et.CompletedDate,
                MentorId = et.MentorId,
                MentorName = et.Mentor != null ? (et.Mentor.Name) : null
            })
            .ToListAsync();

        return Ok(assignedTracks);
    }


    [HttpGet("current")]
    public async Task<ActionResult<TrackDetailedDTO>> GetCurrentTrack()
    {
        var (userId, companyId) = await GetUserAndCompanyId();
        if (!companyId.HasValue)
        {
            return BadRequest(new { message = "User does not have a current company" });
        }

        var user = await _context.Users
            .Include(p => p.AssignedTracks).ThenInclude(p => p.Track)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        // Проверяем, есть ли у пользователя текущий трек
        if (user.CurrentTrackId == null)
        {
            return NotFound(new { message = "No current track selected" });
        }

        var trackId = user.CurrentTrackId.Value;

        var et = user.AssignedTracks
            .FirstOrDefault(p => p.TrackId == user.CurrentTrackId);
        if (et == null)
        {
            return NotFound(new { message = "Track not found or not assigned to user" });
        }

        // Собираем информацию о прогрессе по шагам
        var result = new TrackDetailedDTO
        {
            Id = et.TrackId,
            Title = et.Track.Title,
            Description = et.Track.Description,
            Status = et.Status,
            AssignedDate = et.AssignedDate,
            StartDate = et.StartDate,
            CompletedDate = et.CompletedDate,
            MentorId = et.MentorId,
            MentorName = et.Mentor != null ? (et.Mentor.Name) : null,
            Steps = et.Steps.ToDictionary(p => p.Key, p => JsonDocument.Parse(p.Value)),
            Milestones = et.Track.Milestones
        };

        return Ok(result);
    }


    public class ChangeCurrentTrackDTO
    {
        [Required]
        public Guid TrackId { get; set; }
    }

    // Сменить текущий трек адаптации
    [HttpPost("current")]
    public async Task<ActionResult<TrackDetailedDTO>> ChangeCurrentTrack([FromBody] ChangeCurrentTrackDTO request)
    {
        var (userId, companyId) = await GetUserAndCompanyId();
        if (!companyId.HasValue)
        {
            return BadRequest(new { message = "User does not have a current company" });
        }

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        // Проверяем, назначен ли трек пользователю
        var trackAssignment = await _context.EmployeeTracks
            .Include(et => et.Track)
            .FirstOrDefaultAsync(et => et.UserId == userId && et.TrackId == request.TrackId);

        if (trackAssignment == null)
        {
            return NotFound(new { message = "Track not found or not assigned to user" });
        }

        // Если трек еще не начат, отмечаем его как начатый
        if (trackAssignment.StartDate == null)
        {
            trackAssignment.StartDate = DateTime.UtcNow;
            trackAssignment.Status = "in_progress";
        }

        // Устанавливаем текущий трек для пользователя
        user.CurrentTrackId = request.TrackId;

        await _context.SaveChangesAsync();

        // Возвращаем полную информацию о выбранном треке (аналогично GetCurrentTrack)
        return await GetCurrentTrack();
    }

    public class StepProgressUpdateDTO
    {
        public required JsonDocument Content { get; set; }
    }


    // Обновить прогресс по шагу трека адаптации
    [HttpPost("progress/{stageId}")]
    public async Task<ActionResult> UpdateStepProgress(string stageId, [FromBody] StepProgressUpdateDTO request)
    {
        var (userId, companyId) = await GetUserAndCompanyId();
        if (!companyId.HasValue)
        {
            return BadRequest(new { message = "User does not have a current company" });
        }

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        // Проверяем, назначен ли трек пользователю
        var trackAssignment = await _context.EmployeeTracks
            .Include(et => et.Track)
            .FirstOrDefaultAsync(et => et.UserId == userId && et.TrackId == user.CurrentTrackId);

        if (trackAssignment == null)
        {
            return NotFound(new { message = "Track not found or not assigned to user" });
        }

        // Инициализируем StepProgress, если он еще не существует
        if (trackAssignment.Steps == null)
        {
            trackAssignment.Steps = [];
        }

        trackAssignment.Steps[stageId] = ToJsonString(request.Content);
        _context.EmployeeTracks.Update(trackAssignment);
        await _context.SaveChangesAsync();

        return Ok();
    }

    public static string ToJsonString(JsonDocument jdoc)
    {
        using (var stream = new MemoryStream())
        {
            Utf8JsonWriter writer = new Utf8JsonWriter(stream, new JsonWriterOptions { Indented = true });
            jdoc.WriteTo(writer);
            writer.Flush();
            return Encoding.UTF8.GetString(stream.ToArray());
        }
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
        var isAssigned = await _context.Users
            .AnyAsync(e => e.AssignedTracks.Any(z => z.TrackId == id) && e.CompanyMemberships.Any(p => p.CompanyProfileId == companyId.Value));

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
public class TrackBasicDTO
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public string Status { get; set; } = null!;
    public DateTime? AssignedDate { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    public Guid? MentorId { get; set; }
    public string? MentorName { get; set; }
}

public class TrackDetailedDTO : TrackBasicDTO
{
    public required JsonDocument Milestones { get; set; }
    public Dictionary<string, JsonDocument> Steps { get; set; } = [];
}