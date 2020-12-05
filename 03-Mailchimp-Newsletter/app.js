// for using api keys as enviroment variable
require("dotenv").config();
const key = process.env.PROJECT_API_KEY;
const listId = process.env.PROJECT_LIST_ID;

const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const app = express();

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3030;
}

app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/signup.html");
});

app.get("/success", (req, res) => {
    res.sendFile(__dirname + "/success.html");
});

app.get("/error", (req, res) => {
    res.sendFile(__dirname + "/error.html");
});

app.post("/", function (req, res) {
    const formData = req.body;
    const { fName, lName, email } = formData;

    const data = {
        members: [
            {
                email_address: email,
                status: "subscribed",
                merge_fields: { FNAME: fName, LNAME: lName },
            },
        ],
    };

    const jsonData = JSON.stringify(data);

    const url = `https://us7.api.mailchimp.com/3.0/lists/${listId}`;
    const options = {
        method: "POST",
        auth: `johndoe:${key}`,
    };

    const request = https.request(url, options, (response) => {
        if (response.statusCode === 200) {
            res.sendFile(__dirname + "/success.html");
        } else {
            res.sendFile(__dirname + "/error.html");
        }
    });

    request.write(jsonData);
    request.end();
});

app.post("/error", (req, res) => {
    res.redirect("/");
});

app.listen(port);
