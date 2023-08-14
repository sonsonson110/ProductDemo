import React from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import BaiDangTomTat, { Vote } from "./BaiDangTomTat";
import { styles } from "./styles";

interface Props {
    posts: CollapsedPost[],
    onPostVoteChange: (postId: string, stuId: string, up: boolean, currentVote: Vote) => Vote,
    fetchRealtimeVote: (postId: string) => void,
    refreshProps: { onRefresh: () => void, loading: boolean } | null,
    navigation: any,
    showStudentInfo: boolean,
    fetchMorePosts: (() => void) | null,
    olderLoading: boolean,
}

export default function DanhSachBaiDangTomTat({ posts, onPostVoteChange, fetchRealtimeVote, refreshProps, navigation, showStudentInfo, fetchMorePosts, olderLoading }: Props): JSX.Element {

    return (
        <View style={[styles.background, {zIndex: -1}]}>
            <FlatList
                data={posts}
                keyExtractor={(post, _index) => post.id}
                renderItem={({ item }: { item: CollapsedPost }) =>
                    <BaiDangTomTat
                        showStudentInfo={showStudentInfo}
                        post={item}
                        onPostVoteChange={onPostVoteChange}
                        fetchRealtimeVote={fetchRealtimeVote}
                        navigation={navigation} />}
                refreshing={refreshProps?.loading}
                onRefresh={refreshProps?.onRefresh}
                onEndReached={ fetchMorePosts }
                ListFooterComponent={olderLoading ? <ActivityIndicator size={'large'}/> : <></>}
            />
        </View>
    )
}
