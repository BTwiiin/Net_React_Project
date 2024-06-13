using Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;


namespace database
{
    public class WorkshopDbContext : IdentityDbContext<User>
    {
        public WorkshopDbContext(DbContextOptions<WorkshopDbContext> options) : base(options)
        {
        }


        public DbSet<Ticket> Tickets { get; set; } = null!;
        public DbSet<TimeSlot> TimeSlots { get; set; } = null!;

        public DbSet<Part> Parts { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);


            builder.Entity<User>()
                .HasMany(u => u.Tickets);

            builder.Entity<User>()
                .HasMany(u => u.TimeSlots);

            builder.Entity<Ticket>()
                .HasMany(t => t.TimeSlots)
                .WithOne(ts => ts.Ticket)
                .HasForeignKey(ts => ts.TicketId);

            builder.Entity<Ticket>()
                .HasMany(t => t.Users)
                .WithMany(u => u.Tickets);

            builder.Entity<Ticket>()
                .HasMany(t => t.Parts);

            builder.Entity<TimeSlot>()
                .HasKey(ts => ts.Id);



            builder.Entity<TimeSlot>()
                .HasOne(ts => ts.User)
                .WithMany(u => u.TimeSlots)
                .HasForeignKey(ts => ts.UserId);

            builder.Entity<Part>()
                .HasKey(p => p.Id);

        }
    }


}