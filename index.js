const express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());
app.use(morgan('common'));
app.use(express.static('public'));


let movies = [    {
        title: 'Something about Mary',
        director: 'someone'
    },
    {
        title: 'movie 2',
        director: 'someone'
    },
    {
        title: 'movie 3',
        director: 'someone else'
    }
];


// GET requests
app.get('/movies', (req, res) => {
    res.json(movies)
});

app.get('/', (req, res) => {
    res.send('You have arrived to my Movie app!');
});

// error message
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something Broke!');
});

app.listen(8081, () => {
    console.log('Your app is listening on port 8081.');
});
