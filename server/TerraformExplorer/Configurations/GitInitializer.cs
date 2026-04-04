using TerraformExplorer.Services;

namespace TerraformExplorer.Configurations;

public static class GitInitializer
{
    public static async Task InitializeGitAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var gitService = scope.ServiceProvider.GetRequiredService<GitService>();

        // Always mark the directory as safe — fixes "dubious ownership" errors
        // when the volume was cloned on the host by a different user (e.g. non-root)
        // than the container runtime user (root).
        await gitService.ConfigureSafeDirectoryAsync();

        if (!gitService.IsRepoInitialized()) return;

        await gitService.ConfigureGitUserAsync();
        gitService.EnsureGitIgnore();
    }
}
