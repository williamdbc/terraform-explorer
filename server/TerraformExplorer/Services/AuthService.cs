using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using TerraformExplorer.Entities;
using TerraformExplorer.Exceptions;
using TerraformExplorer.Models;
using TerraformExplorer.Models.Requests;
using TerraformExplorer.Models.Responses;
using TerraformExplorer.Repositories;
using TerraformExplorer.Settings;

public class AuthService
{
    private readonly UserRepository _userRepository;
    private readonly AuthSettings _authSettings;

    public AuthService(
        UserRepository userRepository, 
        AuthSettings authSettings)
    {
        _userRepository = userRepository;
        _authSettings = authSettings;
    }

    public async Task<HasUserResponse> HasUser()
    {
        var hasUser = await _userRepository.Any();
        return new HasUserResponse { HasUser = hasUser };
    }

    public async Task<RegisterResponse> Register(RegisterRequest request)
    {
        if (await _userRepository.Any())
            throw new InvalidOperationException("User already exists.");

        var user = new User
        {
            Username = request.Username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            CreatedAt = DateTime.UtcNow
        };

        await _userRepository.Create(user);

        return new RegisterResponse
        {
            Username = user.Username,
            CreatedAt = user.CreatedAt
        };
    }
    
    public async Task<LoginResponse> Login(LoginRequest request)
    {
        var user = await _userRepository.GetByUsername(request.Username)
                   ?? throw new BusinessException("User not found.");

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new BusinessException("Invalid credentials.");
        
        return GenerateLoginResponse(user);
    }

    private LoginResponse GenerateLoginResponse(User user)
    {
        var expires = DateTime.UtcNow.AddMinutes(_authSettings.ExpirationMinutes);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Username),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Role, "Admin")
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_authSettings.SecretKey)
        );

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _authSettings.Issuer,
            audience: _authSettings.Audience,
            claims: claims,
            expires: expires,
            signingCredentials: creds
        );

        return new LoginResponse
        {
            AccessToken = new JwtSecurityTokenHandler().WriteToken(token),
            ExpiresIn = (int)(expires - DateTime.UtcNow).TotalSeconds
        };
    }

}
