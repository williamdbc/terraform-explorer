using Microsoft.AspNetCore.Mvc;
using TerraformExplorer.Models;
using TerraformExplorer.Models.Requests;
using TerraformExplorer.Models.Responses;
using TerraformExplorer.Services;

namespace TerraformExplorer.Controllers;

[ApiController]
[Route("api/accounts/{accountName}/groups")]
public class ProjectGroupController : ControllerBase
{
    private readonly ProjectGroupService _projectGroupService;

    public ProjectGroupController(ProjectGroupService projectGroupService)
    {
        _projectGroupService = projectGroupService;
    }

    [HttpGet]
    public IActionResult List(string accountName)
    {
        var modules = _projectGroupService.List(accountName);
        return Ok(modules);
    }

    [HttpPost]
    public IActionResult Create(string accountName, [FromBody] CreateItemRequest request)
    {
        _projectGroupService.Create(accountName, request.Name);
        return Ok(new SuccessResponse { Message = $"Module '{request.Name}' created and linked to account '{accountName}' successfully." });
    }

    [HttpDelete("{groupName}")]
    public IActionResult Delete(string accountName, string groupName)
    {
        _projectGroupService.Delete(accountName, groupName);
        return Ok(new SuccessResponse
            { Message = $"Module '{groupName}' deleted from account '{accountName}' successfully." });
    }

    [HttpPut("{groupName}")]
    public IActionResult Rename(string accountName, string groupName, [FromBody] RenameRequest req)
    {
        _projectGroupService.Rename(accountName, groupName, req.NewName);
        return Ok(new SuccessResponse { Message = $"UsedModule renomeado para '{req.NewName}'." });
    }

    [HttpGet("{groupName}")]
    public IActionResult Get(string accountName, string groupName)
    {
        var module = _projectGroupService.Get(accountName, groupName);
        return Ok(module);
    }

    [HttpPost("copy")]
    public IActionResult CopyProjectGroup([FromBody] ProjectGroupCopyRequest request)
    {
        _projectGroupService.CopyProjectGroup(request);
        return Ok(new SuccessResponse { Message = $"UsedModule '{request.Source.GroupName}' copiado para conta '{request.Destination.AccountName}'." });
    }
}