const TrelloAPI = require('./TrelloAPI');

async function attachPullResuest(branchName, prUrl) {
    var cardData = await TrelloAPI.getCardByBranchName(branchName);
    var msg = "成功找到卡片!";
    if (cardData.cards) {
        if (cardData.cards.length = 1) {
            var card = cardData.cards[0];
            if (card.idShort === parseInt(branchName.split('-')[1])) {
                var attachments = await TrelloAPI.getTrelloCardAttachments(card.id);
                if (attachments) {
                    if (attachments.some(it => it.url === prUrl)) {
                        return { success: true, msg: "Pull request 已经被添加到卡片上了" };
                    } 

                    var result = await TrelloAPI.attachTrelloUrlAttachment(card.id, prUrl);
                    if (result.id) {
                        return { ...card, success: true, msg: msg + " " + card.shortUrl }
                    }
                    return { success: false, msg: result };

                } else {
                    return { success: false, msg: attachments };
                }
            } else {
                return { success: false, msg: `找到卡片但无法匹配卡片ID:${branchName}.`};
            }
        }
        return { success: false, msg: `找到${cardData.cards.length}个卡片.`};
    } else {
        return { success: false, msg: "Trello API 错误." + cardData };
    }
}

exports.attachPullResuest = attachPullResuest;