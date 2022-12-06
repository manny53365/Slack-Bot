require('dotenv').config();

const { WebClient, LogLevel } = require("@slack/web-api");
const axios = require('axios');

//challenge code for bot on slack

// app.post('/', function(req,res){

//   const {challenge} = req.body;

//   res.send({challenge})
// });

export class checkNodeHealth {

  checkNodeStatusTest = () => {

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
      } catch (err) {
        console.log(err);
      }
    };

    ethBlockNumFunc();

    async function bWareBlockNumFunc() {
      try{
        const response = await axios.post(process.env.BWARE_NODE_URL, data)
        bWareBlockNum =  BigInt(response.data.result).toString();
      } catch (err) {
        console.log(err);
      }
    };

    bWareBlockNumFunc();

    async function differenceCalculation() {
      let difference = Math.abs(ethBlockNum - bWareBlockNum);

      let text;

      difference <= 3 ? text=`Your Etherum node is healthy.` : text=`Your Etherum node is out of sync.`

      try {
        await client.chat.postMessage({
          channel: channelId,
          text: `${text}`
        });
      } catch (err) {
        console.log(err);
      }
    };

    differenceCalculation();
  }
}
