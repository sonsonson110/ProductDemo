
import React, { useContext, useEffect } from 'react';
import HomeScreen from './src/screen/HomeScreen/HomeScreen';
import BaiDangChiTiet from './src/component/BaiDangChiTiet/BaiDangChiTiet';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { IsUserLoggedIn } from './src/screen/Login/AppNav';
import { AuthContext, AuthProvider } from './src/component/DangNhap/AuthContext';
import ThongTinSinhVien from './src/component/ThongTinSinhVien/ThongTinSinhVien';
import ThongBaoItem from './src/component/ThongBaoItem/ThongBaoItem';
import Notification from './src/screen/Notification/Notification';
import Tab from './src/component/DanhMuc/Personal';
import DanhSachBaiDangTomTat from './src/component/DanhSachBaiDangTomTat/DanhSachBaiDangTomTat';
import ListBaiDangTomTatTheoMon from './src/component/DanhMuc/ListBaiDangTomTatTheoMon';
import Filter from './src/screen/DanhMuc/Menu';

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
  },
};


const Stack = createNativeStackNavigator();

function App(): JSX.Element {
  return (
    <AuthProvider>
      <MyApp />
    </AuthProvider>
  );
}
export default App;

const MyApp = (): JSX.Element => {
  const { stuId }: any = useContext(AuthContext);
  useEffect(() => {
    if (!stuId) return;
  }, [stuId]);
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#ffffff',
          },
          headerTintColor: '#000000',
          headerTitleStyle: {
            fontWeight: '500',
          },
        }}>
        {/* <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} /> */}
        <Stack.Screen name="Login" component={IsUserLoggedIn} options={{ headerShown: false }} />
        <Stack.Screen name="DetailPost" component={BaiDangChiTiet} initialParams={{stuId: stuId}}/>
        <Stack.Screen name="UserProfile" component={ThongTinSinhVien} />
        <Stack.Screen name="Notifications" component={Notification} />
        <Stack.Screen name="Filter" component={Filter} options={{ headerShown: false }} />
        <Stack.Screen name="Tab" component={Tab} options={{ headerShown: false }} />
        <Stack.Screen name="CollapsedPostList" component={ListBaiDangTomTatTheoMon}/>
      </Stack.Navigator>
    </NavigationContainer>
  )
}

