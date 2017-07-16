const path = require("path");
const fs = require("fs");

const LYRICS_PATH = path.resolve(__dirname, "songs");

/*******************
 * CUSTOM DATABASE *
 *******************/

class Database {
  constructor() {
    this.db = this._createDatabase(LYRICS_PATH);
  }

  /*******************
   * PUBLIC METHODS  *
   *******************/

  /**
   * Get all the groups in the database.
   *
   * @return {Object[]} List of groups.
   */
  getAllGroups() {
    return this.db.groups;
  }

  /**
   * Get all the songs in the database.
   *
   * @return {Object[]} List of songs.
   */
  getAllSongs() {
    return this.db.songs.map(this._cleanSongInfo);
  }

  /**
   * Get a group by its id.
   *
   * @param {String} id Group id.
   * @return {Object|null} Group, if found.
   */
  getGroupById(id) {
    return this.db.groups.find(group => group.id === id);
  }

  /**
   * Get a song by its id.
   *
   * @param {String} id Song id.
   * @return {Object|null} Song, if found.
   */
  getSongById(id) {
    return this.db.songs.find(song => song.id === id);
  }

  /**
   * Get all the songs from a specific group.
   *
   * @param {String} groupId Group id.
   * @return {Object[]}
   */
  getSongsByGroup(groupId) {
    return this.db.songs
      .filter(song => song.groupId === groupId)
      .map(this._cleanSongInfo);
  }

  /*******************
   * PRIVATE METHODS *
   *******************/

  /**
   * Remove the embedded, lyrics and audioFile info from the song info.
   *
   * @param {Object} song Song to clean.
   * @return {Object} Song cleaned.
   */
  _cleanSongInfo(song) {
    // This method is intended to be used as an index, so we
    // return the song with just the important info
    // (no lyrics, audioFile or embedded).
    return {
      id: song.id,
      group: song.group,
      groupId: song.groupId,
      title: song.title,
      color: song.color
    };
  }

  /**
   * Create a database representation with the data for the
   * songs from the given path.
   *
   * @param {String} filesDir The directory where the song lyrics are stored.
   * @return {Object} The database filled.
   */
  _createDatabase(filesDir) {
    const db = {
      songs: [],
      groups: []
    };

    const files = fs.readdirSync(filesDir);

    // Fill database with each file's content.
    files.forEach(file => {
      const filePath = path.resolve(filesDir, file);
      const fileContent = fs.readFileSync(filePath);
      const info = JSON.parse(fileContent);

      db.groups.push({ name: info.group, id: info.groupId });
      db.songs.push(info);
    });

    // Remove duplicated group entries.
    db.groups = db.groups.reduce((stored, group) => {
      if (stored.some(g => g.id == group.id)) {
        return stored;
      }

      return [...stored, group];
    }, []);

    // Sort entries.
    db.songs.sort((a, b) => a.title > b.title);
    db.groups.sort((a, b) => a.name > b.name);

    // Database was created.
    return db;
  }
}

/********************
 * EXPORT SINGLETON *
 ********************/

module.exports = new Database();
