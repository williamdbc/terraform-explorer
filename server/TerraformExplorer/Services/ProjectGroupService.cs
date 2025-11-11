using TerraformExplorer.Models;
using TerraformExplorer.Models.Requests;
using TerraformExplorer.Models.Responses;
using TerraformExplorer.Settings;

namespace TerraformExplorer.Services;

public class ProjectGroupService
{
    private readonly FileSystemService _fileSystemService;
    private readonly TerraformSettings _terraformSettings;

    public ProjectGroupService(
        FileSystemService fileSystemService, 
        TerraformSettings terraformSettings)
    {
        _fileSystemService = fileSystemService;
        _terraformSettings = terraformSettings;
    }
    
    public void CopyProjectGroup(ProjectGroupCopyRequest request)
    {
        var source = request.Source;
        var destination = request.Destination;
        
        var sourcePath = GetPath(source.AccountName, source.GroupName);
        var destPath = GetPath(destination.AccountName, destination.GroupName);;

        _fileSystemService.CopyDirectory(sourcePath, destPath);
    }
    
    private string GetPath(string accountName, string moduleName)
    {
        return Path.Combine(_terraformSettings.GetAccountsPath(), accountName, moduleName);
    }
    
    public ItemResponse Get(string accountName, string moduleName)
    {
        var path = GetPath(accountName, moduleName);
        _fileSystemService.EnsureExists(path, "Grupo de projetos");
        return new ItemResponse { Name = moduleName, Path = path };
    }

    public List<ItemResponse> List(string accountName)
    {
        var accountPath = Path.Combine(_terraformSettings.GetAccountsPath(), accountName);
        _fileSystemService.EnsureExists(accountPath, "Account");

        return Directory.GetDirectories(accountPath)
            .Select(d => new ItemResponse { Name = Path.GetFileName(d), Path = d })
            .ToList();
    }

    public void Create(string accountName, string name)
    {
        var path = GetPath(accountName, name);
        _fileSystemService.CreateDirectory(path);
    }

    public void Delete(string accountName, string moduleName)
    {
        var path = GetPath(accountName, moduleName);
        _fileSystemService.DeleteDirectory(path);
    }

    public void Rename(string accountName, string oldName, string newName)
    {
        var oldPath = GetPath(accountName, oldName);
        var newPath = GetPath(accountName, newName);
        _fileSystemService.Rename(oldPath, newPath);
    }
    
}