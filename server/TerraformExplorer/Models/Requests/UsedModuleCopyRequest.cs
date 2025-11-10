namespace TerraformExplorer.Models.Requests;

public class UsedModuleCopyRequest
{
    public UsedModuleLocation Source { get; set; } = new();
    public UsedModuleLocation Destination { get; set; } = new();
}

public class UsedModuleLocation
{
    public string AccountName { get; set; } = string.Empty;
    public string ModuleName { get; set; } = string.Empty;
}