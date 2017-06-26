var path = require('path')
var fs = require('fs')

var LYRICS_PATH = path.resolve(__dirname, 'songs')

var db = {
    lyrics: [],
    groups: new Set(),
}

// Fill the database
var files = fs.readdirSync(LYRICS_PATH);
files.forEach(file => {
    var filePath = path.resolve(LYRICS_PATH, file)
    var fileContent = fs.readFileSync(filePath)
    var info = JSON.parse(fileContent)

    db.groups.add({ name: info.group, id: info.groupId })
    db.lyrics.push(info)
})


// Exports

exports.getGroups = function() {
    return [...db.groups]
}

exports.getSongsByGroup = function(groupId) {
    return db.lyrics
        .filter(song => song.groupId === groupId)
        .map(song => {
            return {
                alias: song.alias,
                group: song.group,
                groupId: song.groupId,
                title: song.title,
                color: song.color
            }
        })
}

exports.getSongById = function(id) {
  return db.lyrics.find(song => song.id === id)
}

exports.getAllSongs = function(alias) {
    return db.lyrics;
}
