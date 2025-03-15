// "pretest": "eslint ./src --fix",      ripped from package.json to prevent "fixing"
const fs = require('fs');
// const { request } = require('http');

/// load json file -into-> memory
// parse json data -into-> javascript object
const booksJSON = JSON.parse(fs.readFileSync(`${__dirname}/../data/books.json`));

const jsonRespon = (request, response, status, object) => {
  // const content = JSON.stringify(Object.values(object));
  const content = JSON.stringify(object);
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
const filterFilterFilter = (query) => JSON.parse(JSON.stringify(
  Object.values(booksJSON).filter((book) => (!query.author || query.author === book.author)
      && (!query.country || query.country === book.country)
      && (!query.language || query.language === book.language)
      && (!query.title || query.title === book.title)
      && (!query.year || Number(query.year) === book.year)
      && (!query.genre || (book.genres && book.genres.includes(query.genre)))),
));

// ISSUE: client page only displays values, missing keys
//    --------> line 18, stringify in jsonRespon
const findByTitle = (qTitle) => Object.values(booksJSON).find((book) => book.title === qTitle);

// checks, throws errors for missing or non-existent title
// helper method for addBook and setStatus
const checkTitle = (title, status) => {
  let responseJSON = {};
  let statusCode = status;
  if (!title) {
    responseJSON = {
      message: 'Title is required.',
      id: 'missingTitle',
    };
    statusCode = 400;
    // return jsonRespon(request, response, 400, responseJSON);
    // return responseJSON;
  } else {
    const titleSearchResults = findByTitle(title);
    if (!titleSearchResults) { // check if book with that title exists
      responseJSON = {
        message: 'No book with that title exists.',
        id: 'bookNotFound',
      };
      statusCode = 404;
      // return jsonRespon(request, response, 404, responseJSON);
      // return responseJSON;
    } else {
      responseJSON = titleSearchResults;
    }
  }
  // return titleSearchResults;
  const responsePackage = {
    responseJSON,
    statusCode,
  };
  return responsePackage;
};

const getBooks = (request, response) => {
  const filterResults = filterFilterFilter(request.query);
  return jsonRespon(request, response, 200, filterResults);
};
const getRandom = (request, response) => {
  const filterResults = filterFilterFilter(request.query);
  const arrFilterResults = Object.values(filterResults);
  // gets random book from filtered results
  const randomResult = arrFilterResults[Math.floor(Math.random() * (arrFilterResults.length))];
  return jsonRespon(request, response, 200, JSON.parse(JSON.stringify(randomResult)));
};
const getBook = (request, response) => {
  const { title } = request.query;
  const responsePackage = checkTitle(title, 200);
  return jsonRespon(request, response, responsePackage.statusCode, responsePackage.responseJSON);
};
const getTitles = (request, response) => {
  const filterResults = filterFilterFilter(request.query);
  const resultTitles = filterResults.map((book) => book.title);
  return jsonRespon(request, response, 200, resultTitles);
};

// could be refactored with checkTitle helper,
//  but would have to split that into two helpers
const addBook = (request, response) => {
  const {
    title, author, genre, language, country, year,
  } = request.body;
  if (!title) { // check if missing essential info
    const responseJSON = {
      message: 'Title is required.',
      id: 'missingTitle',
    };
    return jsonRespon(request, response, 400, responseJSON);
  }
  const updateBook = findByTitle(title);
  if (updateBook) { // update existing book
    updateBook.genres = genre;
    updateBook.language = language;
    updateBook.country = country;
    updateBook.year = year;
    return jsonRespon(request, response, 204, updateBook);
  }
  const newBook = {
    author,
    country,
    language,
    // ,
    // pages,
    title,
    // parseInt(year),    // year is string, shouldnt be
    year,
    genres: genre,
  };
  booksJSON[title] = newBook;
  const responseJSON = { message: 'Created successfully' };
  return jsonRespon(request, response, 201, responseJSON);
};

const setReadStatus = (request, response) => {
  const { title, readStatus } = request.body;
  const responsePackage = checkTitle(title, 204);
  if (responsePackage.statusCode === 204) {
    responsePackage.responseJSON.readStatus = readStatus;
  }
  return jsonRespon(request, response, responsePackage.statusCode, responsePackage.responseJSON);
};

const notFound = (request, response) => {
  const responseJSON = {
    message: 'The page you are looking for was not found.',
    id: 'notFound',
  };
  return jsonRespon(request, response, 404, responseJSON);
};

module.exports = {
  getBooks,
  getBook,
  getRandom,
  getTitles,
  addBook,
  setReadStatus,
  notFound,
};
