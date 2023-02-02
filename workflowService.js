const fetch = require('node-fetch');

const M2M_314_WORKFLOW_URL_BASE = process.env.M2M_314_WORKFLOW_URL_BASE;
const M2M_314_AUTOMATION_SECRET = process.env.M2M_314_AUTOMATION_SECRET;

const headers = {
    'Accept': 'application/json',
    'x-api-key': M2M_314_AUTOMATION_SECRET
}

async function _sendRequest (url, method) {
    return await fetch(url, {
        method: method,
        headers: headers
    }).catch(async err => {
        console.error('M2M API Error:', await err.response.text(), err);
        return;
    });
}

async function getCardByCustomId (cardCustomId) {
    var url = `${M2M_314_WORKFLOW_URL_BASE}/trello/cardCustomId/${cardCustomId}`;
    return await _sendRequest(url, 'GET');
}

async function attachUrlToTrello (cardId, url) {
    var url = `${M2M_314_WORKFLOW_URL_BASE}/trello/card/${cardId}/attachments?url=${url}`;
    await _sendRequest(url, 'POST');
}

async function moveCardToList (cardId, listName) {
    var url = `${M2M_314_WORKFLOW_URL_BASE}/trello/card/${cardId}/lists?listName=${listName}`;
    await _sendRequest(url, 'POST');
}

async function addPrComment (issueNumber, comment) {
    var url = `${M2M_314_WORKFLOW_URL_BASE}/github/issue/${issueNumber}/comments?comment=${comment}`;
    await _sendRequest(url, 'POST');
}

module.exports = {
    getCardByCustomId: getCardByCustomId,
    attachUrlToTrello: attachUrlToTrello,
    moveCardToList: moveCardToList,
    addPrComment: addPrComment
}