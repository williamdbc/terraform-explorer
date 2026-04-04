using System.Diagnostics;
using TerraformExplorer.Exceptions;
using TerraformExplorer.Models.Responses;
using TerraformExplorer.Settings;

namespace TerraformExplorer.Services;

public class GitService
{
    private readonly TerraformSettings _terraformSettings;
    private readonly GitSettings _gitSettings;

    public GitService(TerraformSettings terraformSettings, GitSettings gitSettings)
    {
        _terraformSettings = terraformSettings;
        _gitSettings = gitSettings;
    }

    // ─── Repo state ───────────────────────────────────────────────────────────

    public bool IsRepoInitialized()
    {
        var gitDir = Path.Combine(_terraformSettings.GetRootPath(), ".git");
        return Directory.Exists(gitDir);
    }

    // ─── Setup ────────────────────────────────────────────────────────────────

    /// <summary>
    /// Marks the repo root as a safe directory globally.
    /// Fixes "dubious ownership" errors when the volume was cloned on the host
    /// by a different user than the container's runtime user (root).
    /// </summary>
    public async Task ConfigureSafeDirectoryAsync()
    {
        var rootPath = _terraformSettings.GetRootPath();
        // --global flag works from any working dir; we use /tmp to be safe
        await RunGitInDirAsync($"config --global --add safe.directory {rootPath}", Path.GetTempPath());
    }

    public async Task ConfigureGitUserAsync()
    {
        if (!IsRepoInitialized()) return;

        if (!string.IsNullOrWhiteSpace(_gitSettings.UserName))
            await RunGitAsync($"config user.name \"{_gitSettings.UserName}\"");

        if (!string.IsNullOrWhiteSpace(_gitSettings.UserEmail))
            await RunGitAsync($"config user.email \"{_gitSettings.UserEmail}\"");
    }

    public void EnsureGitIgnore()
    {
        var gitIgnorePath = Path.Combine(_terraformSettings.GetRootPath(), ".gitignore");
        var requiredEntries = new[] { ".aws/", ".terraform.d/", ".terraform-cache/" };

        var existing = File.Exists(gitIgnorePath)
            ? File.ReadAllLines(gitIgnorePath).ToHashSet(StringComparer.OrdinalIgnoreCase)
            : new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        var toAdd = requiredEntries.Where(e => !existing.Contains(e)).ToList();
        if (toAdd.Count > 0)
            File.AppendAllLines(gitIgnorePath, toAdd);
    }

    // ─── Clone ────────────────────────────────────────────────────────────────

    /// <summary>
    /// Clones the configured remote repo into a temp dir, then moves just the
    /// .git folder into the Terraform root — preserving any existing local files.
    /// Immediately configures user and .gitignore without requiring a restart.
    /// </summary>
    public async Task CloneAsync()
    {
        if (IsRepoInitialized())
            throw new BusinessException("O diretório já possui um repositório Git inicializado.");

        if (string.IsNullOrWhiteSpace(_gitSettings.RepoUrl))
            throw new BusinessException("URL do repositório não configurada (GIT_REPO_URL).");

        var rootPath = _terraformSettings.GetRootPath();
        var tmpDir = Path.Combine(Path.GetTempPath(), $"git-clone-{Guid.NewGuid():N}");

        try
        {
            var authenticatedUrl = BuildAuthenticatedUrl();

            // Clone into temp dir so we don't clobber existing files
            var cloneResult = await RunGitInDirAsync(
                $"clone --no-local \"{authenticatedUrl}\" \"{tmpDir}\"",
                Path.GetTempPath()
            );

            if (cloneResult.ExitCode != 0)
                throw new BusinessException($"Erro ao clonar: {cloneResult.Error}");

            // Move only the .git folder into the root
            var tmpGit = Path.Combine(tmpDir, ".git");
            var rootGit = Path.Combine(rootPath, ".git");
            Directory.Move(tmpGit, rootGit);

            // Apply safe.directory, user config and .gitignore without restarting
            await ConfigureSafeDirectoryAsync();
            await ConfigureGitUserAsync();
            EnsureGitIgnore();
        }
        finally
        {
            if (Directory.Exists(tmpDir))
                Directory.Delete(tmpDir, true);
        }
    }

    // ─── Status ───────────────────────────────────────────────────────────────

    public async Task<GitStatusResponse> GetStatusAsync()
    {
        var response = new GitStatusResponse
        {
            IsInitialized = IsRepoInitialized(),
            AutoCommitEnabled = _gitSettings.AutoCommitEnabled,
            AutoCommitIntervalSeconds = _gitSettings.AutoCommitIntervalSeconds
        };

        if (!response.IsInitialized)
            return response;

        var branchResult = await RunGitAsync("rev-parse --abbrev-ref HEAD");
        response.Branch = branchResult.Output.Trim();

        var statusResult = await RunGitAsync("status --porcelain");
        var changedFiles = ParsePorcelainStatus(statusResult.Output);
        response.ChangedFiles = changedFiles.Select(f => f.Path).ToList();
        response.ModifiedFiles = changedFiles.Count;

        if (!string.IsNullOrWhiteSpace(response.Branch))
        {
            var logResult = await RunGitAsync($"log origin/{response.Branch}..HEAD --oneline");
            if (logResult.ExitCode == 0 && !string.IsNullOrWhiteSpace(logResult.Output))
                response.UnpushedCommits = logResult.Output.Trim()
                    .Split('\n', StringSplitOptions.RemoveEmptyEntries).Length;
        }

        response.IsSynced = response.UnpushedCommits == 0 && response.ModifiedFiles == 0;
        return response;
    }

    public async Task<bool> HasChangesAsync()
    {
        if (!IsRepoInitialized()) return false;
        var result = await RunGitAsync("status --porcelain");
        return !string.IsNullOrWhiteSpace(result.Output);
    }

    // ─── Operations ──────────────────────────────────────────────────────────

    public async Task CommitAsync(string? message = null, List<string>? files = null)
    {
        if (!IsRepoInitialized())
            throw new BusinessException("Repositório Git não inicializado.");

        var statusResult = await RunGitAsync("status --porcelain");
        if (string.IsNullOrWhiteSpace(statusResult.Output))
            throw new BusinessException("Não há alterações para commitar.");

        var commitMessage = string.IsNullOrWhiteSpace(message)
            ? BuildCommitMessage(statusResult.Output)
            : message;

        if (files != null && files.Count > 0)
        {
            foreach (var file in files)
                await RunGitAsync($"add \"{EscapeForShell(file)}\"");
        }
        else
        {
            await RunGitAsync("add -A");
        }

        var result = await RunGitAsync($"commit -m \"{EscapeForShell(commitMessage)}\"");
        if (result.ExitCode != 0)
            throw new BusinessException($"Erro ao commitar: {result.Error}");
    }

    public async Task PushAsync()
    {
        if (!IsRepoInitialized())
            throw new BusinessException("Repositório Git não inicializado.");

        if (string.IsNullOrWhiteSpace(_gitSettings.Token))
            throw new BusinessException("Token Git não configurado (GIT_TOKEN).");

        var authenticatedUrl = BuildAuthenticatedUrl();
        var branchResult = await RunGitAsync("rev-parse --abbrev-ref HEAD");
        var branch = branchResult.Output.Trim();

        var result = await RunGitAsync($"push {authenticatedUrl} {branch}");
        if (result.ExitCode != 0)
            throw new BusinessException($"Erro ao fazer push: {result.Error}");
    }

    public async Task<string> PullAsync()
    {
        if (!IsRepoInitialized())
            throw new BusinessException("Repositório Git não inicializado.");

        var authenticatedUrl = BuildAuthenticatedUrl();
        var branchResult = await RunGitAsync("rev-parse --abbrev-ref HEAD");
        var branch = branchResult.Output.Trim();

        var result = await RunGitAsync($"pull {authenticatedUrl} {branch}");
        if (result.ExitCode != 0)
            throw new BusinessException($"Erro ao fazer pull: {result.Error}");

        return result.Output;
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private string BuildAuthenticatedUrl()
    {
        var url = _gitSettings.RepoUrl;
        if (string.IsNullOrWhiteSpace(url))
            throw new BusinessException("URL do repositório Git não configurada (GIT_REPO_URL).");

        if (!url.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
            return url;

        var withoutProtocol = url["https://".Length..];
        return $"https://{Uri.EscapeDataString(_gitSettings.UserName)}:{Uri.EscapeDataString(_gitSettings.Token)}@{withoutProtocol}";
    }

    private static string BuildCommitMessage(string porcelainOutput)
    {
        var files = ParsePorcelainStatus(porcelainOutput);

        var modified = files.Where(f => f.Status == "M").Select(f => f.Path).ToList();
        var added    = files.Where(f => f.Status is "A" or "?").Select(f => f.Path).ToList();
        var deleted  = files.Where(f => f.Status == "D").Select(f => f.Path).ToList();
        var renamed  = files.Where(f => f.Status == "R").Select(f => f.Path).ToList();

        if (files.Count <= 5)
        {
            var parts = new List<string>();
            if (modified.Count > 0) parts.Add($"modified {string.Join(", ", modified)}");
            if (added.Count    > 0) parts.Add($"added {string.Join(", ", added)}");
            if (deleted.Count  > 0) parts.Add($"deleted {string.Join(", ", deleted)}");
            if (renamed.Count  > 0) parts.Add($"renamed {string.Join(", ", renamed)}");
            return $"auto-commit: {string.Join("; ", parts)}";
        }

        var folders = files
            .Select(f => f.Path.Split('/').FirstOrDefault() ?? "root")
            .Distinct().Take(3).Select(f => f + "/").ToList();

        var summary = new List<string>();
        if (modified.Count > 0) summary.Add($"{modified.Count} modified");
        if (added.Count    > 0) summary.Add($"{added.Count} added");
        if (deleted.Count  > 0) summary.Add($"{deleted.Count} deleted");

        return $"auto-commit: {files.Count} files changed ({string.Join(", ", summary)}) across {string.Join(", ", folders)}";
    }

    private static List<(string Status, string Path)> ParsePorcelainStatus(string output)
    {
        var result = new List<(string, string)>();
        foreach (var line in output.Split('\n', StringSplitOptions.RemoveEmptyEntries))
        {
            if (line.Length < 3) continue;
            var statusChar = line[0] != ' ' ? line[0] : line[1];
            var status = statusChar == '?' ? "?" : statusChar.ToString();
            var path = line[3..].Trim();
            if (!string.IsNullOrWhiteSpace(path))
                result.Add((status, path));
        }
        return result;
    }

    private static string EscapeForShell(string value) =>
        value.Replace("\\", "\\\\").Replace("\"", "\\\"");

    // ─── Process execution ───────────────────────────────────────────────────

    private Task<(string Output, string Error, int ExitCode)> RunGitAsync(string arguments) =>
        RunGitInDirAsync(arguments, _terraformSettings.GetRootPath());

    private static async Task<(string Output, string Error, int ExitCode)> RunGitInDirAsync(
        string arguments, string workingDir)
    {
        var psi = new ProcessStartInfo
        {
            FileName = "git",
            Arguments = arguments,
            WorkingDirectory = workingDir,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true
        };

        using var process = new Process { StartInfo = psi };
        process.Start();

        var outputTask = process.StandardOutput.ReadToEndAsync();
        var errorTask  = process.StandardError.ReadToEndAsync();
        await Task.WhenAll(outputTask, errorTask);
        await process.WaitForExitAsync();

        return (await outputTask, await errorTask, process.ExitCode);
    }
}
