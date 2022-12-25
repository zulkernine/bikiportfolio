const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const fileUpload = require("express-fileupload");
const adminRouter = require("./route/admin");
const homeRouter = require("./route/home");
const authRouter = require("./route/auth");
const clientApiRouter = require("./route/client-api");
const session = require("express-session");
const flash = require('express-flash');
const MediaService = require("./service/media-service");

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
app.use(express.static(__dirname + "/static"));
app.use("/admin",checkAuthenticated, adminRouter);
app.use("/api", clientApiRouter);
app.use("/login", authRouter);

app.post("/logout", (req, res) => {
    req.session.isAuthenticated = null;
    res.redirect("/login");
});

app.get("/echo", (req, res) => {
    res.send(req.body.tostring());
});

app.get("/", async (req, res) => {
    const recentImages = await MediaService.getRecentImages();
    const recentVideos = await MediaService.getRecentVideos();
    const teamMembers = await MediaService.getAllTeamMembers();

    res.render("index.ejs",{recentImages,recentVideos,teamMembers});
});

app.get('/about',(req,res)=>{
    res.render('about.ejs');
});

app.get("/blog", (req, res) => {
    res.render("blog.ejs");
});

app.get("/contact", (req, res) => {
    res.render("contact.ejs");
});

app.get("/gallery", (req, res) => {
    res.render("gallery.ejs");
});

app.get("/single-blog", (req, res) => {
    res.render("single-blog.ejs");
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
