namespace TerraformExplorer.Models.Requests;

public class ProjectGroupCopyRequest
{
    public ProjectGroupLocation Source { get; set; } = new();
    public ProjectGroupLocation Destination { get; set; } = new();
}

public class ProjectGroupLocation
{
    public string AccountName { get; set; } = string.Empty;
    public string GroupName { get; set; } = string.Empty;
}