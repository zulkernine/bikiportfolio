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
    console.log(req.body.password);
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
            if (bcrypt.compareSync(req.body.password, data.password)) {
                console.log("Success");
                req.session.isAuthenticated = true;
                res.redirect("/admin");
            } else res.render("login.ejs", { error: "Access key is wrong!" });
        }
    });
});

module.exports = router;
