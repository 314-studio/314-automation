const fetch = require('node-fetch');
const core = require('@actions/core');

const TRELLO_API_KEY = core.getInput('trello-key', { required: true });
const TRELLO_TOKEN = core.getInput('trello-token', { required: true });
const TRELLO_API_BASE_URL = core.getInput('trello-api-base', { required: true });
const TRELLO_BOARD_ID = core.getInput('trello-board-id', { required: true });


async function sendTrelloRequest(method, query, entity, params) {
    var url = TRELLO_API_BASE_URL;

    if (query) {
        url += "search?query=";
        for (var key in query) {
            url += `${key}:"${query[key]}"`;
        }
        url += '&';
    }

    if (entity) {
        url += `${entity.name}/${entity.id}/${entity.type}?`;
    }

    if (params) {
        for (var key in params) {
            url += `${key}=${params[key]}&`;
        }
    }

    core.info(`Making request to ${url}`);

    url += `key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`;

    var response = await fetch(url, {
        method: method,
        headers: {
            'Accept': 'application/json'
        }
    }).catch(async err => {
        console.error(err);
        core.setFailed("Trello API: " + await err.response.text());
        return;
    });

    return await response.json();
}

async function getListByName(listName) {
    var lists = await sendTrelloRequest('GET', null, {
        name: 'boards',
        id: TRELLO_BOARD_ID,
        type: 'lists'
    }, null);

    var list = lists.find(it => it.name === listName);

    if (list) {
        return list;
    }

    console.log(lists)
    core.setFailed(`Cannot find list with list name ${listName}`);
    return;
}

async function moveCardToList(cardId, listId) {
    var response = await sendTrelloRequest('PUT', null, {
        name: 'cards',
        id: cardId,
        type: ""
    }, {
        idList: listId
    });
    if (response.id) {
        return;
    }
    console.log(response);
    core.setFailed(`Move card failed, ${response}`);
    return;
}

async function getCardByCustomId(cardCustomId) {
    var result =  await sendTrelloRequest('GET', {
        name: cardCustomId
    }, null, {
        modelTypes: "cards",
        card_fields: "name,idShort,shortUrl,url"
    });
    if (result.cards && result.cards.length === 1) {
        return result.cards[0];
    }
    console.log(result);
    core.setFailed("Trello API: Can not find card or find more than one cards.");
    return;
}

async function attachTrelloUrlAttachment(cardId, url) {
    return await sendTrelloRequest('POST', null, {
        name: 'cards',
        id: cardId,
        type: 'attachments'
    }, {
        url: url
    });
}

async function getTrelloCardAttachments(cardId) {
    return await sendTrelloRequest('GET', null, {
        name: 'cards',
        id: cardId,
        type: 'attachments'
    }, null);
}

module.exports = {
    getCardByCustomId: getCardByCustomId,
    attachTrelloUrlAttachment: attachTrelloUrlAttachment,
    getTrelloCardAttachments: getTrelloCardAttachments,
    getListByName: getListByName,
    moveCardToList: moveCardToList
}