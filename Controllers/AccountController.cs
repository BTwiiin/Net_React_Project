using System.Security.Claims;
using Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using ViewModels.AccountViewModels;
using Responses;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using CustomExceptions;

namespace Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : Controller
    {
        private readonly UserManager<User> _userManager;

        public AccountController(UserManager<User> userManager)
        {
            _userManager = userManager;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterModel model)
        {
            try
            {
                var user = new User { UserName = model.Username };
                if (await _userManager.FindByNameAsync(model.Username) != null)
                    throw new CustomBadRequest("Username already exists");
                var result = await _userManager.CreateAsync(user, model.Password);

                if (result.Succeeded)
                {
                    await _userManager.AddToRoleAsync(user, "Worker");
                }
                else if (result.Errors.Any())
                {
                    throw new CustomBadRequest(result.Errors.First().Description);
                }
                if (result.Succeeded)
                {
                    return Ok(
                        new
                        {
                            Success = true,
                            Message = "User registered successfully"
                        }
                    );
                }
                throw new CustomBadRequest("Unable to register user");
            }
            catch (Exception)
            {
                throw;
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            try
            {
                var user = await _userManager.FindByNameAsync(model.Username);
                if (user == null)
                    throw new CustomBadRequest("Invalid credentials");

                AuthenticatedResponse responce = null;

                if (await _userManager.CheckPasswordAsync(user, model.Password))
                {
                    var token = GenerateJwtToken(user);
                    var refreshToken = GenerateJwtToken(user, true);
                    user.RefreshToken = refreshToken;
                    user.RefreshTokenExpiryTime = DateTime.Now.ToUniversalTime().AddDays(30);
                    await _userManager.UpdateAsync(user);
                    HttpContext.Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
                    {
                        HttpOnly = true,
                        Secure = true,
                        SameSite = SameSiteMode.None,
                        Expires = DateTime.UtcNow.AddDays(7)
                    });
                    responce = new AuthenticatedResponse
                    {
                        Token = token,
                        RefreshToken = refreshToken
                    };
                }
                if (responce != null)
                {
                    return Ok(responce);
                }
                throw new CustomBadRequest("Invalid credentials");
            }
            catch (Exception)
            {
                throw;
            }
        }

        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh()
        {
            try
            {
                var refreshToken = Request.Cookies["refreshToken"];
                if (string.IsNullOrEmpty(refreshToken))
                {
                    throw new CustomBadRequest("Invalid token");
                }
                var response = await RefreshTokenAsync(refreshToken);
                if (response != null)
                {
                    return Ok(response);
                }
                throw new CustomUnauthorized("Invalid token");
            }
            catch (Exception)
            {
                throw;
            }
        }

        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            try
            {
                var user = await _userManager.GetUserAsync(HttpContext.User);
                user.RefreshToken = "";
                HttpContext.Response.Cookies.Delete("refreshToken");
                user.RefreshTokenExpiryTime = DateTime.UtcNow;
                await _userManager.UpdateAsync(user);
                return Ok();
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<AuthenticatedResponse?> RefreshTokenAsync(string token)
            {
                var principal = GetPrincipalFromExpiredToken(token, true);
                var username = principal.Identity.Name;
                var user = await _userManager.FindByNameAsync(username);

                if (user == null || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
                    return null;

                var newJwtToken = GenerateJwtToken(user);
                var newRefreshToken = GenerateJwtToken(user, true);

                user.RefreshToken = newRefreshToken;
                user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);

                await _userManager.UpdateAsync(user);

                return new AuthenticatedResponse
                {
                    Token = newJwtToken,
                    RefreshToken = newRefreshToken
                };
            }

        public async Task<User?> FindByUsernameAsync(string username)
        {
            return await _userManager.FindByNameAsync(username);
        }



        private string GenerateJwtToken(User user, bool isRefreshToken = false)
        {
            string secret = isRefreshToken ? Environment.GetEnvironmentVariable("REFRESH_SECRET_KEY") : Environment.GetEnvironmentVariable("SECRET_KEY");
            if (secret == null)
                throw new InvalidOperationException("No secret key found");
            var userRoles = _userManager.GetRolesAsync(user).Result;
            if (userRoles.Count == 0)
                throw new InvalidOperationException("User has no roles");
            var roleClaims = userRoles.Select(role => new Claim(ClaimTypes.Role, role)).ToList();
            var claims = new[]
            {
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim(ClaimTypes.NameIdentifier, user.Id)
            }.Union(roleClaims);

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);


            var token = new JwtSecurityToken(
                issuer: "*",
                audience: "*",
                claims: claims,
                expires: DateTime.UtcNow.AddHours(3),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private ClaimsPrincipal GetPrincipalFromExpiredToken(string token, bool isRefreshToken = false)
        {
            var secret = isRefreshToken ? Environment.GetEnvironmentVariable("REFRESH_SECRET_KEY") : Environment.GetEnvironmentVariable("SECRET_KEY");
            if (secret == null)
                throw new InvalidOperationException("No secret key found");
            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = false,
                ValidateIssuerSigningKey = true,
                ValidIssuer = "*",
                ValidAudience = "*",
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret))
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out var securityToken);
            var jwtSecurityToken = securityToken as JwtSecurityToken;

            if (jwtSecurityToken == null || !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
                throw new SecurityTokenException("Invalid token");
            return principal;
        }
    }
}