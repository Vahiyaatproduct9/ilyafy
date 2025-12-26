# Ilyafy

![App Icon](https://raw.githubusercontent.com/Vahiyaatproduct9/ilyafy/refs/heads/main/app_icon.png)

## What it is:

_Ilyafy_ is a "sync" music player that sources its audio from `youtube.com`.
So users can enjoy non-stop music **together** using websockets without any annoying ads.

### Further Breakdown:

_Ilyafy_ uses external modules to convert urls to playable local files.

Users can create _Ilyafy_ account to connect with each other.

Upon Connection, both the users will share and have equal access to a **shared playlist** where they can add or delete songs from that will reflected almost immediately on their partners device.

When Pressed the connect button, the following user is connected to the server through **web socket** that

- sends out `heartbeat` message about current active track and its metadata
- sends out signals like `skip`, `seek`, `stop`, `error` etc to notify their "partner".

## New in Ilyafy!

### Variables

1. `basicData`

- userId = socket id of the user connected through socket.io.
- roomId = room id derived from the database where multiple users (2) are connected through socket.
- songId = song id derived from the playlist connected to the room Id.

### Schema

- _heartbeat_

  - `basicData`
  - position => position of the song.
  - duration => duration of the song.
  - state => state of the song. (i.e => 'playing','error','paused','buffering','ended')

- _skip_ : _Including `next` & `previous`_

  - (Same as Heartbeat)

- _seek_
- _buffering_
- _loading_

  - (Same as Heartbeat)

- _exit_
  - basicData
  - state => 'exit' (player stops in user2 and shows a faint notification.)

### Features

- **poke** button to send a notification to their partner to join the socket.
- Notifies on new song added and old songs deleted.
- Shows a toast notification whenever someone joins, leaves, plays, pauses etc to the other users in the connection.

### Logic (soon to be Implemented)

- **Scenario**
  - User 1 already connected and playing songs.
  - User 2 just opened the app.
- **_Workflow:_** - User 2 has to connect to socket manually first. - both sends out heartbeat of -
  | | User 1 | User 2 |
  | ------------- | ------------- | -------------- |
  | state | `playing` | `none` |

- User 1's state is given priority since it's `playing`.

## Introduction to Caching

The Stream Algorithm now includes client side caching to reduce the number of fetches in the server.
particulary focusing on file:

- `ilyafy/functions/stream/stream.ts`
- `ilyafy/functions/service.ts`

## Client side Fetching

The Flow earlier was audio files being

- fetched(yt-dlp)
- compressed(FFmpeg) on Server Side
- Sent to Client through _http chunks_.

The Newer Architecture flow goes

- Music urls listed from Database
- Urls are fetched and Cached on the Client Side itself
- Only connections and socket signals are handled by the Server.

## Custom Adaptive Bitrate Streaming Algorithm

- Uses **Hysteresis** to perform estimations about the Network.
- Changes Song Quality based on User's Internet latency.
- Caches Songs at high quality in the background while streaming from remote URLs.
  - Swaps the on-Queue `remote url` to `local url` to ensure maximum User Experience.
- Opens potential features like `Data Saver Mode`.
- Refer files:
  - `ilyafy/functions/stream/stream.ts`
  - `ilyafy/store/useDeviceSettings.ts`
  - `ilyafy/store/useSongs.ts`

## Compatible with multiple devices

- Able to connect multiple devices using the same account.

## Redis for Internal Mappings (Server)

- Uses external redis instance for mapping `socket_id`s to their respective `room_id` and `user_id`

## Admin Log report through Email (Server)

- Endpoint for reporting recent logs to creator for optimisations.

## Latest Optimisations

1. -90% reduction in Server CPU Usage.
2. -30% reduction in Server Traffic. (estimated)

## Features to expect in the future

- Data Saver Mode
- Previous fetching Algorithm (server side fetch) as backup on main algorithm(client side fetch) failure.
- OAuth (google) login.
- Multiple Partner for premium users (prolly)
