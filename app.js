require('dotenv').config({override: true});
// added as a work around

const { WebClient, LogLevel } = require("@slack/web-api");
const axios = require('axios');
const AWS = require("aws-sdk");

export class checkNodeHealth {

  async checkNodeStatusTest(){

    const self = this;

    const client = new WebClient(process.env.BOT_TOKEN, {
      // LogLevel can be imported and used to make debugging simpler
      logLevel: LogLevel.DEBUG
    });

    // ID of the channel you want to send the message to
    const channelId = process.env.CHANNEL_ID;

    // block number trackers
    let ethBlockNum = 0;
    let bWareBlockNum = 0;

    const data = {
      jsonrpc:"2.0",
      method:"eth_blockNumber",
      params:[],
      id:1
    };

    async function ethBlockNumFunc() {
      try{
        const response = await axios.post(process.env.ENDPOINT_URL,data)
        ethBlockNum = BigInt(response.data.result).toString();
        return ethBlockNum = 0
      } catch (err) {
        console.log(err);
      }
    };

    async function bWareBlockNumFunc() {
      try{
        const response = await axios.post(process.env.BWARE_NODE_URL,data)
        bWareBlockNum =  BigInt(response.data.result).toString();
        return bWareBlockNum
      } catch (err) {
        console.log(err);
      }
    };

    async function differenceCalculation() {
      let difference = Math.abs(ethBlockNum - bWareBlockNum);

      difference <= 3 ? nodeIsHealthy() :

      difference > 3  && process.env.REPAIR_OPTION === 'none' ? informUserOutOfSync() : difference > 3  && process.env.REPAIR_OPTION === 'auto' ? rebootEC2Instance() : difference > 3  && process.env.REPAIR_OPTION === 'manual' ? self.outOfSyncNodeHandlerReboot() : configIsInvalid();
    };

    async function nodeIsHealthy(){
      try {
        await client.chat.postMessage({
          channel: channelId,
          text: `Your Etherum node is healthy.`
        });
      } catch (err) {
          console.log(err);
        }
    };

    async function informUserOutOfSync(){
      try {
        await client.chat.postMessage({
          channel: channelId,
          text: `Your Etherum node is out of sync.`
        });
      } catch (err) {
          console.log(err);
        }
    };

    async function rebootEC2Instance() {

      const ec2 = new AWS.EC2({accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION
      });
    
      const params = {
        InstanceIds: [process.env.INSTANCE_ID]
      };
    
      try {
        const data = await ec2.rebootInstances(params).promise();
        console.log(data);
      } catch (err) {
        console.error(err);
      }

      client.chat.postMessage({
        channel: channelId,
        text: `Your Etherum node is out of sync, rebooting...`
      });

    };

    async function configIsInvalid(){
      try {
        await client.chat.postMessage({
          channel: channelId,
          text: `The value you entered '${process.env.REPAIR_OPTION}' is not valid. The valid options available are 'none', 'auto' or 'manual', please update your .env file.`
        });
      } catch (err) {
          console.log(err);
        }
    }

    async function performAllActions(){
      const ethBlockNumFuncResult = await ethBlockNumFunc();
      const bwareBlockNumFuncResult = await bWareBlockNumFunc();
      const doCalculation = await differenceCalculation();
    return ethBlockNumFuncResult, bwareBlockNumFuncResult, doCalculation
    };

    await performAllActions();
  }

  async outOfSyncNodeHandlerReboot() {

    const client = new WebClient(process.env.BOT_TOKEN, {
      // LogLevel can be imported and used to make debugging simpler
      logLevel: LogLevel.DEBUG
    });

    const message = {
      "blocks": [
        {
          "type": "header",
          "text": {
            "type": "plain_text",
            "text": "Your node is out of sync, would you like to reboot?",
            "emoji": true
          }
        },
        {
          "type": "actions",
          "elements": [
            {
              "type": "button",
              "text": {
                "type": "plain_text",
                "emoji": true,
                "text": "Approve"
              },
              "style": "primary",
              "value": "Approve"
            },
            {
              "type": "button",
              "text": {
                "type": "plain_text",
                "emoji": true,
                "text": "Reject"
              },
              "style": "danger",
              "value": "Reject"
            }
          ]
        }
      ]
    }

    const channelId = process.env.CHANNEL_ID;

    await axios.post(process.env.REBOOT_BUTTON, message).then(payload => {

      console.log(payload);

      // const responseUrl = response_url;

      const userAction = actions[0].value;

      console.log(payload);

      // let action = payload.actions[0].value;

      // console.log(action);

      async function sendResponse(){
        await axios.post(responseUrl, {text: `Input received: ${userAction}`}).then(console.log('Successfully sent response!')).catch(err => {console.log(err)});
  
        if (userAction.value === "Approve") {
          console.log('found it!')
          rebootApproved();
        } else {
          console.log('Not found')
          rebootRejected();
        }
      }

      sendResponse();

      return {status:200, statusText: 'OK'}
    }); 

    async function rebootApproved(){
      try {
        client.chat.postMessage({
          channel: channelId,
          text: `Reboot has been approved, rebooting...`
        });
      } catch (err) {
        console.log(err);
      }
    }

    async function rebootRejected(){
      try {
        client.chat.postMessage({
          channel: channelId,
          text: `Reboot has been rejected.`
        });
      } catch (err) {
        console.log(err);
      }
    }

    }
}
