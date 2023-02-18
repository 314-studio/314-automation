const { gql, GraphQLClient } = require('graphql-request');
const githubService = require('./GitHubService');
const cheerio = require('cheerio');
const format = require('html-format');

const M2M_314_DOCS_API_BASE = process.env.M2M_314_DOCS_API_BASE;
const CHANGE_LOG_DOC_ID = process.env.CHANGE_LOG_DOC_ID;

const wikiCLient = new GraphQLClient(M2M_314_DOCS_API_BASE, {
    headers: {
        Authorization: `Bearer ${process.env.M2M_314_DOCS_API_TOKEN}`,
    }
});
async function addNewRelease(body) {
    const cardId = body.trello.customId;
    const commits = await githubService.getPrCommitsByUrl(body.branch.commitsUrl);

    if (body.release && body.release.fileName) {
        body.release.url = `${process.env.M2M_314_WORKFLOW_URL_BASE}/download/${body.release.fileName}`;
    }

    const response = await getChangeLogContent();

    if (!response) {
        return { success: false, msg: 'Cannot find page content!', ...body }
    }

    const $ = cheerio.load(response.pages.single.content);
    if ($(`section[id="${cardId}"]`).html()) {
        const minorReleaseUl = $(`section[id="${cardId}"] ul`);
        for (commit of commits.reverse()) {
            if ($(`#${commit.sha}`, minorReleaseUl).html()) {
                continue;
            }
            var minorHTML = '';
            if (commit.sha === body.release.headSha) {
                minorHTML = _buildMinorReleaseHTML(commit, body.release);
            } else {
                minorHTML = _buildMinorReleaseHTML(commit);
            }
            minorReleaseUl.prepend(minorHTML);
        }
    } else {
        const html = _buildMajorReleaseHTML(body);
        $('body').prepend(html);

        const minorReleaseUl = $(`section[id="${cardId}"] ul`);
        for (commit of commits.reverse()) {
            var minorHTML = '';
            if (commit.sha === body.release.headSha) {
                minorHTML = _buildMinorReleaseHTML(commit, body.release);
            } else {
                minorHTML = _buildMinorReleaseHTML(commit);
            }
            minorReleaseUl.append(minorHTML);
        }
    }
    const updateResult = await updateChangeLogContent($('body').html());
    if (updateResult.errors) {
        return { success: false, msg: `Failed updating change log, ${updateResult.errors[0].message}` };
    }
    return { success: true, msg: 'Successfully updated change log.'}
}

function _buildMajorReleaseHTML (body) {
    const html = `
    <section id="${body.trello.customId}">
        <h1>v${body.release.version}</h1>
        <p>
            分支 <a href="${body.branch.url}">${body.branch.name}</a><br>
            拉取请求 <a href="${body.pr.url}">${body.pr.name}</a><br>
            最新构建：<a href="${body.release.url}">${body.release.fileName}</a><br>
            Trello: <a href="${body.trello.url}">${body.trello.title}</a>
        </p>
        <p><strong>提交历史</strong></p>
        <ul></ul>
    </section>
    `;
    return format(html);
}

function _buildMinorReleaseHTML (commit, release) {
    var commitDate = new Date(commit.commit.author.date);
    const html = `
        <li id="${commit.sha}">
            ${commit.commit.author.name} 在 
            ${commitDate.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}
            ${release ? release.version : '未构建'}
            ${ release ? `<a href="${release.url}">${release.fileName}</a>` : '' }
            <a href="${commit.html_url}">${commit.commit.message}</a>
        </li>
    `;
    return format(html);
}

async function updateChangeLogContent (content) {
    const query = gql`
    mutation ($con: String!) {
        pages {
            update (id: ${CHANGE_LOG_DOC_ID}, content: $con, tags: [], isPublished: true) {
                responseResult {
                    succeeded
                    slug
                    message
                }
                page {
                    id
                }
            }
        }
    }`;
    return await wikiCLient.request(query, { con: content }).catch(err => {
        console.error(err);
    });
}

async function getChangeLogContent () {
    const query = gql`
    {
        pages {
            single (id: ${CHANGE_LOG_DOC_ID}) {
                path
                title
                createdAt
                updatedAt
                content
            }
        }
    }`;
    return await wikiCLient.request(query).catch(err => {
        console.error(err);
    });
}

module.exports = {
    addNewRelease: addNewRelease
}
