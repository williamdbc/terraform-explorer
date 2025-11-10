using Microsoft.AspNetCore.Mvc;
using TerraformExplorer.Models.Requests;
using TerraformExplorer.Models.Responses;
using TerraformExplorer.Services;

namespace TerraformExplorer.Controllers;

[ApiController]
[Route("api/providers")]
public class ProvidersController : ControllerBase
{
    private readonly AwsCredentialsService _awsService;

    public ProvidersController(AwsCredentialsService awsService)
    {
        _awsService = awsService;
    }

    [HttpPost("aws-profile")]
    public IActionResult CreateOrUpdateAwsProfile([FromBody] AwsCredentialRequest cred)
    {
        _awsService.SaveProfile(cred);
        return Ok(new SuccessResponse { Message = "AWS profile updated successfully." });
    }

    [HttpGet("aws-profiles")]
    public IActionResult ListAwsProfiles()
    {   
        var profiles = _awsService.ListProfiles();
        return Ok(profiles);
    }

    [HttpDelete("profile/{profileName}")]
    public IActionResult DeleteProfile(string profileName)
    {
        _awsService.DeleteProfile(profileName);
        return Ok(new SuccessResponse { Message = $"AWS profile '{profileName}' deleted successfully." });
    }
}