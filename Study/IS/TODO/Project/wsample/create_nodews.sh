#!/bin/sh

## PROMPT #######################################################################
# can you help me create a nodejs web server listen on 0.0.0.0:3388. This web   #
# server should service static file using HTTP GET. and handle /__api__/echo    #
# POST api,  which read JSON and response the same JSON back.                   #
#################################################################################

# Create and enter a new folder
mkdir NodeWebServer
cd NodeWebServer

npm='/c/Apps/Node/npm'
node='/c/Apps/Node/node.exe'

# Initialize a new Node.js project (creates package.json)
$npm init -y

# Install Express
$npm install express

mkdir public
cat << HTML > public/index.html
<!DOCTYPE html>
<html>
<head>
    <title>Node.js Static File</title>
</head>
<body>
    <h1>Hello from a Node.js/Express static file!</h1>
</body>
</html>
HTML

cat << CODE > index.js
const express = require('express');
const path = require('path');

const app = express();
const PORT = 3388;
const HOST = '0.0.0.0';

// --- 1. Configure JSON Parsing (for the POST API) ---
// This middleware parses incoming 'application/json' requests
// and puts the JSON data on req.body
app.use(express.json());

// --- 2. Configure Static File Serving (HTTP GET) ---
// This serves files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// --- 3. Configure the API Endpoint (HTTP POST) ---
app.post('/__api__/echo', (req, res) => {
    // Thanks to 'express.json()', req.body already contains the parsed JSON
    const jsonData = req.body;

    // Respond by sending the exact same JSON back
    res.json(jsonData);
});

// --- Start the server ---
app.listen(PORT, HOST, () => {
    console.log(`Node.js server running on http://${HOST}:${PORT}`);
    console.log(`Serving static files from 'public' folder`);
});
CODE

cat << TEST > test.sh
#!/bin/sh

curl "http://localhost:3388/index.html"

curl -X POST -H "Content-Type: application/json" -d "{\"user\":\"porshenlai\", \"value\": 123}" "http://localhost:3388/__api__/echo"
TEST

$node index.js
