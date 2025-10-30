import sb from "../../libs/createClient.js";
import getUserFromAccessToken from "../validation/getUserFromAccessToken.js";
export const playlistOf = (access_token) => {
  return {
    get: async () => {
      const { success, id, error } = await getUserFromAccessToken(access_token);
      if (!success)
        return {
          success: false,
          message: "No Access Token Provided",
          error,
        };
      const { data: room, error: roomErr } = await sb
        .from("users")
        .select("room_part_of")
        .eq("id", id)
        .single();
      if (roomErr)
        return {
          success: false,
          message: "No Room found.",
          error: roomErr,
          data: null,
        };
      const { data: songs, error: songErr } = await sb
        .from("playlists")
        .select(`*, songs(*)`)
        .eq("room_part_of", room.room_part_of);
      if (songErr)
        return {
          success: false,
          message: "Couldn't get Songs",
          data: null,
          error: songErr,
        };
      return {
        success: true,
        message: null,
        error: null,
        data: songs,
      };
    },
    add: async () => {},
    remove: async (song_id) => {},
  };
};
