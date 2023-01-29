const core = require('@actions/core');
const github = require('@actions/github');
const TrelloAutomation = require('./services/TrelloAutomation');
const GitHubService = require('./services/GitHubService');

(async () => {
    try {
        const payload = github.context.payload;
        var result = { success: false, msg: 'unrecognized git operation.', payload: payload };
        var branchName = process.env.BRANCH_NAME;
        core.info(`Triggered on branch ${branchName}`);
        var cardCustomId = branchName;
        if (cardCustomId && cardCustomId.split('-').length > 2) {
            var splited = cardCustomId.split('-');
            cardCustomId = `${splited[0]}-${splited[1]}`;
        }


        // git create new branch triggered 
        if (payload.ref_type && payload.ref_type === 'branch') {
            var branchUrl = `${payload.repository.html_url}/tree/${cardCustomId}`;
            core.info(`Created new branch, ${branchName} with card custom ID ${cardCustomId}, branch url: ${branchUrl}`);
            result = await TrelloAutomation.attachNewBranch(cardCustomId, `${branchUrl}`);
        
        // git create pull request triggered
        } else if (payload.pull_request) {
            core.info(`PR created, Branch name: ${cardCustomId}, pull request URL: ${payload.pull_request.html_url}`);
            result = await TrelloAutomation.attachPullResuest(cardCustomId, payload.pull_request.html_url);
            if (result.name) {
                await GitHubService.addPrComment(result);
            }
        
        // git push to main triggered
        } else if (payload.pusher) {
            core.info(`Merging to main, Branch name: ${cardCustomId}, pushed by ${payload.pusher.name}`);
            // result = await TrelloAutomation.moveCardToDone(cardCustomId);
        }


        if (result.success) {
            core.info(`Opperation finished successfully. \n ${JSON.stringify(result)}`);
        } else {
            core.error(result);
            core.setFailed(result);
        }
    } catch (error) {
        core.setFailed(error.message);
    }
})();
