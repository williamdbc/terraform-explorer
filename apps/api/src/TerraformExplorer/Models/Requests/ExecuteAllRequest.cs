namespace TerraformExplorer.Models.Requests;

public class ExecuteAllRequest
{
    public string Command { get; set; } = string.Empty;
    public List<string> WorkingDirs { get; set; } = new();
}