using AdaptationServer.Data;
using AdaptationServer.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Security.Cryptography;

namespace AdaptationServer.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EmployeesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public EmployeesController(ApplicationDbContext context)
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
    public async Task<ActionResult<IEnumerable<Employee>>> GetEmployees()
    {
        var (_, companyId) = await GetUserAndCompanyId();
        if (!companyId.HasValue)
        {
            return BadRequest(new { message = "User does not have a current company" });
        }

        return await _context.Employees
            .Where(e => e.CompanyProfileId == companyId.Value)
            .Include(e => e.Mentor)
            .Include(e => e.AssignedTrack)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Employee>> GetEmployee(Guid id)
    {
        var (_, companyId) = await GetUserAndCompanyId();
        if (!companyId.HasValue)
        {
            return BadRequest(new { message = "User does not have a current company" });
        }

        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Id == id && e.CompanyProfileId == companyId.Value);

        if (employee == null)
        {
            return NotFound(new { message = "Employee not found" });
        }

        return employee;
    }

    [HttpPost]
    public async Task<ActionResult<Employee>> CreateEmployee([FromBody] CreateEmployeeRequest request)
    {
        var (_, companyId) = await GetUserAndCompanyId();
        if (!companyId.HasValue)
        {
            return BadRequest(new { message = "User does not have a current company" });
        }

        // Verify position and department exist in the same company
        var position = await _context.Positions
            .FirstOrDefaultAsync(p => p.Id == request.PositionId && p.CompanyProfileId == companyId.Value);
            
        if (position == null)
        {
            return BadRequest(new { message = "Position not found" });
        }

        var department = await _context.Departments
            .FirstOrDefaultAsync(d => d.Id == request.DepartmentId && d.CompanyProfileId == companyId.Value);
            
        if (department == null)
        {
            return BadRequest(new { message = "Department not found" });
        }

        var employee = new Employee
        {
            FullName = request.FullName,
            PositionId = request.PositionId,
            DepartmentId = request.DepartmentId,
            Email = request.Email,
            Phone = request.Phone,
            HireDate = request.HireDate.ToUniversalTime(),
            AdaptationStatus = "not_started",
            CompanyProfileId = companyId.Value
        };

        _context.Employees.Add(employee);
        await _context.SaveChangesAsync();
        employee.Position = null;
        employee.Department = null;
        return Ok(employee);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateEmployee(Guid id, [FromBody] Employee employee)
    {
        if (id != employee.Id)
        {
            return BadRequest(new { message = "ID mismatch" });
        }

        var (_, companyId) = await GetUserAndCompanyId();
        if (!companyId.HasValue)
        {
            return BadRequest(new { message = "User does not have a current company" });
        }

        var existingEmployee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Id == id && e.CompanyProfileId == companyId.Value);
            
        if (existingEmployee == null)
        {
            return NotFound(new { message = "Employee not found" });
        }

        // Ensure company ID stays the same
        employee.CompanyProfileId = companyId.Value;
        _context.Entry(existingEmployee).State = EntityState.Detached;
        _context.Entry(employee).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await EmployeeExistsInCompany(id, companyId.Value))
            {
                return NotFound(new { message = "Employee not found" });
            }
            throw;
        }

        return Ok(employee);
    }

    [HttpPut("{id}/steps/{stepId}/progress")]
    public async Task<ActionResult<Employee>> SetProgress(Guid id, string stepId, [FromBody] StepProgress progress)
    {
        var (_, companyId) = await GetUserAndCompanyId();
        if (!companyId.HasValue)
        {
            return BadRequest(new { message = "User does not have a current company" });
        }

        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Id == id && e.CompanyProfileId == companyId.Value);
            
        if (employee == null)
        {
            return NotFound(new { message = "Employee not found" });
        }

        var stepKey = stepId.ToString();
        if (employee.StepProgress == null)
        {
            employee.StepProgress = new Dictionary<string, StepProgress>();
        }
        employee.StepProgress[stepKey] = progress;

        await _context.SaveChangesAsync();

        return Ok(employee);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteEmployee(Guid id)
    {
        var (_, companyId) = await GetUserAndCompanyId();
        if (!companyId.HasValue)
        {
            return BadRequest(new { message = "User does not have a current company" });
        }

        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Id == id && e.CompanyProfileId == companyId.Value);
            
        if (employee == null)
        {
            return NotFound(new { message = "Employee not found" });
        }

        _context.Employees.Remove(employee);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{id}/mentor")]
    public async Task<ActionResult<Employee>> AssignMentor(Guid id, [FromBody] AssignMentorRequest request)
    {
        var (_, companyId) = await GetUserAndCompanyId();
        if (!companyId.HasValue)
        {
            return BadRequest(new { message = "User does not have a current company" });
        }

        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Id == id && e.CompanyProfileId == companyId.Value);
            
        if (employee == null)
        {
            return NotFound(new { message = "Employee not found" });
        }

        // Verify mentor exists and is a member of the same company
        var mentorIsMember = await _context.CompanyMembers
            .AnyAsync(cm => cm.UserId == request.MentorId && cm.CompanyProfileId == companyId.Value);
            
        if (!mentorIsMember)
        {
            return NotFound(new { message = "Mentor not found in this company" });
        }

        employee.MentorId = request.MentorId;
        await _context.SaveChangesAsync();

        return Ok(await _context.Employees
            .Include(e => e.Mentor)
            .FirstOrDefaultAsync(e => e.Id == id && e.CompanyProfileId == companyId.Value));
    }

    [HttpDelete("{id}/mentor")]
    public async Task<ActionResult<Employee>> RemoveMentor(Guid id)
    {
        var (_, companyId) = await GetUserAndCompanyId();
        if (!companyId.HasValue)
        {
            return BadRequest(new { message = "User does not have a current company" });
        }

        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Id == id && e.CompanyProfileId == companyId.Value);
            
        if (employee == null)
        {
            return NotFound(new { message = "Employee not found" });
        }

        employee.MentorId = null;
        await _context.SaveChangesAsync();

        return Ok(await _context.Employees
            .Include(e => e.Mentor)
            .FirstOrDefaultAsync(e => e.Id == id && e.CompanyProfileId == companyId.Value));
    }

    [HttpPost("{id}/track")]
    public async Task<ActionResult<Employee>> AssignTrack(Guid id, [FromBody] AssignTrackRequest request)
    {
        var (_, companyId) = await GetUserAndCompanyId();
        if (!companyId.HasValue)
        {
            return BadRequest(new { message = "User does not have a current company" });
        }

        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Id == id && e.CompanyProfileId == companyId.Value);
            
        if (employee == null)
        {
            return NotFound(new { message = "Employee not found" });
        }

        // Verify track exists in the same company
        var track = await _context.Tracks
            .FirstOrDefaultAsync(t => t.Id == request.TrackId && t.CompanyProfileId == companyId.Value);
            
        if (track == null)
        {
            return NotFound(new { message = "Track not found" });
        }

        employee.AssignedTrackId = request.TrackId;
        employee.StartDate = request.StartDate.ToUniversalTime();
        employee.AdaptationStatus = "in_progress";
        await _context.SaveChangesAsync();

        return Ok(await _context.Employees
            .Include(e => e.AssignedTrack)
            .FirstOrDefaultAsync(e => e.Id == id && e.CompanyProfileId == companyId.Value));
    }

    [HttpDelete("{id}/track")]
    public async Task<ActionResult<Employee>> RemoveTrack(Guid id)
    {
        var (_, companyId) = await GetUserAndCompanyId();
        if (!companyId.HasValue)
        {
            return BadRequest(new { message = "User does not have a current company" });
        }

        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Id == id && e.CompanyProfileId == companyId.Value);
            
        if (employee == null)
        {
            return NotFound(new { message = "Employee not found" });
        }

        employee.AssignedTrackId = null;
        employee.StartDate = null;
        employee.AdaptationStatus = "not_started";
        await _context.SaveChangesAsync();

        return Ok(await _context.Employees
            .Include(e => e.AssignedTrack)
            .FirstOrDefaultAsync(e => e.Id == id && e.CompanyProfileId == companyId.Value));
    }

    [HttpPost("{id}/access-link")]
    public async Task<ActionResult<AccessLinkResponse>> GenerateAccessLink(Guid id)
    {
        var (_, companyId) = await GetUserAndCompanyId();
        if (!companyId.HasValue)
        {
            return BadRequest(new { message = "User does not have a current company" });
        }

        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Id == id && e.CompanyProfileId == companyId.Value);
            
        if (employee == null)
        {
            return NotFound(new { message = "Employee not found" });
        }

        // Generate a unique access token
        var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
        employee.AccessLink = token;
        await _context.SaveChangesAsync();

        return Ok(new AccessLinkResponse { AccessLink = token });
    }

    private async Task<bool> EmployeeExistsInCompany(Guid id, Guid companyId)
    {
        return await _context.Employees.AnyAsync(e => e.Id == id && e.CompanyProfileId == companyId);
    }
}

public class CreateEmployeeRequest
{
    public string FullName { get; set; } = null!;
    public Guid PositionId { get; set; }
    public Guid DepartmentId { get; set; }
    public string Email { get; set; } = null!;
    public string? Phone { get; set; }
    public DateTime HireDate { get; set; }
}

public class AssignMentorRequest
{
    public Guid MentorId { get; set; }
}

public class AssignTrackRequest
{
    public Guid TrackId { get; set; }
    public DateTime StartDate { get; set; }
}

public class AccessLinkResponse
{
    public string AccessLink { get; set; } = null!;
}