using TerraformExplorer.Models;
using TerraformExplorer.Models.Requests;
using TerraformExplorer.Models.Responses;
using TerraformExplorer.Settings;
using TerraformExplorer.Utils;

namespace TerraformExplorer.Services;

public class TerraformService
{
    private readonly TerraformSettings _terraformSettings;

    public TerraformService(TerraformSettings terraformSettings)
    {
        _terraformSettings = terraformSettings;
    }

    public TerraformStructure GetStructure()
    {
        return TerraformStructureLoader.Load(_terraformSettings);
    }
        
    public async Task<CommandResponse> ExecuteCommand(CommandRequest request)
    {
        return await TerraformCommandExecutor.ExecuteSingleAsync(request.Command, request.WorkingDir, _terraformSettings);
    }
    
    public async Task<ExecuteAllResponse> ExecuteAll(ExecuteAllRequest request)
    {
        return await TerraformCommandExecutor.ExecuteAllAsync(request, _terraformSettings);
    }
    
}