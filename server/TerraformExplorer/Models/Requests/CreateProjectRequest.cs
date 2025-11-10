namespace TerraformExplorer.Models.Requests;

public class CreateProjectRequest
{
    public string AccountName { get; set; }
    public string UsedModuleName { get; set; }
    public string ModuleName { get; set; }
    public string ProjectName { get; set; }
}