import delSong from "../../api/playlist/delete";

export default [
  {
    title: 'Delete',
    func: async (i: string) => await delSong(i)
  },
  {
    title: 'Add to Playlist',
    func: () => {
      console.log('Add to playlist funciton not implemented :(')
    },
  }
]
