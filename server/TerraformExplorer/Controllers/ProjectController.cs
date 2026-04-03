using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TerraformExplorer.Models.Requests;
using TerraformExplorer.Models.Responses;
using TerraformExplorer.Services;

namespace TerraformExplorer.Controllers;

[ApiController]
[Authorize]
[Route("api/projects")]
public class ProjectController : ControllerBase
{
    private readonly ProjectService _projectService;

    public ProjectController(ProjectService projectService)
    {
        _projectService = projectService;
    }

    [HttpPost]
    public IActionResult Create([FromBody] CreateProjectRequest request)
    {
        _projectService.Create(request);
        return Ok(new SuccessResponse { Message = "Projeto criado com sucesso.", });
    }

    [HttpGet("account/{accountName}/module/{moduleName}")]
    public IActionResult List(string accountName, string moduleName)
    {
        var projects = _projectService.List(accountName, moduleName);
        return Ok(projects);
    }

    [HttpGet("account/{accountName}/module/{moduleName}/{projectName}")]
    public IActionResult Get(string accountName, string moduleName, string projectName)
    {
        var project = _projectService.Get(accountName, moduleName, projectName);
        return Ok(project);
    }

    [HttpDelete("account/{accountName}/module/{moduleName}/{projectName}")]
    public IActionResult Delete(string accountName, string moduleName, string projectName)
    {
        _projectService.Delete(accountName, moduleName, projectName);
        return Ok(new SuccessResponse { Message = $"Projeto '{projectName}' deletado do módulo '{moduleName}' na conta '{accountName}'." });
    }

    [HttpPost("copy")]
    public IActionResult CopyProject([FromBody] ProjectCopyRequest request)
    {
        _projectService.CopyProject(request);
        return Ok(new SuccessResponse { Message = "Projeto copiado com sucesso.", });
    }
    
    [HttpPut("account/{accountName}/module/{moduleName}/{projectName}")]
    public IActionResult Rename(
        string accountName, 
        string moduleName, 
        string projectName, 
        [FromBody] RenameProjectRequest request)
    {
        _projectService.Rename(accountName, moduleName, projectName, request.NewProjectName);
        return Ok(new SuccessResponse 
        { 
            Message = $"Projeto '{projectName}' renomeado para '{request.NewProjectName}' com sucesso." 
        });
    }
}