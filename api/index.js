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
    let ingredientsText =
      "Whey Protein Concentrate, Whey Protein Isolate, Cocoa Powder, Nature Identical Flavouring Substances, Emulsifier (INS 322 (i)), Sodium Chloride, Proprietary Enzyme Blend, Sweetener (INS 955), Stabilizer (INS 415) & Anticaking Agent (INS 551). Proprietary Enzyme Blend - A multi enzyme blend containing Amylase, Protease, Lactase, Lipase & Cellulase";

    // Website-specific logic
    switch (website.toLowerCase()) {
      // Swiggy Instamart case
      case "swiggy-instamart":
        // Title extraction
        productTitle =
          $("div[data-testid='item-display-name']").text().trim() ||
          productTitle;

        // Extract ingredients
        ingredientsText = $("div.sc-aXZVg").text().trim() || ingredientsText;
        break;

      // Amazon case
      case "amazon":
        productTitle = $("#productTitle").text().trim() || productTitle;
        break;

      // BigBasket case
      case "bigbasket":
        productTitle =
          $("h1.Description___StyledH-sc-82a36a-2.bofYPK").text().trim() ||
          productTitle;
        break;

      // Flipkart case
      case "flipkart":
        productTitle = $("span.VU-ZEz").text().trim() || productTitle;
        break;

      // Jiomart case
      case "jiomart":
        productTitle = $("#pdp_product_name").text().trim() || productTitle;
        break;

      // Blinkit case
      case "blinkit":
        productTitle =
          $("h1[class^='ProductInfoCard__ProductName']").text().trim() ||
          productTitle;
        break;

      // Zepto case
      case "zepto":
        productTitle =
          $("h1[data-testid='pdp-product-name']").text().trim() || productTitle;
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

const port = 3000;
app.listen(port, function (req, res) {
  console.log(`Server running at http://localhost:${port}`);
});

module.exports = app;
