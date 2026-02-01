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
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AuthService(
        UserRepository userRepository,
        AuthSettings authSettings,
        IHttpContextAccessor httpContextAccessor)
    {
        _userRepository = userRepository;
        _authSettings = authSettings;
        _httpContextAccessor = httpContextAccessor;
    }
    public async Task<HasUserResponse> HasUser()
    {
        var hasUser = await _userRepository.Any();
        return new HasUserResponse { HasUser = hasUser };
    }

    public async Task<RegisterResponse> Register(RegisterRequest request)
    {
        if (await _userRepository.Any())
            throw new InvalidOperationException("O sistema já possui um usuário registrado.");

        var user = new User
        {
            DisplayName = request.DisplayName,
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
                   ?? throw new BusinessException("Usuario ou senha inválidos.");

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new BusinessException("Usuário ou senha inválidos.");
        
        return GenerateLoginResponse(user);
    }

    private LoginResponse GenerateLoginResponse(User user)
    {
        var expires = DateTime.UtcNow.AddMinutes(_authSettings.ExpirationMinutes);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.DisplayName),
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
    
    public async Task<MeResponse> GetCurrentUser()
    {
        var user = _httpContextAccessor.HttpContext?.User;

        if (user == null || !user.Identity?.IsAuthenticated == true)
        {
            throw new UnauthorizedAccessException("Usuário não autenticado.");
        }

        var usernameClaim = user.FindFirst(ClaimTypes.Name)?.Value
                            ?? user.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

        if (string.IsNullOrEmpty(usernameClaim))
        {
            throw new UnauthorizedAccessException("Não foi possível identificar o usuário no token.");
        }

        var dbUser = await _userRepository.GetByUsername(usernameClaim)
                     ?? throw new UnauthorizedAccessException("Usuário não encontrado ou foi removido.");

        return new MeResponse
        {
            Id = dbUser.Id.ToString(),
            Username = dbUser.Username,
            DisplayName = dbUser.Username,
            CreatedAt = dbUser.CreatedAt
        };
    }

}
