import { NativeModules } from 'react-native';
import { NewPipeStreamInfo } from '../types/songs';

interface NewPipeModule {
  extractStream(url: string): Promise<NewPipeStreamInfo | undefined>;
}

const { NewPipeModule } = NativeModules;

export default NewPipeModule as NewPipeModule;