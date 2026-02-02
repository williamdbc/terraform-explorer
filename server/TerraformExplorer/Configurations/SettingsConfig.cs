using TerraformExplorer.Extensions;
using TerraformExplorer.Settings;

namespace TerraformExplorer.Configurations;

public static class SettingsConfig
{
    public static void ConfigureSettings(this WebApplicationBuilder builder)
    {
        builder.Services.AddValidatedSingletonSettings<TerraformSettings>(builder.Configuration, "TerraformSettings");
        builder.Services.AddValidatedSingletonSettings<DatabaseSettings>(builder.Configuration, "DatabaseSettings");
        builder.Services.AddValidatedSingletonSettings<AuthSettings>(builder.Configuration, "AuthSettings");
    }
}