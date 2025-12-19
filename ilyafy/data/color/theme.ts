import { Appearance } from "react-native";
const theme = Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
export const dark = theme === 'dark' ? true : false;
export default {
  background: dark ? '#6C3E79' : '#FADADD',
  primary: '#F4A9A8',
  secondary: dark ? '#FADADD' : '#6C3E79',
  text: '#FFFFFF',
  accent: '#F4A9A8'
}