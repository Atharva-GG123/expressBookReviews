
const express = require('express');
const axios = require('axios');

const books = require('./booksdb.js');
const isValid = require('./auth_users.js').isValid;
const users = require('./auth_users.js').users;

const public_users = express.Router();

// Axios retrieves book data from this internal endpoint.
const BOOKS_API_URL =
  process.env.BOOKS_API_URL || 'http://127.0.0.1:5000/internal/books';

async function fetchBooks() {
  const response = await axios.get(BOOKS_API_URL, {
    timeout: 5000
  });

  if (!response.data || typeof response.data !== 'object') {
    throw new Error('Invalid book data received from the API');
  }

  return response.data;
}

// Internal data endpoint: supplies the local book database to Axios.
public_users.get('/internal/books', (req, res) => {
  return res.status(200).json(books);
});

// Register a new user (implement separately for the registration task).
public_users.post('/register', (req, res) => {
  return res.status(501).json({
    message: 'Registration not implemented yet'
  });
});

// Task 1: Retrieve all available books using Axios.
public_users.get('/', async (req, res) => {
  try {
    const allBooks = await fetchBooks();
    return res.status(200).json(allBooks);
  } catch (error) {
    console.error('Error retrieving books:', error.message);
    return res.status(502).json({
      message: 'Unable to retrieve books'
    });
  }
});

// Task 2: Retrieve a book by ISBN.
public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const allBooks = await fetchBooks();
    const requestedISBN = String(req.params.isbn).trim();

    const match = Object.entries(allBooks).find(([id, book]) => {
      return (
        String(book.isbn || '').toLowerCase() === requestedISBN.toLowerCase() ||
        String(id) === requestedISBN
      );
    });

    if (!match) {
      return res.status(404).json({
        message: 'Book not found for the supplied ISBN'
      });
    }

    return res.status(200).json(match[1]);
  } catch (error) {
    console.error('Error retrieving book by ISBN:', error.message);
    return res.status(502).json({
      message: 'Unable to retrieve book by ISBN'
    });
  }
});

// Task 3: Retrieve books by author.
public_users.get('/author/:author', async (req, res) => {
  try {
    const allBooks = await fetchBooks();
    const requestedAuthor = decodeURIComponent(req.params.author)
      .trim()
      .toLowerCase();

    const matchingBooks = Object.fromEntries(
      Object.entries(allBooks).filter(([, book]) =>
        String(book.author || '').toLowerCase().includes(requestedAuthor)
      )
    );

    if (Object.keys(matchingBooks).length === 0) {
      return res.status(404).json({
        message: 'No books found for the supplied author'
      });
    }

    return res.status(200).json(matchingBooks);
  } catch (error) {
    console.error('Error retrieving books by author:', error.message);
    return res.status(502).json({
      message: 'Unable to retrieve books by author'
    });
  }
});

// Task 4: Retrieve books by title.
public_users.get('/title/:title', async (req, res) => {
  try {
    const allBooks = await fetchBooks();
    const requestedTitle = decodeURIComponent(req.params.title)
      .trim()
      .toLowerCase();

    const matchingBooks = Object.fromEntries(
      Object.entries(allBooks).filter(([, book]) =>
        String(book.title || '').toLowerCase().includes(requestedTitle)
      )
    );

    if (Object.keys(matchingBooks).length === 0) {
      return res.status(404).json({
        message: 'No books found for the supplied title'
      });
    }

    return res.status(200).json(matchingBooks);
  } catch (error) {
    console.error('Error retrieving books by title:', error.message);
    return res.status(502).json({
      message: 'Unable to retrieve books by title'
    });
  }
});

// Retrieve reviews for a book (implement separately).
public_users.get('/review/:isbn', (req, res) => {
  return res.status(501).json({
    message: 'Review retrieval not implemented yet'
  });
});

module.exports.general = public_users;
