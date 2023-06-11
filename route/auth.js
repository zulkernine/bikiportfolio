const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { dynamodb } = require("../service/aws-service");
const config = require("../config.json");
require("dotenv").config();

function checkAuthenticated(req, res, next) {
    console.log(process.env.SESSION_SECRET);

    let apikey = req.headers["x-api-key"];
    if (apikey == null) {
        apikey = req.query.apikey;
    }

    if (apikey == null) return res.render("unauthorized.ejs");

    var params = {
        TableName: config.adminUserTable,
        Key: {
            id: "zeedstudioadmin",
        },
    };

    // Call DynamoDB to read the item from the table
    dynamodb.get(params, function (err, { Item: data }) {
        if (err) {
            console.log("Error", err);
            res.render("login.ejs", { error: err });
        } else {
            if (bcrypt.compareSync(apikey, data.password)) {
                console.log("Success");
                next(); 
            } else res.render("unauthorized.ejs");
        }
    });
}

module.exports = checkAuthenticated;
