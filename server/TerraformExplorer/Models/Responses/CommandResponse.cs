namespace TerraformExplorer.Models.Responses;

public class CommandResponse
{
    public string? WorkingDir { get; set; }
    public string Output { get; set; }
    public int ExitCode { get; set; }
    public double ExecutionTimeMs { get; set; }
}