// routes/ticketRoutes.js
const express = require('express');
const ticketController = require("../controllers/ticketController");
const { protect, authorize } = require('../middleware/auth');
const stripe = require('../config/stripe'); // Import stripe directly

const router = express.Router();

// For the webhook route, we need to handle raw body data
// But we'll comment this out for now since we're not using webhooks in our simplified approach
// router.post(
//   '/webhook',
//   express.raw({ type: 'application/json' }),
//   ticketController.handleWebhook
// );

// Protect all other routes with authentication
router.use(protect);

// Create payment for ticket - renamed from createCheckoutSession to createPayment
router.post('/create-payment', ticketController.createPayment);

// Confirm payment and activate ticket
router.post('/confirm-payment', ticketController.confirmPayment);

// Get user tickets
router.get('/my-tickets', ticketController.getUserTickets);

// Get ticket by ID
router.get('/:id', ticketController.getTicketById);

// Add debugging route for Stripe
router.get('/debug-stripe/:paymentIntentId', async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    console.log("Debugging payment intent:", paymentIntentId);
    
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    res.json({
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        created: new Date(paymentIntent.created * 1000).toISOString(),
        metadata: paymentIntent.metadata
      }
    });
  } catch (error) {
    console.error("Error retrieving payment intent:", error);
    res.status(400).json({
      success: false,
      message: error.message,
      code: error.code,
      type: error.type
    });
  }
});

module.exports = router;