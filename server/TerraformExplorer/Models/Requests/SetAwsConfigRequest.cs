namespace TerraformExplorer.Models.Requests;

public class SetAwsConfigRequest
{
    public string Profile { get; set; }
    public string? RoleArn { get; set; }
    public string Region { get; set; }
}