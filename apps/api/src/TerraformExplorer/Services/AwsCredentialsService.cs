using TerraformExplorer.Models;
using TerraformExplorer.Models.Requests;
using TerraformExplorer.Settings;
using TerraformExplorer.Utils;

namespace TerraformExplorer.Services;

public class AwsCredentialsService
{
    private readonly TerraformSettings _terraformSettings;

    public AwsCredentialsService(TerraformSettings terraformSettings)
    {
        _terraformSettings = terraformSettings;
    }

    public IReadOnlyList<AwsProfileResponse> ListProfiles()
    {
        string credentialsPath = GetCredentialsPath();
        return AwsCredentialsFile.ReadProfiles(credentialsPath, _terraformSettings.GetCredentialsEncryptionKey());
    }

    public void SaveProfile(AwsCredentialRequest request)
    {
        string credentialsPath = GetCredentialsPath();
        string configPath = GetConfigPath();
        var encryptionKey = _terraformSettings.GetCredentialsEncryptionKey();
        AwsCredentialsFile.UpdateProfile(credentialsPath, request, encryptionKey);
        AwsConfigFile.UpdateProfile(configPath, request, encryptionKey);
    }

    public bool DeleteProfile(string profileName)
    {
        if (string.IsNullOrWhiteSpace(profileName))
        {
            return false;
        }

        if (profileName.Equals("default", StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        string credentialsPath = GetCredentialsPath();
        string configPath = GetConfigPath();

        var encryptionKey = _terraformSettings.GetCredentialsEncryptionKey();
        bool credSuccess = AwsCredentialsFile.DeleteProfile(credentialsPath, profileName, encryptionKey);
        bool configSuccess = AwsConfigFile.DeleteProfile(configPath, profileName, encryptionKey);

        return credSuccess || configSuccess;
    }

    private string GetCredentialsPath()
    {
        return Path.Combine(_terraformSettings.GetProvidersPath(), "credentials.enc");
    }

    private string GetConfigPath()
    {
        return Path.Combine(_terraformSettings.GetProvidersPath(), "config.enc");
    }
}
