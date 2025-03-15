/*
ENDPOINTS:
4+ GET endpoints
  -support for HEAD requests
  -retrieve different data
    -->get all books matching search
    -->get single book by title
    -->get all book *titles* matching search which excludes title
    -->get random book from search results
  -1+ support query parameters
    -filter/limit results
  -never add/modify/remove data
2+ POST endpoints
  -add/edit data
    -->add/edit book
    -->add/edit status
  -both JSON and urlencoded formats, parse on Content-Type
all endpoints support and default to JSON responses
  -other support is optional, control in Accept header
proper error handling for invalid, bad requests, etc
404 for non-existent endpoint

4+ GET endpoints
  --> get all books matching search
  --> get all titles matching search
  --> get single book by title
  --> get random book from search results
2+ POST endpoints
  --> add/edit book
  --> add/edit status

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
  switch (parsedUrl.pathname) {
    case '/addBook':
      parseBody(request, response, jsonHandler.addBook);
      break;
    case '/setReadStatus':
      parseBody(request, response, jsonHandler.setReadStatus);
      break;
    default:
      jsonHandler.notFound(request, response);
      break;
  }
};
const handleGet = (request, response, parsedUrl) => {
  switch (parsedUrl.pathname) {
    case '/style.css':
      htmlHandler.getStyle(request, response);
      break;
    case '/getBooks':
      jsonHandler.getBooks(request, response);
      break;
    case '/getBook':
      jsonHandler.getBook(request, response);
      break;
    case '/getRandom':
      jsonHandler.getRandom(request, response);
      break;
    case '/getTitles':
      jsonHandler.getTitles(request, response);
      break;
    case '/':
      htmlHandler.getIndex(request, response);
      break;
    case '/docs':
      htmlHandler.getDocs(request, response);
      break;
    default:
      jsonHandler.notFound(request, response);
      break;
  }
};

const onRequest = (request, response) => {
  console.log(request.url);
  // parse url using built-in URL class
  const protocol = request.connection.encrypted ? 'https' : 'http';
  const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);
  request.type = request.headers.accept.split(',');
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
