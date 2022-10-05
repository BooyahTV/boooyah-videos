const socket = io("ws://localhost:8080"); //199.195.254.68

var app = new Vue({
    el: "#app",
    data: {
        image: '',
        animation: ''
    },
    mounted: function () {
        if(localStorage.getItem('background')){
            this.image = localStorage.getItem('background')
        }
    }

});



socket.on("selectBackground", (image) => {
    app.image = image
    localStorage.setItem('background', image)
});

socket.on("selectAnimation", (animation) => {
    app.animation = animation
});
