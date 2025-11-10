namespace TerraformExplorer.Models.Requests;

public class AccountCopyRequest
{
    public string SourceAccountName { get; set; } = string.Empty;
    public string DestinationAccountName { get; set; } = string.Empty;
    public bool CopyUsedModules { get; set; } = true;
}