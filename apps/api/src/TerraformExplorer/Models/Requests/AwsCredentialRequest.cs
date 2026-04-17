namespace TerraformExplorer.Models.Requests;

public class AwsCredentialRequest
{
    public string ProfileName { get; set; }
    public string AccessKeyId { get; set; }
    public string SecretAccessKey { get; set; }
    public string? Region { get; set; }
}