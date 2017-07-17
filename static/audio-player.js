const UPDATE_INTERVAL = 100; // Update interval time (ms).
const MAX_OFFSET = UPDATE_INTERVAL / 1000; // Max time Offset (seconds).

/**
 * Main audio interface. Handles the specified audio element
 * events and dispatches an update on each tick of its internal
 * timer.
 * We must keep this internal timer because the 'timeupdate'
 * event isn't constant, meaning that it could be triggered
 * each time at a different interval anywhere between
 * 200ms-600ms (at least on my pc), which really messes up
 * with the lyrics timing. So instead of relaying on it,
 * we use our own timer to keep the updates happening at
 * a constant rate.
 */
class AudioPlayer {
  /**
   * @param {String} id Id for the Audio Element to use.
   */
  constructor(id) {
    this._$player = document.getElementById(id);
    this._onUpdateListeners = [];
    this._playingSong = undefined;
    this._tick = undefined;

    // Bind methods
    this.addOnUpdateListener = this.addOnUpdateListener.bind(this);
    this.playSong = this.playSong.bind(this);
    this._addPlayerListeners = this._addPlayerListeners.bind(this);
    this._onCanPlayThrough = this._onCanPlayThrough.bind(this);
    this._onPause = this._onPause.bind(this);
    this._onPlay = this._onPlay.bind(this);
    this._onSongEnd = this._onSongEnd.bind(this);
    this._onUpdate = this._onUpdate.bind(this);
    this._syncSong = this._syncSong.bind(this);

    // Initialize event listeners
    this._addPlayerListeners();
  }

  /********************
   *  PUBLIC METHODS  *
   ********************/

  /**
   * Register a listener to be called on each playback update.
   *
   * @param {Function} listener Listener to add.
   */
  addOnUpdateListener(cb) {
    this._onUpdateListeners = [...this._onUpdateListeners, cb];
  }

  /**
   * Set a song as the current one and request it.
   * Because we set the src here, the 'canplaythrought' event
   * will automatically play it as soon as it is downloaded.
   *
   * @param {Object} song Song to be played.
   */
  playSong(song) {
    this._$player.pause();
    clearInterval(this._tick);

    this._$player.src = song.audioFile;
    this._playingSong = song;
    this._playingSong.time = 0;
  }

  /*******************
   * PRIVATE METHODS *
   *******************/

  /**
   * Initialize the event listeners for the player.
   */
  _addPlayerListeners() {
    // On every time update, make sure the lyrics timer is in-sync with the player,
    this._$player.addEventListener("timeupdate", this._syncSong);

    // When we got the song buffer, start playing it.
    this._$player.addEventListener("canplaythrough", this._onCanPlayThrough);

    // When the song pauses, stop the timer.
    this._$player.addEventListener("pause", this._onPause);

    // When the = this._onSongEnd song starts playing, start the timer.
    this._$player.addEventListener("play", this._onPlay);

    // When the song ends, clear everything.
    this._$player.addEventListener("ended", this._onSongEnd);
  }

  /**
   * Start playing.
   */
  _onCanPlayThrough() {
    this._$player.play();
  }

  /**
   * Stop updating the internal timer.
   */
  _onPause() {
    this._playingSong.time = this._$player.currentTime;
    clearInterval(this._tick);
  }

  /**
   * Initialize the internal timer.
   */
  _onPlay() {
    this._tick = setInterval(this._onUpdate, UPDATE_INTERVAL);
  }

  /**
   * Clear the internal timer.
   */
  _onSongEnd() {
    if (this._tick) return;

    this._platingSong.time = 0;
    clearInterval(this._tick);
  }

  /**
   * Update the internal time and notify the listeners.
   */
  _onUpdate() {
    this._playingSong.time = this._playingSong.time + UPDATE_INTERVAL / 1000;

    this._onUpdateListeners.forEach(listener => {
      listener(this._playingSong);
    });
  }

  /**
   * Keep the internal timer and the player's time in-sync.
   */
  _syncSong() {
    if (!this._playingSong) return;

    const currentTime = this._playingSong.time;
    const playerTime = this._$player.currentTime;

    if (
      currentTime > playerTime + MAX_OFFSET ||
      currentTime < playerTime - MAX_OFFSET
    ) {
      this._playingSong.time = playerTime;
    }
  }
}
