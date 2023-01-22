const TrelloAutomation = require('./TrelloAPI');
const puppeteer = require('puppeteer');
const USER_DATA_DIR = '../chrome_user_data';

async function attachPullResuest(branchName) {
    var cardData = await TrelloAutomation.getCardByBranchName(branchName);
    var msg = "成功找到卡片!";
    if (cardData.cards) {
        if (cardData.cards.length = 1) {
            var card = cardData.cards[0];
            if (card.idShort === parseInt(branchName.split('-')[1])) {
                console.log(cardData);
                await attachPullResuestInBrowser(card.url);
                return { ...card, success: true, msg: msg + " " + card.shortUrl }
            } else {
                return { success: false, msg: `找到卡片但无法匹配卡片ID:${branchName}.`};
            }
        }
        return { success: false, msg: `找到${cardData.cards.length}个卡片.`};
    } else {
        return { success: false, msg: "Trello API 错误." + cardData };
    }
}

async function _logInToTrello() {
    const browser = await puppeteer.launch({headless: false, userDataDir: USER_DATA_DIR});
    try {
        const page = await browser.newPage();
        await page.goto('https://trello.com/b/nLoz3wA6/rls-314-2023', { timeout: 60000 });

        await page.click('button[data-testid="request-access-login-button"]');
        await _waitAndType(page, 'input#user', process.env.IT_USER_USERNAME);
        await page.click('input#login');
        await _waitAndType(page, 'input#password', process.env.IT_USER_PASSWORD);
        await page.click('button#login-submit');

        await _waitAndClick(page, '.js-pup-dropdown-list-btn');
        await _waitAndClick(page, '.board-menu-powerup');
        await _waitAndClick(page, '.pop-over-list > li:nth-child(2)');

        const githubAuthFrame = await (await page.waitForSelector('iframe.plugin-iframe')).contentFrame();
        await _delay(1000);
        await _waitAndClick(githubAuthFrame, 'button#authorize');

        const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page()))); 
        const githubLoginPage = await newPagePromise;
        await _waitAndType(githubLoginPage, 'input#login_field', process.env.IT_USER_USERNAME);
        await _waitAndType(githubLoginPage, 'input#password', process.env.IT_USER_PASSWORD);
        await _waitAndClick(githubLoginPage, 'input[type="submit"]');
    } catch (err) {
        _send_error_message(err);
    }
    await browser.close();
}

async function _waitAndClick(page, selector) {
    await page.waitForSelector(selector, {visible: true});
    await page.click(selector)
}

async function _waitAndType(page, selector, value) {
    await _waitAndClick(page, selector);
    await page.type(selector, value);
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

function _delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
 }

// userDataDir: USER_DATA_DIR
async function attachPullResuestInBrowser(url) {
    const browser = await puppeteer.launch({ headless: false, userDataDir: USER_DATA_DIR });
    const page = await browser.newPage();
    await page.goto(url);

    const loginButton = (await page.$('button[data-testid="request-access-login-button"]')) || "";

    if (loginButton) {
        await browser.close()
        await _logInToTrello();
        await attachPullResuestInBrowser(url);
    }

    await _waitAndClick(page, 'span[title="GitHub"]');
    await _waitAndClick(page, 'a[data-index="3"]');


    console.log(await page.url());
}

exports.attachPullResuest = attachPullResuest;