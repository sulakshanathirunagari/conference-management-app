// config/stripe.js

const Stripe = require("stripe");
require("dotenv").config(); // Load variables from .env

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = stripe;

