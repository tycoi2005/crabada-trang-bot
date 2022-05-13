const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TOKEN;
// old market
//const mkturl = "https://marketplace.crabada.com/?breed_count=0&breed_count=5&currentType=selling&legend=0&legend=6&order=asc&order_by=price&page=1&price_range=0&price_range=15001&pure=0&pure=6"
//const apiurl = "https://api.crabada.com/public/crabada/selling?limit=20&page=1&from_breed_count=0&to_breed_count=5&from_legend=0&to_legend=6&from_pure=0&to_pure=6&from_price=0&to_price=1.5001e%2B22&orderBy=price&order=asc"

const mkturl = "https://market.crabada.com/?breed_count=0&breed_count=5&currentType=selling&legend=0&legend=6&order=asc&order_by=price&page=1&price_range=0&price_range=15001&pure=0&pure=6"
const apiurl = "https://market-api.crabada.com/public/crabada/selling?limit=20&page=1&from_breed_count=0&to_breed_count=5&from_legend=0&to_legend=6&from_pure=0&to_pure=6&from_price=0&to_price=1.5001e%2B22&orderBy=price&order=asc"

const fetchUrl = require("fetch").fetchUrl;
const schedule = require('node-schedule');
const cronTime = "* * * * *" // every five minutes
const groupChatId = -642386289

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const resp = match[1] + " chatID: " + chatId; // the captured "whatever"

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp);
});


// Matches "/echo [whatever]"
bot.onText(/\/check/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  doCheckCrab(chatId)
  
});

const doCheckCrab = (chatId) => {
  fetchUrl(apiurl, function(error, meta, body){
                if (!body){ return }

                let doc = JSON.parse(body.toString());
                if (!doc || !doc.result || !doc.result.data ) { return }
                items = doc.result.data;
                totalRecord = doc.result.totalRecord;
                //console.log("items:",items)
                console.log("totalRecord:",totalRecord)
                if (totalRecord<1) return;
                for (let i =0; i< items.length; i++){
                  let item = items[i];
                  console.log("item",item);
                  if (item.breed_count < 1 && item.price < 1.5001e+22){
                    bot.sendMessage( chatId , getCrabHTML(item), {parse_mode:'HTML'})
                    return
                  }

                  if (item.breed_count >= 1 && item.price < 1.2000e+22){
                    bot.sendMessage( chatId , getCrabHTML(item), {parse_mode:'HTML'})
                    return
                  }
                }
                // send back the matched "whatever" to the chat
                // bot.sendMessage(chatId, "totalRecord: " + doc.result.totalRecord);
            });
}

const getCrabHTML = (crab) =>{
  let url = "https://market.crabada.com/crabada/"+crab.id;
  let str = 'found crab <a href="' + url + '"> price ' + crab.price +', breed_count ' + crab.breed_count + '</a>'
  return str;
}


let checkCrabJob = schedule.scheduleJob(cronTime, function () {
    console.log("doCheckCrab chatID #" + groupChatId)
    doCheckCrab(groupChatId)
})