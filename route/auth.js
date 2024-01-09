const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { dynamodb } = require("../service/aws-service");
const config = require("../config.json");

router.get("/", checkNotAuthenticated, async (req, res) => {
    res.render("login.ejs");
});

function checkNotAuthenticated(req, res, next) {
    if (req.session.isAuthenticated) {
        return res.redirect("/admin");
    }
    next();
}

router.post("/", (req, res) => {
    console.log(req.body.username);
    var params = {
        TableName: config.adminUserTable,
        Key: {
            id: req.body.username,
        },
    };

    // Call DynamoDB to read the item from the table
    dynamodb.get(params, function (err, { Item:data }) {
        console.log(data);
        console.log("Error", err);

        if (err || !data) {
            res.render("login.ejs", { error: "Username not found" });
        } else {
            if (bcrypt.compareSync(req.body.password, data.password)) {
                console.log("Success");
                req.session.isAuthenticated = true;
                req.session.username = req.body.username;
                req.session.accountId = data.accountId;
                res.redirect("/admin");
            } else
                res.render("login.ejs", {
                    error: "Password didn't match, try again!",
                });
        }
    });
});

module.exports = router;
