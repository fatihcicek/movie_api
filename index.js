const express = require('express');
morgan = require('morgan');
const app = express();
path = require('path'),
bodyParser = require('body-parser'),
uuid = require ('uuid');

const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Director;

mongoose.connect('mongodb://localhost:27017/myFlixDB', {
   useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());
app.use(morgan('common'));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));


let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');



// Parse request body
app.use(express.json());

// Routing for root.
app.get('/', (req, res) => {
  res.send('Welcome to yet another movie database. This one is a really special one as you may only find films that are awfully great. Sounds pretty nice, right? Well, to say the least, it is!');
});

// Get all Movies
app.get(
  '/movies',
  passport.authenticate('jwt', {session: false}),
  (req, res) => {
Movies.find()
  .then((movies) => {
    res.status(201).json(movies);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// Get movies by name
app.get(
  '/movies/:Title',
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ Title: req.params.Title })
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// Get all Directors
app.get('/directors',
passport.authenticate('jwt', { session: false }),
  (req, res) => {
  Directors.find()
    .then((director) => {
      res.status(200).json(director);
    }).catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Gets the data about the name of the director
app.get('/director/:Name',
passport.authenticate('jwt', { session: false }),
 (req, res) => {
  Directors.findOne({
      Name: req.params.Name
    })
    .then((director) => {
      res.json(director);
    }).catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


// Get genres
app.get('/genre',
passport.authenticate('jwt', { session: false }),
(req, res) => {
  Genres.find()
    .then((genre) => {
      res.status(200).json(genre);
    }).catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Get genres by name
app.get('/genre/:Name',
passport.authenticate('jwt', { session: false }),
 (req, res) => {
  Genres.findOne({
      Name: req.params.Name
    })
    .then((genre) => {
      res.json(genre);
    }).catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    })
});

// Get Users
app.get('/users',
passport.authenticate('jwt', { session: false }),
 (req, res) => {
 Users.find()
   .then((users) => {
     res.status(200).json(users);
   }).catch((err) => {
     console.error(err);
     res.status(500).send('Error: ' + err);
   });
});

// Get user by name
app.get('/users/:Username',
passport.authenticate('jwt', { session: false }),
 (req, res) => {
  Users.findOne({
      Username: req.params.Username
    })
    .then((user) => {
      res.json(user);
    }).catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//Add a user
/* We’ll expect JSON in this format
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Birthday: Date
}*/
app.post('/users', (req, res) => {
  Users.findOne({
    Username: req.body.Username
  })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) =>{res.status(200).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// Update a user's username
app.put('/users/:Username',
passport.authenticate('jwt', { session: false }),
 (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    },
  },
  { new: true }, //This line makes sure the document is returned)
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error" + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

// Add a movie to a user's list of favorites
app.post(
  '/users/:Username/movies/:MovieID',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
     $push: { FavoriteMovies: req.params.MovieID }
   },
   { new: true },
   // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
  });

// Remove a movie form user's fav list
app.delete(
  '/users/:Username/favorites/:_id',
  passport.authenticate('jwt', { session: false }),
  (req,res) => {
  users.findOneAndUpdate ({ Username: req.params.Username},
    { $pull: { FavoritMovies: req.params._id} },
    {new: true},
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

// Delete a user by username
app.delete(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
  });



// Error handler
app.use((err, req, res, next) => {
  /* eslint-disable-next-line */
  console.error(err.stack);
  res.status(500).send('Ups, something went wrong. Please try again.');
});
app.listen(8080, () => {
  /* eslint-disable-next-line */
  console.log('Server is listening on port 8080.');
});
