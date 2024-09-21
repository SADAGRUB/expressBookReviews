const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check if a user with the given username already exists
const isValid = (username) => {
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

// Check if the user with the given username and password exists
const authenticatedUser = (username, password) => {
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}
//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 });//modified for 60s

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  // Extract ISBN from request URL
  const isbn = req.params.isbn;
  let book = books[isbn];  // Retrieve book object associated with ISBN

  if (book) {  // Check if book exists
    let review = req.body.review;  // Get review from request body

    if (review) {
      // Initialize reviews array if it doesn't exist
      if (!book.reviews) {
        book.reviews = [];
      }

      // Add new review to the book's reviews
      book.reviews.push(review);

      // Update book details in 'books' object
      books[isbn] = book;

      res.status(200).json({ message: `Review for book with ISBN ${isbn} added.` });
    } else {
      res.status(400).json({ message: "Review content is required." });
    }
  } else {
    // Respond if book with specified ISBN is not found
    res.status(404).json({ message: "Book not found!" });
  }
});


regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const username = req.session.username; // Assuming the username is stored in the session

    // Find the review by ISBN and username
    Review.findOneAndDelete({ isbn: isbn, username: username }, (err, review) => {
        if (err) {
            return res.status(500).send("Error deleting review");
        }
        if (!review) {
            return res.status(404).send("Review not found or you do not have permission to delete this review");
        }
        res.status(200).send("Review deleted successfully");
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
