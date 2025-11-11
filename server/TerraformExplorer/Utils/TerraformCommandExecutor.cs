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

        var maxParallelism = Math.Max(1, Environment.ProcessorCount);
        var results = new List<CommandResponse>();

        await Parallel.ForEachAsync(validDirs, new ParallelOptions
        {
            MaxDegreeOfParallelism = maxParallelism
        }, async (dir, ct) =>
        {
            var result = await ExecuteSingleAsync(request.Command, dir, settings);

            lock (results)
                results.Add(result);
        });

        return new ExecuteAllResponse
        {
            Results = results
        };
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
                Output = $"Directory not found: {workingDir}",
                ExitCode = -1,
                ExecutionTimeMs = 0
            };
        }

        var (fileName, arguments, resolvedWorkingDir) = GetExecutionConfig(command, workingDir);
        var structure = TerraformStructureLoader.Load(settings);
        var account = structure.Accounts
            .FirstOrDefault(a => workingDir.StartsWith(a.Path, StringComparison.OrdinalIgnoreCase));

        var env = new Dictionary<string, string>
        {
            ["HOME"] = "/root",
            ["AWS_SHARED_CREDENTIALS_FILE"] = settings.GetProvidersPath() + "/credentials",
            ["AWS_CONFIG_FILE"] = settings.GetProvidersPath() + "/config"
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

        var stopwatch = Stopwatch.StartNew();
        using var process = new Process { StartInfo = processStartInfo };

        try
        {
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
                Output = outputBuilder.ToString(),
                ExitCode = process.ExitCode,
                ExecutionTimeMs = stopwatch.Elapsed.TotalMilliseconds
            };
        }
        catch (Exception ex)
        {
            return new CommandResponse
            {
                Output = $"Exception: {ex.Message}",
                ExitCode = -1,
                ExecutionTimeMs = stopwatch.Elapsed.TotalMilliseconds
            };
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
}