import { Appearance } from "react-native";
const theme = Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
export const dark = theme === 'dark' ? true : false;
export default {
  background: dark ? '#090F15' : '#FADADD',
  primary: '#262E36',
  secondary: dark ? '#B3B7BA' : '#6C3E79',
  text: '#D3D1CE',
  accent: '#6C6D74'
}