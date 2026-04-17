using System.Text.RegularExpressions;
using TerraformExplorer.Models;
using TerraformExplorer.Models.Requests;

namespace TerraformExplorer.Utils;

public static class AwsCredentialsFile
{
    public static IReadOnlyList<AwsProfileResponse> ReadProfiles(string filePath, string encryptionKey)
    {
        if (!File.Exists(filePath))
            return Array.Empty<AwsProfileResponse>();

        var profiles = new List<AwsProfileResponse>();
        var lines = EncryptedTextFile.ReadAllLines(filePath, encryptionKey);

        foreach (var line in lines)
        {
            var match = Regex.Match(line.Trim(), @"^\[(.+)\]$");
            if (match.Success)
            {
                var profileName = match.Groups[1].Value.Trim();
                profiles.Add(new AwsProfileResponse { Name = profileName });
            }
        }

        return profiles;
    }

    public static void UpdateProfile(string filePath, AwsCredentialRequest request, string encryptionKey)
    {
        var lines = File.Exists(filePath) ? EncryptedTextFile.ReadAllLines(filePath, encryptionKey) : Array.Empty<string>();
        var output = new List<string>();
        var insideProfile = false;
        var profileWritten = false;

        foreach (var line in lines)
        {
            var trimmed = line.Trim();
            if (Regex.IsMatch(trimmed, @"^\[.+\]$"))
            {
                insideProfile = trimmed.Equals($"[{request.ProfileName}]", StringComparison.OrdinalIgnoreCase);
            }

            if (!insideProfile)
            {
                output.Add(line);
            }
            else if (!profileWritten)
            {
                output.Add($"[{request.ProfileName}]");
                output.Add($"aws_access_key_id = {request.AccessKeyId}");
                output.Add($"aws_secret_access_key = {request.SecretAccessKey}");
                profileWritten = true;
            }
        }

        if (!profileWritten)
        {
            if (output.Count > 0 && !string.IsNullOrWhiteSpace(output[^1]))
                output.Add("");

            output.Add($"[{request.ProfileName}]");
            output.Add($"aws_access_key_id = {request.AccessKeyId}");
            output.Add($"aws_secret_access_key = {request.SecretAccessKey}");
        }

        EncryptedTextFile.WriteAllLines(filePath, output, encryptionKey);
    }
    
    public static bool DeleteProfile(string filePath, string profileName, string encryptionKey)
    {
        if (!File.Exists(filePath)) return false;

        var lines = EncryptedTextFile.ReadAllLines(filePath, encryptionKey);
        var output = new List<string>();
        var insideProfile = false;
        var profileFound = false;

        foreach (var line in lines)
        {
            var trimmed = line.Trim();
            if (Regex.IsMatch(trimmed, @"^\[.+\]$"))
            {
                var currentProfile = trimmed.Substring(1, trimmed.Length - 2);
                insideProfile = currentProfile.Equals(profileName, StringComparison.OrdinalIgnoreCase);
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
}
