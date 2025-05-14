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

    public DbSet<Employee> Employees { get; set; } = null!;
    public DbSet<Track> Tracks { get; set; } = null!;
    public DbSet<Article> Articles { get; set; } = null!;
    public DbSet<Notification> Notifications { get; set; } = null!;
    public DbSet<Department> Departments { get; set; } = null!;
    public DbSet<Position> Positions { get; set; } = null!;
    public DbSet<CompanyProfile> CompanyProfiles { get; set; } = null!;
    public DbSet<CompanyMember> CompanyMembers { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Configure User
        builder.Entity<User>()
            .HasOne(u => u.CurrentCompany)
            .WithMany()
            .HasForeignKey(u => u.CurrentCompanyId)
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
        builder.Entity<Employee>()
            .HasOne(e => e.Mentor)
            .WithMany()
            .HasForeignKey(e => e.MentorId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<Employee>()
            .HasOne(e => e.AssignedTrack)
            .WithMany()
            .HasForeignKey(e => e.AssignedTrackId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<Employee>()
            .HasOne(e => e.Department)
            .WithMany(d => d.Employees)
            .HasForeignKey(e => e.DepartmentId)
            .HasPrincipalKey(d => d.Id)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Employee>()
            .HasOne(e => e.Position)
            .WithMany(p => p.Employees)
            .HasForeignKey(e => e.PositionId)
            .HasPrincipalKey(p => p.Id)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Employee>()
            .HasOne(e => e.CompanyProfile)
            .WithMany()
            .HasForeignKey(e => e.CompanyProfileId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Employee>()
            .Property(e => e.StepProgress);

        // Configure Track and related entities
        builder.Entity<Track>()
            .HasOne(t => t.CompanyProfile)
            .WithMany()
            .HasForeignKey(t => t.CompanyProfileId)
            .OnDelete(DeleteBehavior.Restrict);

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

        // Configure Notification
        builder.Entity<Notification>()
            .HasOne(n => n.Employee)
            .WithMany(e => e.Notifications)
            .HasForeignKey(n => n.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Notification>()
            .HasOne(n => n.CompanyProfile)
            .WithMany()
            .HasForeignKey(n => n.CompanyProfileId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Notification>()
            .Property(n => n.Type)
            .HasMaxLength(50);
    }
}