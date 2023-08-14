import { addDoc, collection, doc, getDoc, query, where, getDocs, updateDoc, arrayRemove, arrayUnion, deleteDoc, orderBy, limit, startAfter, QueryDocumentSnapshot, DocumentData, DocumentSnapshot } from "firebase/firestore";
import { uploadBytes, ref, getDownloadURL, listAll, deleteObject } from "firebase/storage";
import { Asset } from "react-native-image-picker";
import { db, storage } from "../../configuration";
import { BaiDangApi } from "../InterfaceAPI";
import { deleteComment, fetchPostComment, fetchSubCommentCount } from "./BinhLuan";
import { fetchSinhVienById, fetchAvatarByName, fetchAllStudentApi } from "./SinhVien";
import { fetchMonHocById } from "./MonHoc";

//CREATE
export const uriToBlob = (uri: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // If successful -> return with blob
        xhr.onload = function () {
            resolve(xhr.response);
        };

        // reject on error
        xhr.onerror = function () {
            reject(new Error('uriToBlob failed'));
        };

        // Set the response type to 'blob' - this means the server's response
        // will be accessed as a binary object
        xhr.responseType = 'blob';

        // Initialize the request. The third argument set to 'true' denotes
        // that the request is asynchronous
        xhr.open('GET', uri, true);

        // Send the request. The 'null' argument means that no body content is given for the request
        xhr.send(null);
    });
};
export const addNewPost = async (data: BaiDangApi, images: Asset[]) => {
    //add to firestore
    const docRef = await addDoc(collection(db, 'bai_dang'), data);

    console.log(docRef.id);

    //upload images to cloud storage
    const promises: Promise<any>[] = [];
    images.forEach(async img => {
        if (!img.uri) return;
        const blob = await uriToBlob(img.uri);
        // UPLOAD
        const process = uploadBytes(ref(storage, `bai_dang/${docRef.id}/${img.fileName}`), blob);
        promises.push(process);
    });
    await Promise.all(promises)
        .then((): any => console.log('upload complete!'))
        .catch(e => console.log(e));
}
//READ
const fetchBaiDangApi = async (postId: string) => {
    const ref = doc(db, "bai_dang", postId);
    const docSnap = await getDoc(ref);
    return docSnap.data() as BaiDangApi;
}
const fetchImageByNameArray = async (postId: string, nameArray: string[]): Promise<string[]> => {
    const result: string[] = [];

    await Promise.all(nameArray.map(async (name) => {
        const imgRef = ref(storage, `bai_dang/${postId}/${name}`);
        const imgUri = await getDownloadURL(imgRef);
        result.push(imgUri);
    }));

    return result;
}
export const fetchNewVote = async (postId: string): Promise<{ upvote: string[], downvote: string[] }> => {
    const post = await fetchBaiDangApi(postId);
    return { upvote: post.upvote, downvote: post.downvote }
}

const fetchBaiDangTomTatById = async (postId: string) => {
    const baiDangApi = await fetchBaiDangApi(postId);
    const monHocApi = await fetchMonHocById(baiDangApi._id_mon_hoc);
    const sinhVienApi = await fetchSinhVienById(baiDangApi._id_sinh_vien);
    const avatar = await fetchAvatarByName(sinhVienApi.avatar);
    const sinhVienObj = { ma: baiDangApi._id_sinh_vien, ten: sinhVienApi.ten, avatar: avatar };
    let tongBinhLuan = 0;
    for (const binhLuanChinh of baiDangApi._id_binh_luan) {
        const binhLuanConCount = await fetchSubCommentCount(binhLuanChinh);
        tongBinhLuan += (1 + binhLuanConCount);
    }
    const postImgs = await fetchImageByNameArray(postId, baiDangApi.hinh_anh);
    //construct bài đăng tóm tắt
    const post: CollapsedPost = {
        id: postId,
        sinh_vien: sinhVienObj,
        tieu_de: baiDangApi.tieu_de,
        ngay_sua: baiDangApi.ngay_sua.toDate(),
        mon_hoc: monHocApi.ten,
        upvote: baiDangApi.upvote,
        downvote: baiDangApi.downvote,
        tong_binh_luan: tongBinhLuan,
        hinh_anh_uri: postImgs
    }
    return post;
}

export const fetchBaiDangTheoTieuDeTimKiem = async (searchText: string) => {
    const q = query(collection(db, 'bai_dang'));
    const snap = await getDocs(q);

    const list: CollapsedPost[] = [];
    for (let doc of snap.docs) {
        const data = doc.data() as BaiDangApi;
        if (data.tieu_de.toLowerCase().includes(searchText.toLowerCase())) {
            const post = await fetchBaiDangTomTatById(doc.id);
            list.push(post);
        }
    }
    return list;
}

export const fetchBaiDangTomTatByMonHocId = async (id: string) => {
    const q = query(collection(db, 'bai_dang'), where('_id_mon_hoc', '==', id), orderBy('ngay_sua', 'desc'));
    const querySnapshot = await getDocs(q);

    const list: CollapsedPost[] = [];
    for (let doc of querySnapshot.docs) {
        const post = await fetchBaiDangTomTatById(doc.id);
        list.push(post);
    }
    return list;
}

export const fetchSavedBaiDangTomTatOfStudentId = async (stuId: string): Promise<CollapsedPost[]> => {
    const sinhVienApi = await fetchSinhVienById(stuId);
    const list: CollapsedPost[] = [];
    for (let i of sinhVienApi._bai_dang_luu) {
        const post = await fetchBaiDangTomTatById(i);
        list.push(post);
    }
    return list;
}

export const fetchBaiDangTomTatFromStudentId = async (stuId: string): Promise<CollapsedPost[]> => {
    const q = query(collection(db, "bai_dang"), where('_id_sinh_vien', '==', stuId), orderBy('ngay_sua', 'desc'));
    const querySnapshot = await getDocs(q);

    const promises: Promise<void>[] = [];
    const list: CollapsedPost[] = [];
    querySnapshot.forEach((doc) => {
        const promise = fetchBaiDangTomTatById(doc.id).then(post => {list.push(post);});
        promises.push(promise);
    });

    await Promise.all(promises);
    return list;
}

export const fetchAllBaiDangTomTat = async () => {
    const asyncPosts: CollapsedPost[] = [];

    const q = query(collection(db, "bai_dang"), orderBy('ngay_sua', 'desc'), limit(10));
    const querySnapshot = await getDocs(q);

    for (let doc of querySnapshot.docs) {
        const baiDang = await fetchBaiDangTomTatById(doc.id);
        asyncPosts.push(baiDang);
    }
    return { posts: asyncPosts, lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] };
}

export const fetchMoreBaiDangTomTat = async (lastDoc: DocumentSnapshot) => {
    try {
        const next = query(collection(db, "bai_dang"), orderBy('ngay_sua', 'desc'), startAfter(lastDoc), limit(10));
        const asyncPosts: CollapsedPost[] = [];
        const querySnapshot = await getDocs(next);

        for (let doc of querySnapshot.docs) {
            const baiDang = await fetchBaiDangTomTatById(doc.id);
            asyncPosts.push(baiDang);
        }
        return { posts: asyncPosts, lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] };
    } catch (e) {
        console.log(e);
        return null;
    }
}

export const fetchBaiDangChiTietById = async (postId: string): Promise<DetailPost> => {

    const postApi = await fetchBaiDangApi(postId);

    //fetch all related post comment
    const postComment: BinhLuan[] = [];
    const postCommentPromises: Promise<void>[] = [];
    postApi._id_binh_luan.forEach((binhLuanId) => {
        const binhLuan = fetchPostComment(binhLuanId);
        const promise = Promise.all([binhLuan])
            .then(([binhLuan]) => {
                postComment.push(binhLuan);
            })
        postCommentPromises.push(promise);
    })

    await Promise.all(postCommentPromises);
    //sort post comment by date
    postComment.sort(function (a, b) { return b.ngay_sua.getTime() - a.ngay_sua.getTime() });

    //construct return DetailPost object
    const sinhVien = await fetchSinhVienById(postApi._id_sinh_vien);
    const svAvatar = await fetchAvatarByName(sinhVien.avatar);
    const monHoc = await fetchMonHocById(postApi._id_mon_hoc);
    const postImgs = await fetchImageByNameArray(postId, postApi.hinh_anh);

    const detailPost: DetailPost = {
        id: postId,
        sinh_vien: {
            ma: postApi._id_sinh_vien,
            ten: sinhVien.ten,
            avatar: svAvatar
        },
        ngay_sua: postApi.ngay_sua.toDate(),
        mon_hoc: monHoc.ten,
        tieu_de: postApi.tieu_de,
        noi_dung: postApi.noi_dung,
        hinh_anh_uri: postImgs,
        upvote: postApi.upvote,
        downvote: postApi.downvote,
        binh_luan_chinh: postComment
    }

    return detailPost;
}
//UPDATE
export const updateUpvote = async (stuID: string, postId: string | null, commentId: string | null, up: boolean): Promise<void> => {
    const ref = postId ? doc(db, 'bai_dang', postId) : commentId ? doc(db, 'binh_luan', commentId) : null;
    if (!ref) return; // NEVER HAPPEN || AVOID ERROR
    if (up)
        await updateDoc(ref, { upvote: arrayRemove(stuID) });
    else
        //if stuId doesn't exist in downvote, Firestore doesn't care
        await updateDoc(ref, { upvote: arrayUnion(stuID), downvote: arrayRemove(stuID) });
}

export const updateDownvote = async (stuID: string, postId: string | null, commentId: string | null, down: boolean): Promise<void> => {
    const ref = postId ? doc(db, 'bai_dang', postId) : commentId ? doc(db, 'binh_luan', commentId) : null;
    if (!ref) return; // NEVER HAPPEN || AVOID ERROR
    if (down)
        await updateDoc(ref, { downvote: arrayRemove(stuID) });
    else
        //if stuId doesn't exist in upvote, Firestore doesn't care
        await updateDoc(ref, { upvote: arrayRemove(stuID), downvote: arrayUnion(stuID) });
}
//DELETE
export const deletePost = async (postId: string) => {
    //delete all saved from user
    const svDocs = await fetchAllStudentApi();
    for (let i = 0; i < svDocs.length; i++) {
        const currentDoc = svDocs[i];
        const ref = doc(db, "sinh_vien", currentDoc.id);
        await updateDoc(ref, { _bai_dang_luu: arrayRemove(postId) });
    }
    //attemp to delete all related comment
    const postApi = await fetchBaiDangApi(postId);
    postApi._id_binh_luan.forEach(async (postCmtId) => {
        await deleteComment(postCmtId, null, postId);
    })
    //delete the doc itself
    await deleteDoc(doc(db, "bai_dang", postId));
    //attemp to delete all images
    const stoRef = ref(storage, 'bai_dang/' + postId);
    return listAll(stoRef)
        .then(res => {
            res.items.forEach(async (img) => {
                await deleteObject(img);
            })
        });

}