import useBackend from "../store/useBackend"

export const domain = useBackend?.getState()?.backend
  // || 'http://10.40.190.8:8080'
  // || 'http://lcoalhost:8080'
  || 'https://katelynn-unstrategic-unsensitively.ngrok-free.dev';
