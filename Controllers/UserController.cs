using database;
using Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using ViewModels.AccountViewModels;
using Responses;
using System.Security.Claims;
using CustomExceptions;
namespace Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class UserController : Controller
    {
        private readonly UserManager<User> _userManager;
        private readonly WorkshopDbContext _context;

        public UserController(UserManager<User> userManager, WorkshopDbContext context)
        {
            _userManager = userManager;
            _context = context;
        }

        [HttpGet("specific")]
        public async Task<IActionResult> GetCurrentUserInfo()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _userManager.FindByIdAsync(userId);
            if (user != null)
            {
                var timeSlots = _context.TimeSlots.Where(ts => ts.UserId == userId).ToList();
                return Ok(new UserInfoResponse
                {
                    Username = user.UserName,
                    HourlyRate = user.HourlyRate,
                    Id = user.Id,
                    TimeSlots = timeSlots.ToArray()
                });
            }
            return BadRequest(new CustomBadRequest("User not found"));
        }

        [HttpPut("update/password")]
        public async Task<IActionResult> ChangeCurrentUserPassword([FromBody] ChangePasswordModel model)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _userManager.FindByIdAsync(userId);

            if (user != null)
            {
                var result = await _userManager.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword);
                if (result.Succeeded)
                {
                    return Ok(new { Success = true, Message = "Password has been changed" });
                }

                var error = result.Errors.FirstOrDefault();
                if (error != null)
                {
                    return BadRequest(new CustomBadRequest(error.Description));
                }
            }

            return BadRequest(new CustomBadRequest("Unable to change password"));
        }

        [HttpGet("all")]
        [Authorize(Policy = "AdminPolicy")]
        public async Task<IActionResult> GetAllEmployees()
        {
            var employees = await _userManager.GetUsersInRoleAsync("Worker");
            var result = employees.Select(e => new { e.UserName, e.Id }).ToList();
            return Ok(result);
        }

        [HttpDelete("specific/{id}")]
        [Authorize(Policy = "AdminPolicy")]
        public async Task<IActionResult> DeleteEmployee(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user != null)
            {
                var result = await _userManager.DeleteAsync(user);
                if (result.Succeeded)
                {
                    return Ok();
                }
            }
            return BadRequest(new CustomBadRequest("Unable to delete user"));
        }
    }
}
