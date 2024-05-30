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
  id: '1',
  title: "The Great Gatsby",
  author: "F. Scott Fitzgerald",
  year: '1925',
  price: '20.99',
  genres: []
};

let library =
{
    books:[],
    totalbooks:0,
    nextid:1,
      addBook: (book) => {
      book.id = library.nextid++;
      library.books.push(book);
      library.totalbooks++;
    },
      deleteBook: (book) => {
      library.books = library.books.filter(element => element !== book);
      library.totalbooks--;
      }
  };
  const checkBookErrors = (book) => {
    let yearRange = {from:'1940',to:'2100'}
    if(bookExists(book))
        return "Error: Book with the title " + book.title + " already exists in the system";
    if(!isPriceValid(book))
        return "Error: Can’t create new Book with negative price";
    if(!isYearInRange(book, yearRange))
      return "Error: Can’t create new Book that its year " +book.year + " is not in the accepted range [1940  -> 2100]";
    return "no error";
  }
const bookExists = (book) => {
return library.books.some((existingBook) => {
return existingBook.title.toLowerCase() === book.title.toLowerCase();
});
};

const isPriceValid = (book) => {
let price = book.price;
return price >= 0;
};

const isYearInRange = (book,yearRange) => {
const printYear = book.year;
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

//When a new Book is created, it is assigned by the server the next id in turn.
app.post('/book', (req, res) => {
  createBook(req,res);
});
//Returns the total number of Books in the system, according to optional filters.
const numOfBooksByFilter = (res,req) => {
  let filter = req.query;
  let count = 0;
  library.books.forEach((book) => {
    if(checkFilter(book,filter))
      count++;
  });
  return count;
};
//Returns the content of the books according to the given filters 
const checkFilter = (book, filter) => {//TODO: Make it more clean
  const filterNotPassed = undefined;
  if(filter.genres === filterNotPassed)
    meetsgenre = true
  else
  {
    const filterGenres = Array.isArray(filter.genres)
    ? filter.genres
    : filter.genres.split(","); // split genres string into an array
    const bookGenres = book.genres.map(genres => genres.toUpperCase()); // convert all genres to uppercase
    meetsgenre = filterGenres.some(genres => bookGenres.includes(genres)); // check if any genre matches
    }
  const meetsAuthor = filter.author === filterNotPassed || book.author === filter.author;
  const meetsYearBiggerThan = filter["year-bigger-than"] === filterNotPassed || book.year > filter["year-bigger-than"];
  const meetsYearSmallerThan = filter["year-smaller-than"] === filterNotPassed || book.year < filter["year-smaller-than"];
  const meetsPriceBiggerThan = filter["price-bigger-than"] === filterNotPassed || book.price > filter["price-bigger-than"];
  const meetsPriceSmallerThan = filter["price-smaller-than"] === filterNotPassed || book.price < filter["price-smaller-than"];
  let meetsRequirement = meetsAuthor && meetsgenre && meetsYearBiggerThan && meetsYearSmallerThan && meetsPriceBiggerThan && meetsPriceSmallerThan;

  return meetsRequirement;
};

const isAllCaps = (str) => {
  return str.toUpperCase() === str;
};
const isAllGeneresAC = (genres) => { //AC = all caps
  let meetRequirement = true;
  const filterGenres = Array.isArray(genres)
  ? genres
  : genres.split(","); // split genres string into an array
  for (const Genere of filterGenres) 
      if (!isAllCaps(Genere))
        meetRequirement = false;
  return meetRequirement;
  };

//Returns the total number of Books in the system, according to optional filters.
app.get('/books/total', (req, res) => {
  if(req.query.genres!== undefined && !isAllGeneresAC(req.query.genres))
      res.status(400).send("Error: Genre must be all caps");
  let total = numOfBooksByFilter(res,req);
  res.status(200).send({"result":total});
})

const getBooksByFilter = (res,req) => {
  let filter = req.query;
  let result = [];
  library.books.sort((a,b) => a.title.localeCompare(b.title));//TODO: Make it more efficient (O(n) instead of O(n^2))
  library.books.forEach((book) => {
    if(checkFilter(book,filter))
      result.push(book);
  });
  return result;
}
//Returns the content of the books according to the given filters as described by the total endpoint
app.get('/books', (req, res) => {
  if(req.query.genres!== undefined && !isAllGeneresAC(req.query.genres))
    res.status(400).send("Error: Genre must be all caps");
  let books = getBooksByFilter(res,req);
  res.status(200).send({"result":books});
});

//Gets a single book’s data according to its id
const getBookById = (req,res) => {
  let id = req.query.id;
  let book = library.books.find((book) => book.id == id);
  return book;
}

//Gets a single book’s data according to its id
app.get('/book', (req, res) => {
  let book = getBookById(req,res);
  if(book == undefined)
    res.status(404).send({"error":"Error: no such Book with id " + req.query.id});
  else
    res.status(200).send({"result":book});
});
//Updates given book’s price
app.put('/book', (req, res) => {
  let book = getBookById(req,res);
  let oldPrice;
  if(book == undefined)
    res.status(404).send({"error":"Error: no such Book with id " + req.query.id});
  else if(!isPriceValid(book))
    res.status(409).send({"error":"Error: price update for book " + req.query.id + " must be a positive integer"});
  else
    oldPrice = book.price;
    book.price = req.query.price;
  res.status(200).send({"result":oldPrice});
});

//Deletes a Book object.
app.delete('/book', (req, res) => {
  let book = getBookById(req,res);
  if(book==undefined)
    res.status(404).send({"error":"Error: no such Book with id " + req.query.id});
  else
  {
    library.deleteBook(book);
    res.status(200).send({"result":book});
  }
    
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
