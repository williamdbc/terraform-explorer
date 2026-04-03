using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TerraformExplorer.Models;
using TerraformExplorer.Models.Requests;
using TerraformExplorer.Models.Responses;
using TerraformExplorer.Services;

namespace TerraformExplorer.Controllers;

[ApiController]
[Authorize]
[Route("api/account")]
public class AccountController : ControllerBase
{
    private readonly AccountService _accountService;

    public AccountController(AccountService accountService)
    {
        _accountService = accountService;
    }

    [HttpPost("{accountName}/link-provider-to-account")]
    public IActionResult LinkProviderToAccount(string accountName, [FromBody] SetAwsConfigRequest request)
    {
        _accountService.LinkProviderToAccount(accountName, request);
        return Ok(new SuccessResponse { Message = $"AWS config atualizada para a conta '{accountName}'" });
    }

    [HttpGet]
    public IActionResult List()
    {
        var accounts = _accountService.List();
        return Ok(accounts);
    }

    [HttpGet("{name}")]
    public IActionResult Get(string name)
    {
        var account = _accountService.Get(name);
        return Ok(account);
    }

    [HttpPost]
    public IActionResult Create([FromBody] CreateItemRequest request)
    {
        _accountService.Create(request.Name);
        return Ok(new SuccessResponse { Message = $"Conta '{request.Name}' criada com sucesso." });
    }

    [HttpDelete("{name}")]
    public IActionResult Delete(string name)
    {
        _accountService.Delete(name);
        return Ok(new SuccessResponse { Message = $"Conta '{name}' deletada com sucesso." });
    }

    [HttpPut("{name}")]
    public IActionResult Rename(string name, [FromBody] RenameRequest req)
    {
        _accountService.Rename(name, req.NewName);
        return Ok(new SuccessResponse { Message = $"Conta renomeada para '{req.NewName}'." });
    }

    [HttpPost("copy")]
    public IActionResult CopyAccount([FromBody] AccountCopyRequest request)
    {
        _accountService.CopyAccount(request);
        return Ok(new SuccessResponse { Message = $"Conta '{request.SourceAccountName}' copiada para '{request.DestinationAccountName}'." });
    }
    
}