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
public class DepartmentsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public DepartmentsController(ApplicationDbContext context)
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
    public async Task<ActionResult<IEnumerable<Department>>> GetDepartments()
    {
        var (_, companyId) = await GetUserAndCompanyId();
        if (!companyId.HasValue)
        {
            return BadRequest(new { message = "User does not have a current company" });
        }

        return await _context.Departments
            .Where(d => d.CompanyProfileId == companyId.Value)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Department>> GetDepartment(Guid id)
    {
        var (_, companyId) = await GetUserAndCompanyId();
        if (!companyId.HasValue)
        {
            return BadRequest(new { message = "User does not have a current company" });
        }

        var department = await _context.Departments
            .FirstOrDefaultAsync(d => d.Id == id && d.CompanyProfileId == companyId.Value);

        if (department == null)
        {
            return NotFound(new { message = "Department not found" });
        }

        return department;
    }

    [HttpPost]
    public async Task<ActionResult<Department>> CreateDepartment([FromBody] CreateDepartmentRequest request)
    {
        var (_, companyId) = await GetUserAndCompanyId();
        if (!companyId.HasValue)
        {
            return BadRequest(new { message = "User does not have a current company" });
        }

        var department = new Department
        {
            Name = request.Name,
            Description = request.Description,
            CompanyProfileId = companyId.Value
        };

        _context.Departments.Add(department);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetDepartment), new { id = department.Id }, department);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateDepartment(Guid id, [FromBody] Department department)
    {
        if (id != department.Id)
        {
            return BadRequest(new { message = "ID mismatch" });
        }

        var (_, companyId) = await GetUserAndCompanyId();
        if (!companyId.HasValue)
        {
            return BadRequest(new { message = "User does not have a current company" });
        }

        var existingDepartment = await _context.Departments
            .FirstOrDefaultAsync(d => d.Id == id && d.CompanyProfileId == companyId.Value);

        if (existingDepartment == null)
        {
            return NotFound(new { message = "Department not found" });
        }

        // Only update allowed properties, not the company ID
        existingDepartment.Name = department.Name;
        existingDepartment.Description = department.Description;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await DepartmentExistsInCompany(id, companyId.Value))
            {
                return NotFound(new { message = "Department not found" });
            }
            throw;
        }

        return Ok(existingDepartment);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDepartment(Guid id)
    {
        var (_, companyId) = await GetUserAndCompanyId();
        if (!companyId.HasValue)
        {
            return BadRequest(new { message = "User does not have a current company" });
        }

        var department = await _context.Departments
            .FirstOrDefaultAsync(d => d.Id == id && d.CompanyProfileId == companyId.Value);

        if (department == null)
        {
            return NotFound(new { message = "Department not found" });
        }

        // Check if department is in use
        var isInUse = await _context.CompanyMembers
            .AnyAsync(e => e.DepartmentId == id);

        if (isInUse)
        {
            return BadRequest(new { message = "Cannot delete department that has employees" });
        }

        _context.Departments.Remove(department);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private async Task<bool> DepartmentExistsInCompany(Guid id, Guid companyId)
    {
        return await _context.Departments.AnyAsync(d => d.Id == id && d.CompanyProfileId == companyId);
    }
}

public class CreateDepartmentRequest
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
}