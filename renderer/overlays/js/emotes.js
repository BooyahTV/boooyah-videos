const subsEmotesBaseURL = 'https://api.ivr.fi/twitch/allemotes/'

const globalBetterttvURL = "https://api.betterttv.net/3/cached/emotes/global";

const betterTTVChannelBaseURL = "https://api.betterttv.net/3/cached/users/twitch/";
const frankerfaceZChannelBaseURL = "https://api.frankerfacez.com/v1/room/id/";

const channelname = channel
const channelid = '149287198'


var twitchEmotes = [
    // https://twitchemotes.com

    { id: '425618', name: 'LUL' },
    { id: '160400', name: 'KonCha' },
    { id: '160404', name: 'TehePelo' },
    { id: '120232', name: 'TriHard' },
    { id: '114836', name: 'Jebaited' },
    { id: '84608', name: 'cmonBruh' },
    { id: '81248', name: 'OSFrog' },
    { id: '58765', name: 'NotLikeThis' },
    { id: '55338', name: 'KappaPride' },
    { id: '28087', name: 'WutFace' },
    { id: '27602', name: 'BuddhaBar' },
    { id: '22639', name: 'BabyRage' },
    { id: '3792', name: 'ANELE' },
    { id: '86', name: 'BibleThump' },
    { id: '69', name: 'BloodTrail' },
    { id: '41', name: 'Kreygasm' },
    { id: '25', name: 'Kappa' },
    { id: '1902', name: 'Keepo' },
    { id: '70433', name: 'KappaRoss' },
    { id: '81997', name: 'KappaWealth' },
    { id: '74510', name: 'KappaClaus' },
    { id: '461298', name: 'DarkMode' },
    { id: '245', name: 'ResidentSleeper' },
    { id: '114856', name: 'UncleNox' },

    { id: '46', name: "SSSsss", scaped: true },
    { id: '47', name: "PunchTrees", scaped: true },
    { id: '28', name: "MrDestructoid", scaped: true },
    { id: '191762', name: "Squid1", scaped: true },
    { id: '191763', name: "Squid2", scaped: true },
    { id: '191764', name: "Squid3", scaped: true },
    { id: '191767', name: "Squid4", scaped: true },


    { id: '354', name: '4Head' },
    { id: '38436', name: 'TTour' },
    { id: '106294', name: 'VoteNay' },
    { id: '106293', name: 'VoteYea' },
    { id: '52', name: 'SMOrc' },
    { id: '1441281', name: 'FBCatch' },
    { id: '1441276', name: 'FBBlock' },
    { id: '58127', name: 'CoolCat' },
    { id: '123171', name: 'CoolStoryBob' },
    { id: '301428702', name: 'BOP' },
    { id: '112292', name: 'TakeNRG' },	

    { id: '555555579', name: '8-)', scaped: true },
    { id: '2', name: ':(', scaped: true },
    { id: '1', name: ':)', scaped: true },
    { id: '555555559', name: ':-(', scaped: true },
    { id: '555555557', name: ':-)', scaped: true },
    { id: '555555586', name: ':-/', scaped: true },
    { id: '555555561', name: ':-D', scaped: true },
    { id: '555555581', name: ':-O', scaped: true },
    { id: '555555592', name: ':-P', scaped: true },
    { id: '555555568', name: ':-Z', scaped: true },
    { id: '555555588', name: ":-\\", scaped: true },
    { id: '555555583', name: ":-o", scaped: true },


];

bttvGlobalEmotes = []
frankerFaceZ = []
bttvChannelEmotes = []
channelSubsEmotes = []
sevenTvChannelEmotes = []
channelBadges = []

Promise.all([
        fetch(globalBetterttvURL).then((value) => value.json()),
        
        fetch(betterTTVChannelBaseURL + channelid).then((value) => value.json()),
        fetch(frankerfaceZChannelBaseURL + channelid).then((value) => value.json()),
        fetch(subsEmotesBaseURL + channelname).then((value) => value.json() ),
        fetch('https://api.7tv.app/v2/users/'+channelname+'/emotes').then((value) => value.json()),
    ])
    .then(([globalBetterttv, channelBetterttv, channelFrankerfaceZ, subsEmotes, channelSeventvEmotes]) => {

        
        // guardamos los emotes globales de bttv
        bttvGlobalEmotes = globalBetterttv

        // cargamos los emotes del canal (bttv)
        if (channelBetterttv.channelEmotes) {

            // añadimos los emotes de de canal de better ttv
            bttvChannelEmotes = channelBetterttv.channelEmotes

            // luevgo añadimos los emotes compartidos con otros canales, con al condicion
            // de que no se este en los emotes del canal

            for (let i = 0; i < channelBetterttv.sharedEmotes.length; i++) {
                var exists = false

                for (let j = 0; j < channelBetterttv.channelEmotes.length; j++) {
                    if(channelBetterttv.sharedEmotes[i].code == channelBetterttv.channelEmotes[j].code){
                        exists = true
                    }
                }
                // si no esta repetido el emote, lo agregamos al arreglo de emotes de canal
                if(!exists){
                    bttvChannelEmotes.push(channelBetterttv.sharedEmotes[i])
                }
            }
        }

        // cargamos los emotes del canal (ffz)

        if (channelFrankerfaceZ.status != 404) {
            
            frankerFaceZ = frankerFaceZ.concat(channelFrankerfaceZ.sets[Object.keys(channelFrankerfaceZ.sets)[0]].emoticons);

            // quitamos los emotes que ya estan en bttv

            frankerFaceZ = frankerFaceZ.filter(ffzEmote => {
                return !bttvGlobalEmotes.some((bttvEmote) => bttvEmote.code == ffzEmote.name);  
            })

            frankerFaceZ = frankerFaceZ.filter(ffzEmote => {
                return !bttvChannelEmotes.some((bttvEmote) => bttvEmote.code == ffzEmote.name);  
            })

        }

        /*if(subsEmotes.subEmotes.length > 0 ){
            channelSubsEmotes = subsEmotes.subEmotes[0].emotes
        }*/


        channelSeventvEmotes = channelSeventvEmotes.filter(stv => {
            return !bttvGlobalEmotes.some((bttvEmote) => bttvEmote.code == stv.name);  
        })

        channelSeventvEmotes = channelSeventvEmotes.filter(stv => {
            return !bttvChannelEmotes.some((bttvEmote) => bttvEmote.code == stv.name);  
        })

        channelSeventvEmotes = channelSeventvEmotes.filter(stv => {
            return !frankerFaceZ.some((ffzEmote) => ffzEmote.name == stv.name);  
        })

        channelSeventvEmotes = channelSeventvEmotes.filter(stv => {
            return !frankerFaceZ.some((ffzEmote) => ffzEmote.name == stv.name);  
        })

        sevenTvChannelEmotes = channelSeventvEmotes


        console.log("[BOOYAH.TV] subsEmotes: ", channelSubsEmotes);
        console.log("[BOOYAH.TV] channelBadges: ", channelBadges);
        console.log("[BOOYAH.TV] frankerFaceZ: ", frankerFaceZ);
        console.log("[BOOYAH.TV] bttvGlobalEmotes: ", bttvGlobalEmotes);
        console.log("[BOOYAH.TV] bttvChannelEmotes: ", bttvChannelEmotes);
        console.log("[BOOYAH.TV] sevenTvChannelEmotes: ", sevenTvChannelEmotes);

        app.emotes = parseEmotes()

    }
)
// find and replace all instances of an emote given the message and a regex rule.

function replaceEmote(msg, regex, url, fullurl, title, from) {

    var src = fullurl

    return msg.replace(
        regex,
        `<img title="${title}" class='emote in-chat-emote' rel="emote" src='${src}' data-fullemote="${fullurl}" data-from="${from}">`
    );
}

// remplaces all bettertTTV and frankerFaceZ emotes in a message.
function escapeRegex(string) {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function parseEmotes() {
    // TWITCH EMOTES
    var emotes = [];

    for (let i = 0; i < twitchEmotes.length; i++) {
        emotes.push({
            name: twitchEmotes[i].name,
            url:  `https://static-cdn.jtvnw.net/emoticons/v2/${twitchEmotes[i].id}/default/dark/4.0`
        })
    }

    // SUB EMOTES


    for (let i = 0; i < channelSubsEmotes.length; i++) {
        if (channelSubsEmotes[i].url) {
            emotes.push({
                name: channelSubsEmotes[i].code,
                url:  channelSubsEmotes[i].url
            })
        } else {
            emotes.push({
                name: channelSubsEmotes[i].code,
                url:  `https://static-cdn.jtvnw.net/emoticons/v2/${channelSubsEmotes[i].id}/default/dark/4.0`
            })
        }
    }

    // BETTER TTV GLOBAL EMOTES
    


    for (let i = 0; i < bttvGlobalEmotes.length; i++) {
        emotes.push({
            name: bttvGlobalEmotes[i].code,
            url:  `https://cdn.betterttv.net/emote/${bttvGlobalEmotes[i].id}/3x`
        })
    }


    // BETTER TTV CHANNEL EMOTES



    for (let i = 0; i < bttvChannelEmotes.length; i++) {
        emotes.push({
            name: bttvChannelEmotes[i].code,
            url:  `https://cdn.betterttv.net/emote/${bttvChannelEmotes[i].id}/3x`
        })
    }

    // FRANKER FACE Z EMOTES


    for (let i = 0; i < frankerFaceZ.length; i++) {
        emotes.push({
            name: frankerFaceZ[i].name,
            url:  `https://cdn.frankerfacez.com/emote/${frankerFaceZ[i].id}/4`
        })
    }


    // SEVEN 7V CHANNEL EMOTES


    for (let i = 0; i < sevenTvChannelEmotes.length; i++) {
        emotes.push({
            name: sevenTvChannelEmotes[i].name,
            url: `https://cdn.7tv.app/emote/${sevenTvChannelEmotes[i].id}/3x`
        })
    }

    for (let i = 0; i < sevenTvChannelEmotes.length; i++) {
        emotes.push({
            name: sevenTvChannelEmotes[i].name,
            url: `https://cdn.7tv.app/emote/${sevenTvChannelEmotes[i].id}/4x`
        })
    }
    

    return emotes.reverse();
}

function getEmoteFromMessage(message) {
    var emotes = parseEmotes()

    firstEmote = false

    emotes.forEach(emote => {
        if(message.includes(emote.name)){
            firstEmote = emote
        }
    })
    return firstEmote
}



// find and replace all instances of an emote given the message and a regex rule.

function replaceEmote(msg, regex, url, fullurl, title, from) {

    var src = fullurl

    return msg.replace(
        regex,
        `<img title="${title}" class='emote in-chat-emote' rel="emote" src='${src}' data-fullemote="${fullurl}" data-from="${from}">`
    );
}

// remplaces all bettertTTV and frankerFaceZ emotes in a message.
function escapeRegex(string) {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function replaceEmotes(msg) {
    // TWITCH EMOTES

    for (let i = 0; i < twitchEmotes.length; i++) {
        let regex = ''

        if (twitchEmotes[i].scaped) {
            regex = escapeRegex(twitchEmotes[i].name)
        } else {
            regex = "\\b" + twitchEmotes[i].name + "\\b"
        }

        regex = new RegExp(regex, "g"); // use scaped if exists

        let url = `https://static-cdn.jtvnw.net/emoticons/v2/${twitchEmotes[i].id}/default/dark/1.0`;
        let fullurl = `https://static-cdn.jtvnw.net/emoticons/v2/${twitchEmotes[i].id}/default/dark/4.0`;

        msg = replaceEmote(msg, regex, fullurl, fullurl, twitchEmotes[i].name, 'Twitch');
    }

    // SUB EMOTES


    for (let i = 0; i < channelSubsEmotes.length; i++) {
        let regex = new RegExp("\\b" + channelSubsEmotes[i].code + "\\b", "g");
        let url = ''
        let fullurl = ''

        if (channelSubsEmotes[i].url) {
            url = channelSubsEmotes[i].url
            fullurl = channelSubsEmotes[i].url
        } else {
            url = `https://static-cdn.jtvnw.net/emoticons/v2/${channelSubsEmotes[i].id}/default/dark/1.0`;
            fullurl = `https://static-cdn.jtvnw.net/emoticons/v2/${channelSubsEmotes[i].id}/default/dark/4.0`;
        }

        msg = replaceEmote(msg, regex, fullurl, fullurl, channelSubsEmotes[i].code, 'Subscriptor');
    }

    // BETTER TTV GLOBAL EMOTES
    


    for (let i = 0; i < bttvGlobalEmotes.length; i++) {
        let regex = new RegExp("\\b" + bttvGlobalEmotes[i].code + "\\b", "g");
        let url = `https://cdn.betterttv.net/emote/${bttvGlobalEmotes[i].id}/1x`;
        let fullurl = `https://cdn.betterttv.net/emote/${bttvGlobalEmotes[i].id}/3x`;

        msg = replaceEmote(msg, regex, fullurl, fullurl, bttvGlobalEmotes[i].code, 'Better TTV');
    }


    // BETTER TTV CHANNEL EMOTES



    for (let i = 0; i < bttvChannelEmotes.length; i++) {
        let regex = new RegExp("\\b" + bttvChannelEmotes[i].code + "\\b", "g");
        let url = `https://cdn.betterttv.net/emote/${bttvChannelEmotes[i].id}/1x`;
        let fullurl = `https://cdn.betterttv.net/emote/${bttvChannelEmotes[i].id}/3x`;

        msg = replaceEmote(msg, regex, fullurl, fullurl, bttvChannelEmotes[i].code, 'Better TTV');
    }

    // FRANKER FACE Z EMOTES


    for (let i = 0; i < frankerFaceZ.length; i++) {
        let regex = new RegExp("\\b" + frankerFaceZ[i].name + "\\b", "g");
        let url = `https://cdn.frankerfacez.com/emote/${frankerFaceZ[i].id}/1`;
        let fullurl = `https://cdn.frankerfacez.com/emote/${frankerFaceZ[i].id}/4`;

        msg = replaceEmote(msg, regex, fullurl, fullurl, frankerFaceZ[i].name, 'Franker Face Z');
    }


    // SEVEN 7V CHANNEL EMOTES


    for (let i = 0; i < sevenTvChannelEmotes.length; i++) {
        let regex = new RegExp("\\b" + sevenTvChannelEmotes[i].name + "\\b", "g");
        let url = `https://cdn.7tv.app/emote/${sevenTvChannelEmotes[i].id}/1x`;
        let fullurl = `https://cdn.7tv.app/emote/${sevenTvChannelEmotes[i].id}/3x`;

        msg = replaceEmote(msg, regex, fullurl, fullurl, sevenTvChannelEmotes[i].name, '7 TV');
    }

    return msg;
}
