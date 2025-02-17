const users = {};

const jsonRespon = (request, response, status, object) => {
  const content = JSON.stringify(object);
  response.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(content, 'utf8'),
  });
  if (request.method !== 'HEAD') {
    response.write(content);
  }
  response.end();
};

const getUsers = (request, response) => {
  const responseJSON = {
    users,
  };
  return jsonRespon(request, response, 200, responseJSON);
};
const addUser = (request, response) => {
  const CONTENTPLACEHOLDER = {
    message: 'holding space',
    id: 'noID',
  };
  return jsonRespon(request, response, 200, CONTENTPLACEHOLDER);
};
const notFound = (request, response) => {
  const responseJSON = {
    message: 'The page you are looking for was not found.',
    id: 'notFound',
  };
  return jsonRespon(request, response, 404, responseJSON);
};

module.exports = {
  getUsers,
  addUser,
  notFound,
};
