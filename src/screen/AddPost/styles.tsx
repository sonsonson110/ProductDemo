import { StyleSheet } from "react-native";

export const style = StyleSheet.create({
    background: {
        flex: 1,
        flexGrow: 1,
        backgroundColor: '#ffffff',
    },
    headerContainer: {
        flexDirection: 'row',
        flexBasis: 'auto',
        alignItems: 'center',
        borderBottomColor: '#dbe0e8',
        paddingBottom: 8,
        borderBottomWidth: 0.7,
        marginHorizontal: -8,
        paddingHorizontal: 8,
        marginBottom: 8
    },
    header: {
        fontSize: 22,
        color: '#000000',
        fontWeight: '500',
    },
    headerPostText: {
        fontWeight: '700',
        fontSize: 16,
        color: '#757575'
    },
    titleInputContainer: {
        paddingVertical: 4,
        borderBottomColor: '#dbe0e8',
        paddingBottom: 8,
        borderBottomWidth: 0.7,
        flexBasis: 'auto'
    },
    titleText: {
        fontSize: 18,
        color: '#1c1c1c'
    },
    contentInputContainer: {
        flex: 1,
        flexGrow: 1,
        paddingVertical: 4,
        borderBottomColor: '#dbe0e8',
        paddingBottom: 8,
        borderBottomWidth: 0.7,
    },
    contentText: {
        fontSize: 16,
        color: '#1c1c1c'
    },
    subjectSelectContainer: {
        flexBasis: 'auto',
        zIndex: 100,
        paddingVertical: 4,
        borderBottomColor: '#dbe0e8',
        paddingBottom: 8,
        borderBottomWidth: 0.7,
    },
    imageSelectContainer: {
        paddingVertical: 4,
        flexDirection: 'column'
    },
    imagesContainer: {
        flexDirection: 'row',
        marginVertical: 8,
    },
    imageItem: {
        height: 80,
        width: 80,
        marginRight: 8,
        borderRadius: 10,
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
    zoomImageModalContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        flex: 1,
        flexDirection: 'column'
    },
    zoomImageModalCancelBtn: {
        alignSelf: 'flex-end',
        marginTop: 5,
        marginRight: 5,
        marginBottom: 10,
        flexBasis: 'auto'
    },
    modalFullImage: {
        width: '100%',
        flex: 1,
        alignSelf: 'center',
        marginBottom: 15
    },
    modelDeleteImageTextContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8
    },
    modelDeleteImageText: {
        color: '#ffffff',
        backgroundColor: '#ba2929',
        borderRadius: 10,
        padding: 10,
        fontSize: 16,
        fontWeight: '600'
    }
})