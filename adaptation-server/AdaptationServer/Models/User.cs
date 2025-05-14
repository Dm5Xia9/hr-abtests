using Microsoft.AspNetCore.Identity;

namespace AdaptationServer.Models;

public class User : IdentityUser<Guid>
{
    public string Name { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLogin { get; set; }
    public Guid? CurrentCompanyId { get; set; }
    
    public CompanyProfile? CurrentCompany { get; set; }
    public ICollection<CompanyMember> CompanyMemberships { get; set; } = new List<CompanyMember>();
}