using Microsoft.AspNetCore.Identity;

namespace AdaptationServer.Models;

public class User : IdentityUser<Guid>
{
    public string Name { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLogin { get; set; }
    public Guid? CurrentCompanyId { get; set; }


    // Текущий выбранный трек адаптации
    public Guid? CurrentTrackId { get; set; }

    public CompanyProfile? CurrentCompany { get; set; }
    public ICollection<CompanyMember> CompanyMemberships { get; set; } = [];
    public ICollection<CalendarEvent> CalendarEvents { get; set; } = [];
    public ICollection<UserTrack> AssignedTracks { get; set; } = [];
    public ICollection<UserTrack> MentoredTracks { get; set; } = [];
}