const express = require('express');
const router = express.Router();
const sendError = require('../services/SendError');
const githubService = require('../services/GitHubService');

// add comment to github issue/pull request
router.post('/owner/:owner/repo/:repo/issue/:issueNumber/comments', async function (req, res) {
    res.json(await githubService.addPrComment(req.params.owner, req.params.repo, req.params.issueNumber, req.query.comment)
        .catch(err => sendError(res, err)));
});


router.post('/owner/:owner/repo/:repo/workflow/:workflowId/artifact/latest/download', async function (req, res) {
    var owner = req.params.owner;
    var repo = req.params.repo;
    var artifact = await githubService.getLastestArtifact(owner, repo, req.params.workflowId);
    if (!artifact) {
        res.json({ success: false, msg: `Cannot found artifact build by workflow run ${req.params.workflowId}` });
        return;
    }
    var result = await githubService.downloadAndHostArtifact(owner, repo, artifact.id, artifact.name);
    result.head = artifact.workflow_run.head_sha;
    res.json(result);
});

module.exports = router;