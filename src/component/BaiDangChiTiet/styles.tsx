import { StyleSheet } from "react-native";

export const detailScreen = StyleSheet.create({
    background: {
        backgroundColor: '#dae0e6',
        flex: 1,
        flexGrow: 1,
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarImg: {
        width: 40,
        height: 40,
        borderRadius: 40,
        marginRight: 8
    },
    postHeaderTitleContainer: {
        flexDirection: 'column',
    },
    postHeaderTitleName: {
        color: '#222222',
        fontWeight: '500',
        flex: 1
    },
    postHeaderTitleSubtitle: {
        flex: 1,
        color: '#5e6062',
        fontSize: 13
    },
    postContentContainer: {
        flexDirection: 'column',
        marginVertical: 3
    },
    postContentTitle: {
        color: '#1c1c1c',
        fontSize: 18,
        fontWeight: '600',
        marginVertical: 12
    },
    postContent: {
        color: '#1c1c1c'
    },
    postFooterContainer: {
        flexDirection: 'row',
        paddingVertical: 8,
        alignItems: 'center',
        justifyContent: "center",
        borderColor: '#f1f1f1',
        borderWidth: 1,
        backgroundColor: '#fffaed',
        borderRadius: 10,
        marginBottom: 10
    },
    postFooterItem: {
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: "center",
        flex: 1
    },
    postFooterText: {
        alignSelf: 'center',
        fontWeight: '500',
        color: '#888a8b'
    },
    postImagesContainer: {
        marginVertical: 8
    },
    postSmallImageItem: {
        width: 200,
        height: 120,
        marginRight: 5,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#a3a5a5'
    },
    modalContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        flex: 1,
        flexDirection: 'column'
    },
    modalCancelButton: {
        alignSelf: 'flex-end',
        marginTop: 5,
        marginRight: 5,
        marginBottom: 5,
        flexBasis: 'auto'
    },
    modalFullImage: {
        width: '100%',
        flex: 1,
        alignSelf: 'center',
    },

    //USER COMMENT
    postCommentContainer: {
        position: 'absolute',
        bottom: 0,
        height: 70,
        width: '100%',
        backgroundColor: '#ffffff',
        borderTopColor: '#e5e5e7',
        borderTopWidth: 1,
        paddingLeft: 12,
        paddingRight: 20,

    },

    userBinhLuanContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userBinhLuanInputContainer: {
        backgroundColor: '#f2f4f5',
        borderRadius: 10,
        paddingHorizontal: 15,
        marginHorizontal: 10,
        flex: 1,
    },

    //PUBLIC COMMENT
    block: {
        backgroundColor: '#ffffff',
        paddingHorizontal: 14,
        width: '100%',
        flexDirection: 'column',
    },
    binhLuanContainer: {
        flexDirection: 'column',
        marginVertical: 3,
        paddingHorizontal: 10
    },
    binhLuanHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    binhLuanHeaderAvatar: {
        width: 32,
        height: 32,
        borderRadius: 40,
        marginRight: 8
    },
    binhLuanHeaderTitleContainer: {
        flexDirection: 'column'
    },
    binhLuanHeaderName: {
        flex: 1,
        fontSize: 12,
        fontWeight: '600',
        color: '#1c1c1c'
    },
    binhLuanHeaderDate: {
        flex: 1,
        color: '#5e6062',
        fontSize: 11
    },
    binhLuanContent: {
        marginTop: 3,
        color: '#1c1c1c',
        marginVertical: 3
    },
    binhLuanFooterContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end'
    },
    binhLuanFooterItem: {
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: "center",
        flexBasis: 'auto',
        marginLeft: 18
    },
    binhLuanConContainer: {
        marginLeft: 24,
        borderLeftColor: '#e5e5e7',
        borderLeftWidth: 1
    },
    binhLuanSettingsContainer: {
        position: 'absolute',
        alignSelf: 'flex-end',
        marginTop: 3,
    },
    binhLuanOptionContainer: {
        position: 'absolute',
        flexWrap: 'wrap',
        top: 24,
        right: 6,
        backgroundColor: '#ffffff',
        borderColor: '#000000',
        borderWidth: 0.8,
        borderRadius: 5,
        padding: 10,
        zIndex: 9999
    },

    //modal
    reportModalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        alignItems: 'center',
        justifyContent: 'center'
      },
    
      reportWindowContainer: {
        backgroundColor: '#f5f5f5',
        borderRadius: 20,
        width: '70%',
        alignItems: 'center',
        padding: 20,
      },
    
      textInputContainer: {
        borderColor: 'black',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        width: '99%',
        marginVertical: 10
      },
      modalTextStyle: {
        fontSize: 20,
        fontWeight: '600',
      },
      modalOptionContainer: {
        marginVertical: 5
      },
});