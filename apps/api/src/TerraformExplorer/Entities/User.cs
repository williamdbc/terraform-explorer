namespace TerraformExplorer.Entities;

public class User
{
    public int Id { get; set; }
    public string DisplayName { get; set; } = null!;
    public string Username { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}