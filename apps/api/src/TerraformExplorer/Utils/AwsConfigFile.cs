using System.Text.RegularExpressions;
using TerraformExplorer.Models.Requests;
using TerraformExplorer.Models.Responses;

namespace TerraformExplorer.Utils;

public static class AwsConfigFile
{
    public static AwsConfigResponse? ReadConfig(string filePath, string profileName, string encryptionKey)
    {
        if (!File.Exists(filePath)) return null;

        var lines = EncryptedTextFile.ReadAllLines(filePath, encryptionKey);
        var targetHeader = profileName == "default" ? "[default]" : $"[profile {profileName}]";
        var inside = false;
        var config = new AwsConfigResponse();

        foreach (var line in lines)
        {
            var trimmed = line.Trim();
            
            if (Regex.IsMatch(trimmed, @"^\[.*\]$"))
            {
                if (inside)
                    break;

                inside = trimmed.Equals(targetHeader, StringComparison.OrdinalIgnoreCase);
                continue;
            }

            if (!inside) continue;

            var parts = trimmed.Split('=', 2, StringSplitOptions.TrimEntries);
            if (parts.Length != 2) continue;

            var key = parts[0].ToLowerInvariant();
            var value = parts[1].Trim('"', '\'');

            switch (key)
            {
                case "region":
                    config.Region = value;
                    break;
                case "source_profile":
                    config.SourceProfile = value;
                    break;
                case "role_arn":
                    config.RoleArn = value;
                    break;
            }
        }

        return inside ? config : null;
    }
    
    public static void UpdateProfile(string filePath, AwsCredentialRequest request, string encryptionKey)
    {
        var lines = File.Exists(filePath) ? EncryptedTextFile.ReadAllLines(filePath, encryptionKey) : Array.Empty<string>();
        var output = new List<string>();
        var header = request.ProfileName == "default" ? "[default]" : $"[profile {request.ProfileName}]";
        var insideProfile = false;
        var profileWritten = false;

        foreach (var line in lines)
        {
            var trimmed = line.Trim();
            if (Regex.IsMatch(trimmed, @"^\[.*\]$"))
            {
                insideProfile = trimmed.Equals(header, StringComparison.OrdinalIgnoreCase);
            }

            if (!insideProfile)
            {
                output.Add(line);
            }
            else if (!profileWritten)
            {
                output.Add(header);
                output.Add($"region = {request.Region ?? "us-east-1"}");
                profileWritten = true;
            }
        }

        if (!profileWritten)
        {
            if (output.Count > 0 && !string.IsNullOrWhiteSpace(output[^1]))
                output.Add("");

            output.Add(header);
            output.Add($"region = {request.Region ?? "us-east-1"}");
        }

        EncryptedTextFile.WriteAllLines(filePath, output, encryptionKey);
    }
    
    public static bool DeleteProfile(string filePath, string profileName, string encryptionKey)
    {
        if (!File.Exists(filePath)) return false;

        var header = profileName == "default" ? "[default]" : $"[profile {profileName}]";
        var lines = EncryptedTextFile.ReadAllLines(filePath, encryptionKey);
        var output = new List<string>();
        var insideProfile = false;
        var profileFound = false;

        foreach (var line in lines)
        {
            var trimmed = line.Trim();
            if (Regex.IsMatch(trimmed, @"^\[.*\]$"))
            {
                insideProfile = trimmed.Equals(header, StringComparison.OrdinalIgnoreCase);
                if (insideProfile) profileFound = true;
            }

            if (!insideProfile)
            {
                output.Add(line);
            }
        }

        if (!profileFound) return false;

        EncryptedTextFile.WriteAllLines(filePath, output, encryptionKey);
        return true;
    }
    
    public static void UpdateAssumeRole(string filePath, string profileName, string sourceProfile, string? roleArn, string region, string encryptionKey)
    {
        var lines = File.Exists(filePath) ? EncryptedTextFile.ReadAllLines(filePath, encryptionKey) : Array.Empty<string>();
        var output = new List<string>();
        var header = $"[profile {profileName}]";
        var inside = false;
        var written = false;

        foreach (var line in lines)
        {
            var trimmed = line.Trim();
            if (trimmed.StartsWith("[profile ") || trimmed == "[default]")
            {
                inside = trimmed == header;
            }

            if (!inside) output.Add(line);
            else if (!written)
            {
                output.Add(header);
                output.Add($"region = {region}");

                if (!string.IsNullOrWhiteSpace(roleArn))
                {
                    output.Add($"source_profile = {sourceProfile}");
                    output.Add($"role_arn = {roleArn}");
                }

                written = true;
            }
        }

        if (!written)
        {
            if (output.Count > 0 && !string.IsNullOrWhiteSpace(output[^1]))
                output.Add("");

            output.Add(header);
            output.Add($"region = {region}");

            if (!string.IsNullOrWhiteSpace(roleArn))
            {
                output.Add($"source_profile = {sourceProfile}");
                output.Add($"role_arn = {roleArn}");
            }
        }

        EncryptedTextFile.WriteAllLines(filePath, output, encryptionKey);
    }
}
