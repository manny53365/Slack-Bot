# Slack Bot using Genez.io

## How it works

The slack bot is designed to help a user in the following ways.

1. Automate the process of checking your Etherum node(s).
2. Send an automated message the the channel id specified in the .env file. The message will inform you of your node's status (i.e good or not responding/out of sync).
3. Should your node ever fall out of sync there are 3 potential potential fixes offered by the bot.

- The bot only informs the user and takes no action
- The bot will automatically send a reboot to the AWS instance(s) specified in the .env file.
- The bot will send a button to the slack chat asking the user for confirmation to reboot the AWS instance(s).

### Setting up your environment

When you download the files to your local system and unzip them in the directory you wish to use, the command install all of the node dependencies is `npm i`.
Once all of this has completed, you're ready to begin. This bot is using the genez.io platform, to install the dependencies and get this set up you can follow the instructions here [Genezio Github](https://github.com/Genez-io/genezio).

The genezio.yaml file will house your cron frequency (how often the check is done), by default I have set this to 5 minutes. This cron setting is based off of the AWS model, information to configure can be found here [Cron Expressions Documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/ScheduledEvents.html).

I have also included a dummy .env file with the proper variable names laid out. **You will need to enter your own value information for the code to work. I recommend you keep the variable names the same**
