using System.Collections.Generic;

namespace TerraformExplorer.Models;

public class TerraformStructure
{
    public string RootPath { get; set; }
    public List<Account> Accounts { get; set; } = new();
    public List<TerraformModule> Modules { get; set; } = new();
    public List<Provider> Providers { get; set; } = new();
}

public class Account
{
    public string Name { get; set; } = string.Empty;
    public string Path { get; set; } = string.Empty;
    public string? AwsProfile { get; set; }
    public string? SourceProfile { get; set; }
    public string? AssumeRoleArn { get; set; }
    public string? Region { get; set; }
    public List<UsedModule> UsedModules { get; set; } = new();
}

public class Provider
{
    public string Name { get; set; }
}

public class TerraformModule
{
    public string Name { get; set; }
    public string Path { get; set; }
    public List<TerraformFile> Files { get; set; } = new();
}

public class UsedModule
{
    public string Name { get; set; }
    public string Path { get; set; }
    public List<Project> Projects { get; set; } = new();
}

public class Project
{
    public string Name { get; set; }
    public string Path { get; set; }
    public List<TerraformFile> Files { get; set; } = new();
}

public class TerraformFile
{
    public string Name { get; set; }
    public string Path { get; set; }
    public string Type { get; set; }
}