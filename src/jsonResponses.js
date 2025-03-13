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
// const { request } = require('http');

const booksJSON = JSON.parse(fs.readFileSync(`${__dirname}/../data/books.json`));

const users = {};

const jsonRespon = (request, response, status, object) => {
  const content = JSON.stringify(Object.values(object));
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
const findByTitle = (query) => JSON.parse(JSON.stringify(
  Object.values(booksJSON).find((book) => query.title === book.title),
));

const filterIncludes = (query, book) => {
  if ((!query.author || query.author === book.author)
    && (!query.country || query.country === book.country)
    && (!query.language || query.language === book.language)
    && (!query.title || query.title === book.title)
    && (!query.year || Number(query.year) === book.year)
    && (!query.genre || (book.genres && book.genres.includes(query.genre)))) {
    return true;
  }
  return false;
};
// pass whether book passes filter into callback function, return
/* const filterThrough = (query, callback) => {
  Object.values(booksJSON).forEach((book) => {
    if ((!query.author || query.author === book.author)
      && (!query.country || query.country === book.country)
      && (!query.language || query.language === book.language)
      && (!query.title || query.title === book.title)
      && (!query.year || Number(query.year) === book.year)
      && (!query.genre || (book.genres && book.genres.includes(query.genre)))) {
      return callback(true);
    }
    return callback(false);
  });
}; */

// book params: author, country, language, title, year, genre
const getBooks = (request, response) => {
  // const responseJSON = {};

  // Array.filter
  // const filterResults = Object.values(booksJSON).filter(filterIncludes())
  const filterResults = filterFilterFilter(request.query);
  // console.log(filterResults);

  // Array.filter ?? idfk come back to this

  // filter, callback
  /* filterThrough(request.query, passes => {
    if (passes) {
      responseJSON[book.title] = book;
    }
  }); */

  // loop thru all books, adding queried to response list
  /* Object.values(booksJSON).forEach((book) => {
    if (filterIncludes(request.query, book)) {
      responseJSON[book.title] = book;
    }
  }); */
  // return jsonRespon(request, response, 200, responseJSON);
  return jsonRespon(request, response, 200, filterResults);
};
const getBook = (request, response) => {
  /* const responseJSON = {};
  // loop thru all books, adding queried to response list
  // array iteration: every instead of forEach
  // Object.values(booksJSON).forEach((book) => {
  Object.values(booksJSON).every((book) => {
    if (filterIncludes(request.query, book)) {
      responseJSON[book.title] = book;
      return false;
      // return jsonRespon(request, response, 200, book);
    }
    return true;
  });
  return jsonRespon(request, response, 200, responseJSON); */
  const titleSearchResults = findByTitle(request.query);
  return jsonRespon(request, response, 200, titleSearchResults);
};
const getTitles = (request, response) => {
  const responseJSON = {};
  // loop thru all books, adding queried to response list
  Object.values(booksJSON).forEach((book) => {
    if (filterIncludes(request.query, book)) {
      responseJSON[book.title] = book.title;
    }
  });
  return jsonRespon(request, response, 200, responseJSON);
};
const getTitle = (request, response) => {
  const responseJSON = {};
  // loop thru all books, adding queried to response list
  Object.values(booksJSON).every((book) => {
    if (filterIncludes(request.query, book)) {
      responseJSON[book.title] = book.title;
      return false;
      // return jsonRespon(request, response, 200, book.title);
    }
    return true;
  });
  return jsonRespon(request, response, 200, responseJSON);
};

const addBook = (request, response) => {
  const {
    title, author, genre, language, country, year,
  } = request.body;
  // const yearNum = (Number) year;
  if (!title || !author) { // check if missing essential info
    const responseJSON = {
      message: 'Both title and author are required.',
      id: 'addBookMissingParams',
    };
    return jsonRespon(request, response, 400, responseJSON);
  } if (booksJSON[title]) { // update existing book
    const updateBook = booksJSON[title];
    // updateBook.title = title;
    // updateBook.author = author;
    updateBook.genres = genre;
    updateBook.language = language;
    updateBook.country = country;
    updateBook.year = year;
    booksJSON.title = updateBook;
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

const setStatus = (request, response) => {
  // console.log(request.body);
  const { title, status } = request.body;
  if (!title || !status) { // check if missing essential info
    const responseJSON = {
      message: 'Both title and author are required.',
      id: 'addBookMissingParams',
    };
    return jsonRespon(request, response, 400, responseJSON);
  }
  // const updateBook = booksJSON[title];
  // console.log(booksJSON[title]);
  // if (!updateBook) { // check if book with that title exists
  // if (!booksJSON[title]) { // check if book with that title exists
  if (/* filterIncludes */false) { // check if book with that title exists
    const responseJSON = {
      message: 'No book with that title exists',
      id: 'bookNotFound',
    };
    return jsonRespon(request, response, 404, responseJSON);
  }
  // const updateBook = booksJSON[title];
  // updateBook[status] = status;
  // booksJSON[title] = updateBook;
  booksJSON[title].status = status;
  const updateBook = booksJSON[title];
  return jsonRespon(request, response, 204, updateBook);
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
  getBook,
  getTitles,
  getTitle,
  addBook,
  setStatus,
  notFound,
};
