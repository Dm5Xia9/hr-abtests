using System;

namespace AdaptationServer.Models;

public class CompanyMember
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid CompanyProfileId { get; set; }
    public string Role { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    public User User { get; set; } = null!;
    public CompanyProfile CompanyProfile { get; set; } = null!;
} 