const express = require('express');
const path = require("path");
const router = require('./server/AIRouter');
const bodyParser = require('body-parser');
const { connectToDatabase } = require('./server/controllers/articleController');

// Creating express server
const app = express();

const PORT = process.env.PORT || 4000;

// router for the api layer
app.use(bodyParser.json());
app.use('/api', router);

// Connect to MongoDB and store the database object
connectToDatabase().then((db) => {
    app.locals.db = db;

    // router for the static files
    app.use(express.static(path.join(__dirname, "build"), { maxAge: "10s"}));
    app.get("/", (req, res) => res.sendFile(path.join(__dirname, "build", "index.html")));

    // serve sitemap.xml
    app.get("/sitemap.xml", (req, res) => res.sendFile(path.join(__dirname, "build", "sitemap.xml")));

    // serve robots.txt
    app.get("/robots.txt", (req, res) => res.sendFile(path.join(__dirname, "build", "robots.txt")));

    // serve ads.txt
    app.get("/ads.txt", (req, res) => res.sendFile(path.join(__dirname, "build", "ads.txt")));
                   
    // catch all router for everything else
    app.get("*", (req, res) => res.sendFile(path.join(__dirname, "build", "index.html")));

    app.listen(PORT, () => {
        console.log(`Starting Express server at ${PORT}`);
    })

});