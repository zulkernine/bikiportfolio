const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const fileUpload = require("express-fileupload");
const adminRouter = require("./route/admin");
const clientApiRouter = require("./route/client-api");

app.use(fileUpload());
app.use(express.json());
app.use("/admin", adminRouter);
app.use("/api", clientApiRouter);

app.get("/", (req, res) => {
    res.send(
        "<h1>My first attempt to use AWS :) and develop a full" +
            " stack application. Please appreciate :(</h1>"
    );
});

app.get("/echo", (req, res) => {
    res.send(req.body.tostring());
});

app.listen(port, () => {
    console.log("Listening to port: " + port);
});
