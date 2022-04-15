const socket = io("ws://localhost:8080"); //199.195.254.68

var app = new Vue({
    el: "#app",
    data: {
        image: '',
    },
});


socket.on("selectBackground", (image) => {
    app.image = image
});
