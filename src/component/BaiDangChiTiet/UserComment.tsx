import { View, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { images } from "../../images";
import { detailScreen } from "./styles";
import React, { useEffect, useState } from "react";
import { BinhLuanApi, StudentApi } from "../../../firebase/api/InterfaceAPI";
import { Timestamp } from "@firebase/firestore";
import { addBinhLuan } from "../../../firebase/api/Usecase.tsx/BinhLuan";
import { fetchSinhVienById, fetchAvatarByName } from "../../../firebase/api/Usecase.tsx/SinhVien";

interface Props {
    postId: string | null,
    binhLuanId: string | null,
    sinhVienId: string,
    updateLocalPrimaryComment: ((primaryCmtId: string, data: BinhLuan) => void) | null,
    updateLocalPostComment: ((data: BinhLuan) => void) | null
}

export const UserComment = ({ postId, binhLuanId, sinhVienId, updateLocalPrimaryComment, updateLocalPostComment }: Props): JSX.Element => {
    const [sinhVienApi, setSinhVienApi] = useState<StudentApi>({
        _bai_dang_luu: [],
        _followers: [],
        _following: [],
        avatar: '',
        email: '',
        mo_ta: '',
        ngay_sinh: '',
        ten: ''
    });
    const [comment, setComment] = useState('');

    useEffect(() => {
        fetchSinhVienById(sinhVienId)
            .then(val => {
                setSinhVienApi(val);
            });

    }, []);

    const handleCommentSend = () => {
        const prepareApiData: BinhLuanApi = {
            _id_binh_luan_con: [],
            _id_sinh_vien: sinhVienId,
            downvote: [],
            upvote: [],
            ngay_sua: Timestamp.fromDate(new Date()),
            noi_dung: comment
        }

        fetchAvatarByName(sinhVienApi.avatar).then(studentAvatar => {
            const prepareEntityData: BinhLuan = {
                id: '',
                sinh_vien: { ma: sinhVienId, ten: sinhVienApi.ten, avatar: studentAvatar },
                ngay_sua: new Date(),
                noi_dung: comment,
                upvote: [],
                downvote: [],
                binh_luan_con: []
            }

            if (binhLuanId && updateLocalPrimaryComment) {
                addBinhLuan(null, binhLuanId, prepareApiData).then(newCmtId => updateLocalPrimaryComment(binhLuanId, { ...prepareEntityData, id: newCmtId }));
            } else if (updateLocalPostComment) {
                addBinhLuan(postId, null, prepareApiData).then(newCmtId =>  updateLocalPostComment({ ...prepareEntityData, id: newCmtId }));
            }
            setComment('');
        })
    }

    //useEffect(() => console.log(comment), [comment]);

    return (
        /* User comment */

        <View
            style={[detailScreen.userBinhLuanContainer, { marginVertical: 10 }]}>

            <View style={detailScreen.userBinhLuanInputContainer}>
                <TextInput
                    multiline={true}
                    placeholder="Chia sẻ cảm nghĩ..."
                    placeholderTextColor='#97999b'
                    value={comment}
                    onChangeText={(text) => setComment(text)}
                    style={{ color: '#1c1c1c' }}
                />
            </View>


            <TouchableOpacity style={{ flexBasis: 'auto' }} onPress={handleCommentSend}>
                <Image source={images.send} />
            </TouchableOpacity>
        </View>

    );
}