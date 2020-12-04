const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const port = 3030;

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.post("/", (req, res) => {
    res.send(req.body);
});
app.listen(port, () => {
    console.log(`Go to http://localhost:${port}`);
});
