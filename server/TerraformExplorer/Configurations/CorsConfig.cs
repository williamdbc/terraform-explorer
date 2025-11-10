using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;

namespace TerraformExplorer.Configurations;

public static class CorsConfig
{
    private static readonly string _policyName = "Origins";

    public static void ConfigureCors(this WebApplicationBuilder builder)
    {
        builder.Services.AddCors(options =>
        {
            options.AddPolicy(name: _policyName,
                policy =>
                {
                    policy.AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader();
                });
        });
    }

    public static void UseCorsConfiguration(this WebApplication app)
    {
        app.UseCors(_policyName);
    }
}