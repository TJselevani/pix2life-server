const { getFirestore, collection, doc, setDoc, getDoc, deleteDoc, updateDoc, getDocs } = require("firebase/firestore");
const { getFirestoreDB } = require('../../database/firebase/init');
const logger = require("../../loggers/logger");
const { v4: uuidv4 } = require('uuid');
const User = require('../../database/models/user.model');

/**
 * Uploads a new user to the Firestore database.
 * @param {Object} userObj - The user data object.
 */
const uploadData = async (userObj) => {
  try {
    const firestore = getFirestoreDB();
    const uuid = uuidv4();
    
    // Create a new User instance from the received object
    const userData = new User(
      uuid,
      userObj.username,
      userObj.email,
      userObj.address,
      userObj.phoneNumber,
      userObj.postCode
    );

    const documentRef = doc(firestore, 'Users', uuid); // Specify a unique document ID
    await setDoc(documentRef, { ...userData });
    logger.info(`Uploaded Data with ID: ${uuid}`);
  } catch (error) {
    logger.error(`Failed to upload data: ${error}`);
  }
};

/**
 * Retrieves all users from the Firestore database.
 * @returns {Promise<User[]>} The list of users.
 */
const getData = async () => {
  try {
    const firestore = getFirestoreDB();
    const querySnapshot = await getDocs(collection(firestore, 'Users'));
    const data = querySnapshot.docs.map(doc => new User(doc.id, ...Object.values(doc.data())));
    logger.info(`Retrieved Data: ${JSON.stringify(data)}`);
    return data;
  } catch (error) {
    logger.error(`Failed to retrieve data: ${error}`);
  }
};

/**
 * Retrieves a user by ID from the Firestore database.
 * @param {string} id - The ID of the user.
 * @returns {Promise<User>} The user data.
 */
const getDataByID = async (id) => {
  try {
    const firestore = getFirestoreDB();
    const documentRef = doc(firestore, 'Users', id);
    const documentSnapshot = await getDoc(documentRef);
    if (documentSnapshot.exists()) {
      const data = documentSnapshot.data();
      const user = new User(id, ...Object.values(data));
      logger.info(`Retrieved Data for ID ${id}: ${JSON.stringify(user)}`);
      return user;
    } else {
      logger.warn(`No document found with ID ${id}`);
    }
  } catch (error) {
    logger.error(`Failed to retrieve data by ID: ${error}`);
  }
};


/**
 * Retrieves a user by a specified field (e.g., email) from the Firestore database.
 * @param {string} field - The field to query by (e.g., 'email').
 * @param {string} value - The value to search for.
 * @returns {Promise<User|null>} The user data or null if not found.
 */
const getUserByField = async (field, value) => {
  try {
    const firestore = getFirestoreDB();
    const q = query(collection(firestore, 'Users'), where(field, '==', value));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      logger.warn(`No user found with ${field} = ${value}`);
      return null;
    }

    // Assuming the first document is the desired user
    const docSnapshot = querySnapshot.docs[0];
    const data = docSnapshot.data();
    const user = new User(docSnapshot.id, ...Object.values(data));
    logger.info(`Retrieved Data for ${field} = ${value}: ${JSON.stringify(user)}`);
    return user;
  } catch (error) {
    logger.error(`Failed to retrieve data by ${field}: ${error}`);
    return null;
  }
};

/**
 * Updates a user by ID in the Firestore database.
 * @param {string} id - The ID of the user.
 * @param {Object} newData - The new data for the user.
 */
const updateData = async (id, newData) => {
  try {
    const firestore = getFirestoreDB();
    const documentRef = doc(firestore, 'Users', id);
    await updateDoc(documentRef, newData);
    logger.info(`Updated Data for ID ${id}`);
  } catch (error) {
    logger.error(`Failed to update data: ${error}`);
  }
};

/**
 * Deletes a user by ID from the Firestore database.
 * @param {string} id - The ID of the user.
 */
const deleteData = async (id) => {
  try {
    const firestore = getFirestoreDB();
    const documentRef = doc(firestore, 'Users', id);
    await deleteDoc(documentRef);
    logger.info(`Deleted Data for ID ${id}`);
  } catch (error) {
    logger.error(`Failed to delete data: ${error}`);
  }
};

module.exports = { uploadData, getData, getDataByID, updateData, deleteData };
