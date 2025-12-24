import useBackend from "../store/useBackend"

export const domain = useBackend?.getState()?.backend
  || 'http://172.24.139.8:8080'
  // || 'http://lcoalhost:8080'
  || 'https://katelynn-unstrategic-unsensitively.ngrok-free.dev';
