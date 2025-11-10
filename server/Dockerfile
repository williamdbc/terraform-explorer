FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY TerraformExplorer/*.csproj ./
RUN dotnet restore

COPY TerraformExplorer/. .
RUN dotnet publish -c Release -o /app/publish -p:AssemblyName="Application"

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:5000

RUN apt-get update && \
    apt-get install -y wget unzip && \
    rm -rf /var/lib/apt/lists/*

RUN wget https://releases.hashicorp.com/terraform/1.5.7/terraform_1.5.7_linux_amd64.zip -O /tmp/terraform.zip && \
    unzip /tmp/terraform.zip -d /usr/local/bin && \
    rm /tmp/terraform.zip

RUN terraform -version

COPY --from=build /app/publish .

EXPOSE 5000

ENTRYPOINT ["dotnet", "Application.dll"]