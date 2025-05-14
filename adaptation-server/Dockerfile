FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy project file and restore dependencies
COPY ["AdaptationServer/AdaptationServer.csproj", "AdaptationServer/"]
RUN dotnet restore "AdaptationServer/AdaptationServer.csproj"

# Copy everything else and build
COPY . .
WORKDIR "/src/AdaptationServer"
RUN dotnet build "AdaptationServer.csproj" -c Release -o /app/build

# Publish the application
FROM build AS publish
RUN dotnet publish "AdaptationServer.csproj" -c Release -o /app/publish

# Final stage/image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Set environment variables
ENV ASPNETCORE_URLS=http://+:80
ENV ASPNETCORE_ENVIRONMENT=Production

# Create a non-root user to run the app
RUN adduser --disabled-password --gecos "" appuser && chown -R appuser /app
USER appuser

EXPOSE 80
ENTRYPOINT ["dotnet", "AdaptationServer.dll"] 