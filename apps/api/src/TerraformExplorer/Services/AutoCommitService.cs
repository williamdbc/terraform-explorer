using TerraformExplorer.Settings;

namespace TerraformExplorer.Services;

public class AutoCommitService : BackgroundService
{
    private readonly GitSettings _gitSettings;
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<AutoCommitService> _logger;

    public AutoCommitService(GitSettings gitSettings, IServiceProvider serviceProvider, ILogger<AutoCommitService> logger)
    {
        _gitSettings = gitSettings;
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var lastRun = DateTime.MinValue;

        while (!stoppingToken.IsCancellationRequested)
        {
            await Task.Delay(1000, stoppingToken);

            if (!_gitSettings.AutoCommitEnabled) continue;

            var elapsed = (DateTime.UtcNow - lastRun).TotalSeconds;
            if (elapsed < _gitSettings.AutoCommitIntervalSeconds) continue;

            lastRun = DateTime.UtcNow;

            try
            {
                using var scope = _serviceProvider.CreateScope();
                var gitService = scope.ServiceProvider.GetRequiredService<GitService>();

                if (!gitService.IsRepoInitialized()) continue;
                if (!await gitService.HasChangesAsync()) continue;

                await gitService.CommitAsync();
                await gitService.PushAsync();
                _logger.LogInformation("Auto-commit executado com sucesso.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro durante o auto-commit.");
            }
        }
    }
}
