const core = require('@actions/core');
const github = require('@actions/github');
const TrelloAutomation = require('./services/TrelloAutomation');

try {
//   const branchName = core.getInput('branch-name');
//   const prUrl = core.getInput('pr-url');
//   console.log(`Targeted branch ${branchName}, PR link ${prUrl}.`);

  // async () => await TrelloAutomation.attachPullResuest(branchName, prUrl)

  const time = (new Date()).toTimeString();
  core.setOutput("time", time);
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}