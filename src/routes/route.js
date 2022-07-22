const express = require("express");
const urlController = require("../controller/urlController");

const router = express.Router();


router.get("/test-me", function (req, res) {
    res.send("My first ever api!")
})

router.post("/url/shorten", urlController.createShortenUrl)
router.get("/:urlCode",urlController.getUrl)
module.exports = router;