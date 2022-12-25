const express = require("express");
const router = express.Router();
const MediaService = require("../service/media-service");

router.get("/", async (req, res) => {
    res.render('index.ejs',{});
});

router.get("/gallery", async (req, res) => {
    res.render("gallery.ejs", {});
});

/**
 * Return all images available sorted by uploadedAt timestamp (latest first or Decrasing)
 */
router.get("/images", async (req, res) => {
    try {
        const allImages = await MediaService.getAllImages();
        res.json(allImages);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

router.get("/images/recent", async (req, res) => {
    try {
        const allImages = await MediaService.getRecentImages();
        res.json(allImages);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

router.get("/videos", async (req, res) => {
    try {
        const allVideos = await MediaService.getAllVideos();
        res.json(allVideos);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

router.get("/videos/recent", async (req, res) => {
    try {
        const allVideos = await MediaService.getRecentVideos();
        res.json(allVideos);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

module.exports = router;

