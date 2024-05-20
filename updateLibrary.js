
const createBook = (req,res) => {
let result , error;
res.send({"result":result,"error":error});

};
const numOfBooksByFilter = (req,res) => {
let result , error;


res.send({"result":result,"error":error});
}

const getBooksByFilter = (req,res) => {
let result , error;

res.send([{"result":result,"error":error}]); //TODO : return books as json

}

const getBookById = (req,res) => {
let result , error;

res.send({"result":result,"error":error}); //TODO : return book as json
}

const deleteBookById = (req,res) => {
    let result , error;
    res.send({"result":result,"error":error}); 
}
const updateBookPrice = (req,res) => {
    let result , error;
    res.send({"result":result,"error":error});
}
module.exports = {createBook,numOfBooksByFilter,getBooksByFilter,getBookById,deleteBookById,updateBookPrice};