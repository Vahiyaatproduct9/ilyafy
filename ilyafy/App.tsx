import './global.css';
import Main from './app/home/main';
import useSocketStore from './store/useSocketStore';
// import { setupPlayer } from './functions/setupPlayer';
import { useEffect } from 'react';
import notificationPermission from './permissions/notificationPermission';
export default function App() {
  const connect = useSocketStore(s => s.connect);
  connect();
  useEffect(() => {
    (async () => {
      await notificationPermission();
    })();
  }, [connect]);
  return <Main />;
}
