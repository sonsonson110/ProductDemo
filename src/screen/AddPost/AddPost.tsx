import React, { useContext, useEffect, useState } from "react";
import { TextInput, View, Image, Text, TouchableOpacity, Modal, ScrollView } from "react-native";
import { style } from "./styles";
import DropDownPicker from "react-native-dropdown-picker";
import { images } from "../../images";
import { Asset, ImageLibraryOptions, ImagePickerResponse, OptionsCommon, launchCamera, launchImageLibrary } from "react-native-image-picker";
import { AuthContext } from "../../component/DangNhap/AuthContext";
import { BaiDangApi } from "../../../firebase/api/InterfaceAPI";
import { Timestamp } from "firebase/firestore";
import { addNewPost } from "../../../firebase/api/Usecase.tsx/BaiDang";
import { fetchAllMonHocData } from "../../../firebase/api/Usecase.tsx/MonHoc";

interface InputData {
    mon_hoc: { ma: string, ten: string },
    tieu_de: string,
    noi_dung: string,
    hinh_anh: Asset[],
}

const initData: InputData = {
    mon_hoc: { ma: '', ten: '' },
    tieu_de: '',
    noi_dung: '',
    hinh_anh: [],
}

export default function AddPost({ navigation }: any): JSX.Element {
    const { stuId }: any = useContext(AuthContext);

    //FOR DROPDOWN MENU
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<{ label: string, value: string }[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<string>();

    //FOR IMAGE PICKER
    const [showPickerOption, setShowPickerOption] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');

    //INPUT STATE
    const [postable, setPostable] = useState(false);
    const [inputData, setInputData] = useState<InputData>(initData);

    //HANDLE RESET BUTTON
    const handleReset = () => {
        setInputData(initData);
        setSelectedSubject(undefined)
    }

    //HANDLE POST ADD
    const addPostToCloud = async () => {
        const imagesName = [];
        for (let i = 0; i < inputData.hinh_anh.length; i++) {
            imagesName.push(inputData.hinh_anh[i].fileName);
        }
        await addNewPost({
            _id_binh_luan: [],
            _id_mon_hoc: inputData.mon_hoc.ma,
            _id_sinh_vien: stuId,
            downvote: [],
            hinh_anh: imagesName,
            ngay_sua: Timestamp.fromDate(new Date()),
            noi_dung: inputData.noi_dung.trim(),
            tieu_de: inputData.tieu_de.trim(),
            upvote: []
        } as BaiDangApi, inputData.hinh_anh);

        handleReset();
    }

    //HANDLE POST CONDITION
    const checkPostCondition = () => {
        if (inputData.mon_hoc.ma === '') { setPostable(false); return }
        if (inputData.tieu_de === '') { setPostable(false); return }
        if (inputData.noi_dung === '') { setPostable(false); return }
        setPostable(true);
    }

    //GET IMAGE FUNCTIONS
    const galleryOptions: ImageLibraryOptions = {
        mediaType: 'photo',
        selectionLimit: 0
    }
    const cameraOption: OptionsCommon = {
        mediaType: 'photo'
    }

    const getCameraImage = async () => {
        setShowPickerOption(false);
        const cameraImage = await launchCamera(cameraOption);

        if (!cameraImage.assets) return;
        const assets = [...inputData.hinh_anh, ...cameraImage.assets]
        setInputData({ ...inputData, hinh_anh: assets })
    }

    const getGalleryImage = async () => {
        setShowPickerOption(false);
        const galleryImage = await launchImageLibrary(galleryOptions);

        if (!galleryImage.assets) return;
        const assets = [...inputData.hinh_anh, ...galleryImage.assets];
        setInputData({ ...inputData, hinh_anh: assets });
    }

    const handleDeleteImage = () => {
        const updatedImage = [...inputData.hinh_anh.flatMap(i => {
            if (i.uri && i.uri !== selectedImage)
                return i;
            return [];
        })];
        setInputData({ ...inputData, hinh_anh: updatedImage });
        setSelectedImage('');
    }

    useEffect(() => {
        fetchAllMonHocData().then(val => setItems(val));
    }, []);

    useEffect(() => {
        //console.log(inputData);
        checkPostCondition();
    }, [inputData]);

    useEffect(() => {
        const targetMonHoc = items.find(item => item.value === selectedSubject);
        if (!targetMonHoc) return;
        setInputData({
            ...inputData, mon_hoc: {
                ma: targetMonHoc.value,
                ten: targetMonHoc.label
            }
        });
    }, [selectedSubject])

    return (
        <View style={style.background}>
            {selectedImage !== '' && (
                <Modal visible={selectedImage !== ''} transparent={true}>
                    <View style={style.zoomImageModalContainer}>
                        <TouchableOpacity style={style.zoomImageModalCancelBtn} onPress={() => setSelectedImage('')}>
                            <Image source={images.cancel} />
                        </TouchableOpacity>
                        <Image
                            source={{ uri: selectedImage }}
                            resizeMode="contain"
                            style={style.modalFullImage} />
                        <TouchableOpacity style={style.modelDeleteImageTextContainer} onPress={handleDeleteImage}>
                            <Text style={style.modelDeleteImageText}>Xoá ảnh</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>
            )}

            <Modal visible={showPickerOption} transparent={true}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.33)', justifyContent: 'flex-end' }}>
                    <View style={style.modalContainer}>
                        <TouchableOpacity style={style.modalOptionContainer} onPress={() => setShowPickerOption(false)}>
                            <Text style={style.modalTextStyle}>Huỷ bỏ</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={style.modalOptionContainer} onPress={getGalleryImage}>
                            <Text style={style.modalTextStyle}>Chọn ảnh từ thư viện</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={style.modalOptionContainer} onPress={getCameraImage}>
                            <Text style={style.modalTextStyle}>Chụp ảnh từ Camera</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <View style={{ margin: 8, flexDirection: 'column', flex: 1 }}>
                {/* HEADER */}
                <View style={style.headerContainer}>
                    <Text style={style.header}>Tạo bài đăng mới</Text>
                    <View style={{ flex: 1, flexDirection: 'row-reverse' }}>
                        <TouchableOpacity disabled={!postable} onPress={addPostToCloud}>
                            <Text style={[style.headerPostText, postable && { color: '#348ee8' }]}>Đăng</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleReset} style={{ flexWrap: 'wrap', marginHorizontal: 10 }}>
                            <Image source={images.reset} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* NHẬP MÔN HỌC */}
                <View style={style.subjectSelectContainer}>
                    <DropDownPicker
                        searchPlaceholder="Tìm theo tên môn"
                        listMode="SCROLLVIEW"
                        dropDownContainerStyle={{
                            position: 'relative',
                            top: 0
                        }}
                        searchable={true}
                        placeholder="Chọn môn học cho bài đăng"
                        open={open}
                        value={selectedSubject || null}
                        items={items}
                        setOpen={setOpen}
                        setValue={setSelectedSubject}
                        setItems={setItems}
                        theme="LIGHT"
                        containerStyle={{
                            alignSelf: 'center',
                            flexBasis: 'auto',
                        }}
                        style={{
                            paddingHorizontal: 10,
                            minHeight: 40,
                        }}
                        textStyle={{ fontSize: 15, }}
                    />
                </View>

                {/* NHẬP TIÊU ĐỀ */}
                <View style={style.titleInputContainer}>
                    <TextInput
                        placeholderTextColor={'#7c7c7c'}
                        value={inputData.tieu_de}
                        onChangeText={(text) => setInputData({ ...inputData, tieu_de: text })}
                        placeholder="Viết một tiêu đề thú vị..."
                        style={style.titleText}
                        removeClippedSubviews={false}
                        multiline={true}
                        blurOnSubmit={true}
                    />
                </View>

                {/* NHẬP NỘI DƯNG */}
                <View style={style.contentInputContainer}>
                    <TextInput
                        placeholderTextColor={'#7c7c7c'}
                        placeholder="Viết thêm nội dung cho bài này..."
                        value={inputData.noi_dung}
                        onChangeText={(text) => setInputData({ ...inputData, noi_dung: text })}
                        style={style.contentText}
                        removeClippedSubviews={false}
                        multiline={true}
                    />
                </View>

                {/* THÊM HÌNH ẢNH */}
                <View style={style.imageSelectContainer}>
                    <Text style={[{ color: '#1c1c1c', fontWeight: '600', fontSize: 16 }]}>Thêm ảnh (tuỳ chọn)</Text>
                    <ScrollView style={style.imagesContainer} horizontal={true} showsHorizontalScrollIndicator={false}>

                        <TouchableOpacity onPress={() => setShowPickerOption(true)}>
                            <Image style={style.imageItem} source={images.plus_square_dotted} />
                        </TouchableOpacity>

                        {inputData.hinh_anh.map(img =>
                            <TouchableOpacity key={img.uri} onPress={() => img.uri && setSelectedImage(img.uri)}>
                                <Image source={{ uri: img.uri }} style={style.imageItem} />
                            </TouchableOpacity>
                        )}

                    </ScrollView>
                </View>
            </View>
        </View>
    );
}