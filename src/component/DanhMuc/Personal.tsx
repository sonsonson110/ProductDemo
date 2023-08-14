import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, ScrollView } from 'react-native';
import { db, storage } from '../../../firebase/configuration'
import { collection, getDocs } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { images } from '../../images';
import { fetchBaiDangTheoTieuDeTimKiem, fetchNewVote } from '../../../firebase/api/Usecase.tsx/BaiDang';
import DanhSachBaiDangTomTat from '../DanhSachBaiDangTomTat/DanhSachBaiDangTomTat';
import { Vote } from '../DanhSachBaiDangTomTat/BaiDangTomTat';
import { ActivityIndicator } from 'react-native-paper';

interface SinhVien {
    id: string;
    ten: string;
    avatar?: string;
    moTa?: string;
}

const Tab = ({ navigation }: any): JSX.Element => {
    const [isPeopleTab, setPeopleTab] = useState<boolean>(true);
    const [searchKeyword, setSearchKeyword] = useState<string>('');
    const [filteredData, setFilteredData] = useState<SinhVien[]>([]);
    const [searchPosts, setSearchPost] = useState<CollapsedPost[]>([]);
    const [postsLoading, setLoading] = useState(false);

    const fetchRealtimeVote = async (postId: string) => {
        const newVote: { upvote: string[], downvote: string[] } = await fetchNewVote(postId);
        setSearchPost(searchPosts.map(
            post => post.id === postId ?
                { ...post, upvote: newVote.upvote, downvote: newVote.downvote } : post
        ));
    }

    //HANDLE A POST'S TOTAL VOTE AFTER USER VOTE
    const onPostVoteChange = (postId: string, stuId: string, up: boolean, currentVote: Vote): Vote => {
        setSearchPost(searchPosts.map(post => {
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

    const handleBackIconPress = () => {
        navigation.goBack();
    };

    const handleSearch = () => {
        fetchFilteredData();
        setLoading(true);
        fetchBaiDangTheoTieuDeTimKiem(searchKeyword)
            .then(searchPosts => {
                setSearchPost(searchPosts);
                setLoading(false);
            });
    };
    // hiển thị kết quả tìm kiếm
    const PersonalItemList: React.FC<{ list: SinhVien[] }> = ({ list }) => (
        <ScrollView style={styles.postList}>
            {list.map((sinhVien) => (
                <TouchableOpacity
                    key={sinhVien.id}
                    style={styles.postContainer}
                    onPress={() => navigation.navigate("UserProfile", { thisStuId: sinhVien.id })}>
                    <View style={styles.postHeader}>
                        {sinhVien.avatar && < Image source={{ uri: sinhVien.avatar }} style={styles.avatar} />}
                        <Text style={styles.name}>{sinhVien.ten}</Text>
                    </View>
                    {sinhVien.moTa && (
                        <Text style={styles.description}>{sinhVien.moTa}</Text>
                    )}
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
    // lấy data từ firebase
    const fetchFilteredData = async () => {
        if (searchKeyword.trim() !== '') {
            const searchTerm = searchKeyword.toLowerCase().trim();
            const querySnapshot = await getDocs(collection(db, 'sinh_vien'));
            const data = await Promise.all(
                querySnapshot.docs
                    .filter((doc) => {
                        const sinhVienData = doc.data() as SinhVien;
                        return (
                            sinhVienData.ten &&
                            sinhVienData.ten.toLowerCase().includes(searchTerm)
                        );
                    })
                    .map(async (doc) => {
                        const sinhVienData = doc.data() as SinhVien;
                        if (sinhVienData.avatar) {
                            const avatarRef = ref(
                                storage,
                                `avatar/${sinhVienData.avatar}`
                            );
                            const avatarLink = await getDownloadURL(avatarRef);
                            sinhVienData.avatar = avatarLink;
                        }
                        return { ...sinhVienData, id: doc.id };
                    })
            );
            setFilteredData(data);
        } else {
            setFilteredData([]);
        }
    };
    return (

        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBackIconPress}>
                    <Image source={images.arrow_left} style={styles.backIcon} />
                </TouchableOpacity>
                <View style={styles.searchBar}>
                    <TextInput
                        autoFocus={true}
                        placeholderTextColor={"gray"}
                        style={styles.searchInput}
                        placeholder="Search"
                        value={searchKeyword}
                        onChangeText={setSearchKeyword}
                        onSubmitEditing={handleSearch}
                    />
                    <TouchableOpacity onPress={handleSearch}>
                        <Image source={images.inactive_search} style={styles.searchIcon} />
                    </TouchableOpacity>
                </View>
            </View>


            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        isPeopleTab && styles.activeTab
                    ]}
                    onPress={() => setPeopleTab(true)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.tabText}>People</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        !isPeopleTab && styles.activeTab
                    ]}
                    onPress={() => setPeopleTab(false)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.tabText}>Posts</Text>
                </TouchableOpacity>
            </View>



            {isPeopleTab ?
                <View style={styles.searchResultsContainer}>
                    <PersonalItemList list={filteredData} />
                </View>
                : !postsLoading ?
                    <View style={{flex: 1, flexBasis: 'auto'}}>
                        <DanhSachBaiDangTomTat
                            showStudentInfo={true}
                            posts={searchPosts}
                            onPostVoteChange={onPostVoteChange}
                            fetchRealtimeVote={fetchRealtimeVote}
                            navigation={navigation}
                            refreshProps={null}
                            fetchMorePosts={null} olderLoading={false} />
                    </View>
                    :
                    <ActivityIndicator style={{ flex: 1, flexGrow: 1, alignSelf: 'center', justifyContent: 'center' }} size={'large'} />
            }

        </View>

    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderRadius: 10,
        paddingTop: 30,
        paddingHorizontal: 8,
        backgroundColor: '#dbe0e8'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 10,
    },
    backButton: {
        fontSize: 18,
        color: '#007AFF',
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        paddingHorizontal: 10,
        maxWidth: 350,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: 'black',
        marginRight: 8,
    },
    searchButton: {
        fontSize: 16,
        color: '#007AFF',
    },
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    tabButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: '#BBBBBB',
        paddingVertical: 10,
    },
    activeTab: {
        borderBottomColor: '#007AFF',
    },
    tabText: {
        fontSize: 18,
        color: 'black'
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backIcon: {
        width: 30,
        height: 30,
        resizeMode: 'contain',
        marginRight: 10,
    },
    searchIcon: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
    },
    avatarContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 50,
    },
    searchResultsContainer: {
        width: '100%',
        alignItems: 'flex-start',
    },
    postList: {
        width: '100%',
    },
    postContainer: {
        justifyContent: 'center',
        marginBottom: 10,
        padding: 8,
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
        width: '100%', // Make the post container full width
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    name: {
        fontSize: 16,
        marginLeft: 16,
        color: 'black'
    },
    description: {
        fontSize: 14,
        color: 'black'
    },
});

export default Tab;
