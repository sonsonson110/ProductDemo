import { collection, query, where, getCountFromServer, orderBy, getDocs, doc, updateDoc } from "firebase/firestore";
import { ThongBao } from "../../../src/screen/Notification/Notification";
import { db } from "../../configuration";
import { ThongBaoApi } from "../InterfaceAPI";
import { fetchAvatarByName } from "./SinhVien";

// READ
export const fetchUnreadNotification = async (stuId: string) => {
    const ref = collection(db, 'thong_bao');
    const q = query(ref, where('_id_sinh_vien', '==', stuId), where('read', '==', false));
    const notificationCountSnap = await getCountFromServer(q);
    return notificationCountSnap.data().count;
}

export const fetchNotificationByStudentId = async (stuId: string) => {
    const ref = collection(db, 'thong_bao');
    const q = query(ref, where('_id_sinh_vien', '==', stuId), orderBy('ngay_thong_bao', 'desc'));
    const docsSnap = await getDocs(q);

    const notifications: ThongBao[] = [];
    for (let i = 0; i < docsSnap.docs.length; i++) {
        const currentDoc = docsSnap.docs[i].data() as ThongBaoApi;
        const avatar_uri = await fetchAvatarByName(currentDoc.avatar_sinh_vien_tuong_tac);
        notifications.push({
            id: docsSnap.docs[i].id,
            _id_bai_dang: currentDoc._id_bai_dang,
            _id_binh_luan: currentDoc._id_binh_luan,
            type: currentDoc.type,
            content: currentDoc.noi_dung,
            ngay_thong_bao: currentDoc.ngay_thong_bao.toDate(),
            avatar_uri_sinh_vien_tuong_tac: avatar_uri,
            read: currentDoc.read,
        });
    }
    return notifications;
}

//UPDATE
export const updateReadStatus = (id: string) => {
    const ref = doc(db, 'thong_bao', id);
    return updateDoc(ref, {read: true});
}