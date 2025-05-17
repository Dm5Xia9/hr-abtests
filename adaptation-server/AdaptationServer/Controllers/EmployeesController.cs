using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace AdaptationServer.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EmployeesController : ControllerBase
{
    [HttpGet]
    public IActionResult GetEmployees()
    {
        return RedirectToAction("GetEmployees", "Users", new { area = "" });
    }

    [HttpGet("{id}")]
    public IActionResult GetEmployee(Guid id)
    {
        return RedirectToAction("GetEmployee", "Users", new { id, area = "" });
    }

    [HttpPost]
    public IActionResult CreateEmployee([FromBody] object request)
    {
        return RedirectToAction("CreateEmployee", "Users", new { area = "" });
    }

    [HttpPut("{id}")]
    public IActionResult UpdateEmployee(Guid id, [FromBody] object request)
    {
        return RedirectToAction("UpdateEmployee", "Users", new { id, area = "" });
    }

    [HttpDelete("{id}")]
    public IActionResult DeleteEmployee(Guid id)
    {
        return RedirectToAction("DeleteEmployee", "Users", new { id, area = "" });
    }

    [HttpPost("{id}/track")]
    public IActionResult AssignTrack(Guid id, [FromBody] object request)
    {
        return RedirectToAction("AssignTrack", "Users", new { id, area = "" });
    }

    [HttpDelete("{id}/track/{trackId}")]
    public IActionResult RemoveTrack(Guid id, Guid trackId)
    {
        return RedirectToAction("RemoveTrack", "Users", new { id, trackId, area = "" });
    }

    [HttpGet("{id}/tracks")]
    public IActionResult GetEmployeeTracks(Guid id)
    {
        return RedirectToAction("GetEmployeeTracks", "Users", new { id, area = "" });
    }

    [HttpPost("{id}/track/{trackId}/mentor")]
    public IActionResult AssignMentorToTrack(Guid id, Guid trackId, [FromBody] object request)
    {
        return RedirectToAction("AssignMentorToTrack", "Users", new { id, trackId, area = "" });
    }

    [HttpDelete("{id}/track/{trackId}/mentor")]
    public IActionResult RemoveMentorFromTrack(Guid id, Guid trackId)
    {
        return RedirectToAction("RemoveMentorFromTrack", "Users", new { id, trackId, area = "" });
    }
}