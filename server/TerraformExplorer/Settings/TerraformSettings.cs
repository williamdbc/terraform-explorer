namespace TerraformExplorer.Settings;

public class TerraformSettings
{
    public string? RootPath { get; set; }
    public string AccountsFolderName { get; set; } = "accounts";
    public string ModulesFolderName { get; set; } = "modules";
    public string ProvidersAwsFolderName { get; set; } = ".aws";
    public string TerraformCacheFolderName { get; set; } = ".terraform-cache";

    public string GetRootPath()
    {
        var baseDir = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
        var folderName = string.IsNullOrWhiteSpace(RootPath) ? "terraform-explorer" : RootPath.Trim('/', '\\');
        return Path.GetFullPath(Path.Combine(baseDir, folderName));
    }
    
    public string GetAccountsPath() => Path.Combine(GetRootPath(), AccountsFolderName);
    public string GetModulesPath() => Path.Combine(GetRootPath(), ModulesFolderName);
    public string GetProvidersPath() => Path.Combine(GetRootPath(), ProvidersAwsFolderName);
    public string GetTerraformCachePath() => Path.Combine(GetRootPath(), TerraformCacheFolderName, "plugin-cache");
}
