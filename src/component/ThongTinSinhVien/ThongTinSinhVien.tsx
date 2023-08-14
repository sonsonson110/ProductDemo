import { View, Text, Image, ActivityIndicator, TouchableOpacity, Modal, TextInput } from 'react-native';
import styles from './style';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { SinhVien } from './Entity';
import DanhSachBaiDangTomTat from '../DanhSachBaiDangTomTat/DanhSachBaiDangTomTat';
import { Vote } from '../DanhSachBaiDangTomTat/BaiDangTomTat';
import { AuthContext } from '../DangNhap/AuthContext';
import { images } from '../../images';
import { Asset, OptionsCommon, launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { fetchNewVote, fetchBaiDangTomTatFromStudentId, fetchSavedBaiDangTomTatOfStudentId } from '../../../firebase/api/Usecase.tsx/BaiDang';
import { updateSinhVienProfile, fetchProfileDataById, setFollow } from '../../../firebase/api/Usecase.tsx/SinhVien';

interface Props {
  navigation: any,
  route: any,
}

interface ModifyInput {
  hinh_anh: Asset | null,
  mo_ta: string
}

export default function ThongTinSinhVien({ navigation, route }: Props) {
  const { logout }: any = useContext(AuthContext);
  const { stuId }: any = useContext(AuthContext);

  const { thisStuId } = route.params;

  const [isSelf, setIsSelf] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userPostsLoading, setUserPostsLoading] = useState(true);
  const [userSavedPostsLoading, setUserSavedPostsLoading] = useState(true);
  const [followed, setFollowed] = useState(false);

  const [userPosts, setUserPosts] = useState<CollapsedPost[]>([]);
  const [userSavedPosts, setUserSavedPosts] = useState<CollapsedPost[]>([]);

  const [sinhVien, setSinhVien] = useState<SinhVien>({
    id: '',
    ten: '',
    avatarLink: '',
    email: '',
    mo_ta: '',
    ngay_sinh: '',
    followers: [],
    following: [],
  });

  const [modifyModal, setModifyModal] = useState(false);
  const [showPickerOption, setShowPickerOption] = useState(false);
  const [modifyInput, setModifyInput] = useState<ModifyInput>({
    hinh_anh: null,
    mo_ta: '',
  });

  const [currentTabIndex, setCurrentTabIndex] = useState(0);

  const onFollowButtonClick = async (add: boolean) => {
    setFollowed(!add);
    //handle remote
    await setFollow(thisStuId, stuId, !add);
  }

  const handleLogout = () => {
    logout();
    navigation.navigate('Login');
  }

  const handleModiyModalSave = () => {
    updateSinhVienProfile(stuId, modifyInput.hinh_anh, modifyInput.mo_ta).then(() => {
      setSinhVien({ ...sinhVien, mo_ta: modifyInput.mo_ta });
      modifyInput.hinh_anh && modifyInput.hinh_anh.uri && setSinhVien({ ...sinhVien, avatarLink: modifyInput.hinh_anh.uri });
      handleModiyModalCancel();
    });
  }
  const handleModiyModalCancel = () => {
    setModifyModal(false),
      setModifyInput({ hinh_anh: null, mo_ta: sinhVien.mo_ta });
  }

  const isDataUpdatable = () => {
    return modifyInput.hinh_anh !== null || modifyInput.mo_ta !== sinhVien.mo_ta;
  }

  //select image
  const option: OptionsCommon = {
    mediaType: 'photo'
  }
  const getCameraImage = async () => {
    setShowPickerOption(false);
    const cameraImage = await launchCamera(option);

    if (!cameraImage.assets) return;
    setModifyInput({ ...modifyInput, hinh_anh: cameraImage.assets[0] })
  }

  const getGalleryImage = async () => {
    setShowPickerOption(false);
    const galleryImage = await launchImageLibrary(option);

    if (!galleryImage.assets) return;
    setModifyInput({ ...modifyInput, hinh_anh: galleryImage.assets[0] });
  }

  const fetchRealtimeVoteTab0 = async (postId: string) => {
    const newVote: { upvote: string[], downvote: string[] } = await fetchNewVote(postId);
    setUserPosts(userPosts.map(
      post => post.id === postId ?
        { ...post, upvote: newVote.upvote, downvote: newVote.downvote } : post
    ));
  }

  const onRefreshTab0 = () => {
    setUserPostsLoading(true);
    fetchBaiDangTomTatFromStudentId(thisStuId).then((p) => {
      setUserPosts(p);
      setUserPostsLoading(false);
    });
  }

  const fetchRealtimeVoteTab1 = async (postId: string) => {
    const newVote: { upvote: string[], downvote: string[] } = await fetchNewVote(postId);
    setUserSavedPosts(userSavedPosts.map(
      post => post.id === postId ?
        { ...post, upvote: newVote.upvote, downvote: newVote.downvote } : post
    ));
  }

  const onRefreshTab1 = () => {
    setUserSavedPostsLoading(true);
    fetchSavedBaiDangTomTatOfStudentId(thisStuId).then((val) => {
      setUserSavedPosts(val);
      setUserSavedPostsLoading(false);
    });
  }


  //HANDLE A POST'S TOTAL VOTE AFTER USER VOTE
  const onPostVoteChangeTab0 = (postId: string, thisStuId: string, up: boolean, currentVote: Vote): Vote => {
    setUserPosts(userPosts.map(post => {
      if (post.id !== postId)
        return post;

      if (up) {
        if (currentVote.upvote === true) {
          post.upvote.splice(post.upvote.indexOf(thisStuId), 1);
          currentVote = { upvote: false, downvote: false };
        } else {
          post.upvote.push(thisStuId);
          if (post.downvote.includes(thisStuId))
            post.downvote.splice(post.downvote.indexOf(thisStuId), 1);
          currentVote = { upvote: true, downvote: false };
        }
      } else {
        if (currentVote.downvote === true) {
          post.downvote.splice(post.downvote.indexOf(thisStuId), 1);
          currentVote = { upvote: false, downvote: false };
        } else {
          post.downvote.push(thisStuId);
          if (post.upvote.includes(thisStuId))
            post.upvote.splice(post.upvote.indexOf(thisStuId), 1);
          currentVote = { upvote: false, downvote: true };
        }
      }
      return post;
    }));

    return currentVote;
  }
  const onPostVoteChangeTab1 = (postId: string, thisStuId: string, up: boolean, currentVote: Vote): Vote => {
    setUserSavedPosts(userSavedPosts.map(post => {
      if (post.id !== postId)
        return post;

      if (up) {
        if (currentVote.upvote === true) {
          post.upvote.splice(post.upvote.indexOf(thisStuId), 1);
          currentVote = { upvote: false, downvote: false };
        } else {
          post.upvote.push(thisStuId);
          if (post.downvote.includes(thisStuId))
            post.downvote.splice(post.downvote.indexOf(thisStuId), 1);
          currentVote = { upvote: true, downvote: false };
        }
      } else {
        if (currentVote.downvote === true) {
          post.downvote.splice(post.downvote.indexOf(thisStuId), 1);
          currentVote = { upvote: false, downvote: false };
        } else {
          post.downvote.push(thisStuId);
          if (post.upvote.includes(thisStuId))
            post.upvote.splice(post.upvote.indexOf(thisStuId), 1);
          currentVote = { upvote: false, downvote: true };
        }
      }
      return post;
    }));

    return currentVote;
  }

  const handleTabChange = (tabIndex: number) => {
    setCurrentTabIndex(tabIndex);
  }

  useEffect(() => {
    //STUID LẤY QUÁ CHẬM ??!!
    if (!stuId) return;
    fetchProfileDataById(thisStuId).then((sv) => {
      setIsSelf(stuId === thisStuId);
      setSinhVien(sv);
      const followed = sv.followers.find(item => item.id === stuId);
      followed && setFollowed(true);
      setModifyInput({ ...modifyInput, mo_ta: sv.mo_ta });
      setLoading(false);
      fetchBaiDangTomTatFromStudentId(thisStuId).then((p) => {
        setUserPosts(p);
        setUserPostsLoading(false);
        fetchSavedBaiDangTomTatOfStudentId(thisStuId).then((val) => {
          setUserSavedPosts(val);
          setUserSavedPostsLoading(false);
        });
      })
    })
  }, [stuId]);

  const Profile = () => {
    return (
      <View style={styles.container}>
        <View style={{ position: 'absolute', flex: 1, alignSelf: 'flex-end', top: 20, right: 20 }}>
          {isSelf ? <>
            <TouchableOpacity onPress={handleLogout}>
              <Text style={[styles.actionButtonTextContainer, { backgroundColor: '#d5d6da', color: '#101010' }]}>Đăng xuất</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginTop: 10 }} onPress={() => setModifyModal(true)}>
              <Text style={[{ borderColor: '#d5d6da', borderWidth: 1, color: '#d5d6da' }, styles.actionButtonTextContainer]}>Chỉnh sửa</Text>
            </TouchableOpacity>
          </> :
            <TouchableOpacity style={{ marginTop: 10 }} onPress={() => onFollowButtonClick(followed)}>
              <Text style={[followed ? { borderColor: '#d5d6da', borderWidth: 1, color: '#d5d6da' } : { backgroundColor: '#d5d6da', color: '#101010' }, styles.actionButtonTextContainer]}>{followed ? 'Huỷ theo dõi' : 'Theo dõi'}</Text>
            </TouchableOpacity>
          }

        </View>
        <View style={styles.control}>
        </View>
        <View style={styles.header}>
          <Image source={{ uri: sinhVien.avatarLink }} style={styles.avatar} />
          <Text style={styles.username}>{sinhVien?.ten}</Text>
          <View style={styles.Follow}>
            <Text style={styles.statNumber}>{'Người theo dõi: ' + sinhVien.followers.length}</Text>
            <Text style={styles.statNumber2}>{'Đang theo dõi: ' + sinhVien.following.length}</Text>
          </View>
          <View style={styles.birth}>
            <Text style={styles.day}>{'Ngày sinh: ' + sinhVien.ngay_sinh}</Text>
            {sinhVien.mo_ta && <Text style={styles.day}>{'Mô tả: ' + sinhVien?.mo_ta}</Text>}
          </View>

        </View>
      </View>

    );
  };

  return (
    <View style={{ flex: 1, flexGrow: 1, backgroundColor: '#dbe0e8' }}>
      <Modal visible={modifyModal} transparent={true}>
        <View style={styles.modifyModalContainer}>
          <View style={styles.modifyWindowContainer}>
            <Text style={{ color: 'black' }}>Chọn ảnh đại diện mới</Text>

            <TouchableOpacity style={{ marginVertical: 10 }} onPress={() => setShowPickerOption(true)}>
              {modifyInput.hinh_anh?.uri ?
                <Image source={{ uri: modifyInput.hinh_anh.uri }} style={styles.imageContainer} />
                : <Image source={images.camera} />}
            </TouchableOpacity>

            <View style={styles.textInputContainer}>
              <TextInput
                multiline={true}
                blurOnSubmit={true}
                style={{ color: 'black', }}
                placeholder='Sửa mô tả...'
                value={modifyInput.mo_ta}
                onChangeText={(text) => setModifyInput({ ...modifyInput, mo_ta: text })}
                placeholderTextColor="#727274" />
            </View>
            <TouchableOpacity disabled={!isDataUpdatable()} onPress={handleModiyModalSave}>
              <Text style={[{ color: '#dbdbdb', fontSize: 16, fontWeight: '600', marginVertical: 8, }, isDataUpdatable() && { color: 'blue' }]}>Lưu</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleModiyModalCancel}>
              <Text style={{ color: 'black', fontSize: 16, fontWeight: '400' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showPickerOption} transparent={true}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.33)', justifyContent: 'flex-end' }}>
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.modalOptionContainer} onPress={() => setShowPickerOption(false)}>
              <Text style={styles.modalTextStyle}>Huỷ bỏ</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalOptionContainer} onPress={getGalleryImage}>
              <Text style={styles.modalTextStyle}>Chọn ảnh từ thư viện</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalOptionContainer} onPress={getCameraImage}>
              <Text style={styles.modalTextStyle}>Chụp ảnh từ Camera</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {!loading ? <View style={{ flex: 1 }}>
        <View style={styles.upper}>
          <Profile />
        </View>
        <View style={styles.lower}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            backgroundColor: '#f4f4f4'
          }}>
            <TouchableOpacity
              style={{ flex: 1, justifyContent: 'center', alignItems: 'center', }}
              onPress={() => handleTabChange(0)}>
              <Text style={[{ paddingVertical: 10, fontSize: 15, color: '#d4d6d8' }, currentTabIndex === 0 && { color: '#000000', fontWeight: '500', borderBottomColor: '#5857bc', borderBottomWidth: 1 }]}>Bài đăng</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
              onPress={() => handleTabChange(1)}>
              <Text style={[{ paddingVertical: 10, fontSize: 15, color: '#d4d6d8' }, currentTabIndex === 1 && { color: '#000000', fontWeight: '500', borderBottomColor: '#5857bc', borderBottomWidth: 1 }]}>Đã lưu</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, flexGrow: 1 }}>
            {currentTabIndex === 0 ?
              (!userPostsLoading ? <DanhSachBaiDangTomTat
                showStudentInfo={false}
                posts={userPosts}
                onPostVoteChange={onPostVoteChangeTab0}
                fetchRealtimeVote={fetchRealtimeVoteTab0}
                navigation={navigation}
                refreshProps={{ onRefresh: onRefreshTab0, loading: userPostsLoading }}
                fetchMorePosts={null}
                olderLoading={false}/>
                :
                <ActivityIndicator size={"large"} />) :
              (!userSavedPostsLoading ? <DanhSachBaiDangTomTat
                showStudentInfo={true}
                posts={userSavedPosts}
                onPostVoteChange={onPostVoteChangeTab1}
                fetchRealtimeVote={fetchRealtimeVoteTab1}
                navigation={navigation}
                refreshProps={{ onRefresh: onRefreshTab1, loading: userSavedPostsLoading }}
                fetchMorePosts={null} olderLoading={false}/>
                :
                <ActivityIndicator size={"large"} />)}
          </View>
        </View>
      </View> : <ActivityIndicator style={{ flex: 1, flexGrow: 1, alignSelf: 'center', justifyContent: 'center' }} size={'large'} />}
    </View>
  );
};
