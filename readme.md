# Tachiagare!

This is what happens when I'm free and home-alone on a weekend.


## How to run

Clone the repo, then:

```sh
$ yarn install
$ yarn start
```

## Want to contribute with songs?

I would soon (hopefully) post some info on how I made the existing ones.

But just in case I forget (or I lose motivation), you can clone

[https://github.com/datyayu/tachiagare-demo/](https://github.com/datyayu/tachiagare-demo/)

then use it to experiment and try the timings.

If you can figure out how to make lyrics with that, then you are cool and I will check any PR you send me :)


## About the songs format

The songs use a custom json format.

Basically, every json should have the following attributes:

- **"title"** -> Song title.
- **"group"** -> Name of the group.
- **"groupId"** -> Id of the group (because I'm too lazy to write a proper backend).
- **"id"** -> The song id. See above.
- **"lyrics"** -> The lyrics of the song (see lyrics format)
- **"audioFile"** -> An url to the audio file.

Optionally, the json can also contain other fields:

- **"color"** -> Custom color for the song title.
- **"embedded"** -> Code to embed into the "live" section, like an iframe or similar. Just make sure it's using https or it won't work.


## Lyrics format

The lyrics field in each song consists of a array of items with each word and it's timing, with some optional metadata.

Each item is an array itself and has four components:

```json
[< WORD >, < START-TIME >, < IS-CALL >, < CALL-COLOR >]
```
```json
  ...
  [ "hello", 193, true, "#3cc" ],
  ...
```

However, the `< IS-CALL >` and `< CALL-COLOR >` components are intended to indicate which words are calls and are only needed when specifying a call. Each item can contain only the `< WORD >` and `< START-TIME >` and still will be parsed as a part of the song.

Like this:
```json
  ["hello", 193]
```

Additionally, an empty array will be taken as the end of a line and can (and should) be used to break lines and to separate verses.

```json
  []
```

Finally, whitespace is preserved, so you can use it as much as you want to improve the visuals of the lyrics.

```json
  ["                                     Fu", 45.2, true],
```
