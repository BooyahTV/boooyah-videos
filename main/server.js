const tmi = require('tmi.js');
var ComfyJS = require("comfy.js");
const settings = require("electron-settings");

const express = require('express');
const app = express();
const path = require('path');

const clientId = 'e640dd8ed90a47f197ba7d8f4c4b6291';
const clientSecret = '6cc3adebcc0e4aacbe6b5a089e6385eb';
const request = require('request');

const http = require("http");

const server = http.createServer(app);
const io = require("socket.io")(server, {
    cors: {
        origin: "*",
    },
});

//app.listen(8080);
server.listen(8080, () => console.log(`Listening on port 8080`));

app.set('views', path.join(__dirname, '../views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.get('/', (req,res) => {
    res.render('index.ejs');
});


app.use(express.static(path.join(__dirname, '..',"/renderer")));


// your application requests authorization
var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 
      'Authorization': 'Basic ' + (new Buffer(clientId + ':' + clientSecret).toString('base64'))
    },
    form: {
      grant_type: 'client_credentials'
    },
    json: true
};


var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.get("/overlay", (req, res) => {
    settings.get("twitch.name").then((channel) => {
        res.render('overlay_poll.ejs',{channel: channel});
    });
});


app.get("/overlayquestions", (req, res) => {
    settings.get("twitch.name").then((channel) => {
        res.render('overlay_preguntas.ejs',{channel: channel});
    });
});


app.get("/overlaysongrequest", (req, res) => {
    res.render('overlay_musica.ejs');
});

app.get("/overlayrate", (req, res) => {
    res.render('overlay_rate.ejs');
});

app.get("/overlayemotes", (req, res) => {
    res.render('overlay_emotecombo.ejs');
});

app.get("/overlaybackground", (req, res) => {
    res.render('overlay_background.ejs');
});

io.on("connection", async(socket) => {
    console.log("a user connected");

    // eventos enviados dedsde la pagina para la creacion de la poll
    socket.on("requestPoll", (poll) => {
        console.log(poll);
        io.emit("startPoll", poll);
    });

    socket.on("endPoll", () => {
        io.emit("endPoll");
        endPoll();
    });

    socket.on("hidePoll", () => {
        io.emit("hidePoll");
    });

    socket.on("showQuestionOnStream", (question) => {
        console.log('showQuestionOnStream')
        io.emit("showQuestionOnStream", question);
    });


    socket.on("hideQuestionOnStream", () => {
        io.emit("hideQuestionOnStream");
    });
    

    socket.on("showSong", (youtubeData) => {
        console.log('[original song] youtube song',youtubeData);

        io.emit("loadingSong");

        // TODO: ejecutar en cliente

        request.post(authOptions, async function(error, response, body) {
            if (!error && response.statusCode === 200) {

            var parsedArtist = parseArtist(youtubeData.artist)

            var parsedname = parseName(youtubeData.title, parsedArtist)

            console.log('Parsed songname',parsedname)
            console.log('Parsed artist',parsedArtist)

            // use the access token to access the Spotify Web API
            var token = body.access_token;

            var searchOptions = {
                url: `https://api.spotify.com/v1/search?type=track&q=track:${encodeURIComponent(parsedname)}+artist:${encodeURIComponent(parsedArtist)}`,
                headers: {
                    'Authorization': 'Bearer ' + token
                },
                json: true
            };

            request.get(searchOptions, function(error, response, body) {
                if(error) console.log(error)
                console.log('tracks encontrados:', body.tracks.items.length)

                // si no se encuentra la cancion, mandar info de youtube
                if (body.tracks.items.length == 0){
                    io.emit("showSong", {
                        youtube: true,
                        youtubeData: youtubeData
                    });
                    return
                }
                

                trackOptions = {
                    url: `https://api.spotify.com/v1/tracks/${body.tracks.items[0].id}`,
                    headers: {
                        'Authorization': 'Bearer ' + token
                    },
                    json: true
                };

                request.get(trackOptions, function(error, response, track) {
                    if (error) console.log(error)
                    console.log(track)

                    
                    artistOptions = {
                        url: `https://api.spotify.com/v1/artists/${body.tracks.items[0].artists[0].id}`,
                        headers: {
                            'Authorization': 'Bearer ' + token
                        },
                        json: true
                    };
                    
                    
                    request.get(artistOptions, function(error, response, artist) {
                        if (error) console.log(error)
                        console.log(artist)

                        var parsedName = parseTitles(track.name)
                        var parsedAlbum = parseTitles(track.album.name)

                        const data = {
                            youtube: false,
                            youtubeData: youtubeData,
                            title: parsedName,
                            artist: artist.name,
                            duration: track.duration_ms,
                            coverart: track.album.images[0].url,
                            releasedate: track.album.release_date,
                            albumName: parsedAlbum,
                            genres: artist.genres.slice(0,2)
                        }

                        console.log('song data',data)
                        io.emit("showSong", data);
   
                    });

                   
                });



            });
            }
        });


        /*api.track.search({
            track: youtubeData.title,
            artist: youtubeData.artist
        })
        .then(data => { 
            const tracks = data.results.trackmatches.track
            const song = tracks[0]
    
            console.log('[Best Search Engine] last fm song',song)

            // remove all text within () and []
            var parsedname = song.name.replace(/ \([\s\S]*?\)/g, '').replace(/ \[[\s\S]*?\]/g, '')
        

            genius.searchSong({
                apiKey: geniusApi,
                title: parsedname,
                artist: song.artist,
                optimizeQuery: true
            }).then((songs) => {
                if(songs != null){

                    io.emit("showSong",songs[0], youtubeData);
                    
                    console.log('[Cover art] genius song',songs[0])
                }else {
                    console.log('Song not found')
                    io.emit("notFound")
                }
            }).catch(err => {
                console.log(err)
            });
        
    
        })
        .catch(err => { console.error(err); });*/
       
    });

    
    socket.on("hideSong", () => {
        io.emit("hideSong");
    });

    socket.on("resumeSong", () => {
        io.emit("resumeSong");
    });

    socket.on("progress", (progress) => {
        io.emit("progress", progress);
    });

    socket.on("changeTtsLabel", (newLabel) => {
        console.log('tts label changed to',newLabel)
        io.emit("changeTtsLabel", newLabel);
    });

    socket.on("changeTtsCommand", (newCommand) => {
        console.log('tts command changed to',newCommand)
        io.emit("changeTtsCommand", newCommand);
        command = newCommand
    });

    socket.on("changeTtsEmote", (emoteurl) => {
        console.log('emote changed to',emoteurl)
        io.emit("changeTtsEmote", emoteurl);
    });

    socket.on("selectBackground", (url) => {
        console.log(url)
        io.emit("selectBackground", url);
    });
    socket.on("selectAnimation", (url) => {
        console.log(url)
        io.emit("selectAnimation", url);
    });
    
    

    // al desconectarse, finalisar la poll
    socket.on("disconnect", function() {
        // cancelar la poll

        io.emit("endPoll");
        setTimeout(() => {
            io.emit("hidePoll");
        }, 2000)
        endPoll();
    });
});

var command = 'pregunta'

function endPoll() {
    // finalisar el conteo de votos

    users = {};
}

var users = {};

var votes = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

//Object.keys(users).length


settings.get("twitch.name").then((channel) => {
    var client = new tmi.Client({
        channels: [ channel ]
    });

    client.connect()

    console.log('poll channel',channel)

    client.on('message', (channel, tags, message, self) => {
        io.emit("message", message, tags["display-name"])

        for (let i = 0; i < 9; i++) {
            if (message == i + 1 && !users[tags["display-name"]]) {
                votes[i]++;
                
                console.log(votes)
                
                io.emit("updateVote", i)
                
                users[tags["display-name"]] = true;
            }
            
        }

    });

    const urlRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gm

    ComfyJS.onCheer = ( user, message, bits, flags, extra ) => {
        console.log(bits)
        console.log(message)

        var result = message.match(urlRegex)
        console.log(result)
        if (bits > 50) {
            if(result){
                io.emit("background", result[0]);
            }
                
        }
    }

    ComfyJS.Init( channel );

});




function parseTitles(text) {
    return text.replace(/ \([\s\S]*?\)/g, '').replace(/ \[[\s\S]*?\]/g, '').replace(/:/g, "").replace(/-/g, "").replace(/VEVO/g, "")
}
function parseArtist(artist) {
    return artist.replace('VEVO','')
    .replace(/(_|-)/g, ' ')
        .trim()
        .replace(/\w\S*/g, function(str) {
            return str.charAt(0).toUpperCase() + str.substr(1)
        })   
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')   
        .replace('Topic', "")
}

function parseName(name, artist) {
    return name.replace(/ \([\s\S]*?\)/g, '')
    .replace(/ \[[\s\S]*?\]/g, '')
    .replace(/:/g, "")
    .replace(/-/g, "")
    .replace(artist.replace('VEVO',''),'')
    .replace(artist, "").trim()
}