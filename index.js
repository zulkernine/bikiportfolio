const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const fileUpload = require("express-fileupload");
const adminRouter = require("./route/admin");
const authRouter = require("./route/auth");
const clientApiRouter = require("./route/client-api");
const session = require("express-session");
const flash = require('express-flash');

app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("view-engine", "ejs");
app.use(
    session({
        secret: "process.env.SESSION_SECRET",
        resave: true,
        saveUninitialized: true,
        cookie: {
            // secure: true,
            maxAge: 86400000,
        },
    })
);
app.use(flash());
app.use("/admin",checkAuthenticated, adminRouter);
app.use("/api", clientApiRouter);
app.use("/login", authRouter);

app.get("/", (req, res) => {
    res.render("index.ejs", { user: "Mohi" });
});

app.post("/logout", (req, res) => {
    req.session.isAuthenticated = null;
    res.redirect("/login");
});

app.get("/echo", (req, res) => {
    res.send(req.body.tostring());
});

app.listen(port, () => {
    console.log("Listening to port: " + port);
});

function checkAuthenticated(req, res, next) {
    console.log("authntication check " + req.session.isAuthenticated);
    if (req.session.isAuthenticated) {
        return next();
    } else res.redirect("/login");
}
