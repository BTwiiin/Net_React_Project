using Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using ViewModels.PartViewModel;
using Microsoft.EntityFrameworkCore;
using Services;
using database;
using CustomExceptions;

namespace Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class PartController : Controller
    {
        private readonly WorkshopDbContext _context;
        private readonly RecalculateService _recalculateService;

        public PartController(WorkshopDbContext context, RecalculateService recalculateService)
        {
            _context = context;
            _recalculateService = recalculateService;
        }

        [HttpGet("specific/{id}")]
        public async Task<IActionResult> GetSpecificPart(int partId)
        {
            try
            {
                var part = await _context.Parts.Where(p => p.Id == partId).FirstOrDefaultAsync();
                if (part != null)
                {
                    return Ok(part);
                }
                return NotFound();
            }
            catch (Exception)
            {
                throw;
            }
        }

        [HttpGet("all/{id}")]
        public async Task<IActionResult> GetAllParts(int ticketId)
        {
            try
            {
                var parts = await _context.Parts.Where(p => p.TicketId == ticketId).ToListAsync();
                return Ok(parts);
            }
            catch (Exception)
            {
                throw;
            }
        }

        [HttpPost("add/{ticketId}")]
        public async Task<IActionResult> AddPart([FromBody] PartModel partModel, int ticketId)
        {
            try
            {
                if (partModel.Name == "" || partModel.Price == 0)
                {
                    throw new CustomBadRequest("Missing required fields");
                }
                var part = new Part
                {
                    Name = partModel.Name,
                    Price = partModel.Price,
                    Quantity = partModel.Quantity,
                    TotalPrice = partModel.Price * partModel.Quantity,
                    TicketId = ticketId,
                };
                _context.Parts.Add(part);
                bool Succeeded = await _context.SaveChangesAsync() > 0;
                if (Succeeded)
                {
                    var result = await _recalculateService.RecalculateTotalPrice(ticketId) ? IdentityResult.Success : IdentityResult.Failed();
                    if (result.Succeeded)
                    {
                        return Ok(
                            new
                            {
                                Success = true,
                                Message = "Part has been added"
                            }
                        );
                    }
                    return BadRequest();
                }
                throw new CustomBadRequest("Failed to add part");
            }
            catch (Exception)
            {
                throw;
            }
        }

        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdatePart([FromBody] PartModel partModel, int partId)
        {
            try
            {
                var part = await _context.Parts.Where(p => p.Id == partId).FirstOrDefaultAsync();
                if (part != null)
                {
                    part.Name = partModel.Name;
                    part.Price = partModel.Price;
                    part.Quantity = partModel.Quantity;
                    part.TotalPrice = partModel.Price * partModel.Quantity;
                    bool Succeeded = await _context.SaveChangesAsync() > 0;
                    if (Succeeded)
                    {
                        var result = await _recalculateService.RecalculateTotalPrice(part.TicketId) ? IdentityResult.Success : IdentityResult.Failed();
                        if (result.Succeeded)
                        {
                            return Ok(
                                new
                                {
                                    Success = true,
                                    Message = "Part has been updated"
                                }
                            );
                        }
                        return BadRequest();
                    }
                }
                throw new CustomBadRequest("Failed to update part");
            }
            catch (Exception)
            {
                throw;
            }
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeletePart(int partId)
        {
            try
            {
                var part = await _context.Parts.Where(p => p.Id == partId).FirstOrDefaultAsync();
                if (part == null)
                {
                    throw new CustomBadRequest("Part not found");
                }
                int ticketId = part.TicketId;
                _context.Parts.Remove(part);

                bool Succeeded = await _context.SaveChangesAsync() > 0;

                if (Succeeded)
                {
                    var result = await _recalculateService.RecalculateTotalPrice(ticketId) ? IdentityResult.Success : IdentityResult.Failed();
                    if (result.Succeeded)
                    {
                        return Ok(
                            new
                            {
                                Success = true,
                                Message = "Part has been deleted"
                            }
                        );
                    }
                    return BadRequest();
                }

                throw new CustomBadRequest("Failed to delete part");
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}