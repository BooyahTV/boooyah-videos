const puppeteer = require("puppeteer-core");
const cheerio = require("cherio");
const locateChrome = require("locate-chrome");

const links = require("./links");

const chatroomID = "79543340";
const chatroomURL = "https://booyah.live/standalone/chatroom/" + chatroomID;

exports.scrapChatLinks = async function() {
  // finds the chrome .exe
  const executablePath = await new Promise((resolve) =>
    locateChrome((arg) => resolve(arg))
  );

  const browser = await puppeteer.launch({
    args: [`--no-sandbox`],
    //headless: false,
    executablePath: executablePath,
  });

  const page = await browser.newPage();

  console.log("Loading Chatroom Page..", chatroomURL);
  await page.goto(chatroomURL);

  console.log("Loading Chat..");

  // wait unitl the page loads .scollbar-container (chat)
  await page.waitForSelector(".scroll-container");
  console.log("Chat Loaded, waiting for messages..");

  await page.exposeFunction("onNewMessage", readMessage);

  await page.evaluate(() => {
    console.log("mutation observer inserted");
    const target = document.querySelector(".scroll-container");
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          onNewMessage(mutation.addedNodes.item(0).innerHTML);
        }
      }
    });
    observer.observe(target, { childList: true });
  });
}

function readMessage(newMessage) {
  const $ = cheerio.load(newMessage);

  const username = $(".username").text();
  const message = $(".message-text").text();

  console.log('[Booyah]',username + ": " + message);

  links.youtube(username, message, "booyah");

  links.mercadolibre(username, message, "booyah");

  links.aliexpress(username, message, "booyah");

  links.amazon(username, message, "booyah");

  links.steam(username, message, "booyah");
}
