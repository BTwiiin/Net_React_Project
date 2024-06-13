namespace Models
{
    public class Ticket
    {
        public int Id { get; set; }
        public string Brand { get; set; } = "";

        public string Model { get; set; } = "";

        public string RegistrationId { get; set; } = "";

        public string Description { get; set; } = "";

        public decimal TotalPrice { get; set; } = 0;

        public string Status { get; set; } = "Created";


        public List<User> Users { get; set; } = new List<User>();
         
        public List<TimeSlot> TimeSlots { get; set; } = new List<TimeSlot>();
        public List<Part> Parts { get; set; } = new List<Part>();
    }
}