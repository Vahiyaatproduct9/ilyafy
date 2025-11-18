import useDeviceSetting from "../../store/useDeviceSetting";
const theme = useDeviceSetting.getState().theme;
export const dark = theme === 'dark' ? true : false;
export default {
  background: dark ? '#6C3E79' : '#FADADD',
  primary: '#F4A9A8',
  secondary: !dark ? '#6C3E79' : '#FADADD',
  text: dark ? '#FFFFFF' : '#6C3E79',
  accent: '#F4A9A8'
}