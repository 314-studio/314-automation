const github = require('@actions/github');

const ghToken = core.getInput('repo-token');
const octokit = new github.GitHub(ghToken);

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