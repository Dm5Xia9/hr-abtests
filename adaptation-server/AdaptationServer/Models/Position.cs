using System.ComponentModel.DataAnnotations;

namespace AdaptationServer.Models;

public class Position
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    [StringLength(100)]
    public string Name { get; set; } = null!;

    [StringLength(500)]
    public string? Description { get; set; }

    public Guid CompanyProfileId { get; set; }
    
    public CompanyProfile CompanyProfile { get; set; } = null!;

    // Навигационное свойство для связи с сотрудниками
    public virtual ICollection<Employee> Employees { get; set; } = new List<Employee>();
} 