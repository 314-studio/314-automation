const { Octokit } = require("octokit");
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const fetch = require('node-fetch');
const fs = require('fs');

async function addPrComment(owner, repo, issueNumber, comment) {
    const baseIssuesArgs = {
        owner: owner,
        repo: repo,
        issue_number: issueNumber
    };

    return octokit.rest.issues.createComment({
        ...baseIssuesArgs,
        body: comment
    });
};

async function getLastestArtifact(owner, repo, workflowRunId) {
    console.log(owner, repo, workflowRunId);
    const response = await octokit.request(
        'GET /repos/{owner}/{repo}/actions/artifacts?per_page={perPage}&page={page}',
        {
            owner: owner,
            repo: repo,
            perPage: '2',
            page: '1'
        }
    );
    console.log(response);
    return response.data.artifacts.find(it => it.workflow_run.id.toString() === workflowRunId);
}

async function downloadAndHostArtifact(owner, repo, artifactId, artifactName) {
    const response = await octokit.request('GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}/{archive_format}', {
        owner: owner,
        repo: repo,
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
        return { success: true, name: artifactName, url: `${process.env.M2M_314_WORKFLOW_URL_BASE}/download/${artifactName}.zip` }
    } else {
        return { success: false, msg: `Failed to download ${artifactName}`, response: response };
    }
}

async function getPrCommitsByUrl (url) {
    console.log(process.env.GITHUB_TOKEN);
    var response = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${ process.env.GITHUB_TOKEN }`,
            Accept: 'application/vnd.github+json'
        }
    }).catch(async err => {
        console.error('M2M API Error:', err);
        return;
    });
    return await response.json();
}

module.exports = {
    getLastestArtifact: getLastestArtifact,
    addPrComment: addPrComment,
    downloadAndHostArtifact: downloadAndHostArtifact,
    getPrCommitsByUrl: getPrCommitsByUrl
}
