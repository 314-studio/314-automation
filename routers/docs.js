const express = require('express');
const router = express.Router();
const wikiService = require('../services/WikijsService');

// add comment to github issue/pull request
router.post('/changelog', async function (req, res) {
    const body = req.body;
    const result = await wikiService.addNewRelease(body);
    res.json(result);
});

module.exports = router;