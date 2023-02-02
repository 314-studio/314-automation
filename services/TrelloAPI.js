const fetch = require('node-fetch');
const logger = require('./Logger');

const TRELLO_API_KEY = process.env.TRELLO_API_KEY;
const TRELLO_TOKEN = process.env.TRELLO_TOKEN;
const TRELLO_API_BASE_URL = process.env.TRELLO_API_BASE_URL;
const TRELLO_BOARD_ID = process.env.TRELLO_BOARD_ID;


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

    logger.info(`Making request to ${url}`);

    url += `key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`;

    var response = await fetch(url, {
        method: method,
        headers: {
            'Accept': 'application/json'
        }
    }).catch(async err => {
        logger.error('Trello API', await err.response.text(), err);
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

    logger.error(`Cannot find list with list name ${listName}`, list);
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
        logger.log('Card moved to list.', cardId, listId);
        return response;
    }
    logger.error('Move card failed', response)
    return;
}

async function getCardByCustomId(cardCustomId) {
    var result =  await sendTrelloRequest('GET', {
        name: cardCustomId
    }, null, {
        modelTypes: "cards",
        card_fields: "name,idShort,shortUrl,url",
        idBoards: TRELLO_BOARD_ID
    });
    if (result.cards && result.cards.length === 1) {
        return result.cards[0];
    }
    logger.error("Trello API: Can not find card or find more than one cards.", result);
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