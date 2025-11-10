using System.Net;
using TerraformExplorer.Exceptions;
using TerraformExplorer.Settings;

namespace TerraformExplorer.Services;

public class FileSystemService
{
    private readonly string _rootPath;

    public FileSystemService(TerraformSettings terraformSettings)
    {
        _rootPath = terraformSettings.GetRootPath();
        Directory.CreateDirectory(_rootPath);
    }

    private string Validate(string path)
    {
        var full = Path.GetFullPath(path);
        if (!full.StartsWith(_rootPath, StringComparison.OrdinalIgnoreCase))
            throw new UnauthorizedAccessException("Fora do diretório permitido.");
        return full;
    }
    
    public void EnsureExists(string path, string type)
    {
        if (!Directory.Exists(Validate(path)) && !File.Exists(Validate(path)))
            throw new NotFoundException($"{type} não encontrado: {path}");
    }
    
    public void EnsureNotExists(string path, string type)
    {
        if (Directory.Exists(Validate(path)) || File.Exists(Validate(path)))
            throw new BusinessException($"{type} já existe: {path}");
    }

    public void CreateDirectory(string path)
    {
        EnsureNotExists(path, "Diretório");
        Directory.CreateDirectory(Validate(path));
    }

    public void DeleteDirectory(string path, bool recursive = true)
    {
        EnsureExists(path, "Diretório");
        Directory.Delete(Validate(path), recursive);
    }

    public void SaveFile(string path, string content)
    {
        string validPath = Validate(path);
        Directory.CreateDirectory(Path.GetDirectoryName(validPath)!);
        File.WriteAllText(validPath, content);
    }

    public string ReadFile(string path)
    {
        var decoded = WebUtility.UrlDecode(path);
        var full = Validate(decoded);
        if (!File.Exists(full))
            throw new NotFoundException($"Arquivo não encontrado: {path}");
        return File.ReadAllText(full);
    }

    public void DeleteFile(string path)
    {
        var full = Validate(path);
        if (!File.Exists(full))
            throw new NotFoundException($"Arquivo não encontrado: {path}");
        File.Delete(full);
    }

    public void Rename(string oldPath, string newPath)
    {
        var oldFull = Validate(oldPath);
        var newFull = Validate(newPath);

        EnsureExists(oldPath, "Item");
        EnsureNotExists(newPath, "Item");

        if (File.Exists(oldFull))
            File.Move(oldFull, newFull);
        else
            Directory.Move(oldFull, newFull);
    }
    
    public void CopyDirectory(string sourcePath, string destinationPath)
    {
        var sourceFull = Validate(sourcePath);
        var destFull = Validate(destinationPath);

        EnsureExists(sourcePath, "Diretório de origem");
        EnsureNotExists(destinationPath, "Diretório de destino");

        Directory.CreateDirectory(destFull);
        
        var filesToIgnore = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "terraform.tfstate",
            "terraform.tfstate.backup",
            ".terraform.lock.hcl"
        };
        
        var dirToIgnore = ".terraform";
        
        foreach (var file in Directory.GetFiles(sourceFull))
        {
            var fileName = Path.GetFileName(file);
            if (filesToIgnore.Contains(fileName))
                continue;

            var destFile = Path.Combine(destFull, fileName);
            File.Copy(file, destFile, overwrite: false);
        }
        
        foreach (var dir in Directory.GetDirectories(sourceFull))
        {
            var dirName = Path.GetFileName(dir);
            if (string.Equals(dirName, dirToIgnore, StringComparison.OrdinalIgnoreCase))
                continue;

            var destDir = Path.Combine(destFull, dirName);
            CopyDirectory(dir, destDir);
        }
    }
    
}