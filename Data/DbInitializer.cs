using database;
using Models;
using Microsoft.AspNetCore.Identity;

public class DbInitializer
{
    public static async Task InitializeAsync(IServiceScope serviceScope)
    {
        var roleManager = serviceScope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = serviceScope.ServiceProvider.GetRequiredService<UserManager<User>>();
        var context = serviceScope.ServiceProvider.GetRequiredService<WorkshopDbContext>();

        if (!context.Roles.Any())
        {
            await SeedRoles(roleManager);
        }

        if (!context.Users.Any())
        {
            await SeedUsers(userManager, roleManager);
        }
    }

    public static async Task SeedRoles(RoleManager<IdentityRole> roleManager)
    {
        var roles = new[]
        {
            new IdentityRole("Admin"),
            new IdentityRole("Worker"),
        };

        foreach (var role in roles)
        {
            await roleManager.CreateAsync(role);
        }
    }

    public static async Task SeedUsers(UserManager<User> userManager, RoleManager<IdentityRole> roleManager)
    {
        User user = new User
        {
            UserName = "admin",
        };

        var existingUser = await userManager.FindByNameAsync(user.UserName);
        if (existingUser == null)
        {
            var createUserResult = await userManager.CreateAsync(user, "123ZaZ!");
            if (createUserResult.Succeeded)
            {
                await AssignRole(userManager, roleManager);
            }
        }
    }

    private static async Task AssignRole(UserManager<User> userManager, RoleManager<IdentityRole> roleManager)
    {
        var adminRole = await roleManager.FindByNameAsync("Admin");
        var adminUser = await userManager.FindByNameAsync("admin");
       

        if (adminUser != null && adminRole != null && !await userManager.IsInRoleAsync(adminUser, adminRole.Name))
        {
            await userManager.AddToRoleAsync(adminUser, adminRole.Name);
        }
    }
}