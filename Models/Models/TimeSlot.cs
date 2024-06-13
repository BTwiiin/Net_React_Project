namespace Models
{
    public class TimeSlot
    {
        public DateTime StartTime { get; set; }

        public DateTime EndTime { get; set; }

        public int Id { get; set; }

        public string UserId { get; set; } = "";

        public User User { get; set; } = null!;

        public int TicketId { get; set; }

        public Ticket Ticket { get; set; } = null!;
    }
}