using TerraformExplorer.Models;
using TerraformExplorer.Models.Requests;
using TerraformExplorer.Models.Responses;
using TerraformExplorer.Settings;
using TerraformExplorer.Utils;

namespace TerraformExplorer.Services;

public class ProjectService
{
    private readonly TerraformSettings _terraformSettings;
    private readonly FileSystemService _fileSystemService;

    public ProjectService(TerraformSettings terraformSettings, FileSystemService fileSystemService)
    {
        _terraformSettings = terraformSettings;
        _fileSystemService = fileSystemService;
    }
    
    public string CopyProject(ProjectCopyRequest request)
    {
        var source = request.Source;
        var destination = request.Destination;
        
        var sourcePath = GetPath(source.AccountName, source.ModuleName, source.ProjectName);
        var destPath = GetPath(destination.AccountName, destination.ModuleName, destination.ProjectName);

        _fileSystemService.CopyDirectory(sourcePath, destPath);

        return destPath;
    }
    
    private string GetPath(string accountName, string moduleName, string projectName)
    {
        return Path.Combine(_terraformSettings.GetAccountsPath(), accountName, moduleName, projectName);
    }

    private string GetModulePath(string accountName, string moduleName)
    {
        return Path.Combine(_terraformSettings.GetAccountsPath(), accountName, moduleName);
    }
    
    public List<ItemResponse> List(string accountName, string moduleName)
    {
        var modulePath = GetModulePath(accountName, moduleName);
        _fileSystemService.EnsureExists(modulePath, "UsedModule");

        return Directory.GetDirectories(modulePath)
            .Select(d => new ItemResponse { Name = Path.GetFileName(d), Path = d })
            .ToList();
    }

    public ItemResponse Get(string accountName, string moduleName, string projectName)
    {
        var path = GetPath(accountName, moduleName, projectName);
        _fileSystemService.EnsureExists(path, "Project");
        return new ItemResponse { Name = projectName, Path = path };
    }

    public void Delete(string accountName, string moduleName, string projectName)
    {
        var path = GetPath(accountName, moduleName, projectName);
        _fileSystemService.DeleteDirectory(path);
    }

    public string CreateProject(CreateProjectRequest request)
    {
        var structure = TerraformStructureLoader.Load(_terraformSettings);
        
        var account = structure.Accounts.FirstOrDefault(a => a.Name == request.AccountName)
                      ?? throw new DirectoryNotFoundException($"Conta {request.AccountName} não encontrada.");

        var projectGroup = account.ProjectGroups.FirstOrDefault(m => m.Name == request.ProjectGroupName)
                         ?? throw new DirectoryNotFoundException($"Grupo de projetos {request.ProjectGroupName} não encontrado na conta {request.AccountName}.");

        var sourceModule = structure.Modules.FirstOrDefault(m => m.Name == request.ModuleName)
                           ?? throw new DirectoryNotFoundException($"Módulo {request.ModuleName} não encontrado em modules/.");

        var projectPath = Path.Combine(projectGroup.Path, request.ProjectName);
        if (Directory.Exists(projectPath))
            throw new InvalidOperationException($"Projeto {request.ProjectName} já existe.");

        Directory.CreateDirectory(projectPath);

        var variablesTfPath = Path.Combine(_terraformSettings.GetModulesPath(), sourceModule.Name, "variables.tf");
        var moduleVariables = ModuleVariableParser.Parse(variablesTfPath);

        var relativeSource = $"../../../../modules/{sourceModule.Name}";
        var mainTfContent = MainTfGenerator.Generate(request.ModuleName, moduleVariables, relativeSource);

        var mainTfPath = Path.Combine(projectPath, "main.tf");
        File.WriteAllText(mainTfPath, mainTfContent);
  
        return mainTfPath;
    }
    
    public void RenameProject(string accountName, string moduleName, string oldProjectName, string newProjectName)
    {
        if (string.IsNullOrWhiteSpace(newProjectName))
            throw new ArgumentException("O novo nome do projeto não pode ser vazio.");

        if (oldProjectName == newProjectName)
            throw new InvalidOperationException("O novo nome é igual ao atual.");

        var oldPath = GetPath(accountName, moduleName, oldProjectName);
        var newPath = GetPath(accountName, moduleName, newProjectName);

        _fileSystemService.EnsureExists(oldPath, "Projeto");

        if (Directory.Exists(newPath))
            throw new InvalidOperationException($"Já existe um projeto com o nome '{newProjectName}' neste módulo.");

        _fileSystemService.Rename(oldPath, newPath);
    }
    
}