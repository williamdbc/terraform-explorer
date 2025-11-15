using Amazon;
using Amazon.Runtime;
using Amazon.Runtime.CredentialManagement;
using Amazon.S3;
using Amazon.S3.Model;
using Amazon.SecurityToken;
using Amazon.SecurityToken.Model;

namespace TerraformExplorer.Services;

public class AwsS3Service
{
    private readonly IAmazonS3 _client;
  
    public AwsS3Service(string profileName, string credentialsFilePath, string? roleArn = null, string region = "us-east-1")
    {
        var chain = new CredentialProfileStoreChain(credentialsFilePath);
        if (!chain.TryGetProfile(profileName, out var profile))
            throw new InvalidOperationException($"AWS profile '{profileName}' not found in {credentialsFilePath}");

        var baseCredentials = profile.GetAWSCredentials(null);
        var stsClient = new AmazonSecurityTokenServiceClient(baseCredentials, RegionEndpoint.GetBySystemName(region));

        if (!string.IsNullOrWhiteSpace(roleArn))
        {
            var assumeRoleResponse = stsClient.AssumeRoleAsync(new AssumeRoleRequest
            {
                RoleArn = roleArn,
                RoleSessionName = "TerraformExplorer-" + Guid.NewGuid().ToString("N")[..8]
            }).GetAwaiter().GetResult();

            var assumedCredentials = assumeRoleResponse.Credentials;
            var sessionCredentials = new SessionAWSCredentials(
                assumedCredentials.AccessKeyId,
                assumedCredentials.SecretAccessKey,
                assumedCredentials.SessionToken
            );

            _client = new AmazonS3Client(sessionCredentials, RegionEndpoint.GetBySystemName(region));
        }
        else
        {
            _client = new AmazonS3Client(baseCredentials, RegionEndpoint.GetBySystemName(region));
        }
    }

    public async Task EnsureBucketExistsAsync(string bucketName)
    {
        if (string.IsNullOrWhiteSpace(bucketName))
            throw new ArgumentException("Bucket name required.");

        if (!IsValidBucketName(bucketName))
            throw new ArgumentException($"Invalid bucket name: {bucketName}");

        try
        {
            await _client.PutBucketAsync(new PutBucketRequest
            {
                BucketName = bucketName,
                BucketRegion = _client.Config.RegionEndpoint.SystemName
            });
        }
        catch (AmazonS3Exception ex) when (ex.ErrorCode == "BucketAlreadyOwnedByYou") { }
        catch (AmazonS3Exception ex)
        {
            throw new InvalidOperationException($"Failed to create bucket '{bucketName}': {ex.Message}", ex);
        }
    }

    private static bool IsValidBucketName(string name)
    {
        return name.Length >= 3 && name.Length <= 63 &&
               System.Text.RegularExpressions.Regex.IsMatch(name, @"^[a-z0-9][a-z0-9\-.]*[a-z0-9]$") &&
               !name.Contains("..") && !name.StartsWith("-") && !name.EndsWith("-");
    }
}