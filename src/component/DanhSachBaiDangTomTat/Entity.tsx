interface CollapsedPost {
    id: string,
    sinh_vien: {
        ma: string,
        ten: string
        avatar: string
    },
    tieu_de: string,
    ngay_sua: Date,
    mon_hoc: string,
    upvote: string[],
    downvote: string[],
    tong_binh_luan: number,
    hinh_anh_uri: string[]
}