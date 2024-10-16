const express = require("express");
const router = express.Router();

// TODO: Import jwt and JWT_SECRET
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

// TODO: createToken
function createToken(id) {
  // Note: id is wrapped in an object to prevent jwt from coercing it into a string
  // payload, key, parameter
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: "1d" });
}

const prisma = require("../prisma");

// This token-checking middleware should run before any other routes.
// It's the first in this file, and this router is imported first in `server.js`.
router.use(async (req, res, next) => {
  // Grab token from headers only if it exists
  const authHeader = req.headers.authorization;
  const token = authHeader?.slice(7); // "Bearer <token>"
  if (!token) return next();

  // TODO: Find customer with ID decrypted from the token and attach to the request
  try {
    const { id } = jwt.verify(token, JWT_SECRET); // Use jwt.verify with JWT_SECRET to get the id from the token.
    const customer = await prisma.customer.findUniqueOrThrow({
      where: { id }, // Find the customer with that id.
    });
    req.customer = customer; // Set req.customer to that customer.
    next(); // Continue to the next middleware.
  } catch (e) {
    next(e);
  }
});

// TODO: POST /register route
router.post("/register", async (req, res, next) => {
  // define/state the properties email and password from the request body, so we can pass it to our register customer method
  const { email, password } = req.body;
  try {
    const customer = await prisma.customer.register(email, password); // Save the returned customer in a variable named customer
    // Pass the id of that customer into createToken, which we defined earlier
    // Save the returned token in a variable named token
    const token = createToken(customer.id);
    res.status(201).json({ token }); // Respond with { token } and a status of 201.
  } catch (e) {
    next(e);
  }
});

// TODO: POST /login route
router.post("/login", async (req, res, next) => {
  // Pass the email and password into prisma.customer.login.
  // Save the returned customer in a variable named customer.
  const { email, password } = req.body;
  try {
    const customer = await prisma.customer.login(email, password);
    // Pass the id of that customer into createToken
    // Save the returned token in a variable named token.
    const token = createToken(customer.id);
    // Respond with { token }.
    res.json({ token });
  } catch (e) {
    next(e);
  }
});

/** Checks the request for an authenticated customer. */
function authenticate(req, res, next) {
  if (req.customer) {
    next();
  } else {
    next({ status: 401, message: "You must be logged in." });
  }
}

// Notice how we export the router _and_ the `authenticate` middleware!
module.exports = {
  router,
  authenticate,
};
