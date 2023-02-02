const express = require('express');
const router = express.Router();
const sendError = require('../services/SendError');
const githubService = require('../services/GitHubService');

// add comment to github issue/pull request
router.post('/issue/:issueNumber/comments', async function (req, res) {
    res.json(await githubService.addPrComment(req.params.issueNumber, req.query.comment)
        .catch(err => sendError(res, err)));
});

module.exports = router;