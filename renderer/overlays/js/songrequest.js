const socket = io("ws://localhost:8080"); //199.195.254.68

var app = new Vue({
    el: "#app",
    data: {
        visible: false,
        loading: false,
        youtube: false,
        song: '',
        artist: '',
        coverart: '',
        duration: '',
        releasedate: '',
        author: '',
        authorcolor: '',
        albumName: '',
        genres: '',
        emote: '',
        progress: 0
    }
});

socket.on("loadingSong", () => {
    app.loading = true
    app.progress = 0
})

socket.on("progress", (progress) => {
    app.progress = (progress * 350)/100
})


socket.on("showSong", (song) => {
    console.log(song);

    app.visible = true
    app.loading = false

    // reset values to default
    app.duration = ''
    app.releasedate = ''
    app.albumName = ''
    app.genres = ''
    app.emote = ''

    // change data depending if its from youtube or spotify
    if(song.youtube){
        app.song = song.youtubeData.title
        app.artist = song.youtubeData.artist
        app.coverart = song.youtubeData.thumbnail
    } else{
        app.song = song.title
        app.artist = song.artist
        app.coverart = song.coverart
        app.releasedate = song.releasedate
        app.albumName = song.albumName
        app.genres = song.genres.join(', ')
        app.duration = secoundsToHHMMSS(song.duration)

        // find emote if exists
        Object.entries(genres).forEach(([key, value]) => {
            if(song.genres[0].replace(/ /g, "-").includes(key)){
                app.emote = value
                console.log('emote found')
            } 
        });

    }

    // both

    app.youtube = song.youtube
    app.author = song.youtubeData.submiter.trim()
    app.authorcolor = song.youtubeData.submiterColor                
});


socket.on("resumeSong", (song) => {

    app.visible = true
                
});


socket.on("hideSong", (song) => {

    app.visible = false
                
});


function secoundsToHHMMSS(millisecouns) {
    
    return moment.utc(millisecouns).format("mm:ss")
  }
  