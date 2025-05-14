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
public class NotificationsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public NotificationsController(ApplicationDbContext context)
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
    public async Task<ActionResult<IEnumerable<Notification>>> GetNotifications()
    {
        var (_, companyId) = await GetUserAndCompanyId();
        if (!companyId.HasValue)
        {
            return BadRequest(new { message = "User does not have a current company" });
        }

        return await _context.Notifications
            .Where(n => n.CompanyProfileId == companyId.Value)
            .Include(n => n.Employee)
            .OrderByDescending(n => n.Date)
            .ToListAsync();
    }

    [HttpPost("{id}/mark-as-read")]
    public async Task<ActionResult<Notification>> MarkAsRead(Guid id)
    {
        var (_, companyId) = await GetUserAndCompanyId();
        if (!companyId.HasValue)
        {
            return BadRequest(new { message = "User does not have a current company" });
        }

        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == id && n.CompanyProfileId == companyId.Value);
            
        if (notification == null)
        {
            return NotFound(new { message = "Notification not found" });
        }

        notification.IsRead = true;
        await _context.SaveChangesAsync();

        return Ok(notification);
    }

    [HttpPost("mark-all-as-read")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var (_, companyId) = await GetUserAndCompanyId();
        if (!companyId.HasValue)
        {
            return BadRequest(new { message = "User does not have a current company" });
        }

        var notifications = await _context.Notifications
            .Where(n => !n.IsRead && n.CompanyProfileId == companyId.Value)
            .ToListAsync();

        foreach (var notification in notifications)
        {
            notification.IsRead = true;
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteNotification(Guid id)
    {
        var (_, companyId) = await GetUserAndCompanyId();
        if (!companyId.HasValue)
        {
            return BadRequest(new { message = "User does not have a current company" });
        }

        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == id && n.CompanyProfileId == companyId.Value);
            
        if (notification == null)
        {
            return NotFound(new { message = "Notification not found" });
        }

        _context.Notifications.Remove(notification);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // Helper method to create notifications (used by other controllers)
    internal async Task<Notification> CreateNotification(
        string type,
        string title,
        string message,
        Guid employeeId,
        JsonDocument? data = null)
    {
        var (_, companyId) = await GetUserAndCompanyId();
        if (!companyId.HasValue)
        {
            throw new InvalidOperationException("User does not have a current company");
        }

        // Verify the employee is in the same company
        var employeeExists = await _context.Employees
            .AnyAsync(e => e.Id == employeeId && e.CompanyProfileId == companyId.Value);
            
        if (!employeeExists)
        {
            throw new InvalidOperationException("Employee not found in the current company");
        }

        var notification = new Notification
        {
            Type = type,
            Title = title,
            Message = message,
            Date = DateTime.UtcNow,
            IsRead = false,
            EmployeeId = employeeId,
            Data = data,
            CompanyProfileId = companyId.Value
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();

        return notification;
    }
}