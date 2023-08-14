import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({

  actionButtonTextContainer: {
    padding: 10,
    width: 110,
    textAlign: 'center',
    borderRadius: 20,
    fontWeight: '700'
  },

  upper: {
    flexBasis: 'auto',
  },
  lower: {
    flexGrow: 1
  },
  container: {
    backgroundColor: '#5758BB',
  },
  control: {
    paddingTop: 10,
    flexDirection: 'row',
  },
  return: {
    fontSize: 45,
    paddingLeft: 20,
    lineHeight: 30,
    paddingTop: 20,
    fontWeight: '500',
    color: 'white',
  },
  return1: {
    fontSize: 30,
    paddingLeft: 240,
    lineHeight: 30,
    paddingTop: 18,
    fontWeight: '500',
    color: 'white',
  },
  return2: {
    fontSize: 25,
    paddingLeft: 20,
    lineHeight: 30,
    paddingTop: 15,
    fontWeight: '500',
    color: 'white',
  },
  header: {
    padding: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 15,
    marginRight: 20,
    borderWidth: 5,
    borderColor: 'white'
  },
  username: {
    fontSize: 25,
    fontWeight: '500',
    paddingLeft: 1,
    paddingTop: 20,
    color: 'white',
  },
  Follow: {
    flexDirection: 'row',
    paddingTop: 7,
  },

  statNumber: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
  statNumber2: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
    paddingLeft: 30,
  },
  birth: {

  },
  day: {
    fontSize: 15,
    fontWeight: '500',
    paddingTop: 8,
    color: 'white',
  },
  container2: {
    height: 50,
  },
  menu1: {
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    height: 60,
  },
  item: {
    width: '33.333%',
    borderBottomColor: 'gray',
  },
  item2: {
    fontWeight: '500',
    fontSize: 20,
    textAlign: 'center', textAlignVertical: 'center'
  },
  menu2: {
    backgroundColor: '#bdc3c7'
  },
  list: {
    height: 350,
  },

  //modal
  modifyModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center'
  },

  modifyWindowContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    width: '60%',
    alignItems: 'center',
    padding: 20,
  },

  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 10
  },

  textInputContainer: {
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    width: '99%',
    marginVertical: 10
  },

  modalContainer: {
    backgroundColor: '#363636',
    flexDirection: 'column-reverse',
    alignItems: 'center',
    flexBasis: 'auto',
    padding: 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTextStyle: {
    fontSize: 20,
    fontWeight: '600',
  },
  modalOptionContainer: {
    marginVertical: 5
  },
});

export default styles;