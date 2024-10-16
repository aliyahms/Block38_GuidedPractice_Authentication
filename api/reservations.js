const express = require("express");
const router = express.Router();
module.exports = router;

const prisma = require("../prisma");
// Notice we use {} when importing `authenticate` because it is not the only export
const { authenticate } = require("./auth");

// GET / ROUTE
// It should only be accessible to a customer that is logged in.
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

// TODO: POST / route
// It should only be accessible to a customer that is logged in.
router.post("/", authenticate, async (req, res, next) => {
  // It will create a new reservation under the logged in customer,
  //according to the partySize and restaurantId specified in the request body.
  const { partySize, restaurantId } = req.body;
  try {
    const reservation = await prisma.reservation.create({
      data: {
        partySize: +partySize,
        restaurantId: +restaurantId,
        customerId: req.customer.id,
      },
    });
    // It then sends the newly created reservation with status 201.
    res.status(201).json(reservation);
  } catch (e) {
    next(e);
  }
});
