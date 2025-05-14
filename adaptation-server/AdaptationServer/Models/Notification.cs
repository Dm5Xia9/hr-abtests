using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace AdaptationServer.Models;

public class Notification
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    [StringLength(50)]
    public string Type { get; set; } = null!;

    [Required]
    [StringLength(100)]
    public string Title { get; set; } = null!;

    [Required]
    [StringLength(500)]
    public string Message { get; set; } = null!;

    [Required]
    public DateTime Date { get; set; }

    public bool IsRead { get; set; }

    public Guid EmployeeId { get; set; }

    [Column(TypeName = "jsonb")]
    public JsonDocument? Data { get; set; }

    public Guid CompanyProfileId { get; set; }
    
    public CompanyProfile CompanyProfile { get; set; } = null!;
    public Employee Employee { get; set; } = null!;
} 