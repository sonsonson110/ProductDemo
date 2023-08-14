import React, { useContext, useEffect } from 'react';
import 'react-native-gesture-handler';
import { LoginScreen } from './LoginScreen';
import HomeScreen from '../HomeScreen/HomeScreen';
import { AuthContext } from '../../component/DangNhap/AuthContext';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import ThongTinSinhVien from '../../component/ThongTinSinhVien/ThongTinSinhVien';
import { Image } from '@rneui/base';
import { images } from '../../images';
import { Text, View } from 'react-native';
import AddPost from '../AddPost/AddPost';
import { PaperProvider, useTheme } from 'react-native-paper';
import Notification from '../Notification/Notification';
import NotificationContextProvider from '../../component/ThongBaoItem/NotificationContext';
import { NotificationContext } from '../../component/ThongBaoItem/NotificationContext'
import Filter from '../DanhMuc/Menu';

export const IsUserLoggedIn = () => {
    const { uid }: any = useContext(AuthContext);
    const { stuId }: any = useContext(AuthContext);
    useEffect(() => {
        if (!stuId) return;
    }, [stuId])
    return (
        /* nếu có id thì chuyển hướng sang HomeScreen */
        uid === '' ? <LoginScreen /> : <NotificationContextProvider><InnerApp stuId={stuId} /></NotificationContextProvider>
        // uid === '' ? <LoginScreen /> : <HomeScreen navigation={navigation}/>
    )
}

const Tab = createMaterialBottomTabNavigator();

function InnerApp({ stuId }: { stuId: string }): JSX.Element {
    const {newNoti, setNewNoti}: any = useContext(NotificationContext);
    const theme = useTheme();
    theme.colors.secondaryContainer = "transperent"
    return (
        <PaperProvider theme={theme}>
            <Tab.Navigator
                initialRouteName='Home'
                activeColor="#000000"
                inactiveColor="#c2c2c2"
                barStyle={{ backgroundColor: '#ffffff', }}
            >
                <Tab.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{
                        tabBarIcon: ({ focused }) => (focused ?
                            <Image source={images.home} style={{ width: 24, height: 24 }} /> :
                            <Image source={images.inactive_home} style={{ width: 24, height: 24 }} />
                        ),
                        tabBarLabel: 'Trang chủ'
                    }}
                />

                <Tab.Screen
                    name="Menu"
                    component={Filter}
                    options={{
                        tabBarIcon: ({ focused }) => (focused ?
                            <Image source={images.active_search} style={{ width: 24, height: 24 }} /> :
                            <Image source={images.inactive_search} style={{ width: 24, height: 24 }} />
                        ),
                        tabBarLabel: 'Danh mục'
                    }}
                />

                <Tab.Screen
                    name='Add'
                    component={AddPost}
                    options={{
                        tabBarIcon: ({ focused }) => (focused ?
                            <Image source={images.add_post} style={{ width: 24, height: 24 }} /> :
                            <Image source={images.inactive_add_post} style={{ width: 24, height: 24 }} />
                        ),
                        tabBarLabel: 'Tạo',
                    }} />
                <Tab.Screen
                    name='Notification'
                    component={Notification}
                    initialParams={{ stuId: stuId }}
                    options={{
                        tabBarIcon: ({ focused }) => (focused ?
                            <View>
                                <Image source={images.active_bell} style={{ width: 24, height: 24 }} />
                                {newNoti &&
                                <Text
                                style={{
                                    padding: 1,
                                    color: '#ff4400',
                                    position: 'absolute',
                                    top: -10, right: -4,
                                }}>{'\u2B24'}</Text>}
                            </View>
                            :
                            <View>
                                <Image source={images.bell} style={{ width: 24, height: 24 }} />
                                {newNoti &&
                                <Text
                                style={{
                                    padding: 1,
                                    color: '#ff4400',
                                    position: 'absolute',
                                    top: -10, right: -4,
                                }}>{'\u2B24'}</Text>}
                            </View>

                        ),
                        tabBarLabel: 'Thông báo'
                    }}
                    listeners={({ navigation }) => ({
                        tabPress: _event => {
                            // Add event
                            setNewNoti(false);
                        },
                    })}
                />
                <Tab.Screen
                    name='Profile'
                    component={ThongTinSinhVien}
                    initialParams={{ thisStuId: stuId }}
                    options={{
                        tabBarIcon: ({ focused }) => (focused ?
                            <Image source={images.person} style={{ width: 24, height: 24 }} /> :
                            <Image source={images.inactive_person} style={{ width: 24, height: 24 }} />
                        ),
                        tabBarLabel: 'Cá nhân'
                    }} />
            </Tab.Navigator>
        </PaperProvider>
    );
}