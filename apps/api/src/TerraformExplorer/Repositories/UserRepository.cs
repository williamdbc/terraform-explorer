using Microsoft.EntityFrameworkCore;
using TerraformExplorer.Data;
using TerraformExplorer.Entities;

namespace TerraformExplorer.Repositories;

public class UserRepository
{
    private readonly TerraformExplorerDbContext _db;

    public UserRepository(TerraformExplorerDbContext db)
    {
        _db = db;
    }

    public Task<bool> Any()
    {
        return _db.Users.AnyAsync();
    }

    public Task<User?> GetByUsername(string username)
    {
        return _db.Users.FirstOrDefaultAsync(x => x.Username == username);
    }

    public async Task Create(User user)
    {
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
    }
}