using Microsoft.EntityFrameworkCore;
using TerraformExplorer.Entities;

namespace TerraformExplorer.Data;

public class TerraformExplorerDbContext : DbContext
{
    public TerraformExplorerDbContext(DbContextOptions<TerraformExplorerDbContext> options): base(options) {}
    
    public DbSet<User> Users => Set<User>();
}