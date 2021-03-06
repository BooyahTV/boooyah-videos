var genres = {
    /*"alternative",
    "ambient",
    "bluegrass",
    "bossanova",
    "brazil",
    "breakbeat",
    "british",
    "chicago-house",
    "chill",
    "comedy",
    "country",
    "deep-house",
    "detroit-techno",
    "disney",
    "drum-and-bass",
    "dub",
    "edm",
    "folk",
    "forro",
    "french",
    "funk",
    "garage",
    "german",
    "gospel",
    "goth",
    "grindcore",
    "groove",
    "grunge",
    "happy",
    "hardstyle",
    "holidays",
    "honky-tonk",
    "house",
    "idm",
    "indian",
    "indie",
    "industrial",
    "iranian",
    "jazz",
    "kids",
    "malay",
    "minimal-techno",
    "movies",
    "mpb",
    "new-age",
    "new-release",
    "opera",
    "pagode",
    "party",
    "philippines-opm",
    "piano",
    "post-dubstep",
    "progressive-house",
    "r-n-b",
    "rainy-day",
    "road-trip",
    "samba",
    "sertanejo",
    "show-tunes",
    "singer-songwriter",
    "ska",
    "sleep",
    "songwriter",
    "soul",
    "soundtracks",
    "spanish",
    "study",
    "summer",
    "swedish",
    "tango",
    "techno",
    "trance",
    "turkish",
    "work-out",
    "world-music"*/
    "pop-dance": 'https://cdn.betterttv.net/emote/5b52e96eb4276d0be256f809/3x',
    "hip-hop": 'https://cdn.betterttv.net/emote/5d1e70f498539c4801cc3811/3x',
    "rap": 'https://cdn.betterttv.net/emote/5d1e70f498539c4801cc3811/3x',
    "venezuelan-hip-hop": "https://www.youtube.com/watch?v=O4f58BU_Hbs",
    "new-romantic": 'https://cdn.betterttv.net/emote/5baf7cfb9809cc1f5117d301/3x',
    "guitar":'https://cdn.betterttv.net/emote/604bc7d6306b602acc59bab0/3x',
    "reggae":'https://cdn.betterttv.net/emote/606d0e0cfba15a03df2c99b5/3x',
    "reggaeton":'https://cdn.betterttv.net/emote/606d0e0cfba15a03df2c99b5/3x',
    "trip-hop": 'https://cdn.betterttv.net/emote/59a6d3dedccaf930aa8f3de1/3x',
    "dubstep": 'https://cdn.betterttv.net/emote/5b1740221c5a6065a7bad4b5/3x',
    "electro": 'https://cdn.betterttv.net/emote/5df2af0691129e77b47cd3d3/3x',
    "romance":'https://cdn.betterttv.net/emote/5baf7cfb9809cc1f5117d301/3x',
    "canadian-pop":'https://cdn.betterttv.net/emote/5fa8f232eca18f6455c2b2e1/3x',
    "indie-pop":'https://cdn.betterttv.net/emote/5c3a9d8bbaa7ba09c9cfca37/3x',
    "mandopop":'https://cdn.betterttv.net/emote/5c3a9d8bbaa7ba09c9cfca37/3x',
    "power-pop":'https://cdn.betterttv.net/emote/5c3a9d8bbaa7ba09c9cfca37/3x',
    "cantopop":'https://cdn.betterttv.net/emote/5c3a9d8bbaa7ba09c9cfca37/3x',
    "synth-pop":'https://cdn.betterttv.net/emote/5c3a9d8bbaa7ba09c9cfca37/3x',
    "electronic": 'https://cdn.betterttv.net/emote/5df2af0691129e77b47cd3d3/3x',
    "acoustic":'https://cdn.betterttv.net/emote/5eebf520924aa35e32a85447/3x',
    "afrobeat":'https://cdn.betterttv.net/emote/600df0934e3ab965ef759f55/3x',
    "alt-rock": 'https://cdn.betterttv.net/emote/5eadf40074046462f7687d0f/3x',
    "anime": 'https://cdn.betterttv.net/emote/5b35cae2f3a33e2b6f0058ef/3x',
    "black-metal": 'https://cdn.betterttv.net/emote/5eadf40074046462f7687d0f/3x',
    "blues": 'https://cdn.betterttv.net/emote/611c836476ea4e2b9f77debd/3x',
    "children":'https://cdn.betterttv.net/emote/5723e5f2ece3853a0adb03d2/3x',
    "classical": 'https://cdn.betterttv.net/emote/611c836476ea4e2b9f77debd/3x',
    "club":'https://cdn.betterttv.net/emote/6020f2f5cc5c150246d90c39/3x',
    "dance": 'https://cdn.betterttv.net/emote/606d0e0cfba15a03df2c99b5/3x',
    "dancehall": 'https://cdn.betterttv.net/emote/606d0e0cfba15a03df2c99b5/3x',
    "death-metal": 'https://cdn.betterttv.net/emote/5eadf40074046462f7687d0f/3x',
    "disco": 'https://cdn.betterttv.net/emote/606d0e0cfba15a03df2c99b5/3x',
    "emo":'https://cdn.betterttv.net/emote/6020f2f5cc5c150246d90c39/3x',
    "hard-rock": 'https://cdn.betterttv.net/emote/5eadf40074046462f7687d0f/3x',
    "hardcore": 'https://cdn.betterttv.net/emote/5eadf40074046462f7687d0f/3x',
    "heavy-metal": 'https://cdn.betterttv.net/emote/5eadf40074046462f7687d0f/3x',
    "hip-hop":'https://cdn.betterttv.net/emote/5d1e70f498539c4801cc3811/3x',
    "j-dance":'https://cdn.betterttv.net/emote/5b35cae2f3a33e2b6f0058ef/3x',
    "j-idol":'https://cdn.betterttv.net/emote/5b35cae2f3a33e2b6f0058ef/3x',
    "j-pop":'https://cdn.betterttv.net/emote/5b35cae2f3a33e2b6f0058ef/3x',
    "j-rock":'https://cdn.betterttv.net/emote/5b35cae2f3a33e2b6f0058ef/3x',
    "k-pop":'https://cdn.betterttv.net/emote/5c3a9d8bbaa7ba09c9cfca37/3x',
    "latin":'https://cdn.betterttv.net/emote/600df0934e3ab965ef759f55/3x',
    "latino":"https://cdn.betterttv.net/emote/600df0934e3ab965ef759f55/3x",
    "metal": "https://cdn.betterttv.net/emote/5eadf40074046462f7687d0f/3x",
    "metal-misc": "https://cdn.betterttv.net/emote/5eadf40074046462f7687d0f/3x",
    "metalcore": "https://cdn.betterttv.net/emote/5eadf40074046462f7687d0f/3x",
    "pop":'https://cdn.betterttv.net/emote/5fa8f232eca18f6455c2b2e1/3x',
    "pop-film":'https://cdn.betterttv.net/emote/5fa8f232eca18f6455c2b2e1/3x',
    "psych-rock": 'https://cdn.betterttv.net/emote/5eadf40074046462f7687d0f/3x',
    "punk": 'https://cdn.betterttv.net/emote/5eadf40074046462f7687d0f/3x',
    "punk-rock": 'https://cdn.betterttv.net/emote/5eadf40074046462f7687d0f/3x',
    "rock": 'https://cdn.betterttv.net/emote/5eadf40074046462f7687d0f/3x',
    "rock-n-roll": 'https://cdn.betterttv.net/emote/5eadf40074046462f7687d0f/3x',
    "rockabilly": 'https://cdn.betterttv.net/emote/5eadf40074046462f7687d0f/3x',
    "sad":"https://cdn.betterttv.net/emote/5f0cbcff6a652705221640dc/3x",
    "salsa":'https://cdn.betterttv.net/emote/5f78bb30e016be4a882eff5b/3x',
}