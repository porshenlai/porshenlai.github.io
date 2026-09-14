#!/bin/sh

## PROMPT ####################################################################
# can you help me create a python asyncio web server listen on 0.0.0.0:3388. #
# This web server should service static file using HTTP GET. and handle      #
# /__api__/echo POST api,  which read JSON and response the same JSON back.  #
##############################################################################

set -e
PYTHON_VERSION="3.14.0"
ZIP_FILE="python-${PYTHON_VERSION}-embed-amd64.zip"
ZIP_URL="https://www.python.org/ftp/python/${PYTHON_VERSION}/${ZIP_FILE}"
PIP_SCRIPT_URL="https://bootstrap.pypa.io/get-pip.py"
PIP_SCRIPT_FILE="get-pip.py"
MAJOR_MINOR=$(echo $PYTHON_VERSION | cut -d. -f1-2 | sed 's/\.//')

# Create and enter a new folder
mkdir PythonWebServer
cd PythonWebServer

mkdir "pyenv"
cd "pyenv"
curl -L "$ZIP_URL" -o "$ZIP_FILE"
unzip -q "$ZIP_FILE"
sed -i -E 's/^[.# ]*(import site)/\1/' "python${MAJOR_MINOR}._pth"
curl -L "$PIP_SCRIPT_URL" -o "$PIP_SCRIPT_FILE"
./python.exe "$PIP_SCRIPT_FILE"
./python.exe -m pip install aiohttp
rm "$ZIP_FILE"
rm "$PIP_SCRIPT_FILE"
cd ..

mkdir public
cat << HTML > public/index.html
<!DOCTYPE html>
<html>
<head>
    <title>Python Static File</title>
</head>
<body>
    <h1>Hello from a Python/aiohttp static file!</h1>
</body>
</html>
HTML

cat << CODE > server.py
from aiohttp import web
import os

# --- 2. The API Endpoint (POST) ---
# This is the handler for our echo API
async def echo_handler(request):
    try:
        # Get the JSON data from the request body
        data = await request.json()

        # Respond with the exact same JSON data
        return web.json_response(data)
    except Exception as e:
        return web.Response(text=str(e), status=400)

# --- 1. Server Setup ---
app = web.Application()

# Get the absolute path to the directory this script is in
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

# --- 3. Configure Static File Serving (GET) ---
# Serve files from the 'public' directory
static_path = os.path.join(CURRENT_DIR, 'public')
app.router.add_static('/', path=static_path, name='public', show_index=True)
# 'show_index=True' automatically serves 'index.html' for a request to '/'

# --- Add the API route ---
app.router.add_post('/__api__/echo', echo_handler)

# --- Run the server ---
if __name__ == '__main__':
    print("Starting Python aiohttp server on http://0.0.0.0:3388")
    web.run_app(app, host='0.0.0.0', port=3388)
CODE

cat << TEST > test.sh
#!/bin/sh

curl "http://localhost:3388/index.html"

curl -X POST -H "Content-Type: application/json" -d "{\"user\":\"porshenlai\", \"value\": 123}" "http://localhost:3388/__api__/echo"
TEST

pyenv/python.exe server.py
