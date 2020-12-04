// As this program is using node-fetch instead of https module
// You need to provide location without any spelling mistakes
// It will not catch 404 errors
// I will be creating The improved version next.

require("dotenv").config();

const express = require("express");
const app = express();
const port = 3030;

const bodyParser = require("body-parser");
const lookup = require("country-code-lookup");
const fetch = require("node-fetch");

app.use(bodyParser.urlencoded({ extended: true }));

const key = process.env.PROJECT_API_KEY; //Enter your own api key here

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.post("/", (req, res) => {
    let country = lookup.byCountry(req.body.country).fips;
    let city = req.body.city;
    let unit = req.body.unit;

    const endpoint = "http://api.openweathermap.org/data/2.5/weather?q=";

    const url =
        endpoint + city + "," + country + "&units=" + unit + "&appid=" + key;

    fetch(url)
        .then((res) => res.json())
        .then((json) => {
            res.send(`

            <h2>${city}, ${req.body.country}</h2>
            <p>
            <i>longitude: ${json.coord.lon}, latitude: ${json.coord.lat}</i>
            </p>

            <i>All Units are in ${unit}.</i> <br>

            <p>
            <img src="http://openweathermap.org/img/wn/${json.weather[0].icon}@2x.png">
            <h3>Weather: ${json.weather[0].main}</h3>
            <h3>Description: ${json.weather[0].description}</h3>
            <h3>Temprature: ${json.main.temp}</h3>
            <h3>Fells Like: ${json.main.feels_like}</h3>
            <h3>Minimum Temp: ${json.main.temp_min}</h3>
            <h3>Maximum Temp: ${json.main.temp_max}</h3>
            <h3>Pressure: ${json.main.pressure}</h3>
            <h3>Humidity: ${json.main.humidity}</h3>
            </p>
            `);
        })
        .catch(console.error);
});

app.listen(port, () => {
    console.log(`Weather App running on http://localhost:${port}`);
});
