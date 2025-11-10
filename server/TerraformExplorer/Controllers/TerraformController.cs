using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using TerraformExplorer.Models;
using TerraformExplorer.Models.Requests;
using TerraformExplorer.Services;

namespace TerraformExplorer.Controllers;

[ApiController]
[Route("api/terraform")]
public class TerraformController : ControllerBase
{
    private readonly TerraformService _terraformService;

    public TerraformController(TerraformService terraformService)
    {
        _terraformService = terraformService;
    }

    [HttpGet("structure")]
    public IActionResult GetStructure()
    {
        var structure = _terraformService.GetStructure();
        return Ok(structure);
    }

    [HttpPost("execute")]
    public async Task<IActionResult> ExecuteTerraformCommand([FromBody] CommandRequest request)
    {
        var result = await _terraformService.ExecuteCommand(request);
        return Ok(result);
    }
    
    [HttpPost("execute-all")]
    public async Task<IActionResult> ExecuteAll([FromBody] ExecuteAllRequest request)
    {
        var response = await _terraformService.ExecuteAll(request);
        return Ok(response);
    }

}

