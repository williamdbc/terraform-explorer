using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using TerraformExplorer.Settings;

namespace TerraformExplorer.Configurations;

public static class AuthConfig
{
    public static void ConfigureAuth(this WebApplicationBuilder builder)
    {
        var authSettings = builder.Services
            .BuildServiceProvider()
            .GetRequiredService<AuthSettings>();

        var key = Encoding.UTF8.GetBytes(authSettings.SecretKey);

        builder.Services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,

                    ValidIssuer = authSettings.Issuer,
                    ValidAudience = authSettings.Audience,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ClockSkew = TimeSpan.Zero
                };
            });

        builder.Services.AddAuthorization();
    }
}