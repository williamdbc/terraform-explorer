namespace TerraformExplorer.Models.Requests;

public class ProjectCopyRequest
{
    public ProjectLocation Source { get; set; } = new();
    public ProjectLocation Destination { get; set; } = new();
}

public class ProjectLocation
{
    public string AccountName { get; set; } = string.Empty;
    public string ModuleName { get; set; } = string.Empty;
    public string ProjectName { get; set; } = string.Empty;
}