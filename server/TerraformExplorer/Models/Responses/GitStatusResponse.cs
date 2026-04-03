namespace TerraformExplorer.Models.Responses;

public class GitStatusResponse
{
    public bool IsInitialized { get; set; }
    public string Branch { get; set; } = "";
    public int UnpushedCommits { get; set; }
    public int ModifiedFiles { get; set; }
    public bool IsSynced { get; set; }
    public bool AutoCommitEnabled { get; set; }
    public int AutoCommitIntervalSeconds { get; set; }
    public List<string> ChangedFiles { get; set; } = [];
}
