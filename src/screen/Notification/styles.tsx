import { StyleSheet } from "react-native";

export const style = StyleSheet.create({
    loadingAnimation: {
        backgroundColor: '#dbe0e8',
        width: '100%',
        flex: 1,
        flexGrow: 1,
        alignSelf: 'center',
        justifyContent: 'center'
    },
    background: {
        backgroundColor: '#dbe0e8',
        flex: 1,
        flexGrow: 1,
    },

    appBar: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        flexWrap: 'wrap',
        alignItems: 'center',
        paddingVertical: 8,
        paddingLeft: 8,
        elevation: 5,
        zIndex: 1,
    },

    appBarText: {
        color: 'black',
        fontSize: 28,
        fontWeight: '500'
    },

    notiCountText: {
        color: 'white',
        fontWeight: '800',
        textAlign: 'center',
        backgroundColor: '#ff4400',
        borderRadius: 100,
        marginLeft: 8,
        width: 24, height: 24,
    }
})