const fetch = require('node-fetch');
const core = require('@actions/core');

/*
 * @param {object} params api query paramters to merge in the request url
 * @queryOptions {object} queryOptions
 * api references https://developer.atlassian.com/cloud/trello/rest/api-group-search/#api-search-get
 */
function buildTrelloRequestUrl(query, entity, params) {
    var TRELLO_API_KEY = core.getInput('trello-key', { required: true });
    var TRELLO_TOKEN = core.getInput('trello-token', { required: true });
    var TRELLO_API_BASE_URL = core.getInput('trello-api-base', { required: true });

    var url = TRELLO_API_BASE_URL;

    if (query) {
        url += "search?query=";
        for (var key in query) {
            url += `${key}:"${query[key]}"`;
        }
    }

    if (entity) {
        url += `${entity.name}/${entity.id}/${entity.type}?`
    }

    if (params) {
        for (var key in params) {
            url += `&${key}=${params[key]}`;
        }
    }

    return url + `&key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
}

async function getCardByBranchName(branchName) {

    var fetchUrl = buildTrelloRequestUrl({
        name: branchName
    }, null, {
        modelTypes: "cards",
        card_fields: "idShort,shortUrl,url"
    });

    var response = await fetch(fetchUrl, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    }).catch(async err => {
        console.error(err);
        return "Trello API: " + await err.response.text();
    });

    return await response.json();
}

async function attachTrelloUrlAttachment(cardId, url) {

    var fetchUrl = buildTrelloRequestUrl(null, {
        name: 'cards',
        id: cardId,
        type: 'attachments'
    }, {
        url: url
    });
    console.log(fetchUrl);
    var response = await fetch(fetchUrl, {
        method: 'POST',
        headers: {
            'Accept': 'application/json'
        }
    }).catch(async err => {
        console.error(err);
        return "Trello API: " + await err.response.text();
    });

    return response;
}

exports.getCardByBranchName = getCardByBranchName;
exports.attachTrelloUrlAttachment = attachTrelloUrlAttachment;