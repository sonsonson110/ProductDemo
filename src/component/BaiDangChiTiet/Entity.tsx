interface DetailPost {
    id: string,
    sinh_vien: {
        ma: string,
        ten: string,
        avatar: string,
    },
    ngay_sua: Date,
    mon_hoc: string,
    tieu_de: string,
    noi_dung: string,
    hinh_anh_uri: string[],
    upvote: string[],
    downvote: string[],
    binh_luan_chinh: BinhLuan[]
}

interface BinhLuan {
    id: string,
    sinh_vien: {
        ma: string,
        ten: string,
        avatar: string,
    },
    ngay_sua: Date,
    noi_dung: string,
    upvote: string[],
    downvote: string[],
    binh_luan_con: BinhLuan[]
}