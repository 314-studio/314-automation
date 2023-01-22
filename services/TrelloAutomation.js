const TrelloAutomation = require('./TrelloAPI');

async function attachPullResuest(branchName, prUrl) {
    var cardData = await TrelloAutomation.getCardByBranchName(branchName);
    var msg = "成功找到卡片!";
    if (cardData.cards) {
        if (cardData.cards.length = 1) {
            var card = cardData.cards[0];
            if (card.idShort === parseInt(branchName.split('-')[1])) {
                var result = await TrelloAutomation.attachTrelloUrlAttachment(card.id, prUrl);
                if (result.id) {
                    return { ...card, success: true, msg: msg + " " + card.shortUrl }
                }
                return { success: false, msg: result };
            } else {
                return { success: false, msg: `找到卡片但无法匹配卡片ID:${branchName}.`};
            }
        }
        return { success: false, msg: `找到${cardData.cards.length}个卡片.`};
    } else {
        return { success: false, msg: "Trello API 错误." + cardData };
    }
}

async function _send_error_message(err) {
    console.error(_get_current_datetime(), err);
    // todo: send email message to the initiator and cc me.
}

function _get_current_datetime () {
    var dateNow = new Date();
    var offset = dateNow.getTimezoneOffset();
    dateNow = new Date(dateNow.getTime() - (offset*60*1000));
    return dateNow.toISOString();
}

exports.attachPullResuest = attachPullResuest;