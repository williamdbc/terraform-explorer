namespace TerraformExplorer.Extensions;

public static class ServiceCollectionExtensions
{
    public static void AddValidatedSingletonSettings<T>(this IServiceCollection services, IConfiguration configuration, string sectionName)
        where T : class, new()
    {
        var settings = configuration.GetSection(sectionName).Get<T>();
        if (settings == null)
            throw new Exception($"Configuração '{sectionName}' não encontrada ou inválida.");
        
        services.AddSingleton(settings);
    }
}