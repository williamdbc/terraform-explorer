using TerraformExplorer.Models;
using TerraformExplorer.Models.Responses;
using TerraformExplorer.Settings;

namespace TerraformExplorer.Services;

public class ModuleService
{
    private readonly TerraformService _terraformService;
    private readonly FileSystemService _fileSystemService;
    private readonly TerraformSettings _terraformSettings;

    public ModuleService(
        TerraformService terraformService, 
        FileSystemService fileSystemService, 
        TerraformSettings terraformSettings)
    {
        _terraformService = terraformService;
        _fileSystemService = fileSystemService;
        _terraformSettings = terraformSettings;
    }
    
    private string GetPath(string name)
    {
        return Path.Combine(_terraformSettings.GetModulesPath(), name);
    }

    public List<ItemResponse> List()
    {
        var modules = _terraformService.GetStructure().Modules;
        return modules.Select(module => new ItemResponse{ Name = module.Name, Path = module.Path }).ToList();
    }

    public ItemResponse Get(string name)
    {
        var path = GetPath(name);
        _fileSystemService.EnsureExists(path, "Module");
        return new ItemResponse { Name = name, Path = path };
    }

    public void Create(string name)
    {
        var path = GetPath(name);
        _fileSystemService.CreateDirectory(path);
    }

    public void Delete(string name)
    {
        var path = GetPath(name);
        _fileSystemService.DeleteDirectory(path);
    }

    public void Rename(string oldName, string newName)
    {
        var oldPath = GetPath(oldName);
        var newPath = GetPath(newName);
        _fileSystemService.Rename(oldPath, newPath);
    }
    
}