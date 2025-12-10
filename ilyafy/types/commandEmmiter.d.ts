import { State } from "react-native-track-player"

export type commands = State
    | 'seek'
    | 'skip'
    | 'heartbeat'
    | 'reject'
    | 'error'
    | 'stop'
    | 'buffering'

export type heartbeatDataType = {
    state: 'heartbeat';
    status: State;
    position: number;
    buffered: number;
    duration: number;
    userId: string;
    roomId: string;
    songId: string;
}

