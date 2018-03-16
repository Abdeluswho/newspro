const express = require('express');
const router = express.Router();

router.get("/", (req, res) => {
    res.render('index', {title: 'NPR news scraper!'});
});

module.exports = router;