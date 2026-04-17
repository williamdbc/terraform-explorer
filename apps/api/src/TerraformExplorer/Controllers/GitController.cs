using Microsoft.AspNetCore.Mvc;
using TerraformExplorer.Models.Requests;
using TerraformExplorer.Models.Responses;
using TerraformExplorer.Services;
using TerraformExplorer.Settings;

namespace TerraformExplorer.Controllers;

[ApiController]
[Route("api/git")]
public class GitController : ControllerBase
{
    private readonly GitService _gitService;
    private readonly GitSettings _gitSettings;

    public GitController(GitService gitService, GitSettings gitSettings)
    {
        _gitService = gitService;
        _gitSettings = gitSettings;
    }

    [HttpGet("status")]
    public async Task<IActionResult> GetStatus()
    {
        var status = await _gitService.GetStatusAsync();
        return Ok(status);
    }

    [HttpPost("commit")]
    public async Task<IActionResult> Commit([FromBody] GitCommitRequest request)
    {
        await _gitService.CommitAsync(request.Message, request.Files);
        return Ok(new SuccessResponse { Message = "Commit realizado com sucesso." });
    }

    [HttpPost("push")]
    public async Task<IActionResult> Push()
    {
        await _gitService.PushAsync();
        return Ok(new SuccessResponse { Message = "Push realizado com sucesso." });
    }

    [HttpPost("pull")]
    public async Task<IActionResult> Pull()
    {
        var output = await _gitService.PullAsync();
        return Ok(new SuccessResponse { Message = output });
    }

    [HttpPost("clone")]
    public async Task<IActionResult> Clone()
    {
        await _gitService.CloneAsync();
        return Ok(new SuccessResponse { Message = "Repositório clonado com sucesso." });
    }

    [HttpPut("auto-commit")]
    public IActionResult UpdateAutoCommit([FromBody] GitAutoCommitSettingsRequest request)
    {
        _gitSettings.AutoCommitEnabled = request.Enabled;
        _gitSettings.AutoCommitIntervalSeconds = request.IntervalSeconds > 0 ? request.IntervalSeconds : 60;
        return Ok(new SuccessResponse { Message = $"Auto-commit {(request.Enabled ? "ativado" : "desativado")}." });
    }
}
