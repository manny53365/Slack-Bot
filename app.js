require('dotenv').config();

// Require the Node Slack SDK package (github.com/slackapi/node-slack-sdk)
const { WebClient, LogLevel } = require("@slack/web-api");

const express = require('express');
const bodyParser = require('body-parser');
const cron = require('./cron');

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));

//Project requirements: 
// The slack bot should me keep my Ethereum Node up, running and syncing without issues and with minimal cost. 
// The Slack Bot will notify me when the Ethereum Node is synced or if it is downed. 
// If the node is having a problem I can ask the Slack Bot to restart the Node.

// WebClient instantiates a client that can call API methods
// When using Bolt, you can use either `app.client` or the `client` passed to listeners.
const client = new WebClient(process.env.BOT_TOKEN, {
    // LogLevel can be imported and used to make debugging simpler
    logLevel: LogLevel.DEBUG
  });

// ID of the channel you want to send the message to
const channelId = process.env.CHANNEL_ID;

//challenge code for bot on slack

// app.post('/', function(req,res){

//   const {challenge} = req.body;

//   res.send({challenge})
// });

app.get('/', function(req,res){
  res.send('This is an API');
})

try {
    // Call the chat.postMessage method using the WebClient
    const result = client.chat.postMessage({
      channel: channelId,
      text: "Bot initialized"
    });
  
    console.log(result);
  }
  catch (error) {
    console.error(error);
  };

// event for app mention to bot in the 'general' channel
app.post('/', function(req,res) {
    let payload = req.body;
    res.sendStatus(200);
    
    if (payload.event.type === 'app_mention') {
      if (payload.event.text.includes(' status')){
        client.chat.postMessage(
          {channel: channelId,
          text: "Status request received"
          }
        
        )
      }
    };
  
    if (payload.event.type === 'app_mention') {
      if (payload.event.text.includes(' help')){
        client.chat.postMessage(
          {channel: channelId,
          text: "Use \'@status bot status\' to check the node status"
          }
        )
      }
    };
  })

app.listen(3000, function(){
  console.log('Started listening on port 3000');
})