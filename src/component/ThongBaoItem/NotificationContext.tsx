import React, { createContext, useEffect, useState } from "react";
import messaging from '@react-native-firebase/messaging';

export const NotificationContext = createContext({});
export default function NotificationContextProvider({children}: any) {
    const [newNoti, setNewNoti] = useState(false);

    useEffect(() => {
        const messageReceive = messaging().onMessage((_message) => {
            setNewNoti(true);
            console.log('received');
        });
        return messageReceive;
    });

    return (
        <NotificationContext.Provider value={{newNoti, setNewNoti}}>
            {children}
        </NotificationContext.Provider>
    )
}