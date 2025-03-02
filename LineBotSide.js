const { Webhook } = require('discord-webhook-node');
require('dotenv').config();
const hook = new Webhook(process.env.DISCORD_WEBHOOK_URL);
const linebot = require("linebot");
var bot = linebot({
  channelId: process.env.LINE_CHANNEL_ID,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
});

// 當有人傳送訊息給Bot時
bot.on("message", async function (event) {
  try {
    let userId = event.source.userId;
    let userName = "使用者"; // 預設使用者名稱

    // 取得使用者名稱
    let profile = await bot.getUserProfile(userId);
    if (profile && profile.displayName) {
      userName = profile.displayName;
    }
    console.log(profile)
    console.log(event)
    let replyMsg = `${event.message.text}`;
    let quoteToken = event.quoteToken;
    // 傳到Discord
    hook.setUsername(userName);
    hook.setAvatar(profile.pictureUrl)
    hook.send(`${replyMsg}\n-# quoteToken: ${event.message.quoteToken}\n-# userId: ${userId}`);
  } catch (error) {
    console.error("取得使用者失敗:", error);
  }
});

// Bot所監聽的webhook路徑與port
bot.listen("/linewebhook", 3000, function () {
  console.log("[Websocket 已準備就緒]");
  console.log("[LINE Bot 已啟動]");
  console.log("Webhook URL: " + "localhost:3000/linewebhook" );
});
