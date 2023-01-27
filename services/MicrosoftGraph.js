const msal = require('@azure/msal-node');
const fetch = require('node-fetch');
const core = require('@actions/core');
// const graph = require('@microsoft/microsoft-graph-client');

require('dotenv').config();

// documentation https://learn.microsoft.com/en-us/azure/active-directory/develop/tutorial-v2-nodejs-console

// const msalConfig = {
//     auth: {
//         clientId: core.getInput('graph-client-id', { required: true }),
//         authority: core.getInput('aad-endpoint', { required: true }) + '/' + core.getInput('graph-client-id'),
//         clientSecret: core.getInput('graph-client-secret', { required: true }),
//     }
// };
const msalConfig = {
    auth: {
        clientId: process.env.CLIENT_ID,
        authority: process.env.AAD_ENDPOINT + '/' + process.env.TENANT_ID,
        clientSecret: process.env.CLIENT_SECRET,
    }
};

const tokenRequest = {
    scopes: [process.env.GRAPH_ENDPOINT + '/.default'],
};

const apiConfig = {
    uri: process.env.GRAPH_ENDPOINT + '/v2.0/users',
};

console.log(msalConfig);

const cca = new msal.ConfidentialClientApplication(msalConfig);

async function getToken(tokenRequest) {
    return await cca.acquireTokenByClientCredential(tokenRequest);
}


async function sendMail(endpoint, accessToken) {
    const message = {
        subject: "hello2",
        body: {
          content: "hello again",
          contentType: 'text'
        },
        sender: {
            emailAddress: {
                address: "ituser.314@outlook.com"
            }
        },
        toRecipients: [
          {
            emailAddress: {
              address: "sunchuanop@outlook.com"
            }
          }
        ]
      };

      const jsonMessage = JSON.stringify({
        message: message
      });

      console.log(jsonMessage);

    var response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            headers: {'Content-Type': 'application/json'}
        },
        data: jsonMessage
    }).catch(err => {
        console.error(err);
        return "MS Graph API: " + err;
    });

    return await response.json();
};

module.exports = {
    getToken: getToken,
    sendMail: sendMail
};