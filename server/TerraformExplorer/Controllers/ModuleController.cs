using Microsoft.AspNetCore.Mvc;
using TerraformExplorer.Models;
using TerraformExplorer.Models.Requests;
using TerraformExplorer.Models.Responses;
using TerraformExplorer.Services;

namespace TerraformExplorer.Controllers;

[ApiController]
[Route("api/modules")]
public class ModuleController : ControllerBase
{
    private readonly ModuleService _moduleService;

    public ModuleController(ModuleService moduleService)
    {
        _moduleService = moduleService;
    }

    [HttpGet]
    public IActionResult List()
    {
        var modules = _moduleService.List();
        return Ok(modules);
    }

    [HttpGet("{name}")]
    public IActionResult Get(string name)
    {
        var module = _moduleService.Get(name);
        return Ok(module);
    }

    [HttpPost]
    public IActionResult Create([FromBody] CreateItemRequest request)
    {
        _moduleService.Create(request.Name);
        return Ok(new SuccessResponse { Message = $"Module '{request.Name}' created successfully." });
    }

    [HttpDelete("{name}")]
    public IActionResult Delete(string name)
    {
        _moduleService.Delete(name);
        return Ok(new SuccessResponse { Message = $"Module '{name}' deleted successfully." });
    }
    
    [HttpPut("{name}")]
    public IActionResult Rename(string name, [FromBody] RenameRequest req)
    {
        _moduleService.Rename(name, req.NewName);
        return Ok(new SuccessResponse { Message = $"Módulo renomeado para '{req.NewName}'." });
    }
    
}