using AdaptationServer.Data;
using AdaptationServer.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AdaptationServer.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CalendarEventsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CalendarEventsController(ApplicationDbContext context)
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
    public async Task<ActionResult<IEnumerable<CalendarEvent>>> GetCalendarEvents()
    {
        var (userId, _) = await GetUserAndCompanyId();

        // Get user's calendar events
        var events = await _context.CalendarEvents
            .Where(e => e.UserId == userId)
            .OrderBy(e => e.Start)
            .ToListAsync();

        return Ok(events);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CalendarEvent>> GetCalendarEvent(Guid id)
    {
        var (userId, _) = await GetUserAndCompanyId();

        var calendarEvent = await _context.CalendarEvents
            .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

        if (calendarEvent == null)
        {
            return NotFound(new { message = "Calendar event not found" });
        }

        return Ok(calendarEvent);
    }

    [HttpPost]
    public async Task<ActionResult<CalendarEvent>> CreateCalendarEvent([FromBody] CalendarEvent calendarEvent)
    {
        var (userId, _) = await GetUserAndCompanyId();

        // Ensure the event belongs to the current user
        calendarEvent.UserId = userId;
        calendarEvent.Start = calendarEvent.Start.ToUniversalTime();
        calendarEvent.End = calendarEvent.End.ToUniversalTime();

        _context.CalendarEvents.Add(calendarEvent);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCalendarEvent), new { id = calendarEvent.Id }, calendarEvent);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCalendarEvent(Guid id, [FromBody] CalendarEvent calendarEvent)
    {
        if (id != calendarEvent.Id)
        {
            return BadRequest(new { message = "ID mismatch" });
        }

        var (userId, _) = await GetUserAndCompanyId();

        // Check if event exists and belongs to the user
        var existingEvent = await _context.CalendarEvents
            .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

        if (existingEvent == null)
        {
            return NotFound(new { message = "Calendar event not found" });
        }

        // Ensure the event remains with the same user
        calendarEvent.UserId = userId;
        calendarEvent.Start = calendarEvent.Start.ToUniversalTime();
        calendarEvent.End = calendarEvent.End.ToUniversalTime();

        _context.Entry(existingEvent).State = EntityState.Detached;
        _context.Entry(calendarEvent).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await CalendarEventExists(id))
            {
                return NotFound(new { message = "Calendar event not found" });
            }
            throw;
        }

        return Ok(calendarEvent);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCalendarEvent(Guid id)
    {
        var (userId, _) = await GetUserAndCompanyId();

        var calendarEvent = await _context.CalendarEvents
            .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

        if (calendarEvent == null)
        {
            return NotFound(new { message = "Calendar event not found" });
        }

        _context.CalendarEvents.Remove(calendarEvent);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("by-date-range")]
    public async Task<ActionResult<IEnumerable<CalendarEvent>>> GetCalendarEventsByDateRange(
        [FromQuery] DateTime start, 
        [FromQuery] DateTime end,
        [FromQuery] string view = "month")
    {
        var (userId, _) = await GetUserAndCompanyId();

        // Convert to UTC
        var startUtc = start.ToUniversalTime();
        var endUtc = end.ToUniversalTime();

        // Get events in the date range
        var events = await _context.CalendarEvents
            .Where(e => e.UserId == userId &&
                ((e.Start >= startUtc && e.Start <= endUtc) || // Starts in range
                (e.End >= startUtc && e.End <= endUtc) || // Ends in range
                (e.Start <= startUtc && e.End >= endUtc))) // Spans range
            .OrderBy(e => e.Start)
            .ToListAsync();

        return Ok(events);
    }

    private async Task<bool> CalendarEventExists(Guid id)
    {
        return await _context.CalendarEvents.AnyAsync(e => e.Id == id);
    }
} 