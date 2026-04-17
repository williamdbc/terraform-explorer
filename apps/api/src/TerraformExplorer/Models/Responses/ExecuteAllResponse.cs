namespace TerraformExplorer.Models.Responses;

public class ExecuteAllResponse
{
    public List<CommandResponse> Results { get; set; } = new();
}