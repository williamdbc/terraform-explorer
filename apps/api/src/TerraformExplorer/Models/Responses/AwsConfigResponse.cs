namespace TerraformExplorer.Models.Responses;

public class AwsConfigResponse
{
    public string SourceProfile { get; set; }
    public string? RoleArn { get; set; }
    public string Region { get; set; }
}