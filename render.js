const key = 'AIzaSyAv2ie_VWHHlbjLyF7xh7aJYdj4lIqsk_c'
const parts = 'snippet,statistics,contentDetails'

const ipcRenderer = require('electron').ipcRenderer;
const dialog = require('electron').remote.dialog 


var bannedVideos = []


function showBanVideoPrompt(id){

    let index = app.videos.findIndex(x => x.id === id);

    dialog.showMessageBox(
    { 
        type:'warning',
        message: '¿Estas seguro que deseas banear "'+app.videos[index].title+'" ?',
        buttons: ["yes", "no"],
        defaultId: 0, // bound to buttons array
        cancelId: 1 // bound to buttons array
    })
    .then(result => {
        if (result.response === 0) {
            // lo agregamos a la banlist
            bannedVideos.push(app.videos[index].id) 

            // borramos el video de la lista actual
            if (index > -1) {
                app.videos.splice(index, 1);
            }

        } else if (result.response === 1) {
            
            
        }
    }
    );
}

function formatISOtime(duration) {
    var a = duration.match(/\d+/g);

    if (duration.indexOf('M') >= 0 && duration.indexOf('H') == -1 && duration.indexOf('S') == -1) {
        a = [0, a[0], 0];
    }

    if (duration.indexOf('H') >= 0 && duration.indexOf('M') == -1) {
        a = [a[0], 0, a[1]];
    }
    if (duration.indexOf('H') >= 0 && duration.indexOf('M') == -1 && duration.indexOf('S') == -1) {
        a = [a[0], 0, 0];
    }

    duration = 0;

    if (a.length == 3) {
        duration = duration + parseInt(a[0]) * 3600;
        duration = duration + parseInt(a[1]) * 60;
        duration = duration + parseInt(a[2]);
    }

    if (a.length == 2) {
        duration = duration + parseInt(a[0]) * 60;
        duration = duration + parseInt(a[1]);
    }

    if (a.length == 1) {
        duration = duration + parseInt(a[0]);
    }
    return duration
}


var app = new Vue({
    el: "#app",
    data: {
        videos: [],
        watchedInSession: [],
        watchedInAlltime: [],
        shortvideos: true,
        showWatchedInSession: true,
        tabs: ['Videos', 'Ver más tarde'],
        currentTab: 'Videos'
    },
    methods: {
        setTab: function (tabName) {
            this.currentTab = tabName;
            console.log("tab '" + tabName + "' selected");
        },
        addToBanVideos: function(id){
            showBanVideoPrompt(id)
        },
        addToWatchlater: function(id){
            let index = this.videos.findIndex(x => x.id === id);

            this.videos[index].watchlater = true
        },
        removeFromWatchlater: function(id){
            let index = this.videos.findIndex(x => x.id === id);

            this.videos[index].watchlater = false
        },
        markAsWatched: function(id){
            let index = this.videos.findIndex(x => x.id === id);

            this.videos[index].watched = true
        },
    },
    computed: {
    	reversevideos() {
            return this.videos.slice().reverse();
        }    	
    }
});

ipcRenderer.on('message', function (event, booyahMessage) {
    console.log(booyahMessage);
    
    addVideo(booyahMessage.id, booyahMessage.username, 'booyah')
});  

/* persistan watched in-all-time videos*/
ipcRenderer.on('shortvideos', function (event, data) {
    console.log('short videos',data)
    app.shortvideos = data.state
})

ipcRenderer.on('showWatchedInSession', function (event, data) {
    console.log('show watched videos during session (stream) status',data)
    app.showWatchedInSession = data.state
})

// Gets all videos watched in other streams
ipcRenderer.on('getAlltimeWatchedVideos', function (event, videos) {
    console.log('watched in all time videos',videos);

    app.watchedInAlltime = videos
});  


function addVideo(id, username, platform){
    // avoid video repetition
    if( app.watchedInSession.includes(id)) return
    if( app.watchedInAlltime.includes(id)) return

    app.watchedInSession.push(id)


    fetch(`https://www.googleapis.com/youtube/v3/videos?part=${parts}&id=${id}&key=${key}`)
    .then(response => response.json())
    .then(youtubeVideo => {

        console.log('youtube api v3 response',youtubeVideo)
        
        let durationSecounds = formatISOtime(youtubeVideo.items[0].contentDetails.duration)

        var duration = moment.duration(durationSecounds, 'seconds');
        var formattedDuration = duration.format("hh:mm:ss");

        let likes = parseInt( youtubeVideo.items[0].statistics.likeCount )
        let dislikes = parseInt(  youtubeVideo.items[0].statistics.dislikeCount )

        let likeratio = Math.floor((100 * likes) / (likes + dislikes))
        
        let video = {
            author: username,
            
            thumbnail_url: youtubeVideo.items[0].snippet.thumbnails.medium.url,
            channel: youtubeVideo.items[0].snippet.channelTitle,
            title: youtubeVideo.items[0].snippet.localized.title,
            publishedAt: youtubeVideo.items[0].snippet.publishedAt.split('T')[0],
            channel: youtubeVideo.items[0].snippet.channelTitle,
            views: youtubeVideo.items[0].statistics.viewCount,
            durationSecounds: durationSecounds,
            durationFormated: formattedDuration,
            url: 'https://youtu.be/'+id,
            id: id,
            likeratio:  likeratio,
            platform: platform,
            watchlater: false,
            watched: false
        }
    
        // if video is added, store in "all time watched" array
        ipcRenderer.send('storeVideo', id)

        app.videos.push(video)
    });
}

const youtubeRegex = /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/g

const client = new tmi.Client({
	channels: [ 'cristianghost' ]
});

client.connect();

client.on('message', (channel, tags, message, self) => {
	console.log(channel,message,tags,self);

	if(message.match(youtubeRegex) !== null){
		message.match(youtubeRegex).forEach((youtubeURL) => {
			addVideo(youtubeURL.slice(-11), tags['display-name'], 'twitch')
		});
	}

});
		