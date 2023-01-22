const core = require('@actions/core');
const github = require('@actions/github');
const TrelloAutomation = require('./services/TrelloAutomation');

try {
    const time = (new Date()).toTimeString();
    core.setOutput("time", time);

    const payload = github.context.payload;
    console.log(payload.pull_request.url);
    console.log(process.env.BRANCH_NAME);
    async () => await TrelloAutomation.attachPullResuest(process.env.BRANCH_NAME, payload.pull_request.url);
} catch (error) {
    core.setFailed(error.message);
}