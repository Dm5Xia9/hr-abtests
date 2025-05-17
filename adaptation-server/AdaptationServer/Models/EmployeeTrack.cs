using System.ComponentModel.DataAnnotations;

namespace AdaptationServer.Models;

public class EmployeeTrack
{
    [Key]
    public Guid Id { get; set; }

    public Guid UserId { get; set; }
    public Guid TrackId { get; set; }

    public Guid? MentorId { get; set; }

    public DateTime AssignedDate { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? CompletedDate { get; set; }

    [StringLength(30)]
    public string Status { get; set; } = "not_started"; // not_started, in_progress, completed, cancelled

    // Navigation properties
    public User User { get; set; } = null!;
    public Track Track { get; set; } = null!;
    public User? Mentor { get; set; }
}