using Newtonsoft.Json;

namespace TerraformExplorer.Exceptions;

public class ExceptionResponse
{
    [JsonProperty("status")]
    public int Status { get; set; }
    
    [JsonProperty("message")]
    public string Message { get; set; }
}