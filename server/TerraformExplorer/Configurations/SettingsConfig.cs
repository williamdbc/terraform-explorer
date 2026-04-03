using TerraformExplorer.Extensions;
using TerraformExplorer.Settings;

namespace TerraformExplorer.Configurations;

public static class SettingsConfig
{
    public static void ConfigureSettings(this WebApplicationBuilder builder)
    {
        builder.Services.AddValidatedSingletonSettings<TerraformSettings>(builder.Configuration, "TerraformSettings");
        builder.Services.AddSingleton(BuildGitSettings(builder.Configuration));
    }

    private static GitSettings BuildGitSettings(IConfiguration configuration)
    {
        var settings = configuration.GetSection("GitSettings").Get<GitSettings>() ?? new GitSettings();
        settings.Token = configuration["GIT_TOKEN"] ?? settings.Token;
        settings.RepoUrl = configuration["GIT_REPO_URL"] ?? settings.RepoUrl;
        settings.UserName = configuration["GIT_USER_NAME"] ?? settings.UserName;
        settings.UserEmail = configuration["GIT_USER_EMAIL"] ?? settings.UserEmail;
        return settings;
    }
}