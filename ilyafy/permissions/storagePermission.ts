import { PermissionsAndroid } from "react-native";
export default async () => {
  return await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE, {
    title: 'Storage Permission',
    message: 'We need storage Permission to save songs locally',
    buttonPositive: 'Sure!',
    buttonNegative: 'Hell Nah',
    buttonNeutral: 'Later :)',
  }
  );
}