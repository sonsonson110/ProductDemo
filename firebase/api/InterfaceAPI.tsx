import { Timestamp } from "firebase/firestore"

export interface StudentApi {
    _bai_dang_luu: string[],
    _followers: string[],
    _following: string[],
    avatar: string,
    email: string,
    mo_ta: string,
    ngay_sinh: string,
    ten: string
}

export interface MonHocApi {
    ten: string
}

export interface BinhLuanApi {
    _id_binh_luan_con: string[],
    _id_sinh_vien: string,
    downvote: string[],
    upvote: string[],
    ngay_sua: Timestamp,
    noi_dung: string
}

export interface BaiDangApi {
    _id_binh_luan: string[],
    _id_mon_hoc: string,
    _id_sinh_vien: string,
    downvote: string[],
    hinh_anh: string[],
    ngay_sua: Timestamp,
    noi_dung: string,
    tieu_de: string,
    upvote: string[]
}

export interface ReportApi {
    _id_bai_dang: string,
    _id_binh_luan: string | null,
    ngay_bao_cao: Timestamp,
    danh_muc: string[],
    mo_ta: string,
    id_sinh_vien_bao_cao: string
}

export interface ThongBaoApi {
    _id_bai_dang: string,
    _id_sinh_vien: string,
    _id_binh_luan: string | null,
    avatar_sinh_vien_tuong_tac: string,
    ngay_thong_bao: Timestamp,
    noi_dung: string,
    type: string,
    read: boolean,
}