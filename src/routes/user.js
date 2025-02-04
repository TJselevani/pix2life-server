const express = require('express');
const router = express.Router();
const extractToken = require('../middleware/extract-token.middleware');
const {
  loginUser,
  createUser,
  createPassword,
  getAllUsers,
  getUserByEmail,
  getUserById,
  checkUser,
  getUserFromToken,
  forgotPassword,
  resetPassword,
  verifyResetCode,
} = require('../controllers/auth.controller');
// const { validateUserLoginInput, validateUserPasswordInput, validateUserSignUpInput, validateUserEmailInput }  = require('../middleware/input-validation.middleware');

//************************************************************************************************************************************************

router.post('/register', createUser);

router.post('/create-password', extractToken, createPassword);

router.post('/forgot-password', forgotPassword);

router.post('/verify/reset-code', verifyResetCode);

router.post('/verify/email');

router.post('/verify/resend');

router.post('/reset-password', resetPassword);

router.post('/login', loginUser);

router.get('/all', extractToken, getAllUsers);

router.post('/email', getUserByEmail);

router.get('/token', extractToken, getUserFromToken);

router.post('/check', checkUser);

router.get('/user/:id', extractToken, getUserById);

router.get('/status');

//***********************************************************************************************************************************************

module.exports = router;
