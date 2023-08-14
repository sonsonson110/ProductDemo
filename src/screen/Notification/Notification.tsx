import React, { useContext, useEffect, useState } from "react";
import { Text, View, ActivityIndicator, FlatList } from "react-native";
import { style } from "./styles";
import { fetchNotificationByStudentId, fetchUnreadNotification, updateReadStatus } from "../../../firebase/api/Usecase.tsx/ThongBao";
import ThongBaoItem from "../../component/ThongBaoItem/ThongBaoItem";
import { NotificationContext } from "../../component/ThongBaoItem/NotificationContext";

export interface ThongBao {
    id: string,
    _id_bai_dang: string,
    _id_binh_luan: string | null,
    type: string,
    content: string,
    ngay_thong_bao: Date,
    avatar_uri_sinh_vien_tuong_tac: string,
    read: boolean,
}

export default function Notification({ navigation, route }: any): JSX.Element {
    const [notifications, setNotifications] = useState<ThongBao[]>([]);
    const [unread, setUnread] = useState(0);
    const [loading, setLoading] = useState(true);
    const newNoti = useContext(NotificationContext);

    const stuId = route.params.stuId;

    const handleNotificationRead = async (nId: string) => {
        setNotifications(notifications.map((noti) => {
            if (noti.id !== nId) return noti;
            noti.read = true;
            return noti;
        }));

        setUnread(unread - 1);
        await updateReadStatus(nId);
    }

    useEffect(() => {
        fetchUnreadNotification(stuId).then(count => {
            setUnread(count);
            fetchNotificationByStudentId(stuId).then(notis => {
                setNotifications(notis);
                setLoading(false);
            });
        });
    }, [newNoti]);

    return !loading ?
        <View style={style.background}>
            <View style={style.appBar}>
                <Text style={style.appBarText}>Thông báo</Text>
                {unread > 0 && <Text style={style.notiCountText}>{unread}</Text>}
            </View>

            <FlatList
                data={notifications}
                renderItem={({ item }) =>
                    <ThongBaoItem
                        notification={item}
                        navigation={navigation}
                        handleNotificationRead={handleNotificationRead}
                    />}
                keyExtractor={(item, _index) => item.id}
            />

        </View> : <ActivityIndicator style={style.loadingAnimation} size={'large'} />

}