using Microsoft.AspNetCore.Identity;

namespace Models
{
    public class User : IdentityUser
    {
        public string Name { get; set; } = "";

        public decimal HourlyRate { get; set; } = 10;

        public string RefreshToken { get; set; } = "";
        public DateTime RefreshTokenExpiryTime { get; set; }

        public List<Ticket> Tickets { get; set; } = new List<Ticket>();

        public List<TimeSlot> TimeSlots { get; set; } = new List<TimeSlot>();

    }
}