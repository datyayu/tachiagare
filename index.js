const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const db = require("./db");

const app = express();
const STATIC_DIR = path.resolve(__dirname, "static");
const PORT = process.env.PORT || 3000;

/*********************
 * CONFIG MIDDLEWARE *
 *********************/

app.use(bodyParser.json());
app.set("view engine", "ejs");
app.use("/", express.static(STATIC_DIR));

/*********************
 *    SONGS ROUTES   *
 *********************/

// Get the song via API.
app.get("/api/songs/:id", (req, res) => {
  const song = db.getSongById(req.params.id);

  if (!song) return res.sendStatus(404);

  res.json(song);
});

// Show song
app.get("/songs/:id", function(req, res) {
  const song = db.getSongById(req.params.id);

  if (!song) return res.sendStatus(404);

  res.render("song", {
    songUrl: `/api/songs/${song.id}`,
    songTitle: song.title,
    songGroup: song.group,
    songGroupId: song.groupId
  });
});

// Index songs
app.get("/songs", function(req, res) {
  const songs = db.getAllSongs();

  if (!songs) return res.sendStatus(404);

  res.render("song-list", {
    songs: songs
  });
});

/*********************
 *   GROUPS ROUTES   *
 *********************/

// Show groups
app.get("/groups/:groupId", function(req, res) {
  const groupId = req.params.groupId;
  const songs = db.getSongsByGroup(groupId);
  const group = db.getGroupById(groupId);

  if (!songs || !group) return res.sendStatus(404);

  res.render("group", {
    songs: songs,
    group: group.name
  });
});

// Index groups
app.get("/groups", function(req, res) {
  const groups = db.getAllGroups();

  if (!groups) return res.sendStatus(404);

  res.render("group-list", {
    groups: groups
  });
});

/*********************
 *    HOME ROUTE     *
 *********************/

// We don't have a home, so just redirect to
// the main index ¯\_(ツ)_/¯
app.get("/", function(req, res) {
  res.redirect("/songs");
});

/*********************
 *  START LISTENING  *
 *********************/

app.listen(PORT, function() {
  console.log(`App started on port ${PORT}`);
});
