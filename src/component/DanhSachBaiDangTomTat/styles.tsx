import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    background: {
        backgroundColor: '#dae0e6',
        flex: 1,
        flexGrow: 1,
        zIndex: -999
    },
    post: {
        backgroundColor: '#ffffff',
        paddingHorizontal: 14,
        paddingVertical: 8,
        alignSelf: 'baseline',
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: '#dae0e6',
    },

    avatarImg: {
        height: 22,
        width: 22,
        borderRadius: 40,
        marginRight: 8
    },

    headerText: {
        color: '#5e6062',
        fontSize: 13
    },
    title: {
        color: '#1c1c1c',
        fontSize: 18,
        fontWeight: '600'
    },
    headerItems: {
        alignItems: 'center',
        flexDirection: "row",
    },
    contentItems: {
        marginVertical: 5,
        flexWrap: 'wrap',
        flexDirection: "row",
    },
    contentTextContainer: {
        flex: 5
    },
    contentImgContainer: {
        flex: 2,
        height: 80,
        borderColor: '#878a8c',
        borderWidth: 0.7,
        borderRadius: 10,
        flexDirection: 'column-reverse'
    },
    imgOverlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        
        alignItems: 'center',
        borderBottomEndRadius: 10,
        borderBottomStartRadius: 10,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 8,
    },
    chipText: {
        borderRadius: 50,
        backgroundColor: '#dadada',
        color: '#000000',
        paddingVertical: 2,
        paddingHorizontal: 8,
        marginTop: 2,
        textAlign: 'center',
        fontSize: 11
    },
    footerContainer: {
        alignItems: 'center',
        flexDirection: "row",
        marginVertical: 3,
    },
    footerItem: {
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: "center",
        borderRadius: 20,
        borderColor: '#878a8d',
        borderWidth: 0.8,
        width: 'auto',
        height: 32,
        marginRight: 8,
    },
    footerText: {
        alignSelf: 'center',
        fontWeight: '500',
        color: '#878a8c',
    }
})