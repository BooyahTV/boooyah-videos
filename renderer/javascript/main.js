const key = 'AIzaSyAv2ie_VWHHlbjLyF7xh7aJYdj4lIqsk_c'
const parts = 'snippet,statistics,contentDetails'

const ipcRenderer = require('electron').ipcRenderer;
const dialog = require('electron').remote.dialog 


var bannedVideos = []

// TODO: chage to api basedhttps://developers.google.com/youtube/v3/docs/videoCategories/list

var categories = [ 
    { id: 1,  name: "Cine y Animación" },
    { id: 2,  name: "Autos Y Vehiculos" },
    { id: 10, name: "Musica" },
    { id: 15, name: "Mascotas Y Animales" },
    { id: 17, name: "Deportes" },
    { id: 18, name: "Cortometrajes" },
    { id: 19, name: "Viajes Y Eventos" },
    { id: 20, name: "Videojuegos" },
    { id: 21, name: "Videoblogs" },
    { id: 22, name: "Gente Y Blogs" },
    { id: 23, name: "Comedia" },
    { id: 24, name: "Entretenimiento" },
    { id: 25, name: "Noticias Y Politica" },
    { id: 26, name: "Tutoriales y Bellesa" },
    { id: 27, name: "Educacion" },
    { id: 28, name: "Ciencia Y Tecnologia" },
    { id: 29, name: "Sin fines de lucro" },
    { id: 30, name: "Movies" },
    { id: 31, name: "Anime/Animación" },
    { id: 32, name: "Acción/Aventura" },
    { id: 33, name: "Clasicos" },
    { id: 34, name: "Comedia" },
    { id: 35, name: "Documental" },
    { id: 36, name: "Drama" },
    { id: 37, name: "Familiar" },
    { id: 38, name: "Extranjero" },
    { id: 39, name: "Horror" },
    { id: 40, name: "Sci-Fi/Fantasia" },
    { id: 41, name: "Thriller" },
    { id: 42, name: "Shorts" },
    { id: 43, name: "Shows" },
    { id: 44, name: "Trailer" }
]

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

function secoundsToHHMMSS(secounds){
    var duration = moment.duration(secounds, 'seconds');

    formated = duration.format("hh:mm:ss");

    if(formated.length < 3) formated += 's'

    return formated

    
}


var app = new Vue({
    el: "#app",
    data: {
        videos: [],
        products: [],
        watchedInSession: [],
        watchedInAlltime: [],

        videofilters: {
            shortvideos: true,
            musicalvideos: true,
            /* data */
            views: true,
            durationFormated: true,
            category: true,
            author: true,
            channel: true,
            publishedAt: true,
            likeratio: true,
            description: false,

        },
        
        showWatchedInSession: true,

        stores: ['mercadolibre','amazon','aliexpress','steam'],
        
        tabs: [
            {id: 'videos', name: 'Videos', enabled: true},
            {id: 'watchlater', name: 'Ver más tarde', enabled: true},
            {id: 'products', name: 'Tiendas', enabled: true}
        ],
        currentTab: 'videos'
    },
    methods: {
        setTab: function (tab) {
            this.currentTab = tab.id;
            console.log("tab '" + tab.id + "' selected");
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
        markVideoAsWatched: function(id){
            let index = this.videos.findIndex(x => x.id === id);

            this.videos[index].watched = true
        },
        markProductAsWatched: function(title){
            let index = this.products.findIndex(x => x.title === title);

            this.products[index].watched = true
        },
        readeableCategory: function(id) {
            var categoryName = ''
            categories.forEach(category => {
                if(category.id === Number(id)){
                    categoryName = category.name;
                } 
            })
            return categoryName
        },
        watchlaterDuration: function(){
            var durationInSecounds = 0;
            this.videos.forEach(video => {
                if(video.watchlater){
                    durationInSecounds+=video.durationSecounds
                } 
            })

            return secoundsToHHMMSS(durationInSecounds)
        }
    },
    computed: {
    	reversevideos() {
            return this.videos.slice().reverse();
        },
        reverseproducts() {
            return this.products.slice().reverse();
        },
    }
});


ipcRenderer.on('video', function (event, msg) {
    addVideo(msg.id,msg.platform, msg.username)
});  

ipcRenderer.on('product', addProduct);  

ipcRenderer.on('toggleStore', function (event, data) {

    const store = app.stores.find(store => store == data.store);

    if(data.status){
        app.stores.push(data.store)
    }else{
        const index = app.stores.indexOf(store);

        if (index > -1) {
            app.stores.splice(index, 1);
        }
    }

})

ipcRenderer.on('toggleTab', function (event, data) {

    const tab = app.tabs.find(tab => tab.id == data.id);

    tab.enabled = data.status

    // change the current active tab to the first enabled tab

    if(tab.id == app.currentTab){

        for (let i = 0; i < app.tabs.length; i++) {
            if(app.tabs[i].enabled){
                app.currentTab = app.tabs[i].id
                return
            }
            
        }
        
    }

})

ipcRenderer.on('filtervideos', function (event, filter) {
    console.log('filter aplied',filter)

    app.videofilters[filter.type] = filter.state;  

})

ipcRenderer.on('showWatchedInSession', function (event, data) {
    console.log('show watched videos during session (stream) status',data)
    app.showWatchedInSession = data.state
})

// Gets all videos watched in other streams
ipcRenderer.on('getAlltimeWatchedVideos', function (event, videos) {
    console.log('watched in all time videos',videos);

    if (videos != null){
        app.watchedInAlltime = videos
    }
});  

function addVideo(id, platform, username ){
    // avoid video repetition
    if( app.watchedInSession.includes(id)) return // refactor to sentInSession
    if( app.watchedInAlltime.includes(id)) return

    app.watchedInSession.push(id)

    fetch(`https://www.googleapis.com/youtube/v3/videos?part=${parts}&id=${id}&key=${key}`)
    .then(response => response.json())
    .then(youtubeVideo => {
        console.log('youtube api v3 response',youtubeVideo)
        
        let durationSecounds = formatISOtime(youtubeVideo.items[0].contentDetails.duration)
        var formattedDuration = secoundsToHHMMSS(durationSecounds)

        let likes = parseInt( youtubeVideo.items[0].statistics.likeCount )
        let dislikes = parseInt(  youtubeVideo.items[0].statistics.dislikeCount )

        let likeratio = Math.floor((100 * likes) / (likes + dislikes))
        
        let video = {
            author: username,
            
            id: id,
            url: 'https://youtu.be/'+id,

            thumbnail_url: youtubeVideo.items[0].snippet.thumbnails.medium.url,
            channel: youtubeVideo.items[0].snippet.channelTitle,
            title: youtubeVideo.items[0].snippet.localized.title,
            category: youtubeVideo.items[0].snippet.categoryId,
            publishedAt: youtubeVideo.items[0].snippet.publishedAt.split('T')[0],
            live: youtubeVideo.items[0].liveBroadcastContent,
            description: youtubeVideo.items[0].snippet.description,
            
            views: youtubeVideo.items[0].statistics.viewCount,
            durationSecounds: durationSecounds,
            durationFormated: formattedDuration,
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

function addProduct(event, product) {
    if( app.watchedInSession.includes(product.title)) return
    app.watchedInSession.push(product.title)

    app.products.push(product)

}

const client = new tmi.Client({
    identity: {
        username: 'elmarceloc',
        password: 'oauth:jnrg7yz2gr4fasktakkpswbngt63tc'
      },
	channels: [ 'cristianghost', 'notfijxu' ]
});

client.connect();

client.on('message', (channel, tags, message, self) => {
    console.log(channel, message)
    if(channel == '#notfijxu'){
        let username = message.split(' ')[1].replace(':','')
        ipcRenderer.send('sendLink', username, message, 'booyah' )
    }else{
        ipcRenderer.send('sendLink', tags['display-name'], message, 'twitch' )
    }
});



const notification = document.getElementById('notification');
const message_title = document.getElementById('message_title');
const message = document.getElementById('message');
const restartButton = document.getElementById('restart-button');

ipcRenderer.on('update_available', () => {
  ipcRenderer.removeAllListeners('update_available');
  message_title.innerText = '¡Actualisación Disponible!';
  message.innerHTML = '<i class="fas fa-download"></i> Descargando...';
  notification.classList.remove('hidden');
});

ipcRenderer.on('update_downloaded', () => {
  ipcRenderer.removeAllListeners('update_downloaded');
  message_title.innerText = 'Actualisación Descargada.';
  message.innerHTML = '<i class="fas fa-check"></i> Se instalara al reiniciar. ¿Quieres reiniciar ahora?';
  restartButton.classList.remove('hidden');
  notification.classList.remove('hidden');
});


function closeNotification() {
    notification.classList.add('hidden');
}
function restartApp() {
    ipcRenderer.send('restart_app');
}
