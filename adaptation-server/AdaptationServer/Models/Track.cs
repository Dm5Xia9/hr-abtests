using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace AdaptationServer.Models;

public class Track
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    [StringLength(200)]
    public string Title { get; set; } = null!;

    [StringLength(1000)]
    public string? Description { get; set; }

    [Column(TypeName = "jsonb")]
    public JsonDocument Milestones { get; set; } = null!;

    public Guid CompanyProfileId { get; set; }
    
    public CompanyProfile CompanyProfile { get; set; } = null!;
}