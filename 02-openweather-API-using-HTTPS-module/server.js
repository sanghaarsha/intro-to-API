// for using api keys as enviroment variable
require("dotenv").config();
const key = process.env.PROJECT_API_KEY;

const express = require("express");
const https = require("https");
const bodyParser = require("body-parser"); // for request body parsing
const lookup = require("country-code-lookup");
const app = express();

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}

app.use(bodyParser.urlencoded({ extended: true }));

// Serving index.html as main route
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

// serving css file
app.get("/styles.css", (req, res) => {
    res.sendFile(__dirname + "/styles.css");
});

// Handling post request from index.html
app.post("/", (req, res) => {
    // storing the required data from request body, parsed usind body-parser
    let country = req.body.country;
    let city = req.body.city;
    let unit = req.body.unit;

    // UTF-8 Letterlike Symbols for selected measurement system
    let sign = "";
    if (unit == "metric") sign = "&#8451;";
    if (unit == "imperial") sign = "&#8457;";
    if (unit == "standard") sign = "&#8490;";

    // does country lookup, if the country exists it switches country name to fips (ie. India = IN) for the precise location, else it leaves OpenWeather API to handle best location
    cntlkp = lookup.byCountry(country);
    if (cntlkp != null) country = cntlkp.fips;

    let apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&units=${unit}&appid=${key}`;

    // Performing https.get method to obtain data from API as data buffer
    const request = https.get(apiUrl, (response) => {
        // checking for 404 and other error status code
        if (response.statusCode === 200) {
            response.on("data", (d) => {
                // converting data buffer(HEXCODE) into json, as https.get returns the data buffer from the api call
                weatherData = JSON.parse(d);

                // Storing the data required, from the parsed buffer
                const temp = weatherData.main.temp;
                const desc = weatherData.weather[0].description;
                const lon = weatherData.coord.lon;
                const lat = weatherData.coord.lat;
                const icon = `http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`;

                // specifying header type to be text/html
                res.setHeader("Content-Type", "text/html");

                // sending generated contenr using res.send
                res.send(`
                <head>
                    <link rel="stylesheet" href="./styles.css" />
                </head>
                <body>
                    <div id="container">
                        <div class="form-space">
                            <h2>${weatherData.name}, ${
                    lookup.byFips(weatherData.sys.country).country
                }</h2>
                            <p>
                            <i>longitude: ${lon}, latitude: ${lat}</i>
                            </p>
                            
                            <p>
                            <img src=\"${icon}\">
                            <h3>${temp} ${sign}</h3>
                            <h3>${desc}</h3>
                            </p>
                            </div>
                    </div>
                </body>
                `);
            });
        } else {
            res.send(
                ` <head>
                    <link rel="stylesheet" href="./styles.css" />
                </head>
                <div id="container"><h1>${response.statusCode} Error!</h1>Check Your Spelling and Try Again!</div>`
            );
        }
    });

    request.on("error", (e) => {
        console.log(e);
    });

    request.end();
});

app.listen(port);
