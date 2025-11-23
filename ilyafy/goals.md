 - Suppose there are 2 users - User1 & User2
## Soon to Come in Ilyafy!
1. When user1 adds a song, a notification(FCM) is sent to their partner to add the song too.
2. 
3. third
### Variables
1. `basicData`
 - userId => socket id of the user connected through socket.io.
 - roomId => room id derived from the database where multiple users (2) are connected through socket.
 - songId => song id derived from the playlist connected to the room Id.

### Schema
- heartbeat
 - 1. `basicData`
 - 2. position => position of the song.
 - 3. duration => duration of the song.
 - 4. state => state of the song. (i.e => 'playing','error','paused','buffering','ended')

- skip *Including `next` & `previous`* 
  - (Same as Heartbeat)


- exit
  - 1. basicData
  - 2. state => 'exit' (player stops in user2 and shows a faint notification.)

### Upcoming Features
- **poke** button to send a notification to their partner to join the socket.
- notification whenever someone tries to unethically join their room.
- notifies on new song added and old songs deleted.
- shows a faint notification whenever someone joins, leaves, plays, pauses etc to the other users in the connection.


### Workflow
- 

### Logic
- **Scenario**
- 1. User 1 already connected and playing songs.
- 2. User 2 just opened the app.
***Workflow:***
- 1. User 2 has to connect to socket manually first.
- 2. both sends out heartbeat of
| ... | User 1 | User 2 |
| ------- | ------------- | -------------- |
| state | `playing` | `none` |

