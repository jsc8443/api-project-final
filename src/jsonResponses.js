// "pretest": "eslint ./src --fix",      ripped from package.json to prevent "fixing"
const fs = require('fs');
// const { json } = require('stream/consumers');
// const { request } = require('http');

/// load json file -into-> memory
// parse json data -into-> javascript object
const booksJSON = JSON.parse(fs.readFileSync(`${__dirname}/../data/books.json`));
// console.log(Array.isArray(booksJSON));

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

// book params: author, country, language, title, year, genres
const filter = (query) => booksJSON.filter((book) => (!query.author || query.author === book.author)
      && (!query.country || query.country === book.country)
      && (!query.language || query.language === book.language)
      && (!query.title || query.title === book.title)
      && (!query.year || Number(query.year) === book.year)
      && (!query.genres || (book.genres && book.genres.includes(query.genres))));

// returns copy of book object, and index in book array
const findByTitle = (qTitle) => {
  // booksJSON.find((book) => book.title === qTitle);
  const index = booksJSON.findIndex((book) => book.title === qTitle);
  return index !== -1 ? { book: booksJSON[index], index } : null;
};
// checks, sends errors for missing title params
const missingTitleParam = (title) => {
  // undefined --> falsy
  // let responseJSON;// = undefined;?
  if (!title) {
    return {
      responseJSON: { message: 'Title is required.', id: 'missingTitle' },
      statusCode: 400,
    };
  }
  return null;
};
// finds book by title
//   if no book exists, returns error
const findBookOrError = (title, statusCode) => {
  const titlePackage = findByTitle(title);
  // const { book } = titlePackage;
  if (!titlePackage) {
    return {
      responseJSON: { message: 'No book with that title exists.', id: 'bookNotFound' },
      statusCode: 404,
    };
  }
  // return { responseJSON: book, statusCode };
  return { responseJSON: titlePackage, statusCode };
};

// checks, sends errors for missing or non-existent title
// helper method for addBook and setStatus
// possible status code returns: 400 || 404 || given
const checkTitle = (title, status) => missingTitleParam(title) || findBookOrError(title, status);

const getBooks = (request, response) => {
  const filterResults = filter(request.query);
  return jsonRespon(request, response, 200, filterResults);
};
const getRandom = (request, response) => {
  const arrFilterResults = filter(request.query);
  // const FilterResults = JSON.parse(JSON.stringify(arrfilterResults));
  // gets random book from filtered results
  const randomResult = arrFilterResults[Math.floor(Math.random() * (arrFilterResults.length))];
  return jsonRespon(request, response, 200, randomResult);
};
const getBook = (request, response) => {
  const { title } = request.query;
  /* const missingTitle = missingTitleParam(title);
  if (missingTitle) { // missing title param
    return jsonRespon(request, response, missingTitle.statusCode, missingTitle.responseJSON);
  }

  //const responsePackage = checkTitle(title, 200);
  const responsePackage = findBookOrError(title, 200);
  return jsonRespon(request, response, responsePackage.statusCode, responsePackage.responseJSON); */
  const titlePackage = checkTitle(title, 200);
  const responseBook = titlePackage.responseJSON.book;
  // const responsePackage = responseBook ? responseBook : titlePackage.responseJSON;
  const responsePackage = responseBook || titlePackage.responseJSON;
  return jsonRespon(request, response, titlePackage.statusCode, responsePackage);
};
const getTitles = (request, response) => {
  const filterResults = filter(request.query);
  const resultTitles = filterResults.map((book) => book.title);
  return jsonRespon(request, response, 200, resultTitles);
};

// avoid overwriting, perhaps with Array.filter() ?
const addBook = (request, response) => {
  const {
    title, author, genres, language, country, year, pages, link,
  } = request.body;
  // check for missing title param, check if title already exists
  const titleSearch = checkTitle(title, 204); // 204 code: title is valid and exists (update book)
  let finalStatusCode = titleSearch.statusCode;
  let { responseJSON } = titleSearch;
  const tempBook = {
    author,
    country,
    language,
    link,
    pages,
    title,
    year,
    genres,
  };
  if (finalStatusCode === 404) { // book not found -> new book
    finalStatusCode = 201; // correct status code
    responseJSON = { message: 'Created successfully' }; // change response content/message
    // push new book to array
    booksJSON.push(tempBook);
  } else if (finalStatusCode === 204) { // book found -> update book
    // update array with updated book
    booksJSON[responseJSON.index] = tempBook;
    // response content
    responseJSON = tempBook;
  }
  return jsonRespon(request, response, finalStatusCode, responseJSON);
};

const setReadStatus = (request, response) => {
  const { title, readStatus } = request.body;
  const titlePackage = checkTitle(title, 204);
  if (titlePackage.statusCode === 204) { // book found -> update readStatus in database
    const { book } = titlePackage.responseJSON;
    book.status = readStatus;
    booksJSON[titlePackage.responseJSON.index] = book;
    // booksJSON[titlePackage.responseJSON.index].readStatus = readStatus;
  }
  return jsonRespon(request, response, titlePackage.statusCode, titlePackage.responseJSON);
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
