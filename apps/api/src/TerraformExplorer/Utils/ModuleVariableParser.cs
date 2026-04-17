using System.Text.RegularExpressions;

namespace TerraformExplorer.Utils;

public static class ModuleVariableParser
{
    public static List<ModuleVariable> Parse(string variablesTfPath)
    {
        if (!File.Exists(variablesTfPath))
            return new List<ModuleVariable>();

        var content = File.ReadAllText(variablesTfPath);
        var variables = new List<ModuleVariable>();
        
        var blockRegex = new Regex(
            @"variable\s+""([^""]+)""\s*\{([^}]*)\}",
            RegexOptions.Singleline
        );

        var matches = blockRegex.Matches(content);

        foreach (Match match in matches)
        {
            var name = match.Groups[1].Value.Trim();
            var body = match.Groups[2].Value;

            var description = GetValue(body, "description");
            var type = GetValue(body, "type") ?? "string";
            var defaultValue = GetDefaultValue(body);

            variables.Add(new ModuleVariable
            {
                Name = name,
                Description = description,
                Type = type,
                Default = defaultValue
            });
        }

        return variables;
    }

    private static string? GetValue(string body, string key)
    {
        var regex = new Regex($@"{key}\s*=\s*""([^""]*)""");
        var match = regex.Match(body);
        return match.Success ? match.Groups[1].Value : null;
    }

    private static string? GetDefaultValue(string body)
    {
        var regex = new Regex(@"default\s*=\s*([^\n#]+)", RegexOptions.Singleline);
        var match = regex.Match(body);
        if (!match.Success) return null;

        var value = match.Groups[1].Value.Trim();
        
        if (value.StartsWith("{") || value.StartsWith("["))
            return value;
        
        if (!value.StartsWith("\""))
            return $"\"{value}\"";

        return value;
    }
    
    
}

public class ModuleVariable
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Type { get; set; } = "string";
    public string? Default { get; set; }
    public List<ModuleVariable>? ObjectFields { get; set; } // NOVO
}