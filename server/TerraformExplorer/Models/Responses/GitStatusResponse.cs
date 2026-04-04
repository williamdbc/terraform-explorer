namespace TerraformExplorer.Models.Responses;

public class GitFileChange
{
    public string Status { get; set; } = ""; // M, A, D, R, ?
    public string Path { get; set; } = "";
}

public class GitStatusResponse
{
    public bool IsInitialized { get; set; }
    public string Branch { get; set; } = "";
    public int UnpushedCommits { get; set; }
    public int ModifiedFiles { get; set; }
    public bool IsSynced { get; set; }
    public bool AutoCommitEnabled { get; set; }
    public int AutoCommitIntervalSeconds { get; set; }
    public List<GitFileChange> ChangedFiles { get; set; } = [];
}
