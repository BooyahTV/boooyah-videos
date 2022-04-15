var isDev = false;

const socket = io("ws://localhost:8080");

const key = "AIzaSyAv2ie_VWHHlbjLyF7xh7aJYdj4lIqsk_c";
const videoParts = "snippet,statistics,contentDetails";
const channelParts = "snippet,statistics,contentDetails,brandingSettings";

var youtube = require('youtube-iframe-player');

const ipcRenderer = require("electron").ipcRenderer;
//const dialog = require("electron").remote.dialog;

const { remote  } = require("electron");
const { dialog } = require('@electron/remote')

//const { Menu, MenuItem } = remote;

var bannedVideos = [];

var voices = [
  'Mia',
  'Enrique',
  'Conchita',
  'Miguel'
]

// TODO: change to api based https://developers.google.com/youtube/v3/docs/videoCategories/list

var categories = [
  { id: 1, name: "Cine y Animación" },
  { id: 2, name: "Autos Y Vehiculos" },
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
  { id: 44, name: "Trailer" },
];

function formatISOtime(duration) {
  var a = duration.match(/\d+/g);

  if (
    duration.indexOf("M") >= 0 &&
    duration.indexOf("H") == -1 &&
    duration.indexOf("S") == -1
  ) {
    a = [0, a[0], 0];
  }

  if (duration.indexOf("H") >= 0 && duration.indexOf("M") == -1) {
    a = [a[0], 0, a[1]];
  }
  if (
    duration.indexOf("H") >= 0 &&
    duration.indexOf("M") == -1 &&
    duration.indexOf("S") == -1
  ) {
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
  return duration;
}

function secoundsToHHMMSS(secounds) {
  var duration = moment.duration(secounds, "seconds");

  formated = duration.format("hh:mm:ss");

  if (formated.length < 3) formated += "s";

  return formated;
}

var app = new Vue({
  el: "#app",
  data: {
    videos: [],
    products: [],
    clips: [],
    sentInSession: [],
    sentInSessionMusic: [],
    sentInAlltime: [],

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
    jam: '',
    volume: 100,
    songrequstison: false,
    isDefaultVideo: true,
    paused: false,
    lastSong: null,
    songslist: [
     /* {
        id: 'DHcG1v74MY8',
        title: 'Esta temblando 2.0 | CristianGhost Clips',
        artist: 'Tiago_facha'
      },
      {
        id: 'mBjpVJKqOlI',
        title: 'Baile de pana con la Cynthia y casi se lekea | CristianGhost Clips',
        artist: 'Tiago_facha'
      },
      {
        id: 'sv0DkJR5HCU',
        title: 'CristianGhost Reacciona a su Abecedario',
        artist: 'MacFlai'
      },*/
    ],

    channels: [],

    showSentInSession: true,

    stores: ["mercadolibre", "amazon", "aliexpress", "steam"],

    tabs: [
      { id: "videos", name: "Videos", icon: "https://cdn.betterttv.net/emote/56cb56f5500cb4cf51e25b90/1x" , enabled: true },
      { id: "watchlater", name: "Ver más tarde", icon: "https://cdn.betterttv.net/emote/5e0502e69e2cd00d968d5677/1x", enabled: true },
      { id: "songrequest", name: "Song Request", icon: "https://cdn.betterttv.net/emote/5f1b0186cf6d2144653d2970/1x", enabled: true }, 
      { id: "poll", name: "Encuestas", icon: "https://cdn.betterttv.net/emote/5aa16eb65d4a424654d7e3e5/1x", enabled: true },
      { id: "questions", name: "Mensajes", icon: "https://cdn.betterttv.net/emote/5f71b705c2f3a70b1ae58709/1x", enabled: true },
      { id: "backgrounds", name: "Fondos", icon: "https://cdn.betterttv.net/emote/60a7489567644f1d67e8a245/1x", enabled: true },
      { id: "clips", name: "Clips", enabled: true },
      { id: "channels", name: "Canales", enabled: false },
      { id: "products", name: "Tiendas", enabled: false },
    ],
    currentTab: "backgrounds",
    questionPoll: "",
    alternatives: [""],
    stateBtn: 'Iniciar',
    pollState: false,
    pollSlots: [],
    selectedPollSlot: 0,
    isQuestionOnStream: false,
    questionsState: false,
    questions: [],
    currentQuestion: 0,
    questionTts: true,
    showAutoOnStream: true,
    ttsLabel: 'dice',
    ttsCommand: 'pregunta',
    voice: 'Mia',
    randomvoice: true,
    emotes: [],
    background: '',
    backgrounds: ['https://cdn.betterttv.net/emote/583089f4737a8e61abb0186b/3x'],
    chatBackgrounds: []
  },
  methods: {
    setTab: function (tab) {
      this.currentTab = tab.id;
      console.log("tab '" + tab.id + "' selected");

      handleJquery()
    },
    addToBanVideos: function (id) {
      let index = this.videos.findIndex((x) => x.id === id);

      this.videos[index].watched = true;

      ipcRenderer.send("storeVideo", id);
    },
    addToWatchlater: function (id) {
      let index = this.videos.findIndex((x) => x.id === id);

      this.videos[index].watchlater = true;
      ipcRenderer.send("addWatchLaterVideo", this.videos[index]);
    },
    removeFromWatchlater: function (id) {
      let index = this.videos.findIndex((x) => x.id === id);

      this.videos[index].watchlater = false;
    },
    markAsWatched: function (arr, id) {
      let index = arr.findIndex((x) => x.id === id);

      arr[index].watched = true;

      ipcRenderer.send("storeVideo", id);
    },
    readeableCategory: function (id) {
      var categoryName = "";
      categories.forEach((category) => {
        if (category.id === Number(id)) {
          categoryName = category.name;
        }
      });
      return categoryName;
    },
    totalItemsInWatchLater: function () {
      return this.videos.filter(video => {
        return video.watchlater && !video.watched
      }).length

    },
    totalItems: function (arr) {
      return arr.length
    },
    watchlaterDuration: function () {
      var durationInSecounds = 0;
      this.videos.forEach((video) => {
        if (video.watchlater && !video.watched) {
          durationInSecounds += video.durationSecounds;
        }
      });

      return secoundsToHHMMSS(durationInSecounds);
    },
    deleteChannel: function (id) {

        app.channels = app.channels.filter(function(channel) {
            return channel.id !== id
        })

        app.sentInSession = app.sentInSession.filter(function(storedId) {
            return storedId !== id
        })    

        console.log('delete ',id,' sent')
        ipcRenderer.send("deleteChannel",id);
    },
    startSongRequest(){
      var self = this;

      this.songrequstison = true
      this.paused = false

      youtube.init(function() {
        
      console.log('API Loaded');

      // si existe un reproductor
      if (typeof youtubePlayer !== "undefined") {
        youtubePlayer.playVideo();
        return
      }
      youtubePlayer = youtube.createPlayer('player', {
            width: '720',
            height: '405',
            videoId: 'g8K21P8CoeI',
            playerVars: { 'autoplay': 1, 'controls': 1 },
            events: {
                'onReady': playerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    
        function playerReady(event) {
          //youtubePlayer.playVideo();
          if (self.songslist.length > 0){
            self.playNext()
          }else{
            youtube.stop()
          }
        }

        setInterval(function(){
          currentTime = youtubePlayer.getCurrentTime()*1;
          duration = youtubePlayer.getDuration()*1;

          if (currentTime){
            socket.emit('progress', (currentTime / duration) * 100)

          }
        },2000)
    
        function onPlayerStateChange(event) {
            console.log('Player State Changed: ', event);
            // si el video termina
            if(event.data == 0){
              //self.playNext()
              self.playNext()
            }
        }  
      });
    },
    selectSong(index){
      this.paused = false

      const song = this.songslist[index]
      const firstSong = this.songslist[0]

      this.songslist[index] = firstSong
      this.songslist[0] = song

      // si hay una siguiente cancion
      if (app.songslist.length > 0){

        // la reproducimos
        youtube.loadVideo(app.songslist[0].id)

        app.isDefaultVideo = false

        socket.emit('showSong', app.songslist[0])

        this.randomJam()
      }
    },
    playRandom() {
      const randomSong = Math.floor(Math.random() * app.songslist.length);
      console.log(randomSong)

      this.selectSong(randomSong)
    },
    playNext(){

      this.paused = false

      // guardamos el video antes de cambiarlo
      app.lastSong = app.songslist[0]
      
      // si no es el video default
      if(!app.isDefaultVideo) app.songslist.shift()
      
      // si hay una siguiente cancion
      if (app.songslist.length > 0){
        
        // la reproducimos
        youtube.loadVideo(app.songslist[0].id)
        
        app.isDefaultVideo = false
        
        socket.emit('showSong', app.songslist[0])

        this.randomJam()

      // si no hay una siguiente cancion, pondremos el video default
      }else{
        youtube.loadVideo('g8K21P8CoeI')
        app.isDefaultVideo = true
        youtube.stop()

        socket.emit('hideSong')

      }
    },
    playLast(){
      this.paused = false

      if(!app.isDefaultVideo) app.songslist.shift()

      const targetSong = this.lastSong

      this.songslist[0] = targetSong

      // si hay una siguiente cancion
      if (app.songslist.length > 0){

        // la reproducimos
        youtube.loadVideo(app.songslist[0].id)

        app.isDefaultVideo = false

        socket.emit('showSong', app.songslist[0])

        this.randomJam()
      }
    },
    stopSongRequest(){
      this.songrequstison = false
      this.paused = false

      youtube.stop()
      socket.emit('hideSong')

    },
    pauseSongRequest(){
      this.paused = true

      youtube.pause()
      socket.emit('hideSong')

    },
    resumeSongRequest(){
      this.paused = false

      youtube.play()
      socket.emit('resumeSong')
    },
    removeSong(index){
      if (index > -1) {

        // if it is the current song, return
        if (index == 0) return
        
        this.songslist.splice(index, 1);

        console.log(index, 'skiped')

      }
    },
    changeVolume(){
      this.$emit('changeVolume', this.volume);
      
      this.setYoutubeVolume(this.volume)

      // save volume in pc
      ipcRenderer.send("saveVolume", this.volume);
    },
    randomJam(){
      var urls = [
        'https://cdn.betterttv.net/emote/5f4c2b696084af6c17192d05/3x',
        'https://cdn.betterttv.net/emote/60a75c5867644f1d67e8a295/3x',
        'https://cdn.betterttv.net/emote/5ada077451d4120ea3918426/3x',
        'https://cdn.betterttv.net/emote/5de88ccef6e95977b50e6eb1/3x',
        'https://cdn.betterttv.net/emote/5c3a9d8bbaa7ba09c9cfca37/3x',
        'https://cdn.betterttv.net/emote/5b9011eea2c5266ff2b8fde5/3x',
        'https://cdn.betterttv.net/emote/60d950bb8ed8b373e421a9d6/3x',
        'https://cdn.betterttv.net/emote/600df0934e3ab965ef759f55/3x',
        'https://cdn.betterttv.net/emote/60fb5ff62d1eba5400d1397b/3x',
        'https://cdn.betterttv.net/emote/5e2cef19bca2995f13fc226b/3x'
      ]
      // guardamos el emote en jam
      this.jam = urls[Math.floor(Math.random() * urls.length)];
    },
    addAlternative: function(event) {
        event.preventDefault();

        let index = this.alternatives.length - 1;
        let input = this.$refs.alternatives[index];

        if (input.value == '' || this.stateBtn != 'Iniciar') return

        this.alternatives.push("");

        this.$nextTick(function() {
            let index = this.alternatives.length - 1;
            let input = this.$refs.alternatives[index];

            input.focus();
        });
    },
    changeState: function() {

      if (this.stateBtn == 'Iniciar') {

          var filteredAlternatives = this.alternatives.filter((alternative) => {
              return alternative != "";
          });

          console.log("Question: ", this.questionPoll);
          console.log("Alternatives: ", filteredAlternatives);

          if (this.questionPoll && filteredAlternatives.length > 1) {
            console.log('Data sent to server via socket.io')

            this.pollState = true
            this.stateBtn = 'Finalizar'

            socket.emit("requestPoll", {
                question: this.questionPoll,
                alternatives: filteredAlternatives
            });
          }

      } else if (this.stateBtn == 'Finalizar') {
          // detener la entrada de votos
          this.stateBtn = 'Ocultar'
          socket.emit("endPoll");

      } else if (this.stateBtn == 'Ocultar') {
          this.pollState = false;
          this.questionPoll = ''
          this.alternatives = ['']
          this.stateBtn = 'Iniciar'
          socket.emit("hidePoll");

      }
    },
    startBasicPoll: function(){
      if (this.stateBtn == "Iniciar") {

        this.questionPoll = "monkaHmm SI O NO?"
        this.alternatives = ['catYep si','catNope no']
              
        this.changeState()
      }
    },
    selectPoll: function(slot) {

      console.log(slot)

      this.pollSlots.forEach((poll, index, object) => {
        
        if (slot == poll.slot) {
          this.questionPoll = poll.question
          this.alternatives = poll.alternatives
          this.changeState()

        }
      });
      
    },
    removePoll: function(slot) {
      this.pollSlots.forEach((poll, index, object) => {
        if (slot == poll.slot) {
          object.splice(index, 1);
        }
      });

      ipcRenderer.send("removeSlot",slot);


    },
    saveSlot: function() {
      console.log('slots before', this.pollSlots)
      // if the slot is not empty
      this.pollSlots.forEach((poll, index, object) => {
        
        if (this.selectedPollSlot == poll.slot) {
          object.splice(index, 1);
        }
      });

      const poll = {
        slot: this.selectedPollSlot,
        question: this.questionPoll,
        alternatives: this.alternatives
      }
      this.pollSlots.push(poll)

      ipcRenderer.send("saveSlot",poll);

      console.log('slots after', this.pollSlots)
    },
    showQuestionOnStream: function(){
      this.isQuestionOnStream = true
      socket.emit('showQuestionOnStream', this.questions[this.currentQuestion])

      // play tts
      if (this.questionTts) {

        const message = encodeURIComponent(`${this.questions[this.currentQuestion].label}`)
        
        var voice = this.voice
        
        // si esta el modo voz random
        if (this.randomvoice){
          voice = voices[Math.floor(Math.random()*voices.length)];
        }

        var audio = new Audio(`https://api.streamelements.com/kappa/v2/speech?voice=${voice}&text=${message}`);
        audio.play();
      }

    },
    hideQuestionOnStream: function(){
      this.isQuestionOnStream = false
      socket.emit('hideQuestionOnStream')
    },
    nextQuestion: function(){
      // if the next question exists
      if (this.questions[this.currentQuestion + 1] !== undefined){
        // show the next question
        this.currentQuestion++

        // enables the show on screen button

        this.isQuestionOnStream = false
      }
    },
    selectQuestion: function(index){
      if (this.currentQuestion == index) return

      this.currentQuestion = index;

      if (this.showAutoOnStream){
        this.showQuestionOnStream()
      }else{
        this.isQuestionOnStream = false
      }
    },
    // adjust the volume based on (https://www.youtube.com/watch?v=MquQQX0Ak0k)
    setYoutubeVolume:function(volume){
      this.volume = volume

      const newVolume = ((volume / 100)**2)*100

      console.log('volume',this.volume)
      console.log('adjusted volume', newVolume)

      youtube.setVolume(newVolume)

    }, 
    changeLabel:function() {
      socket.emit('changeTtsLabel', this.ttsLabel)
      new AWN().success('¡Mensaje cambiado!')

    },
    changeCommand:function() {
      if(this.ttsCommand != ''){
        socket.emit('changeTtsCommand', this.ttsCommand)
        new AWN().success('¡Comando cambiado!')
      }
    },
    onChangeVoice: function(event) {
      const voice = event.target.value

      if(voice == 'random'){
        this.randomvoice = true;
      }else{
        this.voice = voice;
        this.randomvoice = false;
      }
    }, 
    clearTts:function() {
       this.questions = []
    },
    saveBackground: function() {
      console.log(this.background)
      this.backgrounds.push(this.background)
      // TODO: save in settings
    },
    selectBackground: function(url) {
      socket.emit('selectBackground', url)
    }
  },
  computed: {
    reversevideos() {
      return this.videos.slice().reverse();
    },
    reverseproducts() {
      return this.products.slice().reverse();
    },
    reverseclips() {
      return this.clips.slice().reverse();
    },
    reversechannels() {
        return this.channels.slice().reverse();
    }
  }
});

ipcRenderer.on("video", function (event, msg) {
  addVideo(msg.id, msg.platform, msg.username);
});

ipcRenderer.on("musicVideo", function (event, msg) {
  addMusicVideo(msg.id, msg.platform, msg.username, msg.message);
});

ipcRenderer.on("product", addProduct);

ipcRenderer.on("clip", addClip);

ipcRenderer.on("toggleStore", function (event, data) {
  const store = app.stores.find((store) => store == data.store);

  if (data.status) {
    app.stores.push(data.store);
  } else {
    const index = app.stores.indexOf(store);

    if (index > -1) {
      app.stores.splice(index, 1);
    }
  }
});

ipcRenderer.on("toggleTab", function (event, data) {
  const tab = app.tabs.find((tab) => tab.id == data.id);

  tab.enabled = data.status;

  // change the current active tab to the first enabled tab

  if (tab.id == app.currentTab) {
    for (let i = 0; i < app.tabs.length; i++) {
      if (app.tabs[i].enabled) {
        app.currentTab = app.tabs[i].id;
        return;
      }
    }
  }
});

ipcRenderer.on("filtervideos", function (event, filter) {
  console.log("filter aplied", filter);

  app.videofilters[filter.type] = filter.state;
});

ipcRenderer.on("showSentInSession", function (event, data) {
  console.log("show watched videos during session (stream) status", data);
  app.showSentInSession = data.state;
});

// Gets all videos watched in other streams
ipcRenderer.on("getAlltimeWatchedVideos", function (event, videos) {
  console.log("watched in all time videos", videos);

  if (videos != null) {
    app.sentInAlltime = videos;
  }
});

// Gets all videos watched in other streams
ipcRenderer.on("getWatchlaterVideos", function (event, videos) {
  console.log("Watch later videos", videos);

  if (videos != null) {
    app.videos = app.videos.concat(videos);
  }
});



// Gets all channels stored in the system
ipcRenderer.on("getAllChannels", function (event, channels) {
    console.log("Channels: ", channels);
  
    if (channels != null) {
      app.channels = channels;
      
    }
});


ipcRenderer.on("getVolume", function (event, volume) {
  console.log("Volume: ", volume);

  if (volume != null) {
    app.setYoutubeVolume(volume)
  }
});


var client;

ipcRenderer.on("twitchChannel", function (event, channelName) {
  console.log("channelName: ", channelName);

  client = new tmi.Client({
    channels: [channelName]
  });
  
  client.connect();

    
  client.on("message", (channel, tags, message, self) => {
     
    if (message.startsWith('!fondo')){
      const url = message.replace('!fondo','')
      app.chatBackgrounds.push(url)
    }

    if (message.startsWith('!'+app.ttsCommand) || message.startsWith(app.ttsCommand)){

      if (!app.questions.includes(message)){
          cleanedQuestion = removeCommand(message)
          
          app.questions.push({
            label: cleanedQuestion,
            author: tags["display-name"],
            tags: tags
          })
      }
    }

    ipcRenderer.send("sendLink", tags["display-name"], message, "twitch");

  });

});



// song reuquest
ipcRenderer.on("toggleSongRequest", function(event) {

  if (app.songrequstison) {
    app.stopSongRequest()
  }else{
    app.startSongRequest()
  }

})

ipcRenderer.on("togglePauseSongRequest", function(event) {

  if (app.paused && app.songrequstison) {
    app.resumeSongRequest()
  }else{
    app.pauseSongRequest()
  }
})

ipcRenderer.on("skipSongRequest", function(event) {
  app.playNext()
})

ipcRenderer.on("addVolume", function(event) {
  const currentVolume = parseInt(app.volume)

  if(currentVolume < 100){
    app.setYoutubeVolume(currentVolume + 5)
  }else{
    app.setYoutubeVolume(100)
  }
})

ipcRenderer.on("reduceVolume", function(event) {
  const currentVolume = parseInt(app.volume)

  if(currentVolume > 0){
    app.setYoutubeVolume(currentVolume - 5)
  }else{
    app.setYoutubeVolume(0)
  }
})


// poll
ipcRenderer.on("startBasicPoll", function(event) {
  app.startBasicPoll()
})

ipcRenderer.on("changeStatePoll", function(event) {
  if (app.stateBtn != 'Iniciar'){
    app.changeState()
  }
})

ipcRenderer.on("nextQuestion", function(event) {
  app.nextQuestion()
})

ipcRenderer.on("showQuestion", function(event) {
  if(app.isQuestionOnStream){
    app.hideQuestionOnStream()
  }else{
    app.showQuestionOnStream()
  }
})



ipcRenderer.on("setPolls", function (event, polls) {
  app.pollSlots = polls
  console.log(polls)
})

ipcRenderer.on("pollSlot", function (event, slot) {
  console.log('poll slot #', slot)

  app.selectPoll(slot)
})

ipcRenderer.on("background", function (event, url) {
  app.chatBackgrounds.push(url)
})




ipcRenderer.on("isDev", function(event, bool) {
  isDev = bool

  if (isDev){
    /*app.pollSlots = [
      {
        question: 'pregunta',
        alternatives: ["a","b","c"],
        slot: 1
      },
      {
        question: 'asdasda',
        alternatives: ["234","2342","234"],
        slot: 4
      }
    ]*/

}
})



function addVideo(id, platform, username) {
  // avoid video repetition
  if (app.sentInSession.includes(id)) return; // refactor to sentInSession
  if (app.sentInAlltime.includes(id)) return;
  
  ipcRenderer.send("storeVideo", id);

  app.sentInSession.push(id);

  console.log(platform,id)
  
  fetch(`https://www.googleapis.com/youtube/v3/videos?part=${videoParts}&id=${id}&key=${key}`)
  .then((response) => response.json())
  .then((youtubeVideo) => {

      console.log("youtube api v3 response", youtubeVideo);

      let durationSecounds = formatISOtime(
        youtubeVideo.items[0].contentDetails.duration
      );

      var formattedDuration = secoundsToHHMMSS(durationSecounds);

      let likes = parseInt(youtubeVideo.items[0].statistics.likeCount);
      let dislikes = parseInt(youtubeVideo.items[0].statistics.dislikeCount);

      let likeratio = Math.floor((100 * likes) / (likes + dislikes));

      let video = {
        author: username,

        id: id,
        url: "https://youtu.be/" + id,

        thumbnail_url: youtubeVideo.items[0].snippet.thumbnails.medium.url,
        channel: youtubeVideo.items[0].snippet.channelTitle,
        channelId: youtubeVideo.items[0].snippet.channelId,
        title: youtubeVideo.items[0].snippet.localized.title,
        category: youtubeVideo.items[0].snippet.categoryId,
        publishedAt: youtubeVideo.items[0].snippet.publishedAt.split("T")[0],
        live: youtubeVideo.items[0].liveBroadcastContent,
        description: youtubeVideo.items[0].snippet.description,

        views: youtubeVideo.items[0].statistics.viewCount,
        durationSecounds: durationSecounds,
        durationFormated: formattedDuration,
        likeratio: likeratio,
        platform: platform,
        watchlater: false,
        watched: false,
      };

      if (app.songrequstison && video.category == '10'){
        console.log('skiped video because it is a song and song request is on')
        return
      }


      app.videos.push(video); 
    });
}

function addMusicVideo(id, platform, username, message) {

  console.log(message)

  if (app.sentInSessionMusic.includes(id) || !app.songrequstison) return;

  app.sentInSessionMusic.push(id);

  fetch(`https://www.googleapis.com/youtube/v3/videos?part=${videoParts}&id=${id}&key=${key}`)
  .then((response) => response.json())
  .then((youtubeVideo) => {
    console.log(youtubeVideo)

    let durationSecounds = formatISOtime(
      youtubeVideo.items[0].contentDetails.duration
    );

    if (durationSecounds > 500) return

    // si el video es musical
    if(youtubeVideo.items[0].snippet.categoryId == "10"){

      const channelID = youtubeVideo.items[0].snippet.channelId

      // obtenemos la informacion del canal
      fetch(`https://www.googleapis.com/youtube/v3/channels?part=${channelParts}&id=${channelID}&key=${key}`)
        .then((response) => response.json())
        .then((youtubeChannel) => {
          console.log(youtubeChannel)

          const video = {
            id: id,
            title: youtubeVideo.items[0].snippet.title,
            artist: youtubeVideo.items[0].snippet.channelTitle,
            thumbnail: youtubeVideo.items[0].snippet.thumbnails.medium.url,
            channelThumbnail: youtubeChannel.items[0].brandingSettings.image.bannerExternalUrl,
            submiter: username,
            platform: platform,
            message: message,
          }
    
          console.log(video)
          // agregamos el video a la lista
          app.songslist.push(video)
    
          // si no hay videos aparte de ese, lo reproducimos
          if (app.songslist.length == 1) {
            app.playNext()
          }

      })

    }
  })
}


function addChannel(channelID){
    if (app.sentInSession.includes(channelID)) return; // refactor to sentInSession
    
    fetch(`https://www.googleapis.com/youtube/v3/channels?part=${channelParts}&id=${channelID}&key=${key}`)
    .then((response) => response.json())
    .then((youtubeChannel) => {
        console.log(youtubeChannel)

        youtubeChannel.id = channelID
        
        ipcRenderer.send("storeChannel",youtubeChannel);

        app.sentInSession.push(channelID);      
        app.channels.push(youtubeChannel)
    })
}

function addProduct(event, product) {
  if (app.sentInSession.includes(product.title)) return;
  
  app.sentInSession.push(product.title);

  app.products.push(product);
}

function addClip(event, clip) {

  console.log(clip)

  if (app.sentInSession.includes(clip.title)) return;
  
  app.sentInSession.push(clip.title);

  app.clips.push(clip);
}


function addTestVideo() {
  addVideo('DyET9VQZA3E')
}

const notification = document.getElementById("notification");
const message_title = document.getElementById("message_title");
const message = document.getElementById("message");
const restartButton = document.getElementById("restart-button");

ipcRenderer.on("update_available", () => {
  ipcRenderer.removeAllListeners("update_available");
  message_title.innerText = "Actualización Disponible!";
  message.innerHTML = '<i class="fas fa-download"></i> Descargando...';
  notification.classList.remove("hidden");
});

ipcRenderer.on("update_downloaded", () => {
  ipcRenderer.removeAllListeners("update_downloaded");
  message_title.innerText = "Actualización Descargada.";
  message.innerHTML =
    '<i class="fas fa-check"></i> Se instalara al reiniciar. ¿Quieres reiniciar ahora?';
  restartButton.classList.remove("hidden");
  notification.classList.remove("hidden");
});

function closeNotification() {
  notification.classList.add("hidden");
}
function restartApp() {
  ipcRenderer.send("restart_app");
}


function handleJquery() {
  setTimeout(function() {
    $('.emotedropdown').dropdown({
      onChange: function(value, text, $selectedItem) {
        const emoteurl = $selectedItem.find('img').attr('src')
        socket.emit('changeTtsEmote', emoteurl)
      }
    })
  },0)
}

function removeCommand(str) {
  const indexOfSpace = str.indexOf(' ');

  if (indexOfSpace === -1) {
    return '';
  }

  return str.substring(indexOfSpace + 1);
}
