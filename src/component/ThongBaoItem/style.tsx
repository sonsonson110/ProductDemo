import { StyleSheet } from "react-native";

export const style = StyleSheet.create({

    notificationItemContainer: {
        backgroundColor: '#ffffff',
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },

    imageContainer: {
        flexWrap: 'wrap',
    },

    image: {
        width: 70,
        height: 70,
        borderRadius: 40,
    },

    notificationTypeImage: {
        position: 'absolute',
        bottom: 0, right: 0,
        backgroundColor: '#ffffff',
        width: 30,
        height: 30,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center'
    },

    contentContainer: {
        marginLeft: 12,
        flexShrink: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },

    contentText: {
        color: '#1c1c1c',
        width: '100%',
    }
})