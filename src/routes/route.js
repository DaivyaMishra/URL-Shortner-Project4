const express = require("express");
const { urlShortner } = require("../controller/urlController");
const router = express.Router();


router.get("/test-me", function (req, res) {
    res.send("My first ever api!")
})

router.post("/url/shorten", urlShortner)
module.exports = router;