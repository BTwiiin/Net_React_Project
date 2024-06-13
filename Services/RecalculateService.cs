using database;
using Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Sprache;


namespace Services
{
    public class RecalculateService{
        private readonly UserManager<User> _userManager;
        private readonly WorkshopDbContext _context;

        public RecalculateService(UserManager<User> userManager, WorkshopDbContext context)
        {
            _userManager = userManager;
            _context = context;
        }

        public async Task<bool> RecalculateTotalPrice(int ticketId)
            {
            var ticket = await _context.Tickets.FirstOrDefaultAsync(t => t.Id == ticketId);
            var parts = await _context.Parts.Where(p => p.TicketId == ticketId).ToListAsync();
            var timeSlots = await _context.TimeSlots.Where(ts => ts.TicketId == ticketId).ToListAsync();
            if (ticket != null)
            {
                decimal totalPrice = 0;
                if (parts != null && parts.Count > 0)
                {
                    foreach (var part in parts)
                    {
                        totalPrice += part.TotalPrice;
                    }
                }
                if (timeSlots != null && timeSlots.Count > 0)
                {
                    foreach (var timeSlot in timeSlots)
                    {
                        var employee = await _userManager.FindByIdAsync(timeSlot.UserId);
                        if (employee != null)
                        {
                            totalPrice += employee.HourlyRate * (timeSlot.EndTime - timeSlot.StartTime).Hours;
                        }
                    }
                }
                ticket.TotalPrice = totalPrice;
                await _context.SaveChangesAsync();
                return true;
            }
            return false;
        }
    }
}