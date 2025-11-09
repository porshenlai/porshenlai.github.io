#!/bin/sh

## PROMPT ########################################################################
# can you help me create a c# web server listen on 0.0.0.0:3388. This web server #
# should service static file using HTTP GET. and handle /__api__/echo POST api,	 #
# which read JSON and response the same JSON back.															 #
##################################################################################

# Creates a new folder "MyWebServer"
dotnet new web -n DotNetWebServer

# Go into the new folder
cd DotNetWebServer

mkdir wwwroot
cat << HTML > wwwroot/index.html
<!DOCTYPE html>
<html>
<head>
    <title>Static File Test</title>
</head>
<body>
    <h1>Hello from a static HTML file!</h1>
</body>
</html>
HTML

cat << CODE > Program.cs
using System.IO;
using System.Text;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);

// --- Tell the server to listen on 0.0.0.0:3388 ---
builder.WebHost.UseUrls("http://0.0.0.0:3388");

var app = builder.Build();

// --- 1. Configure Static File Serving (HTTP GET) ---
// This serves files from the 'wwwroot' folder
app.UseStaticFiles();

// --- 2. Configure the API Endpoint (HTTP POST) ---
app.MapPost("/__api__/echo", async (HttpRequest request) =>
{
    string jsonBody;
    
    // Read the raw request body as a string
    using (var reader = new StreamReader(request.Body, Encoding.UTF8))
    {
        jsonBody = await reader.ReadToEndAsync();
    }

    // Return the exact same JSON string
    // We use Results.Content to send the raw string
    // and set the content type to application/json
    return Results.Content(jsonBody, "application/json");
});

// Optional: Add a simple root page
app.MapGet("/", () => "Web server is running. Try GET /index.html or POST to /__api__/echo");

// Start the server
System.Console.WriteLine("Starting web server on http://0.0.0.0:3388");
app.Run();
CODE

cat << TEST > test.sh
#!/bin/sh

curl "http://localhost:3388/index.html"

curl -X POST -H "Content-Type: application/json" -d "{\"user\":\"porshenlai\", \"value\": 123}" "http://localhost:3388/__api__/echo"
TEST

dotnet.exe run
