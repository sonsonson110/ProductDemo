import { addDoc, collection, doc, updateDoc, arrayUnion, getDoc, deleteDoc, arrayRemove } from "firebase/firestore";
import { db } from "../../configuration";
import { BinhLuanApi } from "../InterfaceAPI";
import { fetchSinhVienById, fetchAvatarByName } from "./SinhVien";

//CREATE
export const addBinhLuan = async (postId: string | null, commentId: string | null, data: BinhLuanApi) => {
    const docRef = await addDoc(collection(db, 'binh_luan'), data);
    if (postId) {
        const ref = doc(db, "bai_dang", postId);
        await updateDoc(ref, { _id_binh_luan: arrayUnion(docRef.id) });
    } else if (commentId) {
        const ref = doc(db, 'binh_luan', commentId);
        await updateDoc(ref, { _id_binh_luan_con: arrayUnion(docRef.id) });
    }
    return docRef.id;
}
//READ
const fetchBinhLuanApi = async (cmtId: string) => {
    const ref = doc(db, 'binh_luan', cmtId);
    const docSnap = await getDoc(ref);
    return docSnap.data() as BinhLuanApi;
}
export const fetchSubCommentCount = async (cmtId: string): Promise<number> => {
    const commentApi = await fetchBinhLuanApi(cmtId);
    return commentApi._id_binh_luan_con.length;
}

export const fetchPostComment = async (postCommentId: string): Promise<BinhLuan> => {

    const postComment = await fetchBinhLuanApi(postCommentId);

    //fetch all related sub post comment
    const subCmt: BinhLuan[] = [];
    const subCmtPromises: Promise<void>[] = [];

    postComment._id_binh_luan_con.forEach((subCmtId) => {
        const subCmtApi = fetchBinhLuanApi(subCmtId);
        const subCmtPromise = Promise.all([subCmtApi])
            .then(async ([subCmtApi]) => {
                const subSinhVien = await fetchSinhVienById(subCmtApi._id_sinh_vien);
                const subSvAvatar = await fetchAvatarByName(subSinhVien.avatar);

                const subComment: BinhLuan = {
                    id: subCmtId,
                    sinh_vien: {
                        ma: subCmtApi._id_sinh_vien,
                        ten: subSinhVien.ten,
                        avatar: subSvAvatar
                    },
                    ngay_sua: subCmtApi.ngay_sua.toDate(),
                    noi_dung: subCmtApi.noi_dung,
                    upvote: subCmtApi.upvote,
                    downvote: subCmtApi.downvote,
                    binh_luan_con: []
                }

                subCmt.push(subComment);
            });
        subCmtPromises.push(subCmtPromise);
    });

    await Promise.all(subCmtPromises);

    //sort subComment by Date
    if (subCmt.length > 1)
        subCmt.sort(function (a, b) { return b.ngay_sua.getTime() - a.ngay_sua.getTime() });

    //construct post comment
    const sinhVien = await fetchSinhVienById(postComment._id_sinh_vien);
    const svAvatar = await fetchAvatarByName(sinhVien.avatar);

    const postCommentEntity: BinhLuan = {
        id: postCommentId,
        sinh_vien: {
            ma: postComment._id_sinh_vien,
            ten: sinhVien.ten,
            avatar: svAvatar,
        },
        ngay_sua: postComment.ngay_sua.toDate(),
        noi_dung: postComment.noi_dung,
        upvote: postComment.upvote,
        downvote: postComment.downvote,
        binh_luan_con: subCmt
    }

    return postCommentEntity;
}

//UPDATE
//DELETE
export const deleteComment = async (commentId: string, parentCommentId: string | null, postId: string) => {
    //Delete the comment and subcomment from post include the comment
    if (!parentCommentId) {
        const postComment = await fetchBinhLuanApi(commentId);
        for (let i = 0; i < postComment._id_binh_luan_con.length; i++) {
            await deleteDoc(doc(db, 'binh_luan', postComment._id_binh_luan_con[i]));
        }
        await deleteDoc(doc(db, 'binh_luan', commentId));
        const baiDangRef = doc(db, 'bai_dang', postId);
        await updateDoc(baiDangRef, { _id_binh_luan: arrayRemove(commentId) });
    } else if (parentCommentId) {
        const postCommentRef = doc(db, 'binh_luan', parentCommentId);
        await updateDoc(postCommentRef, { _id_binh_luan_con: arrayRemove(commentId) });
        await deleteDoc(doc(db, 'binh_luan', commentId));
    }
}