const core = require('@actions/core');
const github = require('@actions/github');
const TrelloAutomation = require('./services/TrelloAutomation');

(async () => {
    try {
        const payload = github.context.payload;
        core.info(`Branch name: ${process.env.BRANCH_NAME}, pull request URL: ${payload.pull_request.url}`);
        var result = await TrelloAutomation.attachPullResuest(process.env.BRANCH_NAME, payload.pull_request.html_url);
        if (result.success) {
            core.info(`Successfully attached PR to card. \n ${JSON.stringify(result.card)}`);
        } else {
            core.error(result);
            core.setFailed(result);
        }
    } catch (error) {
        core.setFailed(error.message);
    }
})();
