import { memo, useContext, useEffect, useState } from "react";
import { Image, ImageBackground, Text, TouchableOpacity, View } from "react-native";
import { images } from "../../images";
import { styles } from "./styles";
import React from "react";
import { AuthContext } from "../DangNhap/AuthContext";
import { updateUpvote, updateDownvote } from "../../../firebase/api/Usecase.tsx/BaiDang";

interface Props {
    post: CollapsedPost,
    onPostVoteChange: (postId: string, stuId: string, up: boolean, currentVote: Vote) => Vote,
    fetchRealtimeVote: (postId: string) => void,
    navigation: any,
    showStudentInfo: boolean,
}

export interface Vote {
    upvote: boolean,
    downvote: boolean,
}

function BaiDangTomTat({ post, onPostVoteChange, fetchRealtimeVote, navigation, showStudentInfo }: Props): JSX.Element {

    const [vote, setVote] = useState<Vote>({ upvote: false, downvote: false });
    const { stuId }: any = useContext(AuthContext);

    const handleUserClick = () => {
        navigation.navigate('UserProfile', {thisStuId: post.sinh_vien.ma});
    }

    const handleDetailPostNav = () => {
        navigation.navigate('DetailPost', { postId: post.id })
    }

    useEffect(() => {
        const userUpvote = post.upvote.includes(stuId);
        const userDownvote = post.downvote.includes(stuId);
        setVote({ upvote: userUpvote, downvote: userDownvote })
    }, []);

    //REALTIME UPDATE AFTER CHANGING VOTE
    useEffect(() => { setTimeout(() => fetchRealtimeVote(post.id), 1000) }, [vote]);

    const onVoteChange = (type: string) => {
        //changes depend on up/down button is on or not && what button user clicked
        if (type === 'up') {
            if (vote.upvote === true) {
                //update the firestore with upvote decrease
                setVote(onPostVoteChange(post.id, stuId, true, vote))
                updateUpvote(stuId, post.id, null, true);
            } else if (vote.downvote === true) {
                //update the firestore with downvote decease and upvote increase
                setVote(onPostVoteChange(post.id, stuId, true, vote));
                updateUpvote(stuId, post.id, null, false);
            } else if (vote.upvote === false && vote.downvote === false) {
                //update to firestore with upvote increase
                setVote(onPostVoteChange(post.id, stuId, true, vote));
                updateUpvote(stuId, post.id, null, false);
            }
        } else if (type === 'down') {
            if (vote.downvote === true) {
                //update the firestore with downvote decrease
                setVote(onPostVoteChange(post.id, stuId, false, vote));
                updateDownvote(stuId, post.id, null, true);
            } else if (vote.upvote === true) {
                //update the firestore with upvote decease and downvote increase
                setVote(onPostVoteChange(post.id, stuId, false, vote));
                updateDownvote(stuId, post.id, null, false);
            } else if (vote.upvote === false && vote.downvote === false) {
                //update to firestore with down increase
                setVote(onPostVoteChange(post.id, stuId, false, vote));
                updateDownvote(stuId, post.id, null, false);
            }
        }
    }

    return (
        <View style={styles.post}>
            {/* --- HEADER --- */}
            <View style={styles.headerItems}>
                <View style={{ flexDirection: 'row' }}>
                    {showStudentInfo && <TouchableOpacity style={{ flexDirection: 'row' }} onPress={handleUserClick}>
                        <Image style={styles.avatarImg} source={{ uri: post.sinh_vien.avatar }} />
                        <Text style={[styles.headerText, {color: '#222222', fontWeight: '500'}]}>{post.sinh_vien.ten}</Text>
                    </TouchableOpacity>}
                    <Text style={styles.headerText}>{' ▪ ' + `${post.ngay_sua.getDate()}/${post.ngay_sua.getMonth()+1}/${post.ngay_sua.getFullYear()}`}</Text>
                </View>
            </View>

            {/* --- CONTENT --- */}
            <TouchableOpacity style={styles.contentItems} onPress={handleDetailPostNav}>
                <View style={styles.contentTextContainer}>
                    <Text style={styles.title} numberOfLines={3} ellipsizeMode='tail'>{post.tieu_de}</Text>
                    {false ? <></> :
                        <View style={styles.chipContainer}>
                            <Text style={styles.chipText}>{post.mon_hoc}</Text>
                        </View>
                    }
                </View>
                {post.hinh_anh_uri.length === 0 ? <></> :
                    <ImageBackground
                        source={{ uri: post.hinh_anh_uri[0] }}
                        style={styles.contentImgContainer}
                        imageStyle={{ borderRadius: 10, height: 'auto' }}>

                        {post.hinh_anh_uri.length > 1 ?
                            <View style={styles.imgOverlay}>
                                <Text style={[styles.headerText, { color: '#f9f9ff' }]}>{`+${post.hinh_anh_uri.length - 1}`}</Text>
                            </View> : <></>
                        }
                    </ImageBackground>
                }
            </TouchableOpacity>

            {/* --- FOOTER --- */}
            <View style={styles.footerContainer}>
                <View style={styles.footerItem}>
                    <TouchableOpacity onPress={() => { onVoteChange('up'); }}>
                        {vote.upvote === false ?
                            <Image source={images.up_arrow} />
                            : <Image source={images.voted_up_arrow} />
                        }
                    </TouchableOpacity>

                    <Text style={[styles.footerText, vote.upvote && { color: '#ff4500' }]}>{post.upvote.length - post.downvote.length}</Text>

                    <TouchableOpacity onPress={() => onVoteChange('down')}>
                        {vote.downvote === false ?
                            <Image source={images.down_arrow} />
                            : <Image source={images.voted_down_arrow} />
                        }
                    </TouchableOpacity>
                </View>

                <View style={[styles.footerItem, {paddingHorizontal: 14}]}>
                    <Image source={images.comment} />
                    <Text style={[styles.footerText, { marginLeft: 5 }]}>{post.tong_binh_luan}</Text>
                </View>
            </View>
        </View>
    )
}

export default memo(BaiDangTomTat);