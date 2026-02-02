using System.Text;

namespace TerraformExplorer.Utils;

public static class TerraformTypeParser
{
    // Struct para armazenar tipos Terraform parseados
    public abstract class TerraformType { }
    public class PrimitiveType : TerraformType
    {
        public string Name { get; set; } = "string"; // string, number, bool
    }
    public class ListType : TerraformType
    {
        public TerraformType ElementType { get; set; }
    }
    public class MapType : TerraformType
    {
        public TerraformType ElementType { get; set; }
    }
    public class ObjectType : TerraformType
    {
        public Dictionary<string, TerraformType> Fields { get; set; } = new();
    }
    public class OptionalType : TerraformType
    {
        public TerraformType InnerType { get; set; }
        public string? DefaultValue { get; set; }
    }

    public static TerraformType Parse(string typeString)
    {
        typeString = typeString.Trim();

        if (typeString.StartsWith("optional"))
            return ParseOptional(typeString);

        if (typeString.StartsWith("list"))
            return ParseList(typeString);

        if (typeString.StartsWith("map"))
            return ParseMap(typeString);

        if (typeString.StartsWith("object"))
            return ParseObject(typeString);

        // Primitives
        return new PrimitiveType { Name = typeString };
    }

    private static OptionalType ParseOptional(string typeString)
    {
        // formato: optional(type, default)
        var inside = ExtractParenthesesContent(typeString, "optional");
        var parts = SplitTopLevelComma(inside);

        var innerTypeString = parts[0];
        var defaultValue = parts.Length > 1 ? parts[1].Trim() : null;

        return new OptionalType
        {
            InnerType = Parse(innerTypeString),
            DefaultValue = defaultValue
        };
    }

    private static ListType ParseList(string typeString)
    {
        var inside = ExtractParenthesesContent(typeString, "list");
        return new ListType { ElementType = Parse(inside) };
    }

    private static MapType ParseMap(string typeString)
    {
        var inside = ExtractParenthesesContent(typeString, "map");
        return new MapType { ElementType = Parse(inside) };
    }

    private static ObjectType ParseObject(string typeString)
    {
        var inside = ExtractParenthesesContent(typeString, "object");
        // inside looks like { field1 = type1, field2 = type2, ... }
        var fields = new Dictionary<string, TerraformType>();

        var content = inside.Trim();
        if (content.StartsWith("{") && content.EndsWith("}"))
        {
            content = content[1..^1].Trim();
            var tokens = SplitTopLevelComma(content);
            foreach (var token in tokens)
            {
                var parts = token.Split('=', 2);
                if (parts.Length != 2) continue;
                var key = parts[0].Trim();
                var value = parts[1].Trim();
                fields[key] = Parse(value);
            }
        }
        return new ObjectType { Fields = fields };
    }

    private static string ExtractParenthesesContent(string text, string prefix)
    {
        var start = text.IndexOf('(');
        var end = text.LastIndexOf(')');
        if (start < 0 || end < 0 || end <= start)
            return "";
        return text[(start + 1)..end].Trim();
    }

    private static string[] SplitTopLevelComma(string text)
    {
        var parts = new List<string>();
        var sb = new StringBuilder();
        int depth = 0;
        foreach (var c in text)
        {
            if (c == '(' || c == '{' || c == '[') depth++;
            if (c == ')' || c == '}' || c == ']') depth--;
            if (c == ',' && depth == 0)
            {
                parts.Add(sb.ToString());
                sb.Clear();
            }
            else
            {
                sb.Append(c);
            }
        }
        if (sb.Length > 0) parts.Add(sb.ToString());
        return parts.ToArray();
    }
}