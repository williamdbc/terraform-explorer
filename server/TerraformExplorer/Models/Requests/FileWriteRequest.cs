namespace TerraformExplorer.Models.Requests;

public class FileWriteRequest
{
    public string Path { get; set; }
    public string Content { get; set; }
}