namespace TerraformExplorer.Models.Requests;

public class GitAutoCommitSettingsRequest
{
    public bool Enabled { get; set; }
    public int IntervalSeconds { get; set; } = 60;
}
