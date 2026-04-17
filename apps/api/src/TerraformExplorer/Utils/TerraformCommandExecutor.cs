using System.Collections.Concurrent;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Text;
using TerraformExplorer.Models;
using TerraformExplorer.Models.Requests;
using TerraformExplorer.Models.Responses;
using TerraformExplorer.Settings;

namespace TerraformExplorer.Utils;

public static class TerraformCommandExecutor
{
    public static async Task<ExecuteAllResponse> ExecuteAllAsync(ExecuteAllRequest request, TerraformSettings settings)
    {
        ArgumentNullException.ThrowIfNull(request);
        ArgumentNullException.ThrowIfNull(settings);

        if (string.IsNullOrWhiteSpace(request.Command))
            throw new ArgumentException("Command is required.", nameof(request.Command));

        if (request.WorkingDirs == null || request.WorkingDirs.Count == 0)
            throw new ArgumentException("WorkingDirs is required.", nameof(request.WorkingDirs));

        var validDirs = request.WorkingDirs
            .Where(d => !string.IsNullOrWhiteSpace(d))
            .Select(d => d.Trim())
            .ToList();

        if (validDirs.Count == 0)
            throw new ArgumentException("At least one valid WorkingDir is required.", nameof(request.WorkingDirs));

        var maxParallelism = Math.Max(1, Environment.ProcessorCount / 2);
        var results = new ConcurrentBag<(string Dir, CommandResponse Response)>();

        await Parallel.ForEachAsync(validDirs, new ParallelOptions
        {
            MaxDegreeOfParallelism = maxParallelism
        }, async (dir, ct) =>
        {
            var optimizedCmd = OptimizeCommandForInit(request.Command);
            var result = await ExecuteSingleAsync(optimizedCmd, dir, settings);
            results.Add((dir, result));
        });
        
        var ordered = validDirs
            .Select(dir => results.FirstOrDefault(r => r.Dir == dir).Response)
            .Where(r => r != null)
            .ToList();

        return new ExecuteAllResponse { Results = ordered! };
    }

    public static async Task<CommandResponse> ExecuteSingleAsync(
        string command,
        string workingDir,
        TerraformSettings settings)
    {
        if (!Directory.Exists(workingDir))
        {
            return new CommandResponse
            {
                WorkingDir = workingDir,
                Output = $"Directory not found: {workingDir}",
                ExitCode = -1,
                ExecutionTimeMs = 0
            };
        }
        
        if (command.TrimStart().StartsWith("init", StringComparison.OrdinalIgnoreCase))
        {
            EnsureTerraformCacheLink(workingDir, settings);
        }

        var (fileName, arguments, resolvedWorkingDir) = GetExecutionConfig(command, workingDir);
        var structure = TerraformStructureLoader.Load(settings);
        var account = structure.Accounts
            .FirstOrDefault(a => workingDir.StartsWith(a.Path, StringComparison.OrdinalIgnoreCase));

        var stopwatch = Stopwatch.StartNew();
        TemporaryAwsFiles? awsFiles = null;

        try
        {
            awsFiles = TemporaryAwsFiles.Create(settings);

            var env = new Dictionary<string, string>
            {
                ["HOME"] = "/root",
                ["AWS_SHARED_CREDENTIALS_FILE"] = ToProcessPath(awsFiles.CredentialsPath),
                ["AWS_CONFIG_FILE"] = ToProcessPath(awsFiles.ConfigPath),
                ["TF_PLUGIN_CACHE_DIR"] = ToProcessPath(settings.GetTerraformCachePath()),
                ["TF_LOG"] = "ERROR"
            };

            if (account != null)
            {
                if (!string.IsNullOrWhiteSpace(account.AwsProfile))
                    env["AWS_PROFILE"] = account.AwsProfile;
                if (!string.IsNullOrWhiteSpace(account.Region))
                    env["AWS_REGION"] = account.Region;
            }

            var processStartInfo = new ProcessStartInfo
            {
                FileName = fileName,
                Arguments = arguments,
                WorkingDirectory = resolvedWorkingDir,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true,
            };

            processStartInfo.Environment.Clear();
        
            foreach (var e in env)
                processStartInfo.Environment.Add(e.Key, e.Value);

            using var process = new Process { StartInfo = processStartInfo };
            process.Start();

            var outputTask = process.StandardOutput.ReadToEndAsync();
            var errorTask = process.StandardError.ReadToEndAsync();

            await Task.WhenAll(outputTask, errorTask);
            await process.WaitForExitAsync();
            stopwatch.Stop();

            var output = await outputTask;
            var error = await errorTask;

            var outputBuilder = new StringBuilder();
            outputBuilder.Append(output);
            if (!string.IsNullOrWhiteSpace(error))
            {
                outputBuilder.AppendLine();
                outputBuilder.AppendLine("=== ERROR ===");
                outputBuilder.AppendLine(error);
            }

            return new CommandResponse
            {
                WorkingDir = workingDir,
                Output = outputBuilder.ToString(),
                ExitCode = process.ExitCode,
                ExecutionTimeMs = stopwatch.Elapsed.TotalMilliseconds
            };
        }
        catch (Exception ex)
        {
            return new CommandResponse
            {
                WorkingDir = workingDir,
                Output = $"Exception: {ex.Message}",
                ExitCode = -1,
                ExecutionTimeMs = stopwatch.Elapsed.TotalMilliseconds
            };
        }
        finally
        {
            awsFiles?.Dispose();
        }
    }

    private static (string FileName, string Arguments, string WorkingDir) GetExecutionConfig(
        string command, string workingDir)
    {
        if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
        {
            var wslPath = ConvertToWslPath(workingDir);
            var escapedCmd = command.Replace("\"", "\\\"");
            var fullCmd = $"cd \"{wslPath}\" && {escapedCmd}";

            return (
                FileName: "wsl",
                Arguments: $"-d Ubuntu -- bash -c \"{fullCmd}\"",
                WorkingDir: Environment.CurrentDirectory
            );
        }

        return (
            FileName: "terraform",
            Arguments: command,
            WorkingDir: workingDir
        );
    }

    private static string ConvertToWslPath(string windowsPath)
    {
        if (windowsPath.StartsWith(@"\\wsl.localhost\Ubuntu\", StringComparison.OrdinalIgnoreCase))
            return "/" + windowsPath.Substring(@"\\wsl.localhost\Ubuntu\".Length).Replace('\\', '/');

        if (Path.IsPathRooted(windowsPath))
        {
            var root = Path.GetPathRoot(windowsPath)?.TrimEnd('\\');
            if (root?.Length == 2 && root[1] == ':')
            {
                var drive = char.ToLower(root[0]);
                var rest = windowsPath.Substring(2).Replace('\\', '/');
                return $"/mnt/{drive}{rest}";
            }
        }

        return windowsPath.Replace('\\', '/');
    }

    private static string ToProcessPath(string path)
    {
        return RuntimeInformation.IsOSPlatform(OSPlatform.Windows)
            ? ConvertToWslPath(path)
            : path;
    }
    
    private static string OptimizeCommandForInit(string command)
    {
        var cmd = command.Trim();
        if (!cmd.StartsWith("init", StringComparison.OrdinalIgnoreCase))
            return cmd;

        var parts = cmd.Split(' ', StringSplitOptions.RemoveEmptyEntries).ToList();
        parts = parts.Distinct(StringComparer.OrdinalIgnoreCase).ToList();

        bool HasFlag(string flag) => 
            parts.Any(p => p.Equals(flag, StringComparison.OrdinalIgnoreCase));

        void AddIfMissing(string flag)
        {
            if (!HasFlag(flag))
                parts.Add(flag);
        }

        AddIfMissing("-reconfigure");

        if (!HasFlag("-lockfile=readonly"))
        {
            AddIfMissing("-upgrade");
        }

        return string.Join(" ", parts);
    }
    
    private static void EnsureTerraformCacheLink(string workingDir, TerraformSettings settings)
    {
        var terraformDir = Path.Combine(workingDir, ".terraform");
        var cachePath = settings.GetTerraformCachePath();

        Directory.CreateDirectory(cachePath);

        if (Directory.Exists(terraformDir))
            Directory.Delete(terraformDir, true);
        if (File.Exists(terraformDir))
            File.Delete(terraformDir);

        try
        {
            var link = File.CreateSymbolicLink(terraformDir, cachePath);
            if (!link.Exists)
                throw new InvalidOperationException("Link simbólico falhou");
        }
        catch
        {
            Directory.CreateDirectory(terraformDir);
        }
    }

    private sealed class TemporaryAwsFiles : IDisposable
    {
        private TemporaryAwsFiles(string directoryPath, string credentialsPath, string configPath)
        {
            DirectoryPath = directoryPath;
            CredentialsPath = credentialsPath;
            ConfigPath = configPath;
        }

        private string DirectoryPath { get; }
        public string CredentialsPath { get; }
        public string ConfigPath { get; }

        public static TemporaryAwsFiles Create(TerraformSettings settings)
        {
            var directoryPath = Path.Combine(
                Path.GetTempPath(),
                "terraform-explorer",
                "aws",
                Guid.NewGuid().ToString("N"));

            Directory.CreateDirectory(directoryPath);

            var credentialsPath = Path.Combine(directoryPath, "credentials");
            var configPath = Path.Combine(directoryPath, "config");
            var providersPath = settings.GetProvidersPath();
            var encryptionKey = settings.GetCredentialsEncryptionKey();

            File.WriteAllText(
                credentialsPath,
                EncryptedTextFile.ReadAllText(Path.Combine(providersPath, "credentials.enc"), encryptionKey));

            File.WriteAllText(
                configPath,
                EncryptedTextFile.ReadAllText(Path.Combine(providersPath, "config.enc"), encryptionKey));

            return new TemporaryAwsFiles(directoryPath, credentialsPath, configPath);
        }

        public void Dispose()
        {
            try
            {
                if (Directory.Exists(DirectoryPath))
                    Directory.Delete(DirectoryPath, true);
            }
            catch
            {
                // Best effort cleanup; command result should not be masked by temp file deletion.
            }
        }
    }
}
