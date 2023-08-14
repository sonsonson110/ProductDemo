import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../../../firebase/configuration';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { receiveDeviceToken } from '../../../firebase/configuration';
import { fetchStudentIdByUid, updateStudentFcmToken, setUserStatus } from '../../../firebase/api/Usecase.tsx/SinhVien';

// Tạo Context mới với createContext
export const AuthContext = createContext({});

// Custom hook useAuth để dễ dàng sử dụng Context
export function useAuth() {
  return useContext(AuthContext);
}

// Component AuthProvider chứa logic xác thực và trạng thái xác thực
export const AuthProvider = ({ children }: any) => {
  // State để lưu trạng thái xác thực
  const [uid, setUid] = useState('');
  const [stuId, setStuId] = useState('');
  const [error, setError] = useState('');

  // Hàm xử lý đăng nhập
  const login = (email: string, password: string) => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        //Lưu Token của device vào internal db
        receiveDeviceToken().then(token => {
          console.log('Device token: ' + token);
          fetchStudentIdByUid(uid).then(async stuid => {
            setStuId(stuid); AsyncStorage.setItem('stuid', stuid);
            // Cập nhật Token của device hiện tại của người dùng
            await updateStudentFcmToken(stuid, token);
            // Sẵn sàng nhận thông báo từ firebase
            await setUserStatus(stuid, true);
          });
        })
        // Lấy thông tin user khi xác thực thành công
        let uid = userCredential.user.uid;
        setUid(uid);
        // Lưu thông tin vào AsyncStorage để giữ trạng thái xác thực khi ứng dụng khởi động lại
        AsyncStorage.setItem('email', email);
        AsyncStorage.setItem('uid', uid);

        console.log(uid);
        console.log(stuId);
      })
      .catch((error) => {
        // Xử lý các lỗi xác thực và đặt thông báo lỗi vào state error
        setError(error);
        console.log(error);
      });
  }

  // Hàm xử lý đăng xuất
  const logout = () => {
    signOut(auth).then(async () => {
      console.log('User signed out');

      // Đặt trạng thái xác thực và thông tin user về null
      setUid('');

      // Đặt trạng thái nhận thông báo == false
      await setUserStatus(stuId, false);

      // Xóa thông tin xác thực đã lưu trong AsyncStorage
      AsyncStorage.removeItem('uid');
      AsyncStorage.removeItem('stuid');
    }).catch((error) => {
      console.log(error);
    });
  }

  // Hàm kiểm tra xác thực đã lưu trong AsyncStorage khi ứng dụng khởi động lại
  const isLoggin = async () => {
    try {
      // Lấy thông tin user từ AsyncStorage
      let uid = await AsyncStorage.getItem('uid');
      let stuid = await AsyncStorage.getItem('stuid');
      if (uid) {
        // Nếu đã có thông tin user, cập nhật state
        setUid(uid);
        stuid && setStuId(stuid);

        console.log(uid);
        console.log(stuid);
      }
    } catch (e) {
      console.log(e);
    }
  };

  // Sử dụng useEffect để kiểm tra xác thực khi ứng dụng khởi động
  useEffect(() => {
    isLoggin();
  }, []);

  // Trả về Context Provider và cung cấp các giá trị và hàm xử lý xác thực cho Context
  return (
    <AuthContext.Provider value={{ login, logout, uid, error, stuId }}>
      {children}
    </AuthContext.Provider>
  );
}

