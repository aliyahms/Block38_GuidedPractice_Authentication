const express = require("express");
const router = express.Router();
module.exports = router;

const prisma = require("../prisma");

// Note: this route is not protected! Anyone can get all restaurants!
router.get("/", async (req, res, next) => {
  try {
    const restaurants = await prisma.restaurant.findMany();
    res.json(restaurants);
  } catch (e) {
    next(e);
  }
});

// Note: this route is also not protected, but what changes if a customer is logged in?
router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  // The value of includeReservations changes.
  //If a customer is not logged in, then it's simply false,
  // which means that the restaurant will not include any reservations in the response.

  const includeReservations = req.customer
    ? { where: { customerId: req.customer.id } }
    : false;
  // If a customer is logged in,
  // then the response will include any reservations that the logged-in customer has made for that specific restaurant.
  try {
    const restaurant = await prisma.restaurant.findUniqueOrThrow({
      where: { id: +id },
      include: { reservations: includeReservations },
    });
    res.json(restaurant);
  } catch (e) {
    next(e);
  }
});
