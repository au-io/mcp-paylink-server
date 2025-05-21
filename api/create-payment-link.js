const axios = require("axios");

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, currency, mode, reference } = req.body;

  // Validate input
  if (!amount || !currency || !mode || !reference) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Use environment variable to inject Paysafe API key
  const API_KEY = process.env.PAYSAFE_API_KEY;
  const baseURL =
    mode === "live"
      ? "https://api.paysafe.com"
      : "https://api.test.paysafe.com";

  const authHeader = {
    Authorization: `Basic ${Buffer.from(API_KEY).toString("base64")}`,
    "Content-Type": "application/json"
  };

  const payload = {
    merchantRefNum: reference,
    currencyCode: currency,
    amount: amount,
    paymentType: "CARD",
    returnLinks: [
      {
        rel: "on_completed",
        href: "https://yoursite.com/success"
      },
      {
        rel: "on_failed",
        href: "https://yoursite.com/failure"
      }
    ]
  };

  try {
    const response = await axios.post(
      `${baseURL}/paymenthub/v1/paymentrequests`,
      payload,
      { headers: authHeader }
    );

    return res.status(200).json({
      status: "success",
      payment_link: response.data.paymentPageUrl
    });
  } catch (err) {
    return res.status(err.response?.status || 500).json({
      error: err.response?.data || "Unexpected error"
    });
  }
};
