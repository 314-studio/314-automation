const core = require('@actions/core');
const github = require('@actions/github');
const TrelloAutomation = require('./services/TrelloAutomation');

(async () => {
    try {
        const payload = github.context.payload;
        var result = { success: true, msg: 'unrecognized git operation.', payload: payload };
        var branchName = process.env.BRANCH_NAME;
        if (payload.ref_type && payload.ref_type === 'branch') {
            var branchUrl = `${payload.repository.html_url}/tree/${branchName}`;
            core.info(`Created new branch, ${branchName}, branch url: ${branchUrl}`);
            var result = await TrelloAutomation.attachPullResuest(branchName, `${branchUrl}`);
        } else if (payload.pull_request) {
            core.info(`PR created, Branch name: ${branchName}, pull request URL: ${payload.pull_request.html_url}`);
            var result = await TrelloAutomation.attachPullResuest(branchName, payload.pull_request.html_url);
        }
        if (result.success) {
            core.info(`Successfully attached URL to card. \n ${JSON.stringify(result)}`);
        } else {
            core.error(result);
            core.setFailed(result);
        }
    } catch (error) {
        core.setFailed(error.message);
    }
})();
