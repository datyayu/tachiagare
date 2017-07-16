(function() {
  // Globals (I'm so sorry about this ;_;)
  var currentSong = undefined; // Song data.
  var tick = undefined; // Custom timer.

  // Constants
  var LINE_HEIGHT = 38; // Used for scrolling.
  var UPDATE_INTERVAL = 100; // Update interval (ms).
  var MAX_OFFSET = UPDATE_INTERVAL / 1000; // seconds

  // Dom elements
  var $player = document.getElementById("js-audio");
  var $app = document.getElementById("js-lyrics");
  var $title = document.getElementById("js-title");
  var $video = document.getElementById("js-video");

  /**
 * When we got the song buffer, start playing it.
 */
  $player.addEventListener("canplaythrough", play);

  /**
 * On every time update, make sure the lyrics timer is in-sync with the player,
 */
  $player.addEventListener("timeupdate", function(event) {
    if (!currentSong) return;

    var currentTime = currentSong.time;
    var playerTime = $player.currentTime;
    var offset = 1;

    if (
      currentTime > playerTime + MAX_OFFSET ||
      currentTime < playerTime - MAX_OFFSET
    ) {
      currentSong.time = playerTime;
    }
  });

  /**
 * When the song pauses, stop the timer
 */
  $player.addEventListener("pause", function() {
    currentSong.time = $player.currentTime;

    clearInterval(tick);
  });

  /**
 * When the song starts playing, start the timer
 */
  $player.addEventListener("play", function() {
    // We must keep this timer because the 'timeupdate'
    // event isn't constant, meaning that it could be
    // triggered each time at a different interval anywhere
    // between 200ms-600ms (at least on my pc), which really
    // fucks up the lyrics timing. So instead of relaying
    // on it, we use our own timer to keep the updates
    // happening at a constant rate .
    tick = setInterval(() => {
      currentSong.time = currentSong.time + UPDATE_INTERVAL / 1000;
      renderSongLyrics();
    }, UPDATE_INTERVAL);
  });

  /**
 * When the song end, clear everything
 */
  $player.addEventListener("ended", function() {
    if (tick) return;

    clearInterval(tick);
    currentSong.time = 0;
  });

  /**
 * Request the song and start playing.
 */
  function start() {
    var songData = $app.getAttribute("data-song");

    if (!songData) return;

    fetch(songData)
      .then(response => response.json())
      .then(data => {
        currentSong = data;
        currentSong.time = 0;

        if (data.color) {
          $title.setAttribute("style", `color:${data.color};`);
        }

        if (data.embedded) {
          $video.innerHTML = data.embedded;
        }

        setSong(data.audioFile);
        renderSongLyrics();
      })
      .catch(console.warn);
  }

  /**
 * Set a song as the current one and request it.
 * Because we set the src here, the 'canplaythrought' event
 * will automatically play it as soon as it is downloaded.
 */
  function setSong(url) {
    $player.pause();
    $player.src = url;
  }

  /**
 * Start playing
 */
  function play() {
    $player.play();
    renderSongLyrics();
  }

  /**
 * Iterate and render every word on the current song lyrics.
 *
 * @todo Optimize this, I think re-rendering everything each
 *       update is unnecessary.
 */
  function renderSongLyrics() {
    var words = currentSong && currentSong.lyrics;
    if (!words) return;

    var template = "";
    var currentTime = currentSong.time;
    var currentCalls = "";
    var linesHighlighted = 0;
    var lineBreaks = 0;
    var lineWasHighlighted = false;
    var lastWordWasLineBreak = false;

    words.forEach(function(item) {
      var text = item[0];
      var start = item[1];
      var isCall = item[2];
      var callColor = item[3];
      var mustBeHighlighted = currentTime >= start;
      lineWasHighlighted = lineWasHighlighted || mustBeHighlighted;

      // If the item is empty, it's a line break, so we add the calls under it.
      if (!text || start === undefined) {
        if (lastWordWasLineBreak) {
          lineBreaks++;
        }

        if (lineWasHighlighted) {
          lastWordWasLineBreak = true;
          lineWasHighlighted = false;
          linesHighlighted++;
        }

        template += `<br />${currentCalls}</br>`;
        currentCalls = "";

        return;
      }

      lastWordWasLineBreak = false;

      // Store the calls.
      if (isCall) {
        text = text.replace(/\s/g, "&nbsp;");

        if (callColor && mustBeHighlighted) {
          currentCalls += `<span style="color: ${callColor}">${text} </span>`;
          return;
        }

        currentCalls += mustBeHighlighted
          ? `<span style="color: red">${text} </span>`
          : `<span style="color: gray">${text} </span>`;

        return;
      }

      // Render the lyrics.
      template += mustBeHighlighted
        ? `<span style="color: #3737f3">${text} </span>`
        : `<span>${text} </span>`;
    });

    morphdom($app, `<div class="lyrics"> ${template} </div>`);
    scrollLines(linesHighlighted + lineBreaks);
  }

  /**
 * Scroll the lyrics container to keep it focus on the
 * current line. (Only scrolls on new lines)
 *
 * @param {number} lines Number of lines to scroll
 */
  var currentLines = 0;
  function scrollLines(lines) {
    if (currentLines === lines) return;
    currentLines = lines;

    if (lines > 5) {
      $app.scrollTop = lines * LINE_HEIGHT - 5 * LINE_HEIGHT;
    } else {
      $app.scrollTop = 0;
    }
  }

  // start !!
  window.onload = function() {
    start();
  };
})();
