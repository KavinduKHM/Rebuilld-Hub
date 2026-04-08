const donationService = require("../../services/resourceService/donationService");
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.createDonation = async (req, res) => {
  try {
    const result = await donationService.createDonation(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Create checkout session
exports.createCheckoutSession = async (req, res) => {
  try {
    console.log("=".repeat(50));
    console.log("CREATE CHECKOUT SESSION");
    console.log("=".repeat(50));
    
    const { 
      amount, 
      donorName, 
      donorNIC, 
      email, 
      inventoryId, 
      name, 
      description,
      isInternational,
      originalCurrency,
      originalAmount
    } = req.body;
    
    if (!amount) return res.status(400).json({ message: "Amount is required" });
    if (!donorName) return res.status(400).json({ message: "Donor name is required" });
    if (!donorNIC) return res.status(400).json({ message: "NIC/ID is required" });
    if (!inventoryId) return res.status(400).json({ message: "Fund selection is required" });
    
    const amountInCents = Math.round(amount * 100);
    console.log(`Amount: ${amount} LKR → ${amountInCents} cents`);
    
    // Save donation as PENDING
    const Donation = require("../../models/resourceModel/donationModel");
    const donation = new Donation({
      donorName: donorName,
      donorNIC: donorNIC,
      email: email || '',
      type: 'MONEY',
      inventoryId: inventoryId,
      name: name || 'General Relief Fund',
      description: description || '',
      amount: amount,
      paymentStatus: 'PENDING',
    });
    
    const savedDonation = await donation.save();
    console.log("✅ Donation saved with ID:", savedDonation._id);
    
    // Create Stripe Checkout Session - redirect to success page
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'lkr',
            product_data: {
              name: `Donation to ${name || 'Disaster Relief Fund'}`,
              description: description || 'Supporting disaster relief efforts in Sri Lanka',
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/donation-success?session_id={CHECKOUT_SESSION_ID}&donation_id=${savedDonation._id}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/resources?payment=canceled`,
      customer_email: email || undefined,
      metadata: {
        donationId: savedDonation._id.toString(),
        donorName: donorName,
        donorNIC: donorNIC,
        fundId: inventoryId,
        fundName: name || 'General Relief Fund',
        amount: amount.toString(),
      },
    });
    
    // Update donation with stripe session ID
    savedDonation.stripeSessionId = session.id;
    await savedDonation.save();
    
    console.log("✅ Checkout session created:", session.id);
    console.log("✅ Session URL:", session.url);
    
    res.status(200).json({ 
      success: true,
      url: session.url,
      sessionId: session.id,
      donationId: savedDonation._id
    });
    
  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// Verify and complete payment
exports.verifyPayment = async (req, res) => {
  try {
    const { session_id, donation_id } = req.query;
    
    console.log("=".repeat(50));
    console.log("VERIFY PAYMENT CALLED");
    console.log("=".repeat(50));
    console.log("Session ID:", session_id);
    console.log("Donation ID:", donation_id);
    
    if (!session_id) {
      return res.status(400).json({ success: false, message: "Session ID is required" });
    }
    
    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);
    console.log("Session payment status:", session.payment_status);
    
    const Donation = require("../../models/resourceModel/donationModel");
    
    // Find donation
    let donation = null;
    if (donation_id) {
      donation = await Donation.findById(donation_id);
    }
    if (!donation && session.metadata.donationId) {
      donation = await Donation.findById(session.metadata.donationId);
    }
    if (!donation) {
      donation = await Donation.findOne({ stripeSessionId: session_id });
    }
    
    if (!donation) {
      console.log("❌ Donation not found");
      return res.status(404).json({ success: false, message: "Donation record not found" });
    }
    
    if (session.payment_status === 'paid') {
      if (donation.paymentStatus !== 'SUCCESS') {
        // Update donation status
        donation.paymentStatus = 'SUCCESS';
        await donation.save();
        console.log("✅ Donation status updated to SUCCESS:", donation._id);
        
        // Update inventory
        try {
          const inventoryService = require("../../services/resourceService/inventoryService");
          await inventoryService.updateMoneyAmount(donation.inventoryId, donation.amount);
          console.log("✅ Inventory updated for fund:", donation.inventoryId);
        } catch (invError) {
          console.error("Inventory update error:", invError.message);
        }
      }
      
      return res.json({ 
        success: true, 
        message: "Payment verified successfully",
        donation: {
          id: donation._id,
          amount: donation.amount,
          donorName: donation.donorName,
          name: donation.name
        }
      });
    } else {
      return res.json({ 
        success: false, 
        message: `Payment not completed. Status: ${session.payment_status}` 
      });
    }
  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get donation by ID
exports.getDonationById = async (req, res) => {
  try {
    const donation = await donationService.getDonationById(req.params.id);
    res.status(200).json(donation);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

// Get all donations
exports.getAllDonations = async (req, res) => {
  try {
    const donations = await donationService.getAllDonations();
    res.status(200).json(donations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update donation status
exports.updateDonationStatus = async (req, res) => {
  try {
    const donation = await donationService.updateDonationStatus(req.params.id, req.body);
    res.status(200).json(donation);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

// Delete donation
exports.deleteDonation = async (req, res) => {
  try {
    await donationService.deleteDonation(req.params.id);
    res.status(200).json({ message: "Donation deleted successfully" });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

// Get donation statistics
exports.getDonationStats = async (req, res) => {
  try {
    const stats = await donationService.getDonationStats();
    res.status(200).json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get donations by donor
exports.getDonationsByDonor = async (req, res) => {
  try {
    const donations = await donationService.getDonationsByDonor(req.params.donorNIC);
    res.status(200).json(donations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};