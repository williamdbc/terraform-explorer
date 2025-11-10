namespace TerraformExplorer.Services;

public class FileService
{
    private readonly FileSystemService _fileSystemService;

    public FileService(FileSystemService fileSystemService)
    {
        _fileSystemService = fileSystemService;
    }

    public string Read(string path)
    {
        return _fileSystemService.ReadFile(path);
    }

    public void Write(string path, string content)
    {
        _fileSystemService.SaveFile(path, content);
    }

    public void Delete(string path)
    {
        _fileSystemService.EnsureExists(path, "Folder/file");
        _fileSystemService.DeleteFile(path);
    }
    
    public void Rename(string oldPath, string newPath)
    {
        _fileSystemService.Rename(oldPath, newPath);
    }
    
}