using AdaptationServer.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace AdaptationServer.Data;

public class ApplicationDbContext : IdentityDbContext<User, IdentityRole<Guid>, Guid>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Track> Tracks { get; set; } = null!;
    public DbSet<Article> Articles { get; set; } = null!;
    public DbSet<Department> Departments { get; set; } = null!;
    public DbSet<Position> Positions { get; set; } = null!;
    public DbSet<CompanyProfile> CompanyProfiles { get; set; } = null!;
    public DbSet<CompanyMember> CompanyMembers { get; set; } = null!;
    public DbSet<UserTrack> EmployeeTracks { get; set; } = null!;
    public DbSet<CalendarEvent> CalendarEvents { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Configure User
        builder.Entity<User>()
            .HasOne(u => u.CurrentCompany)
            .WithMany()
            .HasForeignKey(u => u.CurrentCompanyId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<User>()
            .HasMany(u => u.MentoredTracks)
            .WithOne(et => et.Mentor)
            .HasForeignKey(et => et.MentorId)
            .OnDelete(DeleteBehavior.SetNull);

        // Configure CompanyProfile
        builder.Entity<CompanyProfile>()
            .HasOne(cp => cp.Owner)
            .WithMany()
            .HasForeignKey(cp => cp.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<CompanyProfile>()
            .Property(cp => cp.Size)
            .HasMaxLength(20);

        // Configure CompanyMember
        builder.Entity<CompanyMember>()
            .HasOne(cm => cm.User)
            .WithMany(u => u.CompanyMemberships)
            .HasForeignKey(cm => cm.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<CompanyMember>()
            .HasOne(cm => cm.CompanyProfile)
            .WithMany(cp => cp.Members)
            .HasForeignKey(cm => cm.CompanyProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<CompanyMember>()
            .Property(cm => cm.Role)
            .HasMaxLength(20);

        // Configure Employee
        builder.Entity<CompanyMember>()
            .HasOne(e => e.Department)
            .WithMany(d => d.Users)
            .HasForeignKey(e => e.DepartmentId)
            .HasPrincipalKey(d => d.Id)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<CompanyMember>()
            .HasOne(e => e.Position)
            .WithMany(p => p.Users)
            .HasForeignKey(e => e.PositionId)
            .HasPrincipalKey(p => p.Id)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure EmployeeTrack (many-to-many relationship)
        builder.Entity<UserTrack>()
            .HasOne(et => et.User)
            .WithMany(e => e.AssignedTracks)
            .HasForeignKey(et => et.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<UserTrack>()
            .HasOne(et => et.Track)
            .WithMany(t => t.EmployeeTracks)
            .HasForeignKey(et => et.TrackId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure Track and related entities
        builder.Entity<Track>()
            .HasOne(t => t.CompanyProfile)
            .WithMany()
            .HasForeignKey(t => t.CompanyProfileId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure CalendarEvent
        builder.Entity<CalendarEvent>()
            .HasOne(ce => ce.User)
            .WithMany(u => u.CalendarEvents)
            .HasForeignKey(ce => ce.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure Article
        builder.Entity<Article>()
            .HasOne(a => a.CompanyProfile)
            .WithMany()
            .HasForeignKey(a => a.CompanyProfileId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Article>()
            .Property(a => a.Tags);

        // Configure Department
        builder.Entity<Department>()
            .HasOne(d => d.CompanyProfile)
            .WithMany()
            .HasForeignKey(d => d.CompanyProfileId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Department>()
            .HasIndex(d => d.Name)
            .IsUnique();

        // Configure Position
        builder.Entity<Position>()
            .HasOne(p => p.CompanyProfile)
            .WithMany()
            .HasForeignKey(p => p.CompanyProfileId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Position>()
            .HasIndex(p => p.Name)
            .IsUnique();

    }
}