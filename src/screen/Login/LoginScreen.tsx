import React, { useState, useContext, useEffect } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../component/DangNhap/AuthContext';
import { images } from '../../images';

export const LoginScreen = () => {
  // State để lưu giá trị email và password người dùng nhập
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Sử dụng useContext và useAuth hook để lấy thông tin xác thực từ AuthProvider
  const { login }: any = useContext(AuthContext);
  const { error }: any = useContext(AuthContext);

  // Hàm xử lý khi người dùng nhấn nút đăng nhập
  const handleLogin = () => {
    // Gọi hàm login từ AuthProvider để thực hiện xác thực
    login(email.trim().toLowerCase(), password);
    // Hiển thị error trong console (Lưu ý: error có thể không có giá trị ngay lập tức do xử lý bất đồng bộ)
    console.log(error);
  };

  useEffect(() => {}, [error]);

  return (
    <SafeAreaView style={styles.container}>
      <Image source={images.logo} style={styles.logo} />
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          onChangeText={(text) => setEmail(text)}
          value={email}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#888"
          secureTextEntry
          onChangeText={(text) => setPassword(text)}
          value={password}
        />
        {/* Hiển thị thông báo lỗi 'Sai mật khẩu' hoặc 'Vui lòng nhập mail và password' trong TextInput */}
        {(error) && <Text style={{color: 'black', marginBottom: 5}}>{'Error: ' + error.code}</Text>}

        <Button title="Login" onPress={handleLogin} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  formContainer: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  logo: {
    width: 350,
    height: 150,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 20,
  },
  input: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    color: '#333',
  },
});
