using TerraformExplorer.Models;
using TerraformExplorer.Settings;

namespace TerraformExplorer.Utils;

public static class TerraformStructureLoader
{
    public static TerraformStructure Load(TerraformSettings settings)
    {
        return new TerraformStructure
        {
            RootPath = settings.GetRootPath(),
            Modules = LoadModules(settings.GetModulesPath()),
            Accounts = LoadAccounts(settings.GetAccountsPath()),
            Providers = LoadProviders(settings.GetProvidersPath())
        };
    }

    public static List<TerraformModule> LoadModules(string modulesPath)
    {
        var modules = new List<TerraformModule>();
        if (!Directory.Exists(modulesPath))
            return modules;

        foreach (var moduleDir in Directory.GetDirectories(modulesPath))
        {
            modules.Add(new TerraformModule
            {
                Name = Path.GetFileName(moduleDir),
                Path = moduleDir,
                Files = LoadFiles(moduleDir)
            });
        }

        return modules
            .OrderBy(m => m.Name, StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    public static List<Account> LoadAccounts(string accountsPath)
    {
        var accounts = new List<Account>();
        if (!Directory.Exists(accountsPath)) return accounts;
        
        foreach (var accountDir in Directory.GetDirectories(accountsPath))
        {
            var account = new Account
            {
                Name = Path.GetFileName(accountDir),
                Path = accountDir,
                UsedModules = LoadUsedModules(accountDir)
            };
            
            var providerTfPath = Path.Combine(accountDir, "provider.tf");
            if (File.Exists(providerTfPath))
            {
                var tfConfig = ProviderTfParser.Parse(File.ReadAllText(providerTfPath));
                account.AwsProfile = tfConfig.Profile;
                account.Region = tfConfig.Region;
                account.AssumeRoleArn = tfConfig.AssumeRoleArn;
            }

            accounts.Add(account);
        }

        return accounts
            .OrderBy(a => a.Name, StringComparer.OrdinalIgnoreCase)
            .ToList();
    }
    
    public static List<UsedModule> LoadUsedModules(string accountPath)
    {
        var usedModules = new List<UsedModule>();
        foreach (var usedModuleDir in Directory.GetDirectories(accountPath))
        {
            usedModules.Add(new UsedModule
            {
                Name = Path.GetFileName(usedModuleDir),
                Path = usedModuleDir,
                Projects = LoadProjects(usedModuleDir)
            });
        }

        return usedModules
            .OrderBy(um => um.Name, StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    public static List<Project> LoadProjects(string usedModulePath)
    {
        var projects = new List<Project>();
        foreach (var projectDir in Directory.GetDirectories(usedModulePath))
        {
            projects.Add(new Project
            {
                Name = Path.GetFileName(projectDir),
                Path = projectDir,
                Files = LoadFiles(projectDir)
            });
        }

        return projects
            .OrderBy(p => p.Name, StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    public static List<Provider> LoadProviders(string providersPath)
    {
        if (!Directory.Exists(providersPath))
            return new List<Provider>();

        var credentialsPath = Path.Combine(providersPath, "credentials");
        var profileResponses = AwsCredentialsFile.ReadProfiles(credentialsPath);
        
        var providers = profileResponses
            .Select(p => new Provider { Name = p.Name })
            .OrderBy(p => p.Name, StringComparer.OrdinalIgnoreCase)
            .ToList();

        return providers;
    }

    public static List<TerraformFile> LoadFiles(string directory)
    {
        var files = new List<TerraformFile>();
        foreach (var filePath in Directory.GetFiles(directory))
        {
            files.Add(new TerraformFile
            {
                Name = Path.GetFileName(filePath),
                Path = filePath,
                Type = Path.GetExtension(filePath)
            });
        }

        return files
            .OrderBy(f => f.Name, StringComparer.OrdinalIgnoreCase)
            .ToList();
    }
}