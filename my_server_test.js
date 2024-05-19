
const express = require('express');
const app = express();
const port = 8574;

const testMiddleware = (req, res, next) =>{ //test middleware
    req.url = '/book' + req.url;
    next();
  };

  //This is a sanity endpoint used to check that the server is up and running.
  app.get('/books/health', (req, res) => {
    res.status(200).send("OK");
  });

  //Creates a new Book in the system
  //When a new Book is created, it is assigned by the server the next id in turn.
app.post('/book', (req, res) => {

});

//Returns the total number of Books in the system, according to optional filters.
app.get('/books/total', (req, res) => {
  
})
//Returns the content of the books according to the given filters as described by the total endpoint
app.get('/books', (req, res) => {

});

//Gets a single book’s data according to its id
app.get('/book', (req, res) => {

});
//Updates given book’s price
app.put('/book', (req, res) => {
  
})
//Deletes a Book object.
app.delete('/book', (req, res) => {
  
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

