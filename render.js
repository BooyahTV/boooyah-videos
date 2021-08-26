const key = 'AIzaSyAv2ie_VWHHlbjLyF7xh7aJYdj4lIqsk_c'
const parts = 'snippet,statistics,contentDetails'

const ipcRenderer = require('electron').ipcRenderer;
const dialog = require('electron').remote.dialog 


var banlist = []
var videolist = [] // for avoid repetition

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
            banlist.push(app.videos[index].id) 

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
      shortvideos: true,
    },
    methods: {
        banvideo: function(id){
            showBanVideoPrompt(id)
        }
    },
    computed: {
    	reversevideos() {
            return this.videos.slice().reverse();
        }    	
    }
});

ipcRenderer.on('shortvideos', function (event, data) {
    console.log('short videos',data)
    app.shortvideos = data.state
})

ipcRenderer.on('message', function (event, booyahMessage) {
    console.log(booyahMessage);

    if(banlist.includes(booyahMessage.id) || videolist.includes(booyahMessage.id)) return

    videolist.push(booyahMessage.id)

    fetch(`https://www.googleapis.com/youtube/v3/videos?part=${parts}&id=${booyahMessage.id}&key=${key}`)
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
            author: booyahMessage.username,
            
            thumbnail_url: youtubeVideo.items[0].snippet.thumbnails.medium.url,
            channel: youtubeVideo.items[0].snippet.channelTitle,
            title: youtubeVideo.items[0].snippet.localized.title,
            publishedAt: youtubeVideo.items[0].snippet.publishedAt.split('T')[0],
            views: youtubeVideo.items[0].statistics.viewCount,
            durationSecounds: durationSecounds,
            durationFormated: formattedDuration,
            url: 'https://youtu.be/'+booyahMessage.id,
            id: booyahMessage.id,
            likeratio:  likeratio
        }
    
        app.videos.push(video)
    });
    
});  