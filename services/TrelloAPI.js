const { response } = require('express');
const fetch = require('node-fetch');

/*
 * @param {object} params api query paramters to merge in the request url
 * @queryOptions {object} queryOptions
 * api references https://developer.atlassian.com/cloud/trello/rest/api-group-search/#api-search-get
 */
function buildTrelloRequestUrl(query, params) {
    var TRELLO_API_KEY = process.env.TRELLO_API_KEY;
    var TRELLO_TOKEN = process.env.TRELLO_TOKEN;
    var TRELLO_API_BASE_URL = 'https://api.trello.com/1/'

    var url = TRELLO_API_BASE_URL;

    if (query) {
        url += "search?query=";
        for (var key in query) {
            url += `${key}:"${query[key]}"`;
        }
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
    }, {
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
        return await err.response.text();
    });

    return await response.json();
}

exports.getCardByBranchName = getCardByBranchName;