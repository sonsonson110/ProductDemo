import { doc, updateDoc, arrayUnion, collection, getDocs, query, where, getDoc, arrayRemove } from "firebase/firestore";
import { ref, getDownloadURL, listAll, deleteObject, uploadBytes } from "firebase/storage";
import { Asset } from "react-native-image-picker";
import { SinhVien } from "../../../src/component/ThongTinSinhVien/Entity";
import { db, storage } from "../../configuration";
import { StudentApi } from "../InterfaceAPI";
import { uriToBlob } from "./BaiDang";

//CREATE
export const addStudentSavedPost = async (stuId: string, postId: string) => {
    const ref = doc(db, "sinh_vien", stuId);
    await updateDoc(ref, {
        _bai_dang_luu: arrayUnion(postId)
    })
}

//READ
export const fetchAllStudentApi = async () => {
    const ref = collection(db, 'sinh_vien');
    const docSnapshot = await getDocs(ref);
    return docSnapshot.docs;
}

export const fetchStudentIdByUid = async (uid: string) => {
    const q = query(collection(db, 'sinh_vien'), where('_uid', '==', uid));
    const docSnap = await getDocs(q);
    return docSnap.docs[0].id;
}
export const fetchSinhVienById = async (id: string): Promise<StudentApi> => {
    const sinhVienRef = doc(db, 'sinh_vien', id);
    const snapshotDoc = await getDoc(sinhVienRef);
    return snapshotDoc.data() as StudentApi;
}
export const fetchAvatarByName = async (name: string): Promise<string> => {
    const imgRef = ref(storage, `avatar/${name}`);
    const imgUri = await getDownloadURL(imgRef);
    return imgUri;
}
export const fetchProfileDataById = async (id: string): Promise<SinhVien> => {
    const sinhVienApi = await fetchSinhVienById(id);
    const selfAvt = await fetchAvatarByName(sinhVienApi.avatar);

    //get followers
    const followers: { id: string, ten: string, avatarLink: string }[] = []
    for (let i of sinhVienApi._followers) {
        const followerData = await fetchSinhVienById(i);
        const avatarLink = await fetchAvatarByName(followerData.avatar);
        followers.push({ id: i, ten: followerData.ten, avatarLink: avatarLink });
    }
    //get following
    const followering: { id: string, ten: string, avatarLink: string }[] = []
    for (let i of sinhVienApi._following) {
        const followingData = await fetchSinhVienById(i);
        const avatarLink = await fetchAvatarByName(followingData.avatar);
        followering.push({ id: i, ten: followingData.ten, avatarLink: avatarLink });
    }
    return {
        id: id,
        ten: sinhVienApi.ten,
        avatarLink: selfAvt,
        email: sinhVienApi.email,
        mo_ta: sinhVienApi.mo_ta,
        ngay_sinh: sinhVienApi.ngay_sinh,
        followers: followers,
        following: followering,
    } as SinhVien;
}

//UPDATE
export const updateSinhVienProfile = async (stuId: string, avt: Asset | null, bio: string) => {
    //firestore update
    const stuRef = doc(db, "sinh_vien", stuId);
    await updateDoc(stuRef, { mo_ta: bio });
    avt && await updateDoc(stuRef, { avatar: avt.fileName });

    //cloud storage update (replace image)
    if (avt && avt.uri) {
        const stoRef = ref(storage, 'avatar/' + stuId);
        listAll(stoRef)
            .then(res => {
                res.items.forEach(async (img) => {
                    await deleteObject(img);
                })
            });
        const blob = await uriToBlob(avt.uri);
        await uploadBytes(ref(storage, `avatar/${avt.fileName}`), blob);
    }
}

export const updateStudentFcmToken = async (stuId: string, fcmToken: string) => {
    const stuRef = doc(db, "sinh_vien", stuId);
    await updateDoc(stuRef, { token: fcmToken });
}

export const setUserStatus = async (stuId: string, active: boolean) => {
    const stuRef = doc(db, "sinh_vien", stuId);
    await updateDoc(stuRef, { active: active });
}

export const setFollow = async (targetStuId: string, currentStuId: string, add: boolean) => {
    const targetStuRef = doc(db, 'sinh_vien', targetStuId);
    await updateDoc(targetStuRef, { _followers: add ? arrayUnion(currentStuId) : arrayRemove(currentStuId) });

    const currentStuRef = doc(db, 'sinh_vien', currentStuId);
    return updateDoc(currentStuRef, { _following: add ? arrayUnion(targetStuId) : arrayRemove(targetStuId) });
}

//DELETE
export const deleteStudentSavedPost = async (stuId: string, postId: string) => {
    const ref = doc(db, "sinh_vien", stuId);
    await updateDoc(ref, {
        _bai_dang_luu: arrayRemove(postId)
    })
}