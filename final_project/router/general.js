const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    // List of users
    let users = [];

    // Check if a user with the given username already exists
    const doesExist = (username) => {
        let usersWithSameName = users.filter((user) => {
            return user.username === username;
        });
        return usersWithSameName.length > 0;
    };

    // Check if the user with the given username and password exists
    const authenticatedUser = (username, password) => {
        let validUsers = users.filter((user) => {
            return user.username === username && user.password === password;
        });
        return validUsers.length > 0;
    };

    // Retrieve the username and password from the request body
    const { username, password } = req.body;

    // Check if the username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if the username already exists
    if (doesExist(username)) {
        return res.status(400).json({ message: "Username already exists" });
    }

    // Register the new user
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    //Written
    res.status(200).send(JSON.stringify({
      message: "Here is the book list available in the shop",
      books: books
    }, null, 4));
  });
  

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Written
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    res.status(200).json(book);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    const bookKeys = Object.keys(books);
    const filteredBooks = [];

    bookKeys.forEach(key => {
        if (books[key].author === author) {
            filteredBooks.push(books[key]);
        }
    });

    if (filteredBooks.length > 0) {
        res.status(200).json(filteredBooks);
    } else {
        res.status(404).json({ message: "No books found for this author" });
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Written
  const title = req.params.title;
  const bookKeys = Object.keys(books);
    const filteredBooks = []; 
    bookKeys.forEach(key => {
        if (books[key].title === title) {
            filteredBooks.push(books[key]);
        }
    });

    if (filteredBooks.length > 0) {
        res.status(200).json(filteredBooks);
    } else {
        res.status(404).json({ message: "No books found for this title" });
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Written
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    if (book.reviews) {
      res.status(200).json(book.reviews);
    } else {
      res.status(200).json({ message: "No reviews available for this book" });
    }
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
