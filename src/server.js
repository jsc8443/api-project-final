/*
ENDPOINTS:
4+ GET endpoints
  -support for HEAD requests
  -retrieve different data
  -1+ support query parameters
    -filter/limit results
  -never add/modify/remove data
2+ POST endpoints
  -add/edit data
  -both JSON and urlencoded formats, parse on Content-Type
all endpoints support and default JSON responses
  -other support is optional, control in Accept header
proper error handling for invalid, bad requests, etc
404 for non-existent endpoint
*/
const http = require('http');
const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const parseBody = (request, response, handler) => {
  const body = [];

  request.on('error', (err) => {
    console.dir(err);
    response.statusCode = 400;
    response.end();
  });

  request.on('data', (chunk) => {
    body.push(chunk);
  });

  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    request.body = query.parse(bodyString);

    handler(request, response);
  });
};

const handlePost = (request, response, parsedUrl) => {
  if (parsedUrl.pathname === '/addUser') {
    parseBody(request, response, jsonHandler.writeUser);
  }
};
const handleGet = (request, response, parsedUrl) => {
  if (parsedUrl.pathname === '/style.css') {
    htmlHandler.getStyle(request, response);
  } else if (parsedUrl.pathname === '/getUsers') {
    jsonHandler.readUsers(request, response);
  } else if (parsedUrl.pathname === '/getBooks') {
    jsonHandler.getBooks(request, response);
  } else if (parsedUrl.pathname === '/') {
    htmlHandler.getIndex(request, response);
  } else {
    jsonHandler.notFound(request, response);
  }
};

const onRequest = (request, response) => {
  console.log(request.url);
  // parse url using built-in URL class
  const protocol = request.connection.encrypted ? 'https' : 'http';
  const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);
  // forwards(?) search params
  request.query = Object.fromEntries(parsedUrl.searchParams);

  if (request.method === 'POST') {
    handlePost(request, response, parsedUrl);
  } else {
    handleGet(request, response, parsedUrl);
  }
};

http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1:${port}`);
});
