import { State } from "react-native-track-player"

export type commands = 'play'
    | 'pause'
    | 'stop'
    | 'seek'
    | 'next'
    | 'previous'
    | 'skip'
    | 'heartbeat'
    | 'reject'

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

