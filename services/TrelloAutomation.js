const TrelloAPI = require('./TrelloAPI');
const core = require('@actions/core');

const TRELLO_LIST_NAME_DONE = core.getInput('trello-list-name-done', { required: true });
const TRELLO_LIST_NAME_UNDER_REVIEW = core.getInput('trello-list-name-under-review', { required: true });
const TRELLO_LIST_NAME_IN_PROGRESS = core.getInput('trello-list-name-in-progress', { required: true });

async function _attachGitHubUrl(cardCustomId, url) {
    var card = await _findCardByCustomId(cardCustomId);
    var msg = "成功找到卡片!";

    var attachments = await TrelloAPI.getTrelloCardAttachments(card.id);
    if (attachments.some(it => it.url === url)) {
        return { success: true, msg: "Pull request/Branch 已经被添加到卡片上了" };
    }

    var result = await TrelloAPI.attachTrelloUrlAttachment(card.id, url);
    if (result.id) {
        return { ...card, success: true, msg: msg + " " + card.shortUrl }
    }
    console.log(result);
    core.setFailed(`Fail to attach github url.`)
    return { success: false };
}

async function attachPullResuest(cardCustomId, prUrl) {
    var result = await _attachGitHubUrl(cardCustomId, prUrl);
    if (result.id) {
        await _moveCardToList(result, TRELLO_LIST_NAME_UNDER_REVIEW);
    }
    return result;
}

async function attachNewBranch(cardCustomId, branchUrl) {
    var result = await _attachGitHubUrl(cardCustomId, branchUrl);
    if (result.id) {
        await _moveCardToList(result, TRELLO_LIST_NAME_IN_PROGRESS);
    }
    return result;
}

async function _moveCardToList(card, listName) {
    var list = await TrelloAPI.getListByName(listName);
    core.info(`Moving card ${card.name} to list ${list.name}`);
    await TrelloAPI.moveCardToList(card.id, list.id);
}

async function _findCardByCustomId(cardCustomId) {
    var card = await TrelloAPI.getCardByCustomId(cardCustomId);
    if (card.idShort !== parseInt(cardCustomId.split('-')[1])) {
        console.log(card);
        core.setFailed(`Worng format of branch name ${cardCustomId} with card number: ${card.idShort}`);
    }
    return card;
}

async function moveCardToDone(cardCustomId) {
    var card = await _findCardByCustomId(cardCustomId);
    await _moveCardToList(card, TRELLO_LIST_NAME_DONE);
    return { ...card, success: true }
}

module.exports = {
    attachPullResuest: attachPullResuest,
    attachNewBranch: attachNewBranch,
    moveCardToDone: moveCardToDone
}