using TerraformExplorer.Configurations;

var builder = WebApplication.CreateBuilder(args);

builder.ConfigureSwagger();
builder.ConfigureMvc();
builder.ConfigureServices();
builder.ConfigureCors();
builder.ConfigureSettings();
builder.ConfigureDatabase();
builder.ConfigureAuth();

builder.InitializeDirectories();

var app = builder.Build();

app.UseCorsConfiguration();
app.ConfigureMiddlewares();
app.InitializeDatabase();

app.Run();
