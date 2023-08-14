export interface SinhVien {
    id: string,
    ten: string,
    avatarLink: string,
    email: string,
    mo_ta: string,
    ngay_sinh: string,
    followers: {
        id: string,
        ten: string,
        avatarLink: string
    }[],
    following: {
        id: string,
        ten: string,
        avatarLink: string
    }[],
}