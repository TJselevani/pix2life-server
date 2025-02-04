const { getFirebaseAdmin } = require("../database/firebase/init");
const logger = require("../loggers/logger");


async function setCustomClaims(uid, role) {
    await getFirebaseAdmin.auth().setCustomUserClaims(uid, { role: role });
    logger.log(`Custom claims set for user ${uid}`);
  }