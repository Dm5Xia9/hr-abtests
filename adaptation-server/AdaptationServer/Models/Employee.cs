using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace AdaptationServer.Models;

public class Employee
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    [StringLength(100)]
    public string FullName { get; set; } = null!;

    public Guid PositionId { get; set; }
    public Guid DepartmentId { get; set; }

    [Required]
    [StringLength(100)]
    [EmailAddress]
    public string Email { get; set; } = null!;

    [StringLength(20)]
    public string? Phone { get; set; }

    [Required]
    public DateTime HireDate { get; set; }

    public DateTime? StartDate { get; set; }

    [StringLength(30)]
    public string AdaptationStatus { get; set; } = "not_started";

    public string? AccessLink { get; set; }

    [Column(TypeName = "jsonb")]
    public Dictionary<string, StepProgress> StepProgress { get; set; } = new();

    public Guid? MentorId { get; set; }
    public Guid? AssignedTrackId { get; set; }

    public Guid CompanyProfileId { get; set; }
    
    public CompanyProfile CompanyProfile { get; set; } = null!;
    public User? Mentor { get; set; }
    public Track? AssignedTrack { get; set; }
    public Position Position { get; set; } = null!;
    public Department Department { get; set; } = null!;
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}

[Serializable]
public class StepProgress
{
    public string Status { get; set; } = "not_started";
    public DateTime? CompletedAt { get; set; }
    public string? Comment { get; set; }
    public Dictionary<string, bool>? Checklist { get; set; }
}