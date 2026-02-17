const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static("public"));

app.post("/predict", (req, res) => {
    const { area, bedrooms, bathrooms, location } = req.body;

    // Simple prediction logic (replace with ML model later)
    const price =
        (area * 3000) +
        (bedrooms * 500000) +
        (bathrooms * 300000) +
        (location * 200000);

    res.json({ predictedPrice: price });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
