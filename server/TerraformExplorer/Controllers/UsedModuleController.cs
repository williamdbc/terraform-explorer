using Microsoft.AspNetCore.Mvc;
using TerraformExplorer.Models;
using TerraformExplorer.Models.Requests;
using TerraformExplorer.Models.Responses;
using TerraformExplorer.Services;

namespace TerraformExplorer.Controllers;

[ApiController]
[Route("api/accounts/{accountName}/modules")]
public class UsedModuleController : ControllerBase
{
    private readonly UsedModuleService _usedModuleService;

    public UsedModuleController(UsedModuleService usedModuleService)
    {
        _usedModuleService = usedModuleService;
    }

    [HttpGet]
    public IActionResult List(string accountName)
    {
        var modules = _usedModuleService.List(accountName);
        return Ok(modules);
    }

    [HttpPost]
    public IActionResult Create(string accountName, [FromBody] CreateItemRequest request)
    {
        _usedModuleService.Create(accountName, request.Name);
        return Ok(new SuccessResponse { Message = $"Module '{request.Name}' created and linked to account '{accountName}' successfully." });
    }

    [HttpDelete("{moduleName}")]
    public IActionResult Delete(string accountName, string moduleName)
    {
        _usedModuleService.Delete(accountName, moduleName);
        return Ok(new SuccessResponse
            { Message = $"Module '{moduleName}' deleted from account '{accountName}' successfully." });
    }

    [HttpPut("{moduleName}")]
    public IActionResult Rename(string accountName, string moduleName, [FromBody] RenameRequest req)
    {
        _usedModuleService.Rename(accountName, moduleName, req.NewName);
        return Ok(new SuccessResponse { Message = $"UsedModule renomeado para '{req.NewName}'." });
    }

    [HttpGet("{moduleName}")]
    public IActionResult Get(string accountName, string moduleName)
    {
        var module = _usedModuleService.Get(accountName, moduleName);
        return Ok(module);
    }

    [HttpPost("copy")]
    public IActionResult CopyUsedModule([FromBody] UsedModuleCopyRequest request)
    {
        _usedModuleService.CopyUsedModule(request);
        return Ok(new SuccessResponse { Message = $"UsedModule '{request.Source.ModuleName}' copiado para conta '{request.Destination.AccountName}'." });
    }
}