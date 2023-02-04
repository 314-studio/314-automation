const { Octokit } = require("octokit");
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const fetch = require('node-fetch');
const fs = require('fs');

const githubRepoOwner = process.env.GITHUB_REPO.split('/');
const GITHUB_OWNER = githubRepoOwner[0];
const GITHUB_REPO = githubRepoOwner[1];

async function addPrComment(issueNumber, comment) {
    console.log(issueNumber, comment);
    const baseIssuesArgs = {
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        issue_number: issueNumber
    };

    return octokit.rest.issues.createComment({
        ...baseIssuesArgs,
        body: comment
    });
};

async function getLastestArtifact(workflowRunId) {
    const response = await octokit.request(
        'GET /repos/{owner}/{repo}/actions/artifacts?per_page={perPage}&page={page}',
        {
            owner: GITHUB_OWNER,
            repo: GITHUB_REPO,
            perPage: '2',
            page: '1'
        }
    );
    return response.data.artifacts.find(it => it.workflow_run.id.toString() === workflowRunId);
}

async function downloadAndHostArtifact(artifactId, artifactName) {
    const response = await octokit.request('GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}/{archive_format}', {
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        artifact_id: artifactId,
        archive_format: 'zip'
    });

    if (response.status === 200) {
        const res = await fetch(response.url);
        const buffer = await res.buffer();
        await fs.promises.writeFile(`${__dirname}/../public/${artifactName}.zip`, buffer)
            .catch(err => {
                return { success: false, msg: `Failed to download ${artifactName}, ${err}` };
            });
        return { success: true, url: `${process.env.M2M_314_WORKFLOW_URL_BASE}/download/${artifactName}.zip` }
    } else {
        return { success: false, msg: `Failed to download ${artifactName}`, response: response };
    }
}

module.exports = {
    getLastestArtifact: getLastestArtifact,
    addPrComment: addPrComment,
    downloadAndHostArtifact: downloadAndHostArtifact
}
