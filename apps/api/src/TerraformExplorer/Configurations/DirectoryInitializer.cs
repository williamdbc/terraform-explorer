using System.IO;
using Serilog;
using TerraformExplorer.Settings;
using TerraformExplorer.Utils;

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
            settings.GetProvidersPath(),
            settings.GetTerraformCachePath()
        };

        foreach (var path in paths)
        {
            Directory.CreateDirectory(path);
            Log.Information("Directory ensured: {Path}", path);
        }

        var credPath = Path.Combine(settings.GetProvidersPath(), "credentials");
        var configPath = Path.Combine(settings.GetProvidersPath(), "config");
        var encryptedCredPath = Path.Combine(settings.GetProvidersPath(), "credentials.enc");
        var encryptedConfigPath = Path.Combine(settings.GetProvidersPath(), "config.enc");
        var encryptionKey = settings.GetCredentialsEncryptionKey();

        EnsureEncryptedAwsFile(credPath, encryptedCredPath, "[default]\n", encryptionKey);
        EnsureEncryptedAwsFile(configPath, encryptedConfigPath, "[default]\nregion = us-east-1\n", encryptionKey);
    }

    private static void EnsureEncryptedAwsFile(
        string legacyPath,
        string encryptedPath,
        string defaultContent,
        string encryptionKey)
    {
        if (!File.Exists(encryptedPath))
        {
            var content = File.Exists(legacyPath)
                ? File.ReadAllText(legacyPath)
                : defaultContent;

            EncryptedTextFile.WriteAllText(encryptedPath, content, encryptionKey);
        }

        if (File.Exists(legacyPath))
            File.Delete(legacyPath);
    }
}
