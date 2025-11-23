import { ToastAndroid } from "react-native";
export default (message: string) => {
  return ToastAndroid.showWithGravity(message, ToastAndroid.SHORT, ToastAndroid.BOTTOM)
}