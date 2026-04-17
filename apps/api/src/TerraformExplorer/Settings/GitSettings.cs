namespace TerraformExplorer.Settings;

public class GitSettings
{
    public string Token { get; set; } = "";
    public string RepoUrl { get; set; } = "";
    public string UserName { get; set; } = "";
    public string UserEmail { get; set; } = "";
    public bool AutoCommitEnabled { get; set; } = false;
    public int AutoCommitIntervalSeconds { get; set; } = 60;
}
