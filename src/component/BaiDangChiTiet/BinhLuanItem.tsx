import React, { useState, useEffect } from "react";
import { View, Image, Text, TouchableOpacity, Modal } from "react-native";
import { images } from "../../images";
import { Vote } from "../DanhSachBaiDangTomTat/BaiDangTomTat";
import { detailScreen } from "./styles";
import { UserComment } from "./UserComment";
import { deleteComment } from "../../../firebase/api/Usecase.tsx/BinhLuan";

interface Props {
    postId: string,
    binhLuan: BinhLuan,
    parentCommentId: string | null,
    sinhVienId: string,
    onSubBinhLuanAdded: ((primaryCmtId: string, data: BinhLuan) => void) | null,
    onCommentVoteChange: (commentId: string, parentCommentId: string | null, up: boolean, currentVote: Vote) => Vote,
    deleteLocalComment: (commentId: string, parentCommentId: string | null) => void,
    openReportModalFromCmt: (cmtId: string) => void,
}

interface CommentSetting {
    label: string,
    value: number
}

export const BinhLuanItem = ({
    postId,
    binhLuan,
    parentCommentId,
    sinhVienId,
    onSubBinhLuanAdded,
    onCommentVoteChange,
    deleteLocalComment,
    openReportModalFromCmt,
}: Props): JSX.Element => {
    const [isReplying, setReplying] = useState(false);
    const [commentVote, setCommentVote] = useState<Vote>({ upvote: false, downvote: false });
    const [option, setOption] = useState<CommentSetting[]>([]);
    const [isSettingVisible, setSettingVisible] = useState(false);

    const handleCommentVote = (up: boolean) => {
        const newVote = onCommentVoteChange(binhLuan.id, parentCommentId, up, commentVote);
        setCommentVote(newVote);
    }

    const handleCommentOption = (value: number) => {
        if (value === 1) {
            console.log('cmtId: ' + binhLuan.id + '| parentId: ' + parentCommentId + '| postId: ' + postId);
            deleteLocalComment(binhLuan.id, parentCommentId);
            deleteComment(binhLuan.id, parentCommentId, postId);
        } else {
            openReportModalFromCmt(binhLuan.id);
        }
    }

    const handleOutsidePress = () => {
        setSettingVisible(false);
    };

    useEffect(() => {
        setCommentVote({
            upvote: binhLuan.upvote.includes(sinhVienId) || false,
            downvote: binhLuan.downvote.includes(sinhVienId) || false
        });

        sinhVienId !== binhLuan.sinh_vien.ma ? setOption([{ label: 'Báo cáo', value: 0 }]) : setOption([{ label: 'Xoá', value: 1 }]);
    }, []);

    return (
        <View style={[{ paddingLeft: 3, }, binhLuan.sinh_vien.ma === sinhVienId && { borderLeftWidth: 1, borderLeftColor: '#2d89ff' }]}>
            <View style={[detailScreen.binhLuanContainer]}>
                <View>
                    <TouchableOpacity
                        style={detailScreen.binhLuanSettingsContainer}
                        onPress={() => setSettingVisible(!isSettingVisible)}>
                        <Image source={images.three_dot} />
                    </TouchableOpacity>
                    {isSettingVisible && <View style={detailScreen.binhLuanOptionContainer}
                        onTouchEnd={handleOutsidePress}>
                        {option.map(opt =>
                            <TouchableOpacity
                                key={opt.value}
                                onPress={() => handleCommentOption(opt.value)}>
                                <Text style={detailScreen.binhLuanContent}>{opt.label}</Text>
                            </TouchableOpacity>)}
                    </View>}

                </View>

                {/* HEADER */}
                <View style={detailScreen.binhLuanHeaderContainer}>
                    <Image
                        style={detailScreen.binhLuanHeaderAvatar}
                        source={{ uri: binhLuan.sinh_vien.avatar }} />

                    <View style={detailScreen.binhLuanHeaderTitleContainer}>
                        <Text style={detailScreen.binhLuanHeaderName}>{binhLuan.sinh_vien.ten}</Text>
                        <Text style={detailScreen.binhLuanHeaderDate}>{`${binhLuan.ngay_sua.getDate()}/${binhLuan.ngay_sua.getMonth() + 1}/${binhLuan.ngay_sua.getFullYear()}`}</Text>
                    </View>
                </View>
                {/* CONTENT */}
                <Text style={detailScreen.binhLuanContent}>{binhLuan.noi_dung}</Text>

                {/* FOOTER */}
                <View style={detailScreen.binhLuanFooterContainer}>
                    <View style={detailScreen.binhLuanFooterItem}>
                        <TouchableOpacity onPress={() => handleCommentVote(true)}>
                            {!commentVote.upvote ?
                                <Image source={images.up_arrow} />
                                : <Image source={images.voted_up_arrow} />
                            }
                        </TouchableOpacity>

                        <Text style={[detailScreen.postFooterText, commentVote.upvote && { color: '#de6d23' }]}>{binhLuan.upvote.length - binhLuan.downvote.length}</Text>

                        <TouchableOpacity onPress={() => handleCommentVote(false)}>
                            {!commentVote.downvote ?
                                <Image source={images.down_arrow} />
                                : <Image source={images.voted_down_arrow} />
                            }
                        </TouchableOpacity>
                    </View>


                    {parentCommentId === null &&
                        <TouchableOpacity
                            onPress={() => setReplying(!isReplying)}
                            style={detailScreen.binhLuanFooterItem}>
                            <Image style={{ marginRight: 3 }} source={images.reply} />
                            <Text style={detailScreen.postFooterText}>Reply</Text>
                        </TouchableOpacity>
                    }

                </View>
            </View>

            {isReplying ?
                <View style={{ width: '80%', alignSelf: 'flex-end', marginRight: 14 }}>
                    <UserComment
                        postId={null}
                        binhLuanId={binhLuan.id}
                        sinhVienId={sinhVienId}
                        updateLocalPrimaryComment={onSubBinhLuanAdded}
                        updateLocalPostComment={null}
                    />
                </View> : <></>
            }

            {/* SUB COMMENT */}
            {binhLuan.binh_luan_con && binhLuan.binh_luan_con.map((cmt) =>
                <View style={[detailScreen.binhLuanConContainer]} key={cmt.id}>
                    <BinhLuanItem
                        postId={postId}
                        binhLuan={cmt}
                        parentCommentId={binhLuan.id}
                        sinhVienId={sinhVienId}
                        onSubBinhLuanAdded={null}
                        onCommentVoteChange={onCommentVoteChange}
                        deleteLocalComment={deleteLocalComment}
                        openReportModalFromCmt={openReportModalFromCmt} />
                </View>
            )}
        </View>
    );
}