using System;

namespace AdaptationServer.Models;

public class CompanyProfile
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string? LogoUrl { get; set; }
    public string? Industry { get; set; }
    public string? Size { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid OwnerId { get; set; }
    
    public User Owner { get; set; } = null!;
    public ICollection<CompanyMember> Members { get; set; } = new List<CompanyMember>();
} 