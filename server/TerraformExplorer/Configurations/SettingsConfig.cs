using TerraformExplorer.Extensions;
using TerraformExplorer.Settings;

namespace TerraformExplorer.Configurations;

public static class SettingsConfig
{
    public static void ConfigureSettings(this WebApplicationBuilder builder)
    {
        builder.Services.AddValidatedSingletonSettings<TerraformSettings>(builder.Configuration, "TerraformSettings");
    }
}