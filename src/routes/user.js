const express = require('express');
const router = express.Router()
const extractToken = require('../middleware/extract-token.middleware');
const { loginUser, createUser, createPassword, getAllUsers, getUserByEmail, getUserById, checkUser, getUserFromToken} = require('../controllers/auth.controller')
const { validateUserLoginInput, validateUserPasswordInput, validateUserSignUpInput, validateUserEmailInput }  = require('../middleware/input-validation.middleware');

//************************************************************************************************************************************************

router.post('/register', createUser)

router.post('/create-password', extractToken, createPassword)

router.post('/login', loginUser)

router.get('/all', extractToken, getAllUsers)

router.post('/email', getUserByEmail)

router.get('/token', extractToken, getUserFromToken)

router.post('/check',  checkUser)

router.get('/user/:id', extractToken,  getUserById)

//***********************************************************************************************************************************************

module.exports = router