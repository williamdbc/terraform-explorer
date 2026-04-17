using System.Text;

namespace TerraformExplorer.Utils;


public static class MainTfGenerator
{
    public static string Generate(string moduleName, List<ModuleVariable> variables, string sourcePath)
    {
        var sb = new StringBuilder();
        sb.AppendLine($"module \"{ToSnakeCase(moduleName)}\" {{");
        sb.AppendLine($"  source = \"{sourcePath}\"");
        sb.AppendLine();

        foreach (var v in variables)
        {
            var value = v.Default ?? "\"\"";
            sb.AppendLine($"  {v.Name} = {value}");
        }

        sb.AppendLine("}");
        return sb.ToString();
    }

    private static string ToSnakeCase(string input)
        => string.Concat(input.Select((x, i) => i > 0 && char.IsUpper(x) ? "_" + x.ToString() : x.ToString())).ToLower();
}