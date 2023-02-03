const fetch = require('node-fetch');
const core = require('@actions/core');

// const M2M_314_WORKFLOW_URL_BASE = core.getInput('m2m-314-automation-base-url', { required: true });

// const headers = {
//     'Accept': 'application/json',
//     'x-api-key': core.getInput('m2m-314-automation-secret', { required: true })
// }

const M2M_314_WORKFLOW_URL_BASE = 'https://314studio.games:3443';

const headers = {
    'Accept': 'application/json',
    'x-api-key': '4b5db5f8b5ea4689882ec2c89f36bbbc5c761d7d6d85487a9f5896da17738f94'
}

async function _sendRequest (url, method) {
    var response = await fetch(url, {
        method: method,
        headers: headers
    }).catch(async err => {
        console.error('M2M API Error:', await err.response.text(), err);
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

async function addPrComment (issueNumber, comment) {
    var url = `${M2M_314_WORKFLOW_URL_BASE}/github/issue/${issueNumber}/comments?comment=${comment}`;
    return await _sendRequest(url, 'POST');
}

module.exports = {
    getCardByCustomId: getCardByCustomId,
    attachUrlToTrello: attachUrlToTrello,
    moveCardToList: moveCardToList,
    addPrComment: addPrComment
}