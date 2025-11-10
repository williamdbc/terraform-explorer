using Microsoft.AspNetCore.Builder;
using TerraformExplorer.Configurations;

var builder = WebApplication.CreateBuilder(args);

builder.ConfigureSwagger();
builder.ConfigureMvc();
builder.ConfigureServices();
builder.ConfigureCors();
builder.ConfigureSettings();

builder.InitializeDirectories();

var app = builder.Build();

app.UseCorsConfiguration();
app.ConfigureMiddlewares();

app.Run();
