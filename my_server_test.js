
const express = require('express');
const app = express();
const port = 3000;

const testMiddleware = (req, res, next) =>{ //test middleware
    req.url = '/test' + req.url;
    next();
  };

app.get('/test_get_method',testMiddleware, (req, res) => {
    //Accessing query parameters
    const id = req.query.id;
    const year = req.query.year;

    //Sending a response with the query parameters
    res.send(`Hello, ${id}! You are ${year} years old.`);
  });
  app.post('/test_post_method', (req, res) => {
    const data = req.body;
    console.log(data);
    res.status(200).json({ message: 'Data updated successfully' });
  });

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
