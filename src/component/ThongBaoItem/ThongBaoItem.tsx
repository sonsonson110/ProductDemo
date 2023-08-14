import React from "react"
import { View, Image, Text, TouchableOpacity } from "react-native"
import { images } from "../../images"
import { ThongBao } from "../../screen/Notification/Notification"
import { style } from "./style"

interface Props {
    notification: ThongBao,
    navigation: any,
    handleNotificationRead: (nId: string) => void,
}

export default function NotificationItem({ notification, navigation, handleNotificationRead }: Props): JSX.Element {

    const onItemClick = () => {
        navigation.navigate('DetailPost', { postId: notification._id_bai_dang });
        handleNotificationRead(notification.id);
    }

    const NotificationType = (): JSX.Element => {
        switch (notification.type) {
            case 'UPVOTE':
                return (
                    <Image
                        source={images.voted_up_arrow}
                        style={style.notificationTypeImage} />
                );
            case 'COMMENT':
                return (
                    <View style={[style.notificationTypeImage, { paddingTop: 2 }]}>
                        <Image source={images.comment} />
                    </View>
                );
            case 'POST':
                return (
                    <View style={[style.notificationTypeImage]}>
                        <Image source={images.post} />
                    </View>
                );
            default:
                return <></>;
        }
    }

    return (
        <TouchableOpacity
            onPress={onItemClick}
            style={[style.notificationItemContainer, !notification.read && { backgroundColor: '#e7f3ff' }]}>
            <View style={style.imageContainer}>
                <Image
                    style={style.image}
                    source={{ uri: notification.avatar_uri_sinh_vien_tuong_tac }} />

                {NotificationType()}
            </View>
            <View style={style.contentContainer}>
                <Text style={style.contentText}>{notification.content}</Text>
                <Text style={[style.contentText, { color: '#7a7c7e', fontSize: 13 }]}>{`${notification.ngay_thong_bao.getDate()}/${notification.ngay_thong_bao.getMonth() + 1}/${notification.ngay_thong_bao.getFullYear()}`}</Text>
            </View>
        </TouchableOpacity>
    )
}