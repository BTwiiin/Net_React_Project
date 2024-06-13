using System.ComponentModel.DataAnnotations;

namespace ViewModels.TimeSlotViewModel
{   
    public class TimeSlotModel {
        [Required]
        public string StartTime { get; set; } = "";
        [Required]
        public string EndTime { get; set; } = "";
    }
}
