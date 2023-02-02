const TrelloAPI = require('./TrelloAPI');
const logger = require('./Logger');

async function attachUrl(cardId, url) {
    var attachments = await TrelloAPI.getTrelloCardAttachments(cardId);
    if (attachments.some(it => it.url === url)) {
        return { success: true, msg: "Url already existed on card." };
    }

    var result = await TrelloAPI.attachTrelloUrlAttachment(cardId, url);
    if (result.id) {
        return { success: true, msg: 'Successfully accached url.' };
    }
    return { success: false, msg: `Fail to attach url ${url} to card with id ${cardId}` };
}

async function moveCardToList(cardId, listName) {
    var list = await TrelloAPI.getListByName(listName);
    if (!list) {
        return { success: false, msg: `Error moving card with ${listName}`};
    }
    logger.info(`Moving card with ID ${cardId} to list ${listName}`);
    var list = await TrelloAPI.moveCardToList(cardId, list.id);
    return { success: true, msg: `Card moved to list ${listName}`};
}

async function getCardWithCustomId(cardCustomId) {
    var card = await TrelloAPI.getCardByCustomId(cardCustomId);
    if (card.idShort !== parseInt(cardCustomId.split('-')[1])) {
        var errorMsg = `Worng format of branch name ${cardCustomId} with card number: ${card.idShort}`;
        logger.error(errorMsg, card);
        return { success: false, msg: errorMsg};
    }
    return { success: true, msg: `Successfully get card with ${cardCustomId}`, ...card };
}

module.exports = {
    getCardWithCustomId: getCardWithCustomId,
    attachUrl: attachUrl,
    moveCardToList: moveCardToList
}