const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const axios = require('axios');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});


// Ready event handler
client.on("ready", () => {
  client.user.setActivity("CrossChat 運行中");
  console.log(`在 ${client.guilds.cache.size} 個伺服器載入.`);
});



client.on('messageCreate', async (msg) => {
  if (msg.author.bot) return;
  if (msg.reference && msg.reference.messageId) {
    try {
      const repliedMessage = await msg.channel.messages.fetch(msg.reference.messageId);
      const repliedQuoteToken = repliedMessage.content.match(/-# quoteToken: ([\w-]+)/)?.[1];
      const repliedUserId = repliedMessage.content.match(/-# userId: ([\w]+)/)?.[1];

      if (repliedQuoteToken && repliedUserId) {
        const success = await sendToLine(msg.content, repliedUserId, repliedQuoteToken);
        if (success) {
          await msg.react('✅');
        } else {
          await msg.reply('傳送失敗，請稍後再試');
        }
        return;
      }
    } catch (error) {
      console.error('Error handling reply:', error);
      await msg.reply('處理回覆時發生錯誤');
      return;
    }
  }
  if (msg.content == "!cc ") {
    return msg.reply('CrossChat 指令說明:\n' + 
      '`!cc direct <userId> <message>` - 傳送直接訊息\n' +
      '`!cc reply <userId> <quoteToken> <message>` - 傳送回覆訊息');
  }

  const prefix = '!cc ';  // Added space after !cc 
  if (!msg.content.startsWith(prefix)) return;

  const args = msg.content.slice(prefix.length).trim().split(/ +/);
  const type = args.shift()?.toLowerCase();

  // Check for valid message type
  if (!['direct', 'reply'].includes(type)) {
    return msg.reply('請使用正確的類型: `direct` 或 `reply`');
  }

  if (type === 'direct' && args.length < 2) {
    return msg.reply('用法: `!cc direct <userId> <message>`'); 
  }

  if (type === 'reply' && args.length < 3) {
    return msg.reply('用法: `!cc reply <userId> <quoteToken> <message>`'); 
  }

  const lineUserId = args.shift();
  let lineMessage;
  let replyMessageId;


  if (type === 'reply') {
    replyMessageId = args.shift();
    lineMessage = args.join(' ');
    
    const success = await sendToLine(lineMessage, lineUserId, replyMessageId);
    if (success) {
        await msg.react('✅');
    } else {
      msg.reply('傳送失敗，請確認 LINE ID 與訊息ID。');
    }
  } else {
    lineMessage = args.join(' ');
    const success = await sendToLine(lineMessage, lineUserId);
    if (success) {
      msg.react('✅');
    } else {
      msg.reply('傳送失敗，請確認 LINE ID。');
    }
  }
});

async function sendToLine(message, userId, replyToken = null) {
  const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const apiUrl = 'https://api.line.me/v2/bot/message/push';
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${channelAccessToken}`
  };
  
  const messageObject = {
    type: 'text',
    text: message
  };

  // Add replyToken if it exists
  if (replyToken) {
    messageObject.quoteToken = replyToken;
  }
  
  const data = {
    to: userId,
    messages: [messageObject]
  };
  
  try {
    const response = await axios.post(apiUrl, data, { headers });
    console.log('傳送成功:', response.data);
    return true;
  } catch (error) {
    console.error('傳送失敗:', error.response?.data || error.message);
    return false;
  }
}
client.login(process.env.DISCORD_BOT_TOKEN);