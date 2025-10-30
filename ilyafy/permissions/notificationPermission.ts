import { PermissionsAndroid } from "react-native"
export default async () => {
    return await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
            title: 'Notification Permission',
            message: 'We need notification Permission',
            buttonPositive: 'Sure!',
            buttonNegative: 'Hell Nah',
            buttonNeutral: 'Later :)',
        })
}