using System.Text;
using TerraformExplorer.Models;

namespace TerraformExplorer.Utils;

public static class ProviderTfGenerator
{
    public static void Generate(Account account, string? providerPath = null)
    {
        var targetPath = providerPath ?? account.Path;
        var providerTfPath = Path.Combine(targetPath, "provider.tf");
        var sb = new StringBuilder();

        sb.AppendLine("provider \"aws\" {");
        sb.AppendLine($"  region  = \"{account.Region ?? "us-east-1"}\"");

        if (!string.IsNullOrWhiteSpace(account.AwsProfile))
            sb.AppendLine($"  profile = \"{account.AwsProfile}\"");

        if (!string.IsNullOrWhiteSpace(account.AssumeRoleArn))
        {
            sb.AppendLine();
            sb.AppendLine("  assume_role {");
            sb.AppendLine($"    role_arn = \"{account.AssumeRoleArn}\"");
            sb.AppendLine("  }");
        }

        sb.AppendLine("}");
        File.WriteAllText(providerTfPath, sb.ToString());
    }

    public static void GenerateSimple(Account account, string? providerPath = null)
    {
        var targetPath = providerPath ?? account.Path;
        var providerTfPath = Path.Combine(targetPath, "provider.tf");
        var sb = new StringBuilder();

        sb.AppendLine("provider \"aws\" {");
        sb.AppendLine($"  region  = \"{account.Region ?? "us-east-1"}\"");

        if (!string.IsNullOrWhiteSpace(account.AwsProfile))
            sb.AppendLine($"  profile = \"{account.AwsProfile}\"");

        sb.AppendLine("}");
        File.WriteAllText(providerTfPath, sb.ToString());
    }

    public static void GenerateProvider(Account account, string? providerPath = null)
    {
        if (string.IsNullOrWhiteSpace(account.AssumeRoleArn))
            GenerateSimple(account, providerPath);
        else
            Generate(account, providerPath);
    }

}