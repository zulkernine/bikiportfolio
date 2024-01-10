const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { dynamodb } = require("../service/aws-service");
const config = require("../config.json");
const MediaService = require("../service/media-service");

router.get("/", checkNotAuthenticated, async (req, res) => {
    res.render("signup.ejs");
});

function checkNotAuthenticated(req, res, next) {
    if (req.session.isAuthenticated) {
        return res.redirect("/admin");
    }
    next();
}

router.post("/", async (req, res) => {
    console.log(req.body.username);
    const extAccount = await MediaService.getTeamInfo(req.body.accountId);
    const extUsername = await MediaService.getTeamInfoByUsername(req.body.username);

    console.log(extAccount);
    console.log(extUsername);

    if (extAccount) {
        res.render("signup.ejs", {
            error: "Account ID already exist! Please use different ID",
        });
    } else if (extUsername) {
        res.render("signup.ejs", {
            error: "Username already exist! Please use email",
        });
    } else {
        
        const params = {
            TableName: config.adminUserTable,
            Item: {
                id: req.body.username,
                accountId: req.body.accountId,
                email: req.body.username,
                password: bcrypt.hashSync(req.body.password,10),
                createdAt: (new Date()).toISOString(),
            },
        };

        await dynamodb
            .put(params)
            .promise()
            .then(
                () => {
                    req.flash("info", "Successfully Signed Up!");
                    res.redirect("/login");
                },
                (error) => {
                    console.log(error);
                    res.status(500).send(error);
                }
            );
    }
});

module.exports = router;
