import { collection, addDoc } from "firebase/firestore";
import { db } from "../../configuration";
import { ReportApi } from "../InterfaceAPI";

// WRITE
export const sendReport = async (data: ReportApi) => {
    const ref = collection(db, 'bao_cao');
    await addDoc(ref, data);
}