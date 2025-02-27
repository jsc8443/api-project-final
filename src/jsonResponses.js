/// load json file -into-> memory
// parse json data -into-> javascript object
/*
// from https://stackoverflow.com/a/10011078
let obj;
fs.readFile('file','utf8', (err,data) => {
  if (err) throw err;
  obj = JSON.parse(data);
}); */
const fs = require('fs');

const dataJSON = JSON.parse(fs.readFileSync(`${__dirname}/../data/books.json`));

const users = {};

const jsonRespon = (request, response, status, object) => {
  const content = JSON.stringify(object);
  // console.log(content);
  response.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(content, 'utf8'),
  });
  if (request.method !== 'HEAD' && status !== 204) {
    response.write(content);
  }
  response.end();
};
// book params: author, country, language, title, year, genre
const getBooks = (request, response) => {
  const responseJSON = {};
  // loop thru all books, adding queried to response list
  Object.values(dataJSON).forEach((book) => {
    if ((!request.query.author || request.query.author === book.author)
      && (!request.query.country || request.query.country === book.country)
      && (!request.query.language || request.query.language === book.language)
      && (!request.query.title || request.query.title === book.title)
      && (!request.query.year || Number(request.query.year) === book.year)
      && (!request.query.genre || book.genre.includes(request.query.genre))) {
      responseJSON[book.title] = book;
    }
  });
  return jsonRespon(request, response, 200, responseJSON);
};

const readUsers = (request, response) => {
  const responseJSON = {
    users,
  };
  return jsonRespon(request, response, 200, responseJSON);
};

/// new user ----------> 201
/// update age --------> 204
/// missing name/age --> 400
const writeUser = (request, response) => {
  // store user data
  const { name, age } = request.body;
  if (!name || !age) { // check if missing info
    const responseJSON = {
      message: 'Both name and age are required.',
      id: 'writeUserMissingParams',
    };
    return jsonRespon(request, response, 400, responseJSON);
  } if (users[name]) { // update existing user
    const updateUser = {
      name,
      age,
    };
    users[name] = updateUser;
    return jsonRespon(request, response, 204, updateUser);
  } // add new user
  const newUser = { // creating user
    name,
    age,
  };
  users[name] = newUser;
  const responseJSON = { message: 'Created successfully' };
  return jsonRespon(request, response, 201, responseJSON);
};
const notFound = (request, response) => {
  const responseJSON = {
    message: 'The page you are looking for was not found.',
    id: 'notFound',
  };
  return jsonRespon(request, response, 404, responseJSON);
};

module.exports = {
  readUsers,
  writeUser,
  getBooks,
  notFound,
};
