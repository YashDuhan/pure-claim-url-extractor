const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();

// Enable CORS for all routes
app.use(cors());

// Default route
app.get("/", (req, res) => {
  res.json({
    message:
      "Welcome here\n Use the /extract endpoint to fetch product details.",
  });
});

// Extract route
app.get("/extract", async (req, res) => {
  const { url, website } = req.query;

  if (!url || !website) {
    return res.status(400).json({ error: "URL and website are required" });
  }

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    let productTitle = "Product title not found";
    let ingredientsText = "Ingredients section not found, check yourself";

    // Website-specific logic
    switch (website.toLowerCase()) {
      case "amazon":
        productTitle = $("#productTitle").text().trim() || productTitle;
        break;

      case "bigbasket":
        productTitle =
          $("h1.Description___StyledH-sc-82a36a-2.bofYPK").text().trim() ||
          productTitle;
        break;

      case "flipkart":
        productTitle = $("span.VU-ZEz").text().trim() || productTitle;
        break;

      case "jiomart":
        productTitle = $("#pdp_product_name").text().trim() || productTitle;
        break;

      default:
        return res.status(400).json({ error: "Unsupported website" });
    }

    res.json({ productTitle, ingredientsText });
  } catch (error) {
    console.error("Error fetching data:", error);
    res
      .status(500)
      .json({ error: "Error fetching data. Please check the URL." });
  }
});

module.exports = app;
