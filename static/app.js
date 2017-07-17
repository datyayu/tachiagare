function start() {
  /********************
   *   DOM ELEMENTS   *
   ********************/

  const $title = document.getElementById("js-title");
  const $video = document.getElementById("js-video");
  const $app = document.getElementById("js-lyrics");

  const songEndpoint = $app.getAttribute("data-song");
  if (!songEndpoint) return;

  /********************
   * MODULE INSTANCES *
   ********************/

  const lyricsRenderer = new LyricsRenderer("js-lyrics");
  const audioPlayer = new AudioPlayer("js-audio");

  /********************
   *   REQUEST INFO   *
   ********************/

  fetch(songEndpoint)
    .then(response => response.json())
    .then(song => {
      if (song.color) {
        // Update title color
        $title.setAttribute("style", `color:${song.color};`);
      }

      if (song.embedded) {
        // Add the embedded video.
        $video.innerHTML = song.embedded;
      }

      // Render initial lyrics.
      lyricsRenderer.render(song);

      // Start playing.
      audioPlayer.playSong(song);
      audioPlayer.addOnUpdateListener(lyricsRenderer.render);
    })
    .catch(console.error);
}

// start !!
window.onload = () => start();
