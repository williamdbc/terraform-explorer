using Amazon.S3;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using TerraformExplorer.Services;

namespace TerraformExplorer.Configurations;

public static class ServicesConfig
{
    public static void ConfigureServices(this WebApplicationBuilder builder)
    {
        builder.Services.AddHealthChecks();
        builder.Services.AddMemoryCache();
        
        builder.Services.AddScoped<TerraformService>();
        builder.Services.AddScoped<AwsCredentialsService>();
        builder.Services.AddScoped<AccountService>();
        builder.Services.AddScoped<ProjectService>();
        builder.Services.AddScoped<FileService>();
        builder.Services.AddScoped<FileSystemService>();
        builder.Services.AddScoped<ModuleService>();
        builder.Services.AddScoped<ProjectGroupService>();
        // builder.Services.AddScoped<AwsS3Service>();
    }
}