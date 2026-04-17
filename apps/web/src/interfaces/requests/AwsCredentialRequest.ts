export interface AwsCredentialRequest {
  profileName: string;
  accessKeyId: string;
  secretAccessKey: string;
  region?: string;
}