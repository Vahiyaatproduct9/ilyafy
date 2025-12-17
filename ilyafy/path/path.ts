import useBackend from "../store/useBackend"

export const domain = useBackend?.getState()?.backend
  || 'http://10.167.165.8:8080'
// || 'https://katelynn-unstrategic-unsensitively.ngrok-free.dev';
// export const domain = backend || 'https://zgmmrk31-8080.inc1.devtunnels.ms'
// export const domain = 'http://10.102.54.8:8080'
