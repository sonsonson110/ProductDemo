import { doc, getDoc, collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../../configuration";
import { MonHocApi } from "../InterfaceAPI";

//READ
export const fetchMonHocById = async (id: string): Promise<MonHocApi> => {
    const monHocRef = doc(db, 'monhoc', id);
    const snapshotDoc = await getDoc(monHocRef);
    const monHocApi = snapshotDoc.data() as MonHocApi;
    return monHocApi;
}

export const fetchAllMonHocData = async () => {
    const ref = collection(db, "monhoc");
    const q = query(ref, orderBy('ten'));
    const docSnap = await getDocs(q);

    const monHocData: { label: string, value: string }[] = [];
    for (let i = 0; i < docSnap.docs.length; i++) {
        const currentDoc = docSnap.docs[i];
        monHocData.push({ label: currentDoc.data().ten, value: currentDoc.id });
    }
    return monHocData;
}
//UPDATE
//DELETE

