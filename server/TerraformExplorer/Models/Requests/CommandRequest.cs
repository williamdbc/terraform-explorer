namespace TerraformExplorer.Models.Requests;

public class CommandRequest
{
    public string Command { get; set; }
    public string WorkingDir { get; set; }
}