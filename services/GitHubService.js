const github = require('@actions/github');
const core = require('@actions/core');

const ghToken = core.getInput('github-repo-token');
const octokit = github.getOctokit(ghToken);
const payload = github.context.payload;

const baseIssuesArgs = {
    owner: (payload.organization || payload.repository.owner).login,
    repo: payload.repository.name,
    issue_number: payload.pull_request.number
};

function buildTrelloLinkComment (cardInfo) {
    return `![](https://github.trello.services/images/mini-trello-icon.png) [${cardInfo.name}](${cardInfo.url})`;
}

async function addPrComment (cardInfo) {
    var comment = buildTrelloLinkComment(cardInfo);
    return octokit.rest.issues.createComment({
        ...baseIssuesArgs,
        body: comment
    });
};

exports.addPrComment = addPrComment;