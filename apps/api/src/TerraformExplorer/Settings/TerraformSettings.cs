namespace TerraformExplorer.Settings;

public class TerraformSettings
{
    public string? RootPath { get; set; }
    public string AccountsFolderName { get; set; } = "accounts";
    public string ModulesFolderName { get; set; } = "modules";
    public string ProvidersAwsFolderName { get; set; } = ".aws";
    public string TerraformCacheFolderName { get; set; } = ".terraform-cache";
    public string? CredentialsEncryptionKey { get; set; }

    public string GetRootPath()
    {
        if (string.IsNullOrWhiteSpace(RootPath))
        {
            var baseDir = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
            return Path.GetFullPath(Path.Combine(baseDir, "terraform-explorer"));
        }

        return Path.IsPathRooted(RootPath)
            ? Path.GetFullPath(RootPath)
            : Path.GetFullPath(Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), RootPath));
    }
    
    public string GetAccountsPath() => Path.Combine(GetRootPath(), AccountsFolderName);
    public string GetModulesPath() => Path.Combine(GetRootPath(), ModulesFolderName);
    public string GetProvidersPath() => Path.Combine(GetRootPath(), ProvidersAwsFolderName);
    public string GetTerraformCachePath() => Path.Combine(GetRootPath(), TerraformCacheFolderName, "plugin-cache");
    public string GetCredentialsEncryptionKey()
    {
        if (!string.IsNullOrWhiteSpace(CredentialsEncryptionKey))
            return CredentialsEncryptionKey;

        return $"terraform-explorer:{Environment.UserName}:{GetRootPath()}";
    }
}
