import React, { useEffect, useState } from "react";
import DanhSachBaiDangTomTat from "../DanhSachBaiDangTomTat/DanhSachBaiDangTomTat";
import { fetchAllBaiDangTomTat, fetchBaiDangTomTatByMonHocId } from "../../../firebase/api/Usecase.tsx/BaiDang";
import { ActivityIndicator } from "react-native-paper";
import { Vote } from "../DanhSachBaiDangTomTat/BaiDangTomTat";
import { fetchNewVote } from "../../../firebase/api/Usecase.tsx/BaiDang";


export default function ListBaiDangTomTatTheoMon({ navigation, route }: any): JSX.Element {
    const { id_mon_hoc } = route.params;
    const [posts, setPosts] = useState<CollapsedPost[]>([]);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        fetchBaiDangTomTatByMonHocId(id_mon_hoc)
        .then(data => {
            setPosts(data);
            setLoading(false);
            console.log(data);
        })
        .catch(e => console.log(e));
    }, []);

    return !loading ?
        <DanhSachBaiDangTomTat
            showStudentInfo={true}
            posts={posts}
            onPostVoteChange={onPostVoteChange}
            fetchRealtimeVote={fetchRealtimeVote}
            refreshProps={{ onRefresh: onRefresh, loading: loading }}
            navigation={navigation}
            fetchMorePosts={null}
            olderLoading={false}
        />
        :
        <ActivityIndicator style={{ width: '100%', height: '100%', justifyContent: 'center', backgroundColor: '#dbe0e8' }} size="large" />

}