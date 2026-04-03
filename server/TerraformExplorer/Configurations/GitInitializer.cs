using TerraformExplorer.Services;

namespace TerraformExplorer.Configurations;

public static class GitInitializer
{
    public static async Task InitializeGitAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var gitService = scope.ServiceProvider.GetRequiredService<GitService>();

        if (!gitService.IsRepoInitialized()) return;

        await gitService.ConfigureGitUserAsync();
        gitService.EnsureGitIgnore();
    }
}
