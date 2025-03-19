import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { onUserCreated } from "firebase-functions/v2/identity";
import * as logger from "firebase-functions/logger";
import {Storage} from "@google-cloud/storage";
import {onCall} from "firebase-functions/v2/https";

initializeApp();
const firestore = getFirestore();

const storage = new Storage();

const rawVideoBucketName = "hv-yt-raw-videos";

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

export const generateUploadUrl = onCall({maxInstances: 1}, async (request) => {
    // Check if the user is authentication
    if (!request.auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called while authenticated."
      );
    }
  
    const auth = request.auth;
    const data = request.data;
    const bucket = storage.bucket(rawVideoBucketName);
  
    // Generate a unique filename for upload
    const fileName = `${auth.uid}-${Date.now()}.${data.fileExtension}`;
  
    // Get a v4 signed URL for uploading file
    const [url] = await bucket.file(fileName).getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    });
  
    return {url, fileName};
  });