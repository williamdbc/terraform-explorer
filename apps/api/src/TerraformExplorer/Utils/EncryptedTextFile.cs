using System.Security.Cryptography;
using System.Text;

namespace TerraformExplorer.Utils;

public static class EncryptedTextFile
{
    private const string Prefix = "TEFENC1:";
    private const int NonceSize = 12;
    private const int TagSize = 16;

    public static string ReadAllText(string filePath, string encryptionKey)
    {
        if (!File.Exists(filePath))
            return string.Empty;

        var content = File.ReadAllText(filePath);
        if (!content.StartsWith(Prefix, StringComparison.Ordinal))
            return content;

        var payload = Convert.FromBase64String(content[Prefix.Length..]);
        if (payload.Length < NonceSize + TagSize)
            throw new InvalidOperationException($"Encrypted file '{filePath}' has an invalid payload.");

        var nonce = payload[..NonceSize];
        var tag = payload[NonceSize..(NonceSize + TagSize)];
        var cipherText = payload[(NonceSize + TagSize)..];
        var plainText = new byte[cipherText.Length];

        using var aes = new AesGcm(DeriveKey(encryptionKey), TagSize);
        aes.Decrypt(nonce, cipherText, tag, plainText);

        return Encoding.UTF8.GetString(plainText);
    }

    public static string[] ReadAllLines(string filePath, string encryptionKey)
    {
        var content = ReadAllText(filePath, encryptionKey);
        return string.IsNullOrEmpty(content)
            ? Array.Empty<string>()
            : content.ReplaceLineEndings("\n").Split('\n');
    }

    public static void WriteAllText(string filePath, string content, string encryptionKey)
    {
        var key = DeriveKey(encryptionKey);
        var nonce = RandomNumberGenerator.GetBytes(NonceSize);
        var plainText = Encoding.UTF8.GetBytes(content);
        var cipherText = new byte[plainText.Length];
        var tag = new byte[TagSize];

        using var aes = new AesGcm(key, TagSize);
        aes.Encrypt(nonce, plainText, cipherText, tag);

        var payload = new byte[nonce.Length + tag.Length + cipherText.Length];
        Buffer.BlockCopy(nonce, 0, payload, 0, nonce.Length);
        Buffer.BlockCopy(tag, 0, payload, nonce.Length, tag.Length);
        Buffer.BlockCopy(cipherText, 0, payload, nonce.Length + tag.Length, cipherText.Length);

        Directory.CreateDirectory(Path.GetDirectoryName(filePath)!);
        File.WriteAllText(filePath, Prefix + Convert.ToBase64String(payload));
    }

    public static void WriteAllLines(string filePath, IEnumerable<string> lines, string encryptionKey)
    {
        WriteAllText(filePath, string.Join(Environment.NewLine, lines), encryptionKey);
    }

    private static byte[] DeriveKey(string encryptionKey)
    {
        if (string.IsNullOrWhiteSpace(encryptionKey))
            throw new InvalidOperationException("TerraformSettings:CredentialsEncryptionKey is required.");

        return SHA256.HashData(Encoding.UTF8.GetBytes(encryptionKey));
    }
}
