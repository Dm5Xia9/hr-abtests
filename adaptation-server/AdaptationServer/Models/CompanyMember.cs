using System.ComponentModel.DataAnnotations;

namespace AdaptationServer.Models;

public class CompanyMember
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid CompanyProfileId { get; set; }
    public string Role { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    [StringLength(100)]
    public string? FullName { get; set; }
    public Guid? PositionId { get; set; }
    public Guid? DepartmentId { get; set; }
    [StringLength(20)]
    public string? Phone { get; set; }
    public DateTime? HireDate { get; set; }

    public User User { get; set; } = null!;
    public CompanyProfile CompanyProfile { get; set; } = null!;
    public Position? Position { get; set; }
    public Department? Department { get; set; }
}