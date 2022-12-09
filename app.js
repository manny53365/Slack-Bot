require('dotenv').config();

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
    
      console.log(process.env.AWS_ACCESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY, process.env.AWS_REGION);
    
      const params = {
        InstanceIds: [process.env.INSTANCE_ID]
      };
    
      try {
        const data = ec2.rebootInstances(params)
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

    try {
      // Send the initial message with the button elements:
      const response = await axios.post(process.env.REBOOT_BUTTON, message);
    
      console.log('Response:', response);
      console.log('Response data:', response.data);
    
      // Extract the value of the button clicked from the response data:
      const data = JSON.parse(response.data);
      const selectedValue = data.blocks[1].elements[0].value;
    
      // Create a new object for the response message without the button elements:
      const resData = {
        channel: channelId,
        text: `You selected: ${selectedValue}`
      };
    
      // Send the response message to the Slack channel:
      await axios.post(process.env.REBOOT_BUTTON, resData);
    } catch (err) {
      console.log(err);
    }
  }  

}
