const LINE_HEIGHT = 38; // Used for scrolling.

/**
 * Handles the lyric rendering on the given element.
 */
class LyricsRenderer {
  /**
   * @param {String} id Id for the Html Element to render on.
   */
  constructor(id) {
    this._$app = document.getElementById(id);
    this._scrolledLines = 0;

    // Bind methods
    this.render = this.render.bind(this);
    this._createLyricsTemplate = this._createLyricsTemplate.bind(this);
    this._scrollLines = this._scrollLines.bind(this);
  }

  /********************
   *  PUBLIC METHODS  *
   ********************/

  /**
   * Render the current song lyrics based on the given song state.
   *
   * @param {Object} currentSong Song to render.
   */
  render(currentSong) {
    // Create template
    const {
      template,
      linesHighlighted,
      lineBreaks
    } = this._createLyricsTemplate(currentSong);

    // Diff and update the dom.
    morphdom(this._$app, `<div class="lyrics"> ${template} </div>`);

    // Then scroll to center the current line.
    this._scrollLines(linesHighlighted + lineBreaks);
  }

  /*********************
   *  PRIVATE METHODS  *
   *********************/

  /**
   * Create an html template based on the given song state.
   *
   * @param {Object} currentSong Song to generate the template with.
   */
  _createLyricsTemplate(currentSong) {
    if (!currentSong) return;

    const words = currentSong.lyrics;
    const currentTime = currentSong.time || 0;

    let template = ""; // Html template
    let currentCalls = ""; // Calls in the current line.
    let linesHighlighted = 0; // Number of lines highlighted so far.
    let highlightedLineBreaks = 0; // Number of double (two-consecutive) line breaks.
    let currentLineWasHighlighted = false;
    let lastWordWasHighlightedLineBreak = false;

    words.forEach(function(word) {
      const [text, highlightTime, isCall, callColor] = word;
      const currentWordMustBeHighlighted = currentTime >= highlightTime;

      currentLineWasHighlighted =
        currentLineWasHighlighted || currentWordMustBeHighlighted;

      // If the text isn't present it's a line break, so we add the calls under it.
      if (!text) {
        // Update the number the line-breaks.
        if (lastWordWasHighlightedLineBreak) {
          highlightedLineBreaks++;
        }

        // If the line was highlighted, count it.
        if (currentLineWasHighlighted) {
          linesHighlighted++;
          currentLineWasHighlighted = false;
          lastWordWasHighlightedLineBreak = true;
        }

        // Append current line calls to template.
        template += `<br /> ${currentCalls} <br />`;
        currentCalls = "";

        // Continue.
        return;
      }

      // Word has a value.
      lastWordWasHighlightedLineBreak = false;

      // Store the calls.
      if (isCall) {
        const parsedText = text.replace(/\s/g, "&nbsp;"); // Preserve whitespace.

        // Call must be a certain color. Also add it to current line calls.
        if (callColor && currentWordMustBeHighlighted) {
          currentCalls += `<span style="color: ${callColor}">${parsedText} </span>`;
          return;
        }

        // Add call to current line calls.
        currentCalls += currentWordMustBeHighlighted
          ? `<span style="color: red">${parsedText} </span>`
          : `<span style="color: gray">${parsedText} </span>`;

        return;
      }

      // Add the lyrics.
      template += currentWordMustBeHighlighted
        ? `<span style="color: #3737f3">${text} </span>`
        : `<span>${text} </span>`;
    });

    return {
      template: template,
      linesHighlighted: linesHighlighted,
      lineBreaks: highlightedLineBreaks
    };
  }

  /**
 * Scroll the lyrics container to keep it focus on the
 * current line. (Only scrolls on new lines)
 *
 * @param {number} lines Number of lines to scroll.
 */
  _scrollLines(lines) {
    if (lines === this._scrolledLines) return;
    this._scrolledLines = lines;

    if (lines > 5) {
      this._$app.scrollTop = (lines - 5) * LINE_HEIGHT;
    } else {
      this._$app.scrollTop = 0;
    }
  }
}
