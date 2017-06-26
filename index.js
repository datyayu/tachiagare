var path = require('path')
var express = require('express')
var bodyParser = require('body-parser')
var db = require('./db')

var app = express()
var STATIC_DIR = path.resolve(__dirname, 'static')


app.use(bodyParser.json())
app.set('view engine', 'ejs')

app.use('/', express.static(STATIC_DIR))

// Songs

app.get('/api/songs/:id', function(req, res) {
  var song = db.getSongById(req.params.id)

  if (!song) return res.sendStatus(404)

  res.json(song);
})

app.get('/songs/:id', function(req, res) {
  var song = db.getSongById(req.params.id)

  if (!song) return res.sendStatus(404)

  res.render('song', {
    songUrl: `/api/songs/${song.id}`,
    songTitle: song.title,
    songGroup: song.group,
    songGroupId: song.groupId
  })
})

app.get('/songs', function(req, res) {
  var songs = db.getAllSongs()

  if (!songs) return res.sendStatus(404)

  res.render('song-list', {
    songs: songs
  });
})

app.get('/', function(req, res) {
  res.redirect('/songs')
})



// Groups

app.get('/groups/:groupId', function(req, res) {
  var groupId = req.params.groupId
  var songs = db.getSongsByGroup(groupId)
  var group = db.getGroups().find(group => group.id === groupId)

  if (!songs || !group) return res.sendStatus(404)

  res.render('group', {
    songs: songs,
    group: group.name,
  })
})

app.get('/groups', function(req, res) {
  var groups = db.getGroups()

  if (!groups) return res.sendStatus(404)

  res.render('group-list', {
    groups: groups,
  })
})



app.listen(process.env.PORT || 3000)
