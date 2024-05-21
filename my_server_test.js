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
    if(bookExists(book))
        return "Error: Book with the title " + book.Title + " already exists in the system";
    if(!isPriceValid(book))
        return "Error: Can’t create new Book that its year " +book['Print-year'] + " is not in the accepted range [1940  -> 2100]";
    if(!isYearInRange(book))
        return "Error: Can’t create new Book with negative price";
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

const isYearInRange = (book) => {
const printYear = book['Print-year'];
return printYear >= 1940 && printYear <= 2100;
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

//Returns the total number of Books in the system, according to optional filters.
app.get('/books/total', (req, res) => {
  request.numOfBooksByFilter(res,req);
})

//Returns the content of the books according to the given filters as described by the total endpoint
app.get('/books', (req, res) => {
  request.getBooksByFilter(res,req);
});

//Gets a single book’s data according to its id
app.get('/book', (req, res) => {
  request.getBookById(res,req);
});
//Updates given book’s price
app.put('/book', (req, res) => {
 request.updateBookPrice(res,req);
})
//Deletes a Book object.
app.delete('/book', (req, res) => {
  request.deleteBookById(res,req);
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

