using Microsoft.EntityFrameworkCore;
using TerraformExplorer.Data;
using TerraformExplorer.Settings;

namespace TerraformExplorer.Configurations;

public static class DatabaseConfig
{
    public static void ConfigureDatabase(this WebApplicationBuilder builder)
    {
        var databaseSettings = builder.Services.BuildServiceProvider().GetRequiredService<DatabaseSettings>();

        builder.Services.AddDbContext<TerraformExplorerDbContext>(options =>
            options.UseSqlite(databaseSettings.ConnectionString));
    }

    public static void InitializeDatabase(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<TerraformExplorerDbContext>();
        dbContext.Database.Migrate();
        //dbContext.Database.EnsureCreated();
    }
}