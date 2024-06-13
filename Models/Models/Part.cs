namespace Models
{
    public class Part
    {
        public int Id { get; set; }

        public string Name { get; set; } = "";

        public decimal Price { get; set; } = 0;

        public decimal Quantity { get; set; } = 0;

        public decimal TotalPrice { get; set; } = 0;

        public int TicketId { get; set; }
    }
}