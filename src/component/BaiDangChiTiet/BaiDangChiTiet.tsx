import React, { useContext, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, KeyboardAvoidingView, Modal, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import { KeyboardAwareFlatList, KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { images } from "../../images";
import { Vote } from "../DanhSachBaiDangTomTat/BaiDangTomTat";
import { BinhLuanItem } from "./BinhLuanItem";
import { UserComment } from "./UserComment";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { detailScreen } from "./styles";
import { Timestamp } from "firebase/firestore";
import { ReportApi } from "../../../firebase/api/InterfaceAPI";
import { deletePost, fetchNewVote, updateUpvote, updateDownvote, fetchBaiDangChiTietById } from "../../../firebase/api/Usecase.tsx/BaiDang";
import { sendReport } from "../../../firebase/api/Usecase.tsx/BaoCao";
import { addStudentSavedPost, deleteStudentSavedPost, fetchSinhVienById } from "../../../firebase/api/Usecase.tsx/SinhVien";

const initDetailPost: DetailPost = {
    id: '',
    sinh_vien: {
        ma: '',
        ten: '',
        avatar: '',
    },
    ngay_sua: new Date(),
    mon_hoc: '',
    tieu_de: '',
    noi_dung: '',
    hinh_anh_uri: [],
    upvote: [],
    downvote: [],
    binh_luan_chinh: []
}

interface PostSetting {
    label: string,
    value: number
}

interface ReportType {
    label: string,
    value: number,
}

const reportTypes: ReportType[] = [
    { value: 0, label: 'Spam' },
    { value: 1, label: 'Ngôn từ không phù hợp' },
    { value: 2, label: 'Vi phạm quyền sở hữu trí tuệ' },
    { value: 3, label: 'Nội dung không liên quan' },
    { value: 4, label: 'Khác' },
];

export default function BaiDangChiTiet({ navigation, route }: any): JSX.Element {
    const [postVote, setPostVote] = useState<Vote>({ upvote: false, downvote: false })
    const [isSaved, setSave] = useState(false);
    const [post, setPost] = useState<DetailPost>(initDetailPost);
    const [selectedImage, setSelectedImage] = useState<string>('');
    const [error, setError] = useState(false);

    const [option, setOption] = useState<PostSetting[]>([]);
    const [isSettingVisible, setSettingVisibility] = useState(false);

    const [displayReportModal, setModalDisplay] = useState(false);
    const [reportData, setReportData] = useState<{ danh_muc: string[], mo_ta: string, commentId: string | null }>({
        danh_muc: [],
        mo_ta: '',
        commentId: null,
    });

    const { postId, stuId } = route.params;

    //SAVE FUNCTION
    const handlePostSave = async () => {
        setSave(true);
        await addStudentSavedPost(stuId, post.id);
    }

    const handlePostUndoSave = async () => {
        setSave(false);
        await deleteStudentSavedPost(stuId, post.id);
    }

    //POST Options
    const openReportModalFromCmt = (cmtId: string) => {
        setModalDisplay(true);
        setReportData({ ...reportData, commentId: cmtId });
    };

    const handlePostOptions = (value: number) => {
        if (value === 1) {
            deletePost(post.id);
            navigation.goBack();
        }
        else if (value === 0) {
            setModalDisplay(true);
        }
    }

    const onReportDataChange = (value: number, isAdd: boolean) => {
        const currentType = reportTypes.find(val => val.value === value);
        if (!currentType) return;

        if (isAdd) {
            setReportData({ ...reportData, danh_muc: [...reportData.danh_muc, currentType.label] });
        } else {
            const newData = [...reportData.danh_muc];
            newData.splice(newData.indexOf(currentType.label), 1);
            setReportData({ ...reportData, danh_muc: newData });
        }
    }

    const onSendReport = async () => {
        const report: ReportApi = {
            _id_bai_dang: postId,
            _id_binh_luan: reportData.commentId,
            ngay_bao_cao: Timestamp.fromDate(new Date()),
            danh_muc: reportData.danh_muc,
            mo_ta: reportData.mo_ta,
            id_sinh_vien_bao_cao: stuId
        }

        await sendReport(report);
        onCancelReport();
    }

    const onCancelReport = () => {
        setReportData({ danh_muc: [], mo_ta: '', commentId: null });
        setModalDisplay(false);
    }

    //COMMENT DELETE FUNCTION
    const deleteLocalComment = (commentId: string, parentCommentId: string | null) => {
        const clonePostComment = [...post.binh_luan_chinh];
        const postCommentId = parentCommentId ? parentCommentId : commentId;
        const postComment = clonePostComment.find(obj => obj.id === postCommentId);
        if (!parentCommentId && postComment) {
            clonePostComment.splice(clonePostComment.indexOf(postComment), 1);
        } else if (postComment) {
            const subComment = postComment.binh_luan_con.find(obj => obj.id === commentId);
            subComment && postComment.binh_luan_con.splice(postComment.binh_luan_con.indexOf(subComment), 1);
        }
        setPost({ ...post, binh_luan_chinh: clonePostComment });
    }

    //COMMENT ADDING FUNCTION
    const addSubComment = (primaryCmtId: string, data: BinhLuan) => {
        let primaryCmts = { ...post }.binh_luan_chinh;
        const desiredCmt = primaryCmts.find(cmt => cmt.id === primaryCmtId);
        desiredCmt && desiredCmt.binh_luan_con && desiredCmt.binh_luan_con.unshift(data);
        if (primaryCmts && desiredCmt) {
            primaryCmts = [...primaryCmts.filter((cmt) => cmt.id !== primaryCmtId), desiredCmt];
        }
        const newPost: DetailPost = { ...post, binh_luan_chinh: primaryCmts }
        setPost(newPost);
    }

    const addPostComment = (data: BinhLuan) => {
        const newPrimaryCmt = { ...post }.binh_luan_chinh;
        newPrimaryCmt.unshift(data);
        setPost({ ...post, binh_luan_chinh: newPrimaryCmt });
    }

    //VOTING FUNCTION
    const fetchRealtimeVote = async (postId: string) => {
        const newVote: { upvote: string[], downvote: string[] } = await fetchNewVote(postId);
        setPost({ ...post, upvote: newVote.upvote, downvote: newVote.downvote });
    }

    //call remote + local update
    const updatePostVote = (up: boolean) => {
        if (!post) return;
        onLocalPostVoteChange(up);
        //changes depend on up/down button is on or not && what button user clicked
        if (up) {
            if (postVote.upvote === true) {
                //update the firestore with upvote decrease
                updateUpvote(stuId, post.id, null, true);
            } else if (postVote.downvote === true) {
                //update the firestore with downvote decease and upvote increase
                updateUpvote(stuId, post.id, null, false);
            } else if (postVote.upvote === false && postVote.downvote === false) {
                //update to firestore with upvote increase
                updateUpvote(stuId, post.id, null, false);
            }
        } else {
            if (postVote.downvote === true) {
                //update the firestore with downvote decrease
                updateDownvote(stuId, post.id, null, true);
            } else if (postVote.upvote === true) {
                //update the firestore with upvote decease and downvote increase
                updateDownvote(stuId, post.id, null, false);
            } else if (postVote.upvote === false && postVote.downvote === false) {
                //update to firestore with down increase
                updateDownvote(stuId, post.id, null, false);
            }
        }
    }

    const onLocalPostVoteChange = (up: boolean) => {
        const cloneUpvote = [...post.upvote];
        const cloneDownvote = [...post.downvote];
        //console.log('OLD POST VOTE: \n' + JSON.stringify(cloneUpvote) + '\n' + JSON.stringify(cloneDownvote));
        if (up) {
            if (postVote.upvote === true) {
                cloneUpvote.splice(cloneUpvote.indexOf(stuId), 1);
                setPostVote({ upvote: false, downvote: false });
            } else {
                cloneUpvote.push(stuId);
                if (cloneDownvote.includes(stuId))
                    cloneDownvote.splice(cloneDownvote.indexOf(stuId), 1);
                setPostVote({ upvote: true, downvote: false });
            }
        } else {
            if (postVote.downvote === true) {
                cloneDownvote.splice(cloneDownvote.indexOf(stuId), 1);
                setPostVote({ upvote: false, downvote: false });
            } else {
                cloneDownvote.push(stuId);
                if (cloneUpvote.includes(stuId))
                    cloneUpvote.splice(cloneUpvote.indexOf(stuId), 1);
                setPostVote({ upvote: false, downvote: true });
            }
        }
        //console.log('NEW POST VOTE: \n' + JSON.stringify(cloneUpvote) + '\n' + JSON.stringify(cloneDownvote));
        setPost({ ...post, upvote: cloneUpvote, downvote: cloneDownvote });
    }

    //change remote + local, return turn proccesed vote value
    const updateCommentVote = (commentId: string, parentCommentId: string | null, up: boolean, currentVote: Vote): Vote => {
        let newVote = { ...currentVote };
        onLocalCommentVoteChange(commentId, parentCommentId, up, currentVote, stuId);
        if (up) {
            if (currentVote.upvote === true) {
                //update the firestore with upvote decrease
                updateUpvote(stuId, null, commentId, true);
                newVote = { upvote: false, downvote: false };
            } else if (currentVote.downvote === true) {
                //update the firestore with downvote decease and upvote increase
                updateUpvote(stuId, null, commentId, false);
                newVote = { upvote: true, downvote: false };
            } else if (currentVote.upvote === false && currentVote.downvote === false) {
                //update to firestore with upvote increase
                updateUpvote(stuId, null, commentId, false);
                newVote = { upvote: true, downvote: false };
            }
        } else {
            if (currentVote.downvote === true) {
                //update the firestore with downvote decrease
                updateDownvote(stuId, null, commentId, true);
                newVote = { upvote: false, downvote: false };
            } else if (currentVote.upvote === true) {
                //update the firestore with upvote decease and downvote increase
                updateDownvote(stuId, null, commentId, false);
                newVote = { upvote: false, downvote: true };
            } else if (currentVote.upvote === false && currentVote.downvote === false) {
                //update to firestore with down increase
                updateDownvote(stuId, null, commentId, false);
                newVote = { upvote: false, downvote: true };
            }
        }
        return newVote;
    }

    const onLocalCommentVoteChange = (commentId: string, parentCommentId: string | null, up: boolean, currentVote: Vote, stuId: string) => {
        const parentComment = parentCommentId === null ? commentId : parentCommentId;
        const cloneBinhLuanChinh = [...post.binh_luan_chinh];
        const parentCommentEntity = cloneBinhLuanChinh.find(cmt => cmt.id === parentComment);
        //console.log('old:' + JSON.stringify(cloneBinhLuanChinh));
        //if the id is post comment
        if (parentCommentId === null && parentCommentEntity) {
            const cloneUpvote = [...parentCommentEntity.upvote];
            const cloneDownvote = [...parentCommentEntity.downvote];
            if (up) {
                if (currentVote.upvote === true) {
                    cloneUpvote.splice(cloneUpvote.indexOf(stuId), 1);
                } else {
                    cloneUpvote.push(stuId);
                    if (cloneDownvote.includes(stuId))
                        cloneDownvote.splice(cloneDownvote.indexOf(stuId), 1);
                }
            } else {
                if (currentVote.downvote === true) {
                    cloneDownvote.splice(cloneDownvote.indexOf(stuId), 1);
                } else {
                    cloneDownvote.push(stuId);
                    if (cloneUpvote.includes(stuId))
                        cloneUpvote.splice(cloneUpvote.indexOf(stuId), 1);
                }
            }
            parentCommentEntity.upvote = cloneUpvote;
            parentCommentEntity.downvote = cloneDownvote;
        }
        //or the id is a subcomment of parentCommentId
        else if (parentCommentEntity) {
            const subCommentEntity = parentCommentEntity.binh_luan_con.find(cmt => cmt.id === commentId);
            if (!subCommentEntity) return; // AVOID typescript things
            const cloneUpvote = [...subCommentEntity.upvote];
            const cloneDownvote = [...subCommentEntity.downvote];
            if (up && subCommentEntity) {
                if (currentVote.upvote === true) {
                    cloneUpvote.splice(cloneUpvote.indexOf(stuId), 1);
                } else {
                    cloneUpvote.push(stuId);
                    if (cloneDownvote.includes(stuId))
                        cloneDownvote.splice(cloneDownvote.indexOf(stuId), 1);
                }
            } else if (!up && subCommentEntity) {
                if (currentVote.downvote === true) {
                    cloneDownvote.splice(cloneDownvote.indexOf(stuId), 1);
                } else {
                    cloneDownvote.push(stuId);
                    if (cloneUpvote.includes(stuId))
                        cloneUpvote.splice(cloneUpvote.indexOf(stuId), 1);
                }
            }
            subCommentEntity.upvote = cloneUpvote;
            subCommentEntity.downvote = cloneDownvote;
        }
        //console.log('new:' + JSON.stringify(cloneBinhLuanChinh));
        setPost({ ...post, binh_luan_chinh: cloneBinhLuanChinh });
    }

    //RENDER CONDITION
    useEffect(() => {
        fetchBaiDangChiTietById(postId)
            .then((post) => {
                setPost(post);
                setPostVote({
                    upvote: post.upvote.includes(stuId) || false,
                    downvote: post && post.downvote.includes(stuId) || false
                });

                fetchSinhVienById(stuId).then(val => {
                    if (val._bai_dang_luu.includes(post.id))
                        setSave(true);
                }).catch((e) => {
                    console.log("Lỗi fetchSinhVienById: " + e);
                    setError(true);
                    return;
                });

                stuId !== post.sinh_vien.ma ? setOption([{ label: 'Báo cáo', value: 0 }]) : setOption([{ label: 'Xoá', value: 1 }]);
            })
            .catch((e) => {
                console.log("Lỗi fetchBaiDangChiTietById: " + e);
                setError(true);
                return;
            });

    }, []);

    const DetailPost = (post: DetailPost): JSX.Element => {
        return (

            <View style={{ flexDirection: 'column', paddingTop: 8 }}>
                <View>
                    <TouchableOpacity
                        style={detailScreen.binhLuanSettingsContainer}
                        onPress={() => setSettingVisibility(!isSettingVisible)}>
                        <Image source={images.three_dot} />
                    </TouchableOpacity>
                    {isSettingVisible && <View style={detailScreen.binhLuanOptionContainer}>
                        {option.map(opt =>
                            <TouchableOpacity
                                key={opt.value}
                                onPress={() => handlePostOptions(opt.value)}>
                                <Text style={{ color: '#000000' }}>{opt.label}</Text>
                            </TouchableOpacity>)}
                    </View>}

                </View>
                {/* Header */}
                <View style={detailScreen.postHeader}>
                    <Image
                        style={detailScreen.avatarImg}
                        source={{ uri: post.sinh_vien.avatar }} />
                    <View style={detailScreen.postHeaderTitleContainer}>
                        <Text style={detailScreen.postHeaderTitleName}>{post.sinh_vien.ten}</Text>
                        <Text style={detailScreen.postHeaderTitleSubtitle}>{post.mon_hoc + ' ▪ ' + `${post.ngay_sua.getDate()}/${post.ngay_sua.getMonth() + 1}/${post.ngay_sua.getFullYear()}`}</Text>
                    </View>
                </View>

                {/* Nội dung */}
                <View style={detailScreen.postContentContainer}>
                    <Text style={detailScreen.postContentTitle}>{post.tieu_de}</Text>
                    <Text style={detailScreen.postContent}>{post.noi_dung}</Text>

                    {
                        post.hinh_anh_uri.length > 0 ?
                            <FlatList
                                horizontal={true}
                                style={detailScreen.postImagesContainer}
                                data={post.hinh_anh_uri}
                                renderItem={({ item }: { item: string }) =>
                                    <TouchableOpacity onPress={() => setSelectedImage(item)}>
                                        <Image
                                            source={{ uri: item }}
                                            style={detailScreen.postSmallImageItem} />
                                    </TouchableOpacity>
                                } /> : <></>
                    }
                </View>

                {/* Footer */}
                <View style={detailScreen.postFooterContainer}>
                    <View style={detailScreen.postFooterItem}>
                        <TouchableOpacity onPress={() => updatePostVote(true)}>
                            {postVote.upvote ?
                                <Image source={images.voted_up_arrow} /> :
                                <Image source={images.up_arrow} />
                            }
                        </TouchableOpacity>

                        <Text style={[detailScreen.postFooterText, postVote.upvote && { color: '#de6d23' }]}>{post.upvote.length - post.downvote.length}</Text>

                        <TouchableOpacity onPress={() => updatePostVote(false)}>
                            {!postVote.downvote ?
                                <Image source={images.down_arrow} />
                                : <Image source={images.voted_down_arrow} />
                            }
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={[detailScreen.postFooterItem]} onPress={() => isSaved ? handlePostUndoSave() : handlePostSave()}>
                        {!isSaved ? <Image source={images.bookmark} /> : <Image source={images.bookmark_avtive} />}
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    if (!error) {
        return post.id !== '' ?
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flexGrow: 1 }}>
                <Modal visible={displayReportModal} transparent={true}>
                    <View style={detailScreen.reportModalContainer}>
                        <View style={detailScreen.reportWindowContainer}>
                            <View style={{ alignItems: 'flex-start' }}>
                                {reportTypes.map(item => (
                                    <View style={{ flexDirection: 'row', margin: 8 }} key={item.value}>
                                        <BouncyCheckbox onPress={(checked) => onReportDataChange(item.value, checked)} />
                                        <Text style={{ color: 'black', }}>{`${item.label}`}</Text>
                                    </View>
                                ))}
                            </View>
                            <View style={detailScreen.textInputContainer}>
                                <TextInput
                                    multiline={true}
                                    style={{ color: 'black', }}
                                    placeholder='Thêm mô tả... (tuỳ chọn)'
                                    value={reportData.mo_ta}
                                    onChangeText={(text) => setReportData({ ...reportData, mo_ta: text })}
                                    placeholderTextColor="#727274" />
                            </View>
                            <TouchableOpacity onPress={() => onSendReport()} disabled={reportData.danh_muc.length === 0}>
                                <Text style={[{ color: '#727274', fontSize: 16, fontWeight: '600', marginVertical: 8, }, reportData.danh_muc.length > 0 && { color: '#057fd7' }]}>Lưu</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={onCancelReport}>
                                <Text style={{ color: 'black', fontSize: 16, fontWeight: '400' }}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                <View style={detailScreen.background}>
                    {selectedImage && (
                        <Modal visible={selectedImage !== ''} transparent={true}>
                            <View style={detailScreen.modalContainer}>
                                <TouchableOpacity style={detailScreen.modalCancelButton} onPress={() => setSelectedImage('')}>
                                    <Image source={images.cancel} />
                                </TouchableOpacity>
                                <Image
                                    source={{ uri: selectedImage }}
                                    resizeMode="contain"
                                    style={detailScreen.modalFullImage} />
                            </View>
                        </Modal>
                    )}

                    <View style={[detailScreen.block, { marginBottom: 70, paddingBottom: 10 }]}>
                        <KeyboardAwareFlatList
                            showsVerticalScrollIndicator={false}
                            ListHeaderComponent={DetailPost(post)}
                            data={post.binh_luan_chinh}
                            keyExtractor={(binhLuan) => binhLuan.id}
                            renderItem={({ item }: { item: BinhLuan }) =>
                                <BinhLuanItem
                                    postId={post.id}
                                    binhLuan={item}
                                    parentCommentId={null}
                                    sinhVienId={stuId}
                                    onSubBinhLuanAdded={addSubComment}
                                    onCommentVoteChange={updateCommentVote}
                                    deleteLocalComment={deleteLocalComment}
                                    openReportModalFromCmt={openReportModalFromCmt} />}
                        />
                    </View>
                    {
                        <View style={detailScreen.postCommentContainer}>
                            <UserComment
                                postId={post.id}
                                sinhVienId={stuId}
                                binhLuanId={null}
                                updateLocalPrimaryComment={null}
                                updateLocalPostComment={addPostComment} />
                        </View>
                    }
                </View></KeyboardAvoidingView> : <ActivityIndicator style={{ width: '100%', height: '100%', justifyContent: 'center', backgroundColor: '#dbe0e8' }} size="large" />
    } else {
        return (
            <Text style={{ width: '100%', height: '100%', fontSize: 30, backgroundColor: '#dbe0e8', color: 'black' }}>
                Bài đăng không tồn tại. Hãy làm mới danh sách ở trang trước. Nếu lỗi tiếp tục tồn tại hay liên hệ nhà phát triển!
            </Text>
        );
    }
}
