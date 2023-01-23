const core = require('@actions/core');
const github = require('@actions/github');
const TrelloAutomation = require('./services/TrelloAutomation');

(async () => {
    try {
        const payload = github.context.payload;
        var result = { success: false, msg: 'unrecognized git operation.', payload: JSON.stringify(payload) };
        var branchName = process.env.BRANCH_NAME;
        if (payload.pusher) {
            var branchUrl = `${payload.repository.html_url}/tree/${branchName}/`;
            core.info(`Pushing to main branch, from: ${branchName}, branch url: `);
            var result = await TrelloAutomation.attachPullResuest(branchName, `${branchUrl}`);
        } else {
            core.info(`PR created, Branch name: ${branchName}, pull request URL: ${payload.pull_request.html_url}`);
            var result = await TrelloAutomation.attachPullResuest(branchName, payload.pull_request.html_url);
        }
        if (result.success) {
            core.info(`Successfully attached PR to card. \n ${JSON.stringify(result)}`);
        } else {
            core.error(result);
            core.setFailed(result);
        }
    } catch (error) {
        core.setFailed(error.message);
    }
})();
