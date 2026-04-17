using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Hosting;
using TerraformExplorer.Extensions;

namespace TerraformExplorer.Configurations;

public static class MiddlewaresConfig
{
    public static void ConfigureMiddlewares(this WebApplication app)
    {
        app.UseMiddleware<ExceptionHandlingMiddleware>();

        app.UseHttpsRedirection();
        
        app.UseRouting();
        
        app.UseCorsConfiguration();
        
        app.UseAuthentication();
        app.UseAuthorization();
        
        app.UseWebSockets();
        
        app.MapHealthChecks("/health");
        
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }
        
        app.MapControllers();
    }
}