using System.Security.Claims;
using Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ViewModels.TimeSlotViewModel;
using Services;
using database;
using CustomExceptions;

namespace Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class TimeSlotController : Controller
    {
        private readonly UserManager<User> _userManager;
        private readonly WorkshopDbContext _context;
        private readonly RecalculateService _recalculateService;

        public TimeSlotController(UserManager<User> userManager, WorkshopDbContext context, RecalculateService recalculateService)
        {
            _userManager = userManager;
            _context = context;
            _recalculateService = recalculateService;
        }

        [HttpGet("specific/{id}")]
        public async Task<IActionResult> GetSpecificTimeSlot(int timeSlotId)
        {
            try
            {
                var timeSlot = await _context.TimeSlots.Where(ts => ts.Id == timeSlotId).FirstOrDefaultAsync();
                if (timeSlot != null)
                {
                    return Ok(timeSlot);
                }
                return NotFound();
            }
            catch (Exception)
            {
                throw;
            }
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllTimeSlots()
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var timeSlots = await _context.TimeSlots.Where(ts => ts.UserId == userId).ToListAsync();
                return Ok(timeSlots);
            }
            catch (Exception)
            {
                throw;
            }
        }

        [HttpPost("add/{ticketId}")]
        public async Task<IActionResult> AddTimeSlot([FromBody] TimeSlotModel timeSlotModel, int ticketId)
        {
            try
            {  
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (timeSlotModel.StartTime == null || timeSlotModel.EndTime == null || timeSlotModel.StartTime == "" || timeSlotModel.EndTime == "" || ticketId == 0 || userId == "")
                {
                    throw new CustomBadRequest("Missing required fields");
                }
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    throw new CustomBadRequest("User not found");
                }
                var userTimeSlots = await _context.TimeSlots.Where(ts => ts.UserId == userId).ToListAsync();
                var userTickets = await _context.Tickets.Where(t => t.Users.Any(u => u.Id == userId)).ToListAsync();
                foreach (var ts in userTimeSlots)
                {
                    if (DateTime.Parse(timeSlotModel.StartTime).ToUniversalTime() >= ts.StartTime && DateTime.Parse(timeSlotModel.StartTime).ToUniversalTime() <= ts.EndTime)
                    {
                        throw new CustomBadRequest("Time slot overlaps with another time slot");
                    }
                    if (DateTime.Parse(timeSlotModel.EndTime).ToUniversalTime() >= ts.StartTime && DateTime.Parse(timeSlotModel.EndTime).ToUniversalTime() <= ts.EndTime)
                    {
                        throw new CustomBadRequest("Time slot overlaps with another time slot");
                    }
                }
                var timeSlot = new TimeSlot
                {
                    StartTime = DateTime.Parse(timeSlotModel.StartTime).ToUniversalTime(),
                    EndTime = DateTime.Parse(timeSlotModel.EndTime).ToUniversalTime(),
                    TicketId = ticketId,
                    UserId = userId
                };
                if (userTickets.Any(t => t.Id == ticketId) == false)
                {
                    var ticket = await _context.Tickets.Where(t => t.Id == ticketId).FirstOrDefaultAsync();
                    _context.Tickets.Find(ticketId)!.Users.Add(user);
                }
                _context.TimeSlots.Add(timeSlot);
                var ticketUser = await _context.Tickets.Where(t => t.Id == ticketId).Include(t => t.Users).FirstOrDefaultAsync();
                bool Succeeded = await _context.SaveChangesAsync() > 0;
                if (Succeeded)
                {
                    var result = await _recalculateService.RecalculateTotalPrice(ticketId) ? IdentityResult.Success : IdentityResult.Failed();
                    if (result.Succeeded)
                    {
                        return Ok(timeSlot);
                    }
                }
                throw new CustomBadRequest("Failed to add time slot");
            }
            catch (Exception)
            {
                throw;
            }
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteTimeSlot(int id)
        {
            try
            {
                var timeSlot = await _context.TimeSlots.Where(ts => ts.Id == id).FirstOrDefaultAsync();

                if (timeSlot != null)
                {
                    var userId = timeSlot.UserId;
                    var ticket  = await _context.Tickets.Where(t => t.Id == timeSlot.TicketId).Include(t => t.Users).FirstOrDefaultAsync();
                    var employeeTimeSlotsForThisTicket = await _context.TimeSlots.Where(ts => ts.UserId == userId && ts.TicketId == timeSlot.TicketId).ToListAsync();
                    if (employeeTimeSlotsForThisTicket.Count == 1)
                    {
                        ticket.Users.Remove(await _context.Users.Where(u => u.Id == userId).FirstOrDefaultAsync());
                    }
                    _context.TimeSlots.Remove(timeSlot);
                    bool Succeeded = await _context.SaveChangesAsync() > 0;
                    if (Succeeded)
                    {
                        var result = await _recalculateService.RecalculateTotalPrice(timeSlot.TicketId) ? IdentityResult.Success : IdentityResult.Failed();
                        if (result.Succeeded)
                        {
                            return Ok(new
                            {
                                Success = true,
                                Message = "Time slot has been deleted"
                            });
                        }
                        return BadRequest(result.Errors);
                    }
                }
                throw new CustomBadRequest("Failed to delete time slot");
            }
            catch (Exception)
            {
                throw;
            }
        }

        
    }


}