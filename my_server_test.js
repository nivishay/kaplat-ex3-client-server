const express = require('express');
const app = express();
const request = require('./updateLibrary.js');
const port = 8574;
const bodyParser = require('body-parser');

app.use(
  bodyParser.json({
    type() {
      return true;
    },
  })
);
app.use(bodyParser.urlencoded({ extended: true }));

//LIBRARY SERVER 
//AUTHER: Niv Ishay
const yearRange ={
  from:'year',
  to:'year',
}
let book = {
  Id: 1,
  Title: "The Great Gatsby",
  Author: "F. Scott Fitzgerald",
  "Print-year": '1925',
  Price: '20.99',
  Genre: "Classic Fiction"
};

let library =
{
    books:[],
    totalbooks:0,
    nextid:0,
      addBook: (book) => {
      book.Id = library.nextid++;
      library.books.push(book);
      library.totalbooks++;
    }
  };
  const checkBookErrors = (book) => {
    let yearRange = {from:'1940',to:'2100'}
    if(bookExists(book))
        return "Error: Book with the title " + book.Title + " already exists in the system";
    if(!isPriceValid(book))
        return "Error: Can’t create new Book with negative price";
    if(!isYearInRange(book, yearRange))
      return "Error: Can’t create new Book that its year " +book['Print-year'] + " is not in the accepted range [1940  -> 2100]";
    return "no error";
  }
const bookExists = (book) => {
return library.books.some((existingBook) => {
return existingBook.Title.toLowerCase() === book.Title.toLowerCase();
});
};

const isPriceValid = (book) => {
let price = book.Price;
return price >= 0;
};

const isYearInRange = (book,yearRange) => {
const printYear = book['Print-year'];
return printYear >= yearRange.from &&  printYear <= yearRange.to;
  };
const createBook = (req,res) => {
let result , error;
let book = req.body; 
error = checkBookErrors(book);
if(error === "no error"){
library.addBook(book);
result = book;
}
res.status(200).send({"result":result,"error":error});
};

  //This is a sanity endpoint used to check that the server is up and running.
  app.get('/books/health', (req, res) => {
    res.status(200).send("OK");
  });
  //Creates a new Book in the system

  //When a new Book is created, it is assigned by the server the next id in turn.
app.post('/book', (req, res) => {
  createBook(req,res);
});

const numOfBooksByFilter = (res,req) => {
  let filter = req.query;
  let count = 0;
  library.books.forEach((book) => {
    if(checkFilter(book,filter))
      count++;
  });
  return count;
};

const checkFilter = (book, filter) => {//TODO: Make it more clean
  const filterNotPassed = undefined;
  let meetRequirement = true;
  if(filter.Author!==filterNotPassed&&book.Author!==filter.Author)
    meetRequirement = false;
  if(filter.Genre!==filterNotPassed&&filter.Genre.includes(book.Genre.toUpperCase())===false)
    meetRequirement = false;
  if(filter["year-bigger-than"]!==filterNotPassed&&book["Print-year"]<=filter["year-bigger-than"])
    meetRequirement = false;
  if(filter["year-smaller-than"]!==filterNotPassed&&book["Print-year"]>=filter["year-smaller-than"])
    meetRequirement = false;
  if(filter["price-bigger-than"]!==filterNotPassed&&book.Price>=filter["price-bigger-than"])
    meetRequirement = false;
  if(filter["price-smaller-than"]!==filterNotPassed&&book.Price<=filter["price-smaller-than"])
    meetRequirement = false;
  return meetRequirement;
};
const isAllCaps = (str) => {
  return str.toUpperCase() === str;
};
const isAllGeneresAC = (Genres) => { //AC = all caps
  let meetRequirement = true;
  for (const Genere of Genres) 
      if (!isAllCaps(Genere))
        meetRequirement = false;
  return meetRequirement;
  };
//Returns the total number of Books in the system, according to optional filters.
app.get('/books/total', (req, res) => {
  if(!isAllGeneresAC(req.query.Genre))
    res.status(400).send("Error: Genre must be all caps");
  let total = numOfBooksByFilter(res,req);
  res.status(200).send({"result":total});
})

const getBooksByFilter = (res,req) => {
  let filter = req.query;
  let result = [];
  library.books.sort((a,b) => a.Title.localeCompare(b.Title));//TODO: Make it more efficient (O(n) instead of O(n^2))
  library.books.forEach((book) => {
    if(checkFilter(book,filter))
      result.push(book);
  });
  return result;
}
//Returns the content of the books according to the given filters as described by the total endpoint
app.get('/books', (req, res) => {
  let books = getBooksByFilter(res,req);
  res.status(200).send({"result":books});
});

const getBookById = (res,req) => {
  let Id = req.query.Id;
  let book = library.books.find((book) => book.Id == Id);
  return book;
}

//Gets a single book’s data according to its id
app.get('/book', (req, res) => {
  let book = getBookById(res,req);
  if(book == undefined)
    res.status(404).send({"error":"Error: no such Book with id " + req.query.Id});
  else
    res.status(200).send({"result":book});
});
//Updates given book’s price
app.put('/book', (req, res) => {
 updateBookPrice(res,req);
});
//Deletes a Book object.
app.delete('/book', (req, res) => {
  deleteBookById(res,req);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

