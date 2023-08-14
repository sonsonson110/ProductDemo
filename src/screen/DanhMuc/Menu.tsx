import { collection, getDocs, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, SafeAreaView, StyleSheet, TextInput, Image } from 'react-native';
import { db } from '../../../firebase/configuration';
import { images } from '../../images';

interface KiHoc {
  ten: string;
  mon_hoc: string[];
}

interface NganhUI {
  ten: string;
  ki_hoc: KiHoc[];
}

const fetchAllNganh = async () => {
  const q = query(collection(db, 'nganh'));
  const docSnap = await getDocs(q);
  const result: NganhUI[] = [];
  for (let i = 0; i < docSnap.docs.length; i++) {
    const currentDoc = docSnap.docs[i];
    const ki_hoc: KiHoc[] = [];
    for (let j in currentDoc.data()._mon_hoc) {
      ki_hoc.push({
        ten: j,
        mon_hoc: currentDoc.data()._mon_hoc[j]
      })
    }
    result.push({
      ten: currentDoc.data().ten,
      ki_hoc: ki_hoc
    });
  }
  return result;
}


//MenuItem
//ExpandMenuItem

const MenuItem = ({ item, level = 0, navigation }: any) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleItemClick = () => {
    setIsExpanded(!isExpanded);
  };

  const renderSubmenuItems = (submenuItems: any, submenuLevel: any, navigation: any) => {
    return (
      <FlatList
        data={submenuItems}
        renderItem={({ item }) => (
          <View>
            <View style={styles.submenuItem}>
              <Text style={[styles.submenuItemText, { marginLeft: submenuLevel }]}>
                {item.ten}
              </Text>
            </View>
            {item.mon_hoc && renderMonHoc(item.mon_hoc, submenuLevel + 2, navigation)}
          </View>
        )}
        keyExtractor={(item) => item.ten}
      />
    );
  };

  const renderMonHoc = (mon_hoc: any, submenuLevel: any, navigation: any) => {
    return (
      <FlatList
        data={mon_hoc}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate("CollapsedPostList", { id_mon_hoc: item })}>
            <View style={styles.subsubmenuItem}>
              <Text style={[styles.subsubmenuItemText, { marginLeft: submenuLevel }]}>
                {item}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item}
      />
    );
  };



  return (
    <View>
      <TouchableOpacity onPress={handleItemClick}>
        <View style={styles.menuItem}>
          <Text style={[styles.menuItemText, { flex: 0.9, marginLeft: level * 16 }]}>
            {item.ten}
          </Text>
          <Image source={isExpanded ? images.down : images.right} />
        </View>
      </TouchableOpacity>
      {isExpanded && item.ki_hoc && renderSubmenuItems(item.ki_hoc, level + 1, navigation)}
    </View>
  );
};


export default function Filter({navigation}: any) {
  const [menuData, setMenuData] = useState<NganhUI[]>([]); // Initialize with an empty array
  const handleSearchIconPress = () => {
    navigation.navigate('Tab'); // Chuyển hướng sang Tab khi người dùng nhấn vào searchIcon
  };

  useEffect(() => {
    // Fetch data from the function and update the state
    const fetchNganhData = async () => {
      try {
        const data = await fetchAllNganh();
        setMenuData(data); // Update the state with the fetched data
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchNganhData();
  }, []);
  const sortKiHocByTen = (ki_hoc: any) => {
    return ki_hoc.sort((a: any, b: any) => a.ten.localeCompare(b.ten));
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchBarContainer}>
      <TouchableOpacity onPress={handleSearchIconPress}>
          <Image source={images.inactive_search} style={styles.searchIcon} />
        </TouchableOpacity>
      </View>
      <View>
        <FlatList
          data={menuData}
          renderItem={({ item }) => <MenuItem item={{ ...item, ki_hoc: sortKiHocByTen(item.ki_hoc) }} navigation={navigation} />}
          keyExtractor={(item) => item.ten}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
    backgroundColor: '#fafafa'
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end', // Change to 'flex-end' to align the search icon to the right
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  searchIcon: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 4, // Adjust the marginLeft for each level here
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  menuItemText: {
    flex: 0.9,
    fontSize: 16,
    color: '#6d6d6d'
  },
  submenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  submenuItemText: {
    fontSize: 16,
    color: '#6d6d6d'
  },
  subsubmenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
  subsubmenuItemText: {
    fontSize: 16,
    color: '#6d6d6d'
  },
});

