using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TerraformExplorer.Models;
using TerraformExplorer.Models.Requests;
using TerraformExplorer.Services;

namespace TerraformExplorer.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/setup")]
public class SetupController : ControllerBase
{
    private readonly AuthService _authService;

    public SetupController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpGet("status")]
    public async Task<ActionResult<SetupStatusResponse>> Status()
    {
        var response = await _authService.HasUser();
        return Ok(response);
    }

    [HttpPost]
    public async Task<ActionResult<RegisterResponse>> Register(RegisterRequest request)
    {
        var response = await _authService.Register(request);
        return Ok(response);
    }
}
