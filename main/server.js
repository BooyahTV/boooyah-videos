const express = require('express');
const app = express();

const path = require('path');

app.set('views', path.join(__dirname, '../views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.get('/', (req,res) => {
    res.render('index.ejs');
});


app.use(express.static(path.join(__dirname, '..',"/renderer")));

app.listen(8080);