const socket = io("ws://localhost:8080"); //199.195.254.68

var app = new Vue({
    el: "#app",
    data: {
        visible: false,
        question: {},
        authorColor: '#ffffff',
        label: 'dice',
        command: 'pregunta',
        emoteurl: 'https://i.imgur.com/rOt0jD6.gif'
    },
    /*methods: {
        
    },*/
});


socket.on("changeTtsLabel", (newLabel) => {
    app.label = newLabel;
})

socket.on("changeTtsCommand", (newCommand) => {
    app.command = newCommand;
})

socket.on("changeTtsEmote", (emooteurl) => {
    app.emoteurl = emooteurl;
})


socket.on("showQuestionOnStream", (question) => {
    console.log(question);


    app.visible = true
    
    app.question.author = question.author
    app.authorColor = question.tags.color  

    document.getElementById('label').innerHTML = question.label
    
    console.log(question)
    
    $('.question, .text')
        .not(":has(img)")
        .each(function() {
            var msg = $(this).html();
            
            msg = replaceEmote(msg, new RegExp("( |^)" + "&lt;3" + "\\b(?!&lt;3)", "g"), "https://static-cdn.jtvnw.net/emoticons/v1/9/1.0", "https://static-cdn.jtvnw.net/emoticons/v1/9/4.0", "<3","Twitch"); // harth <3			
            msg = replaceEmote(msg, new RegExp("\\b" + "D:" + "( |$)", "g"), "https://cdn.betterttv.net/emote/55028cd2135896936880fdd7/1x", "https://cdn.betterttv.net/emote/55028cd2135896936880fdd7/3x","D:","Better TTV"); // D:
            msg = replaceEmote(msg, new RegExp(":tf:", "g"), "https://cdn.betterttv.net/emote/54fa8f1401e468494b85b537/1x","https://cdn.betterttv.net/emote/54fa8f1401e468494b85b537/3x", ":tf:","Better TTV"); // :tf:
            
            msg = replaceEmotes(msg); // replace all twitch, sub emotes, betterttv and franker face z emotes
            //console.log('[result] ',msg)
            
            $(this).html(msg);
        })


            
});


socket.on("hideQuestionOnStream", () => {

    app.visible = false

});

