const fetch = require('node-fetch');
const core = require('@actions/core');

const M2M_314_WORKFLOW_URL_BASE = core.getInput('m2m-314-automation-base-url', { required: true });

const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'x-api-key': core.getInput('m2m-314-automation-secret', { required: true })
}

async function _sendRequest (url, method) {
    var response = await fetch(url, {
        method: method,
        headers: headers
    }).catch(async err => {
        console.error('M2M API Error:', err);
        return;
    });
    return await response.json();
}

async function getCardByCustomId (cardCustomId) {
    var url = `${M2M_314_WORKFLOW_URL_BASE}/trello/cardCustomId/${cardCustomId}`;
    return await _sendRequest(url, 'GET');
}

async function attachUrlToTrello (cardId, url) {
    var url = `${M2M_314_WORKFLOW_URL_BASE}/trello/card/${cardId}/attachments?url=${url}`;
    return await _sendRequest(url, 'POST');
}

async function moveCardToList (cardId, listName) {
    var url = `${M2M_314_WORKFLOW_URL_BASE}/trello/card/${cardId}/lists?listName=${listName}`;
    return await _sendRequest(url, 'POST');
}

async function addPrComment (owner, repo, issueNumber, comment) {
    var url = `${M2M_314_WORKFLOW_URL_BASE}/github/owner/${owner}/repo/${repo}/issue/${issueNumber}/comments?comment=${comment}`;
    return await _sendRequest(url, 'POST');
}

async function downloadArtifact (owner, repo, workflowId) {
    var url = `${M2M_314_WORKFLOW_URL_BASE}/github/owner/${owner}/repo/${repo}/workflow/${workflowId}/artifact/latest/download`;
    return await _sendRequest(url, 'POST');
}

async function createChangeLog (body) {
    var url = `${M2M_314_WORKFLOW_URL_BASE}/docs/changelog`;
    var response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
    }).catch(async err => {
        console.error('M2M API Error:', err);
        return;
    });
    return await response.json();
}

module.exports = {
    getCardByCustomId: getCardByCustomId,
    attachUrlToTrello: attachUrlToTrello,
    moveCardToList: moveCardToList,
    addPrComment: addPrComment,
    downloadArtifact: downloadArtifact,
    createChangeLog: createChangeLog
}