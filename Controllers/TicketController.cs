using Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ViewModels.TicketViewModel;
using database;
using System.Security.Claims;
using Sprache;
using CustomExceptions;

namespace Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class TicketController : Controller
    {
        private readonly UserManager<User> _userManager;
        private readonly WorkshopDbContext _context;

        public TicketController(UserManager<User> userManager, WorkshopDbContext context)
        {
            _userManager = userManager;
            _context = context;
        }

        [HttpGet("specific/{id}")]
        public async Task<IActionResult> GetSpecificTicket(int id)
        {
            try
            {
                var ticket = await _context.Tickets.Where(t => t.Id == id).FirstOrDefaultAsync();
                if (ticket != null)
                {
                    ticket.Parts = await _context.Parts.Where(p => p.TicketId == id).ToListAsync();
                    ticket.TimeSlots = await _context.TimeSlots.Where(ts => ts.TicketId == id).ToListAsync();
                }
                if (ticket != null)
                {
                    return Ok(ticket);
                }
                return NotFound();
            }
            catch (Exception)
            {
                throw;
            }
        }


        [HttpGet("user/all")]
        public async Task<IActionResult> GetAllTicketsForUser()
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var tickets = new List<Ticket>();
                tickets = await _context.Tickets.Where(t => t.Users.Any(u => u.Id == userId)).Include(t => t.Parts)
                                        .Include(t => t.TimeSlots.Where(ts => ts.UserId == userId)).ToListAsync();
                return Ok(tickets);
            }
            catch (Exception)
            {
                throw;
            }
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllTickets()
        {
            try
            {
                var tickets = new List<Ticket>();
                tickets = await _context.Tickets.ToListAsync();
                return Ok(tickets);
            }
            catch (Exception)
            {
                throw;
            }
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateTicket([FromBody] TicketModel ticketModel)
        {
            try
            {
                string userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (userId == null)
                {
                    throw new CustomBadRequest("User not found");
                }
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    throw new CustomBadRequest("User not found");
                }
                if (ticketModel.Brand == "" || ticketModel.Model == "" || ticketModel.RegistrationId == "" || ticketModel.Description == "")
                {
                    throw new CustomBadRequest("Missing required fields");
                }
                var ticket = new Ticket
                {
                    Brand = ticketModel.Brand,
                    Model = ticketModel.Model,
                    RegistrationId = ticketModel.RegistrationId,
                    Description = ticketModel.Description,
                };
                _context.Tickets.Add(ticket);

                var result = await _context.SaveChangesAsync() > 0 ? IdentityResult.Success : IdentityResult.Failed();

                if (result.Succeeded)
                {
                    return Ok(
                        new
                        {
                            Success = true,
                            Message = "Ticket has been created"
                        }
                    );
                }
                return BadRequest(result.Errors);

            }
            catch (Exception)
            {
                throw;
            }
        }

        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateTicket(int id, [FromBody] Ticket newTicket)
        {
            try
            {
                var ticket = await _context.Tickets.FirstOrDefaultAsync(t => t.Id == id);
                var result = IdentityResult.Failed();
                if (ticket != null)
                {
                    ticket.Brand = newTicket.Brand;
                    ticket.Model = newTicket.Model;
                    ticket.RegistrationId = newTicket.RegistrationId;
                    ticket.Description = newTicket.Description;
                    ticket.Status = newTicket.Status;
                    result = await _context.SaveChangesAsync() > 0 ? IdentityResult.Success : IdentityResult.Failed();
                    if (!result.Succeeded)
                    {
                        throw new CustomBadRequest("Failed to update ticket");
                    }
                    result = RecalculateTotalPrice(id).Result ? IdentityResult.Success : IdentityResult.Failed();

                }
                if (result.Succeeded)
                {
                    return Ok(new
                    {
                        Success = true,
                        Message = "Ticket has been updated"
                    });
                }
                return BadRequest(result.Errors);
            }
            catch (Exception)
            {
                throw;
            }
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteTicket(int id)
        {
            try
            {
                var ticket = await _context.Tickets.FirstOrDefaultAsync(t => t.Id == id);
                var result = IdentityResult.Failed();
                if (ticket != null)
                {
                    _context.Tickets.Remove(ticket);
                    if (ticket.Parts != null && ticket.Parts.Count > 0)
                        _context.Parts.RemoveRange(ticket.Parts);
                    if (ticket.TimeSlots != null && ticket.TimeSlots.Count > 0)
                        _context.TimeSlots.RemoveRange(ticket.TimeSlots);
                    result = await _context.SaveChangesAsync() > 0 ? IdentityResult.Success : IdentityResult.Failed();
                    if (result.Succeeded)
                    {
                        return Ok(new
                        {
                            Success = true,
                            Message = "Ticket has been deleted"
                        });
                    }
                return BadRequest(result.Errors);
                }
                throw new CustomBadRequest("Ticket not found");
            }
            catch (Exception)
            {
                throw;
            }
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
