using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AdaptationServer.Models;

public class CalendarEvent
{
    [Key]
    public Guid Id { get; set; }
    
    [Required]
    [StringLength(200)]
    public string Title { get; set; } = null!;
    
    [StringLength(1000)]
    public string? Description { get; set; }
    
    [Required]
    public DateTime Start { get; set; }
    
    [Required]
    public DateTime End { get; set; }
    
    [StringLength(200)]
    public string? Location { get; set; }
    
    [StringLength(20)]
    public string? MeetingType { get; set; } // in_person, google_meet, telemost, zoom, teams, other
    
    [StringLength(1000)]
    public string? MeetingUrl { get; set; }
    
    [Column(TypeName = "jsonb")]
    public List<string>? Participants { get; set; }
    
    public bool IsAllDay { get; set; }
    
    public Guid? StageId { get; set; }  // ID этапа-встречи, если событие связано с этапом адаптации
    
    [StringLength(20)]
    public string? Color { get; set; }
    
    [StringLength(20)]
    public string Status { get; set; } = "scheduled"; // scheduled, completed, cancelled
    
    public bool ReminderSent { get; set; }
    
    public Guid UserId { get; set; }
    
    // Navigation property
    public User User { get; set; } = null!;
} 