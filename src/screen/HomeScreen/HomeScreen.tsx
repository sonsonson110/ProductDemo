import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, Text, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { Vote } from "../../component/DanhSachBaiDangTomTat/BaiDangTomTat";
import DanhSachBaiDangTomTat from "../../component/DanhSachBaiDangTomTat/DanhSachBaiDangTomTat";
import { images } from "../../images";
import { homeStyles, } from "./styles";
import { fetchNewVote, fetchAllBaiDangTomTat, fetchMoreBaiDangTomTat } from "../../../firebase/api/Usecase.tsx/BaiDang";

export default function HomeScreen({ navigation }: any): JSX.Element {
    const [lastDoc, setLastDoc] = useState<any>();

    //FOR DROPDOWN MENU
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState([{ label: 'mới nhất', value: '1' }, { label: 'chú trọng', value: '2' }]);
    const [value, setValue] = useState<string>('1');

    //DATA TO DISPLAY
    const [posts, setPosts] = useState<CollapsedPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [olderLoading, setOlderLoading] = useState(false);


    const fetchRealtimeVote = async (postId: string) => {
        const newVote: { upvote: string[], downvote: string[] } = await fetchNewVote(postId);
        setPosts(posts.map(
            post => post.id === postId ?
                { ...post, upvote: newVote.upvote, downvote: newVote.downvote } : post
        ));
    }

    //HANDLE LIST FRESHING
    const onRefresh = () => {
        setLoading(true);
        fetchAllBaiDangTomTat()
            .then(data => {
                setPosts(data.posts);
                setLastDoc(data.lastDoc);
                setLoading(false);
            })
    }

    //HANDLE A POST'S TOTAL VOTE AFTER USER VOTE
    const onPostVoteChange = (postId: string, stuId: string, up: boolean, currentVote: Vote): Vote => {
        setPosts(posts.map(post => {
            if (post.id !== postId)
                return post;

            if (up) {
                if (currentVote.upvote === true) {
                    post.upvote.splice(post.upvote.indexOf(stuId), 1);
                    currentVote = { upvote: false, downvote: false };
                } else {
                    post.upvote.push(stuId);
                    if (post.downvote.includes(stuId))
                        post.downvote.splice(post.downvote.indexOf(stuId), 1);
                    currentVote = { upvote: true, downvote: false };
                }
            } else {
                if (currentVote.downvote === true) {
                    post.downvote.splice(post.downvote.indexOf(stuId), 1);
                    currentVote = { upvote: false, downvote: false };
                } else {
                    post.downvote.push(stuId);
                    if (post.upvote.includes(stuId))
                        post.upvote.splice(post.upvote.indexOf(stuId), 1);
                    currentVote = { upvote: false, downvote: true };
                }
            }
            return post;
        }));

        return currentVote;
    }
    // GET MORE POST AT THE LIST BOTTOM
    const fetchMorePosts = async () => {
        if (olderLoading) return null;
        setOlderLoading(true);
        const olderData = await fetchMoreBaiDangTomTat(lastDoc);
        if (olderData === null) {
            setOlderLoading(false);
            setLastDoc(null);
            return null;
        }
        setLastDoc(olderData.lastDoc);
        setPosts((p) => p.concat(olderData.posts));
        olderData.posts.forEach((doc) => console.log('new: ' + doc.id));
        setOlderLoading(false);
        return null;
    }

    //GET POST AT SCREEN INITIATION
    useEffect(() => {
        fetchAllBaiDangTomTat().then(data => {
            setPosts(data.posts);
            setLastDoc(data.lastDoc);
            setLoading(false);
            data.posts.forEach((value, index) => console.log(`init: ${index}` + value.id));
        });
    }, []);

    // //HANDLE POST LIST WHEN SORT OPTION CHANGED
    useEffect(() => {
        if (value === '1' && loading === false) {
            setLoading(true);
            const newSortedPosts = [...posts];
            newSortedPosts.sort((a, b) => (b.ngay_sua.getTime() - a.ngay_sua.getTime()) - (b.ngay_sua.getTime() - b.ngay_sua.getTime()));
            setPosts(newSortedPosts);
            setLoading(false);
            console.log('rendered!');
        }
        else if (value === '2') {
            setLoading(true);
            const voteSortedPosts = [...posts];
            voteSortedPosts.sort((a, b) => (b.upvote.length - b.downvote.length) - (a.upvote.length - a.downvote.length))
            setPosts(voteSortedPosts);
            setLoading(false);
        }
    }, [value])

    return (
        <View style={homeStyles.background}>
            <View style={homeStyles.homeHeaderContainer}>
                <Image source={images.gdsc} style={{ width: 50, height: 25, resizeMode: 'contain' }} />
                <Text style={[{ flexBasis: 120 }, homeStyles.homeTitleText]}>Study Together</Text>
                <Text style={[homeStyles.homeTitleText, { flex: 2, fontSize: 12, textAlign: 'right' },]}>Sắp xếp theo: </Text>
                {!loading && <DropDownPicker
                    placeholder=""
                    open={open}
                    value={value || '1'}
                    items={items}
                    setOpen={setOpen}
                    setValue={setValue}
                    setItems={setItems}
                    theme="LIGHT"
                    containerStyle={{
                        alignSelf: 'center',
                        flex: 2.5,
                    }}
                    style={{
                        paddingHorizontal: 5,
                        minHeight: 30,
                    }}
                    textStyle={{ fontSize: 12, }}
                />}
            </View>
            <View style={{ flex: 1, flexGrow: 1 }}>
                {loading ?
                    <ActivityIndicator style={{ width: '100%', height: '100%', justifyContent: 'center', backgroundColor: '#dbe0e8' }} size="large" />
                    :
                    <DanhSachBaiDangTomTat
                        showStudentInfo={true}
                        posts={posts}
                        onPostVoteChange={onPostVoteChange}
                        fetchRealtimeVote={fetchRealtimeVote}
                        refreshProps={{ onRefresh: onRefresh, loading: loading }}
                        navigation={navigation}
                        fetchMorePosts={fetchMorePosts}
                        olderLoading={olderLoading}
                    />}
            </View>
        </View>
    )
}