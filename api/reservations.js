const express = require("express");
const router = express.Router();
module.exports = router;

const prisma = require("../prisma");
// Notice we use {} when importing `authenticate` because it is not the only export
const { authenticate } = require("./auth");

router.get("/", authenticate, async (req, res, next) => {
  // TODO: Send reservations made by the logged in customer
  try {
    const reservations = await prisma.reservation.findMany({
      where: { customerId: req.customer.id }, // Send all of the reservations made by the customer stored in req.customer.
      include: { restaurant: true }, // Include the restaurant of each reservation.
    });
    res.json(reservations);
  } catch (e) {
    next(e);
  }
});

// TODO: POST /
