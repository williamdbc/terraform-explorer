using System.IO;
using Serilog;
using TerraformExplorer.Settings;

namespace TerraformExplorer.Configurations;

public static class DirectoryInitializer
{
    public static void InitializeDirectories(this WebApplicationBuilder builder)
    {
        var settings = builder.Configuration.GetSection("TerraformSettings").Get<TerraformSettings>();
        if (settings == null) return;

        var paths = new[]
        {
            settings.GetAccountsPath(),
            settings.GetModulesPath(),
            settings.GetProvidersPath()
        };

        foreach (var path in paths)
        {
            Directory.CreateDirectory(path);
            Log.Information("Directory ensured: {Path}", path);
        }

        var credPath = Path.Combine(settings.GetProvidersPath(), "credentials");
        var configPath = Path.Combine(settings.GetProvidersPath(), "config");

        if (!File.Exists(credPath))
            File.WriteAllText(credPath, "[default]\n");
        if (!File.Exists(configPath))
            File.WriteAllText(configPath, "[default]\nregion = us-east-1\n");
    }
}