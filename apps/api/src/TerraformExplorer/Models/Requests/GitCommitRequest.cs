namespace TerraformExplorer.Models.Requests;

public class GitCommitRequest
{
    public string? Message { get; set; }
    public List<string>? Files { get; set; }
}
