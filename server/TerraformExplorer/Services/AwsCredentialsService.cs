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
        return AwsCredentialsFile.ReadProfiles(credentialsPath);
    }

    public void SaveProfile(AwsCredentialRequest request)
    {
        string credentialsPath = GetCredentialsPath();
        string configPath = GetConfigPath();
        AwsCredentialsFile.UpdateProfile(credentialsPath, request);
        AwsConfigFile.UpdateProfile(configPath, request);
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

        bool credSuccess = AwsCredentialsFile.DeleteProfile(credentialsPath, profileName);
        bool configSuccess = AwsConfigFile.DeleteProfile(configPath, profileName);

        return credSuccess || configSuccess;
    }

    private string GetCredentialsPath()
    {
        return Path.Combine(_terraformSettings.GetProvidersPath(), "credentials");
    }

    private string GetConfigPath()
    {
        return Path.Combine(_terraformSettings.GetProvidersPath(), "config");
    }
}