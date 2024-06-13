using System.ComponentModel.DataAnnotations;

namespace ViewModels.PartViewModel
{
    public class PartModel {
        [Required]
        public string Name { get; set; } = "";
        [Required]
        public decimal Price { get; set; } = 0;
        [Required]
        public decimal Quantity { get; set; } = 0;
    }
}