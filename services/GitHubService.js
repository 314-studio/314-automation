const { Octokit } = require("octokit");
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

async function addPrComment (issueNumber, comment) {
    console.log(issueNumber, comment);
    const baseIssuesArgs = {
        owner: process.env.GITHUB_REPO_OWNER,
        repo: process.env.GITHUB_REPO_NAME,
        issue_number: issueNumber
    };

    return octokit.rest.issues.createComment({
        ...baseIssuesArgs,
        body: comment
    });
};

exports.addPrComment = addPrComment;