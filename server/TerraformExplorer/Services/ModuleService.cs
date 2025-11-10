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
    if (string.IsNullOrWhiteSpace(newName))
        throw new ArgumentException("O novo nome do módulo não pode ser vazio.");

    if (oldName == newName)
        throw new InvalidOperationException("O novo nome é igual ao atual.");

    var oldPath = GetPath(oldName);
    var newPath = GetPath(newName);

    _fileSystemService.EnsureExists(oldPath, "Módulo");

    if (Directory.Exists(newPath))
        throw new InvalidOperationException($"Já existe um módulo com o nome '{newName}'.");
    
    _fileSystemService.Rename(oldPath, newPath);
    
    UpdateModuleReferencesInProjects(oldName, newName);
}

private void UpdateModuleReferencesInProjects(string oldModuleName, string newModuleName)
{
    var structure = _terraformService.GetStructure();
    var accountsPath = _terraformSettings.GetAccountsPath();

    if (!Directory.Exists(accountsPath)) return;

    var oldSourcePattern = $"../../../../modules/{oldModuleName}";
    var newSourcePattern = $"../../../../modules/{newModuleName}";

    foreach (var account in structure.Accounts)
    {
        foreach (var usedModule in account.UsedModules)
        {
            var projectsPath = usedModule.Path;
            if (!Directory.Exists(projectsPath)) continue;

            foreach (var projectDir in Directory.GetDirectories(projectsPath))
            {
                var mainTfPath = Path.Combine(projectDir, "main.tf");
                if (!File.Exists(mainTfPath)) continue;

                var content = File.ReadAllText(mainTfPath);

                if (content.Contains(oldSourcePattern))
                {
                    var updatedContent = content.Replace(oldSourcePattern, newSourcePattern);
                    File.WriteAllText(mainTfPath, updatedContent);
                }
            }
        }
    }
}
    
}