const { BrowserWindow } = require("electron");
const colors = require('colors');

const og = require("open-graph");

const PriceFinder = require("price-finder");
const priceFinder = new PriceFinder();

const utf8 = require('utf8');

const request = require("request");
const cheerio = require('cherio')

const currencyRegex = /[$]\s+([^\s]+)/g;

exports.youtube = function(username, message, platform) {
  const prefix = /yt=([^\s]+)/g;
  const full = /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/g;

  urlRegex([prefix, full], message, function (id, index) {
    // if is the prefixed regex, cuts the prefix,
    // otherwise, cut the id part
    id = index == 0 ? id.substring(3) : id.slice(-11);

    console.log('video sent'.blue)

    BrowserWindow.getAllWindows()[0].webContents.send("video", {
      username: username,
      id: id,
      platform: platform,
    });
  });
}

exports.youtubeMusicVideo = function(username, message, platform) {
  const prefix = /yt=([^\s]+)/g;
  const full = /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/g;

  urlRegex([prefix, full], message, function (id, index) {
    // if is the prefixed regex, cuts the prefix,
    // otherwise, cut the id part
    id = index == 0 ? id.substring(3) : id.slice(-11);

    console.log('video sent'.blue)

    BrowserWindow.getAllWindows()[0].webContents.send("musicVideo", {
      username: username,
      id: id,
      platform: platform,
      message: message
    });
  });
}

exports.mercadolibre = function (username, message, platform) {
  const prefix = /ml=(.)([^\s]+)/g;
  const full =
    /(http|https):\/\/?(.)(?:www\.)?articulo.mercadolibre.cl(.)([^\s]+)/g;
  const baseUrl = "https://articulo.mercadolibre.cl/";

  urlRegex([prefix, full], message, function (id, index) {
    let url = "";

    if (index == 1) {
      url = encodeURI(id);
    } else {
      url = encodeURI(baseUrl + id.slice(3));
    }

    og(url, function (err, meta) {
      if (err) return;

      let title = meta.title.split("$");
      title.splice(-1); // remove the price in the title

      title = title.join("").slice(0, -2);

      // formats the price
      let priceCLP = Number(
        meta.title
          .match(currencyRegex)[0]
          .replace("$", "")
          .replace(/\./g, "")
          .trim()
      );

      let img = meta["image"] !== undefined ? meta.image.url : null;

      let product = {
        username: username,
        url: url,
        title: title,
        priceCLP: priceCLP,
        priceUSD: null,
        category: null,
        img: img,
        watched: false,
        store: "mercadolibre",
        storeReadeable: "Mercado Libre",
        platform: platform,
      };

      BrowserWindow.getAllWindows()[0].webContents.send("product", product);
    });
  });
}

exports.aliexpress = function (username, message, platform) {
  const prefix = /ae=(.)([^\s]+)/g;
  const full = /(?:https:\/\/)?(es|cl)\.aliexpress\.com\/(\S+)/g;
  const baseUrl = "https://es.aliexpress.com/";

  urlRegex([prefix, full], message, function (id, index) {
    let url = "";

    if (index == 1) {
      url = encodeURI(id);
    } else {
      url = encodeURI(baseUrl + id.slice(3) + ".html");
    }

    og(url, function (err, meta) {
      if (err) return;
      title = meta.title.split("|")[1];
      img = meta["image"] !== undefined ? meta.image.url : null;
      priceCLP = Number(meta.title.split("CLP")[0].trim());

      let product = {
        username: username,
        url: url,
        title: title,
        priceCLP: priceCLP,
        priceUSD: null,
        category: null,
        img: img,
        watched: false,
        store: "aliexpress",
        storeReadeable: "Aliexpress",
        platform: platform,
      };
      
      BrowserWindow.getAllWindows()[0].webContents.send("product", product);

    });
  });
}

exports.amazon = function (username, message, platform) {
  const prefix = /az=(.)([^\s]+)/g;
  const full = /(http|https):\/\/?(.)www.amazon.com(.)([^\s]+)/g;
  const baseUrl = "https://www.amazon.com/";

  urlRegex([prefix, full], message, function (id, index) {
    let url = "";

    if (index == 1) {
      url = encodeURI(id.replace("-/es/", "").split("/ref=")[0]);
    } else {
      url = encodeURI(baseUrl + id.slice(3));
    }

    priceFinder.findItemDetails(url, function (err, item) {
      if (err) return;
      console.log(item);

      let product = {
        username: username,
        url: url,
        title: item.name,
        priceCLP: null,
        priceUSD: item.price,
        category: item.category,
        img: null,
        watched: false,
        store: "amazon",
        storeReadeable: "Amazon",
        platform: platform,
      };
      
      BrowserWindow.getAllWindows()[0].webContents.send("product", product);
    });
  });
}

exports.steam = function (username, message, platform) {
  const prefix = /ae=(.)([^\s]+)/g;
  const full = /(?:https:\/\/)?store\.steampowered\.com\/(\S+)/g;
  const baseUrl = "https://store.steampowered.com/";

  urlRegex([prefix, full], message, function (id, index) {
    let url = "";

    if (index == 1) {
      url = encodeURI(id);
    } else {
      url = encodeURI(baseUrl + id.slice(3) + ".html");
    }

    og(url, function (err, meta) {
      if (err) return;

      let img = meta["image"] !== undefined ? meta.image.url : null;

      priceFinder.findItemDetails(url, function (err, item) {
        if (err) return;
        var price = item.price.toString().replace(/\./g, "");

        let product = {
            username: username,
            url: url,
            title: item.name,
            priceCLP: null,
            priceUSD: price,
            category: item.category,
            img: img,
            watched: false,
            store: "steam",
            storeReadeable: "Steam",
            platform: platform,
          };
          
          BrowserWindow.getAllWindows()[0].webContents.send("product", product);

      });
    });
  });
}

// TODO: clips de twitch

exports.clips = function (username, message, platform) {
  const prefix = /sv=(.)([^\s]+)/g;
  const full = /(?:https:\/\/)?streamvip\.app\/clips\/(\S+)/g;
  const baseUrl = "https://streamvip.app/clips/";

  urlRegex([prefix, full], message, function (id, index) {
    let url = "";

    if (index == 1) {
      url = encodeURI(id);
    } else {
      url = encodeURI(baseUrl + id.slice(3));
    }

    console.log(url)

    request({ encoding: null, method: "GET", uri: url }, function (error, response, body) {
      try {
        

        const $ = cheerio.load(body)
        
        const title = $('.title').text().replace('Clips','')
        const video = $('video').attr('src')
        const channelImage = $('.info img').attr('src')
        const details = $('.created small').text().trim().replace('h├í').split('Criado por')
        
        const createdAt = details[0].replace('há ','').trim()
        const author = details[1].trim()
      

      const clip = {
        username: username,
        title: title,
        createdAt: createdAt,
        author: author,
        url: url,
        video: video,
        channelImage: channelImage,
        platform: platform,
        watched: false
      }
      
      BrowserWindow.getAllWindows()[0].webContents.send("clip", clip);


      console.log(title)
      console.log(createdAt)
      console.log(author)
    } catch (error) {
        
    }
    });

  });
}

function urlRegex(regexs, message, callback) {

  regexs.forEach((regex, index) => {
    if (message.match(regex) !== null) {
      message.match(regex).forEach((id) => {
        callback(id, index);
      });
    }
  });
}