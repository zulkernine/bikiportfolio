const express = require("express");
const serverless = require("serverless-http");
const app = express();
const port = process.env.PORT || 3000;
const fileUpload = require("express-fileupload");
const adminRouter = require("./route/admin");
const homeRouter = require("./route/home");
const authRouter = require("./route/auth");
const clientApiRouter = require("./route/client-api");
const session = require("express-session");
const flash = require("express-flash");
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
// app.use("/admin", adminRouter);
app.use("/admin", authRouter, adminRouter);
app.use("/api", clientApiRouter);
// app.use("/login", authRouter);

// app.post("/logout", (req, res) => {
//     req.session.isAuthenticated = null;
//     res.redirect("/login");
// });

app.get("/echo", (req, res) => {
    res.send(req.body.tostring());
});

app.get("/", async (req, res) => {
    const recentImages = await MediaService.getRecentImages();
    const recentVideos = await MediaService.getRecentVideos();
    const teamMembers = await MediaService.getAllTeamMembers();

    res.render("index.ejs", { recentImages, recentVideos, teamMembers });
});

app.get("/about", async (req, res) => {
    const teamMembers = await MediaService.getAllTeamMembers();
    res.render("about.ejs",{teamMembers});
});

app.get("/cinema", async (req, res) => {
    const allVideos = await MediaService.getAllVideos();
    res.render("cinema.ejs",{allVideos});
});

app.get("/contact", async (req, res) => {
    const teamInfo = await MediaService.getTeamInfo();
    console.log(teamInfo);
    res.render("contact.ejs",{teamInfo});
});

app.get("/gallery", async (req, res) => {
    const allImages = await MediaService.getAllImages(true);
    const recentVideos = await MediaService.getRecentVideos();
    res.render("gallery.ejs", { allImages,"allVideos":recentVideos });
});

app.get("/single-blog", (req, res) => {
    res.render("single-blog.ejs");
});

app.listen(port, () => {
    console.log("Listening to port: " + port);
});

module.exports.handler = serverless(app);

// function checkAuthenticated(req, res, next) {
//     let apikey = req.headers["X-API-KEY"];
//     if(apikey == null){
//         apikey = req.query["API_KEY"]
//     }
//     console.log("authntication check " + apikey);
//     if (apikey == "IamBiki") {
//         return next();
//     } else res.render("unauthorized.ejs");
// }
