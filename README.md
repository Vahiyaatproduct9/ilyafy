<style>
.font{
  font-size: 60px;
}
</style>
<font class='font'>Ilyafy</font>

![App Icon](https://raw.githubusercontent.com/Vahiyaatproduct9/ilyafy/refs/heads/main/app_icon.png)

## GOALS

## Soon to Come in Ilyafy!

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

- _skip_ => _Including `next` & `previous`_

  - (Same as Heartbeat)

- _exit_
  - basicData
  - state => 'exit' (player stops in user2 and shows a faint notification.)

### Upcoming Features

- **poke** button to send a notification to their partner to join the socket.
- notification whenever someone tries to unethically join their room.
- notifies on new song added and old songs deleted.
- When user1 adds a song, a notification(FCM) is sent to their partner to add the song too.
- shows a faint notification whenever someone joins, leaves, plays, pauses etc to the other users in the connection.

### Workflow

-

### Logic

- **Scenario**
  - User 1 already connected and playing songs.
  - User 2 just opened the app.
- **_Workflow:_** - User 2 has to connect to socket manually first. - both sends out heartbeat of -
  | | User 1 | User 2 |
  | ------------- | ------------- | -------------- |
  | state | `playing` | `none` |

- User 1's state is given priority since it's `playing`.
