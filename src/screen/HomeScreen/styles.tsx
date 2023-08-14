import { StyleSheet } from "react-native";

export const homeStyles = StyleSheet.create({
    background: {
        flex: 1,
        flexGrow: 1,
    },
    homeHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        paddingVertical: 4,
        borderBottomColor: '#dae0e6',
        borderBottomWidth: 1,
        paddingHorizontal: 8
    },

    homeTitleText: {
        alignSelf: 'center',
        paddingLeft: 14,
        fontWeight: '600',
        fontSize: 20,
        color: '#1c1c1c'
    },

    loadingText: {
        flexGrow: 1,
        flexShrink: 1,
        fontSize: 28,
        textAlign: 'center',
        textAlignVertical: 'center',
    }
})