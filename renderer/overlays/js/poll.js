const socket = io("ws://localhost:8080"); //199.195.254.68
var timeInterval;

var app = new Vue({
    el: "#app",
    data: {
        state: false,
        countVotes: false,
        question: "",
        totalVotes: 0,
        alternatives: [],
        time: 0,
    },
    filters: {
        percentage: function(value, alternatives) {
            let totalVotes = 0;

            alternatives.forEach((alternative) => {
                totalVotes += alternative.votes;
            });
            if(value > 0){
                return ((100 * value) / totalVotes).toString().substring(0, 4);
            }else{
                return 0
            }
        },
    },
    methods: {
        updateProgress() {
            this.alternatives.forEach((alternative, index) => {
                let totalVotes = 0;

                this.alternatives.forEach((alternative) => {
                    totalVotes += alternative.votes;
                });

                this.alternatives[index].progress =
                    (100 * this.alternatives[index].votes) / totalVotes;
            });
        },
        setWinner() {

            var max = -Infinity;
            var index;

            this.alternatives.forEach(function(v, k) {
                if (max < +v.votes) {
                    max = +v.votes;
                    index = k;
                }
            });

            this.alternatives[index].isWinner = true


        }
    },
});

app.updateProgress();

// handle the event sent with socket.send()
socket.on("startPoll", (poll) => {
    console.log(poll);

    app.state = true

    // cambiamos la pretgunta y limiamos las alternativas y votos
    app.question = poll.question;

    app.alternatives = []
    app.totalVotes = 0;
    app.time = 0
    clearInterval(timeInterval)

    // init the progress

    poll.alternatives.forEach((alternative) => {
        app.alternatives.push({
            title: alternative,
            votes: 0,
            progress: 0,
            isWinner: false,
        });
    });

    app.countVotes = true

    timeInterval = setInterval(function() {
        app.time++
    }, 1000);


    app.updateProgress();
});

socket.on("endPoll", () => {
    if (app.state) {
        app.updateProgress();
        clearInterval(timeInterval)
        app.setWinner()
        app.countVotes = false

    }

});

socket.on("hidePoll", () => {
    app.time = 0

    app.state = false
});

socket.on("updateVote", (alternative) => {

    if(!app.countVotes) return

    console.log(alternative);

    if (typeof app.alternatives[alternative] === 'undefined') return // checkea si esta el indice dentro del array

    app.alternatives[alternative].votes++; // aumenta el contador de una opcion
    app.totalVotes++; // aunmenta el contador total

    app.updateProgress()
});