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
public class PositionsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PositionsController(ApplicationDbContext context)
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
    public async Task<ActionResult<IEnumerable<Position>>> GetPositions()
    {
        var (_, companyId) = await GetUserAndCompanyId();
        if (!companyId.HasValue)
        {
            return BadRequest(new { message = "User does not have a current company" });
        }

        return await _context.Positions
            .Where(p => p.CompanyProfileId == companyId.Value)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Position>> GetPosition(Guid id)
    {
        var (_, companyId) = await GetUserAndCompanyId();
        if (!companyId.HasValue)
        {
            return BadRequest(new { message = "User does not have a current company" });
        }

        var position = await _context.Positions
            .FirstOrDefaultAsync(p => p.Id == id && p.CompanyProfileId == companyId.Value);
            
        if (position == null)
        {
            return NotFound(new { message = "Position not found" });
        }

        return position;
    }

    [HttpPost]
    public async Task<ActionResult<Position>> CreatePosition([FromBody] CreatePositionRequest request)
    {
        var (_, companyId) = await GetUserAndCompanyId();
        if (!companyId.HasValue)
        {
            return BadRequest(new { message = "User does not have a current company" });
        }

        var position = new Position
        {
            Name = request.Name,
            Description = request.Description,
            CompanyProfileId = companyId.Value
        };

        _context.Positions.Add(position);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetPosition), new { id = position.Id }, position);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePosition(Guid id, [FromBody] Position position)
    {
        if (id != position.Id)
        {
            return BadRequest(new { message = "ID mismatch" });
        }

        var (_, companyId) = await GetUserAndCompanyId();
        if (!companyId.HasValue)
        {
            return BadRequest(new { message = "User does not have a current company" });
        }

        var existingPosition = await _context.Positions
            .FirstOrDefaultAsync(p => p.Id == id && p.CompanyProfileId == companyId.Value);
            
        if (existingPosition == null)
        {
            return NotFound(new { message = "Position not found" });
        }

        // Only update allowed properties, not the company ID
        existingPosition.Name = position.Name;
        existingPosition.Description = position.Description;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await PositionExistsInCompany(id, companyId.Value))
            {
                return NotFound(new { message = "Position not found" });
            }
            throw;
        }

        return Ok(existingPosition);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePosition(Guid id)
    {
        var (_, companyId) = await GetUserAndCompanyId();
        if (!companyId.HasValue)
        {
            return BadRequest(new { message = "User does not have a current company" });
        }

        var position = await _context.Positions
            .FirstOrDefaultAsync(p => p.Id == id && p.CompanyProfileId == companyId.Value);
            
        if (position == null)
        {
            return NotFound(new { message = "Position not found" });
        }

        // Check if position is in use
        var isInUse = await _context.Employees
            .AnyAsync(e => e.PositionId == id && e.CompanyProfileId == companyId.Value);
            
        if (isInUse)
        {
            return BadRequest(new { message = "Cannot delete position that is assigned to employees" });
        }

        _context.Positions.Remove(position);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private async Task<bool> PositionExistsInCompany(Guid id, Guid companyId)
    {
        return await _context.Positions.AnyAsync(p => p.Id == id && p.CompanyProfileId == companyId);
    }
}

public class CreatePositionRequest
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
}