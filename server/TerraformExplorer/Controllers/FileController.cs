using Microsoft.AspNetCore.Mvc;
using TerraformExplorer.Models;
using TerraformExplorer.Models.Requests;
using TerraformExplorer.Models.Responses;
using TerraformExplorer.Services;

namespace TerraformExplorer.Controllers;

[ApiController]
[Route("api/files")]
public class FileController : ControllerBase
{
    private readonly FileService _fileService;

    public FileController(FileService fileService)
    {
        _fileService = fileService;
    }

    [HttpGet("{path}")]
    public IActionResult Read([FromRoute] string path)
    {
        var content = _fileService.Read(path);
        return Ok(new FileReadResponse { Content = content });
    }

    [HttpPost]
    public IActionResult Write([FromBody] FileWriteRequest req)
    {
        _fileService.Write(req.Path, req.Content);
        return Ok();
    }

    [HttpDelete("{path}")]
    public IActionResult Delete([FromRoute] string path)
    {
        _fileService.Delete(path);
        return Ok();
    }
    
    [HttpPut]
    public IActionResult Rename([FromBody] RenameFileRequest req)
    {
        _fileService.Rename(req.OldPath, req.NewPath);
        return Ok(new SuccessResponse { Message = "Arquivo renomeado com sucesso." });
    }
    
}