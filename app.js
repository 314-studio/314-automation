const core = require('@actions/core');
const github = require('@actions/github');
const workflow = require('./workflowService');

const TRELLO_LIST_NAME_UNDER_REVIEW = core.getInput('trello-list-name-under-review', { required: true });
const TRELLO_LIST_NAME_IN_PROGRESS = core.getInput('trello-list-name-in-progress', { required: true });



async function _attachUrlToTrelloAndMoveCard (cardId, url, listName) {
    var result = await workflow.attachUrlToTrello(cardId, url);
    if (!result.success) {
        core.setFailed(result.msg);
    }
    result = await workflow.moveCardToList(cardId, listName);
    if (!result.success) {
        core.setFailed(result.msg);
    }
    return result;
}

function _buildTrelloLinkComment (cardInfo) {
    return `![](https://github.trello.services/images/mini-trello-icon.png) [${cardInfo.name}](${cardInfo.url})`;
}

(async () => {
    try {
        const payload = github.context.payload;
        var branchName = process.env.BRANCH_NAME;
        core.info(`Triggered on branch ${branchName}`);
        var cardCustomId = branchName;
        if (cardCustomId && cardCustomId.split('-').length > 2) {
            var splited = cardCustomId.split('-');
            cardCustomId = `${splited[0]}-${splited[1]}`;
        }

        var card = await workflow.getCardByCustomId(cardCustomId);
        if (!card.success) {
            core.setFailed(card.msg);
        }
        core.info(`Found card ${card.name}.`);
        var result = {};
        
        // git create new branch triggered
        if (payload.ref_type && payload.ref_type === 'branch') {
            var branchUrl = `${payload.repository.html_url}/tree/${branchName}`;
            core.info(`Created new branch, ${branchName} with card custom ID ${cardCustomId}, branch url: ${branchUrl}`);
            result = await _attachUrlToTrelloAndMoveCard(card.id, branchUrl, TRELLO_LIST_NAME_IN_PROGRESS);
        
        // git create pull request triggered
        } else if (payload.pull_request) {
            core.info(`PR created, Branch name: ${cardCustomId}, pull request URL: ${payload.pull_request.html_url}`);
            result = await _attachUrlToTrelloAndMoveCard(card.id, payload.pull_request.html_url, TRELLO_LIST_NAME_UNDER_REVIEW);
            await workflow.addPrComment(payload.pull_request.number, _buildTrelloLinkComment(card));
        
        // git push to main triggered
        } else if (payload.pusher) {
            core.info(`Merging to main, Branch name: ${cardCustomId}, pushed by ${payload.pusher.name}`);
            // result = await TrelloAutomation.moveCardToDone(cardCustomId);
        } else {
            result = { success: false, msg: 'unrecognized git operation.', payload: payload };
        }

        if (!result.success) {
            core.setFailed(result);
        }

        core.info(`Opperation finished successfully. \n ${JSON.stringify(result)}`);
    } catch (error) {
        core.setFailed(error.message);
    }
})();
