using TerraformExplorer.Exceptions;
using TerraformExplorer.Models;
using TerraformExplorer.Models.Requests;
using TerraformExplorer.Models.Responses;
using TerraformExplorer.Settings;
using TerraformExplorer.Utils;

namespace TerraformExplorer.Services;

public class AccountService
{
    private readonly TerraformService _terraformService;
    private readonly FileSystemService _fileSystemService;
    private readonly TerraformSettings _terraformSettings;
    // private readonly AwsS3Service _s3Service;

    public AccountService(
        TerraformService terraformService, 
        FileSystemService fileSystemService, 
        // AwsS3Service s3Service,
        TerraformSettings terraformSettings)
    {
        _terraformService = terraformService;
        _fileSystemService = fileSystemService;
        // _s3Service = s3Service;
        _terraformSettings = terraformSettings;
    }
    
    public void CopyAccount(AccountCopyRequest request)
    {
        var sourcePath = GetPath(request.SourceAccountName);
        var destPath = GetPath(request.DestinationAccountName);

        _fileSystemService.CopyDirectory(sourcePath, destPath);
    }
    
    private string GetPath(string name)
    {
        return Path.Combine(_terraformSettings.GetAccountsPath(), name);
    }

    public List<ItemResponse> List()
    {
        var accounts = _terraformService.GetStructure().Accounts;
        return accounts.Select(account => new ItemResponse { Name = account.Name, Path = account.Path }).ToList();
    }

    public ItemResponse Get(string name)
    {
        var path = GetPath(name);
        _fileSystemService.EnsureExists(path, "Conta");
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
    
    public async Task LinkProviderToAccount(string accountName, SetAwsConfigRequest request)
    {
        var structure = TerraformStructureLoader.Load(_terraformSettings);
        var account = structure.Accounts.FirstOrDefault(a => a.Name == accountName)
                      ?? throw new NotFoundException($"Conta {accountName} não encontrada.");
        
        account.AwsProfile = request.Profile;
        account.AssumeRoleArn = request.RoleArn;
        account.Region = request.Region;
        
        ProviderTfGenerator.GenerateProvider(account);
        
        var credentialsPath = Path.Combine(_terraformSettings.GetProvidersPath(), "credentials");
        
        var s3Service = new AwsS3Service(
            account.AwsProfile,
            credentialsPath,
            account.AssumeRoleArn,
            account.Region
        );
        await ProviderTfGenerator.GenerateBackendAsync(account, s3Service);
    }
    
    private string GetConfigPath()
    {   
        return Path.Combine(_terraformSettings.GetProvidersPath(), "config");
    }
    
}