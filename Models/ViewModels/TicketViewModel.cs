using System.ComponentModel.DataAnnotations;

namespace ViewModels.TicketViewModel
{   
    public class TicketModel
    {
        [Required]
        public string Brand { get; set; } = "";
        [Required]
        public string Model { get; set; } = "";
        [Required]
        public string RegistrationId { get; set; } = "";
        [Required]
        public string Description { get; set; } = "";
    }
}