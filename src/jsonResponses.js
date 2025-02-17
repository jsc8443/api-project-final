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

/// new user ----------> 201
/// update age --------> 204
/// missing name/age --> 400
const addUser = (request, response) => {
  // store user data
  const { name, age } = request.body;
  if (!name|| !age) {  // missing info?
    const responseJSON = {
      message: 'Both name and age are required.',
      id: 'addUserMissingParams',
    };
    return jsonRespon(request, response, 400, responseJSON);
  }
  if (users[name]) {      // existing user / updating age?
    // update existing user
    const updateUser = {
      name,
      age,
    };
    users[name] = updateUser;
    return jsonRespon(request, response, 204, {});
  }

  // add new user
  const newUser = {       // creating user
    name,
    age,
  };
  users[newUser.name] = newUser;
  return jsonRespon(request, response, 201, newUser);
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
