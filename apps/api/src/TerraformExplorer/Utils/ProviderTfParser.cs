using System.Text.RegularExpressions;

namespace TerraformExplorer.Utils;

public static class ProviderTfParser
{
    public static (string? Profile, string? AssumeRoleArn, string? Region) Parse(string content)
    {
        var profile = Regex.Match(content, @"profile\s*=\s*""([^""]+)""")?.Groups[1].Value;
        var region = Regex.Match(content, @"region\s*=\s*""([^""]+)""")?.Groups[1].Value;
        var roleArn = Regex.Match(content, @"role_arn\s*=\s*""([^""]+)""")?.Groups[1].Value;

        return (profile, roleArn, region);
    }
}