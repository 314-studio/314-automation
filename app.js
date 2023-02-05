const core = require('@actions/core');
const github = require('@actions/github');
const workflowService = require('./workflowService');
const workflow = require('./workflowService');

const TRELLO_LIST_NAME_UNDER_REVIEW = core.getInput('trello-list-name-under-review', { required: true });
const TRELLO_LIST_NAME_IN_PROGRESS = core.getInput('trello-list-name-in-progress', { required: true });
const M2M_314_WORKFLOW_URL_BASE = core.getInput('m2m-314-automation-base-url', { required: true });
const BUILD_VERSION = core.getInput('build-version', { required: false });
const BUILD_FILE_NAME = core.getInput('build-file-name', { required: false });


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

async function onPush (cardCustomId) {
    const payload = github.context.payload;
    core.info(`Merging to main, Branch name: ${cardCustomId}, pushed by ${payload.pusher.name}`);
    // result = await TrelloAutomation.moveCardToDone(cardCustomId);
}

async function onCreateBranch (branchName, cardCustomId, card) {
    const payload = github.context.payload;
    var branchUrl = `${payload.repository.html_url}/tree/${branchName}`;
    core.info(`Created new branch, ${branchName} with card custom ID ${cardCustomId}, branch url: ${branchUrl}`);
    return await _attachUrlToTrelloAndMoveCard(card.id, branchUrl, TRELLO_LIST_NAME_IN_PROGRESS);
}

async function onPullRequest (cardCustomId, card) {
    var result = {}
    const payload = github.context.payload;
    const branchName = process.env.BRANCH_NAME;
    const repoOwner = payload.repository.owner.login;
    const repoName = payload.repository.name;
    if (BUILD_FILE_NAME) {
        if (!BUILD_VERSION) {
            core.setFailed(`Workflow run without a build version is not allowed.`);
        }
        
        const changeLogBody = {
            repo: {
                owner: repoOwner,
                name: repoName
            },
            branch: {
                name: branchName,
                url: `${payload.repository.html_url}/tree/${branchName}`,
                commitsUrl: payload.pull_request._links.commits.href
            },
            release: {
                version: BUILD_VERSION,
                fileName: BUILD_FILE_NAME,
                url: `${M2M_314_WORKFLOW_URL_BASE}/download/${BUILD_FILE_NAME}`,
                headSha: payload.pull_request.head.sha
            },
            pr: {
                name: payload.pull_request.body ? payload.pull_request.body : 'PR',
                url: payload.pull_request.html_url
            },
            trello: {
                title: card.name,
                url: card.url
            }
        }

        const createCLResponse = await workflowService.createChangeLog(changeLogBody);
        if (!createCLResponse.success) {
            core.setFailed(`Failed to create change log ${JSON.stringify(createCLResponse)}`);
        }
        core.info('Change log created.')
    } else {
        core.info(`Workflow id not specified.`);
    }

    core.info(`PR created, Branch name: ${cardCustomId}, pull request URL: ${payload.pull_request.html_url}`);
    result = await _attachUrlToTrelloAndMoveCard(card.id, payload.pull_request.html_url, TRELLO_LIST_NAME_UNDER_REVIEW);
    if (payload.action === 'opened') {
        // todo core.error if failed
        await workflow.addPrComment(repoOwner, repoName, payload.pull_request.number, _buildTrelloLinkComment(card));
    }
    return result;
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
        var result = { success: true };

        // git create new branch triggered
        if (payload.ref_type && payload.ref_type === 'branch') {
            await onCreateBranch(branchName, cardCustomId, card);
        
        // git create pull request triggered
        } else if (payload.pull_request) {
            result = await onPullRequest(cardCustomId, card);
            
        // git push to main triggered
        } else if (payload.pusher) {
            result = await onPush(cardCustomId);
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
