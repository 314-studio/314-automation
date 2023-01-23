const github = require('@actions/github');
const core = require('@actions/core');

const ghToken = core.getInput('github-repo-token');
const octokit = github.getOctokit(ghToken);

const baseIssuesArgs = {
    owner: (evthookPayload.organization || evthookPayload.repository.owner).login,
    repo: evthookPayload.repository.name,
    issue_number: evthookPayload.pull_request.number
};

function buildTrelloLinkComment (cardInfo) {
    return `![](https://github.trello.services/images/mini-trello-icon.png) [${cardInfo.name}](${cardInfo.url})`;
}

const addPrComment = async (cardInfo) => {
    var comment = buildTrelloLinkComment();
    return octokit.issues.createComment({
        ...baseIssuesArgs,
        comment
    });
};

exports.addPrComment = addPrComment;