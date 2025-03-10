import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { onUserCreated } from "firebase-functions/v2/identity";
import * as logger from "firebase-functions/logger";

initializeApp();
const firestore = getFirestore();

export const createUser = onUserCreated((event) => {
    const user = event.data;
    const userInfo = {
        uid: user.uid,
        email: user.email || null,
        photoUrl: user.photoURL || null,
    };

    return firestore.collection("users").doc(user.uid).set(userInfo)
        .then(() => logger.info(`User Created: ${JSON.stringify(userInfo)}`))
        .catch(error => logger.error("Error creating user:", error));
});
