const express = require('express');
const router = express.Router();
const sendError = require('../services/SendError');
const githubService = require('../services/GitHubService');

// add comment to github issue/pull request
router.post('/issue/:issueNumber/comments', async function (req, res) {
    res.json(await githubService.addPrComment(req.params.issueNumber, req.query.comment)
        .catch(err => sendError(res, err)));
});


router.post('/workflow/:workflowId/artifact/latest/download', async function (req, res) {
    var artifact = await githubService.getLastestArtifact(req.params.workflowId);
    if (!artifact) {
        res.json({ success: false, msg: `Cannot found artifact build by workflow run ${req.params.workflowId}` });
    }
    var result = await githubService.downloadAndHostArtifact(artifact.id, artifact.name);
    result.head = artifact.workflow_run.head_sha;
    res.json(result);
});

module.exports = router;