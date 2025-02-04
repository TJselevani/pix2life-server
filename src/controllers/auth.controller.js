const logger = require('../loggers/logger');
const userService = require('../services/user.service');
const authService = require('../services/auth.service');
const {
  BadRequestError,
  NotFoundError,
} = require('../errors/application-errors');
const asyncHandler = require('../middleware/async-handler.middleware');

const createUser = asyncHandler(async (req, res) => {
  const userData = req.body;
  const user = await userService.createUser(userData);
  const token = await authService.createAuthJWTToken(user);
  logger.info(`User ${user.email} Created Successfully`);
  await userService.welcomeEmail(user);
  return res.json({
    token: token,
    user: user,
    message: `User ${user.username} registered successfully, Verification Code has been sent to Mail`,
  });
});

const createPassword = asyncHandler(async (req, res) => {
  const email = req.user.email;
  const { password, confirmPassword } = req.body;
  if (password != confirmPassword) {
    throw new BadRequestError("Passwords Don't match");
  }
  const authUser = await userService.getUserByEmail(email);
  const hashedPassword = await authService.hashPassword(password);
  await userService.createPassword(authUser, hashedPassword);
  await userService.updateUserLoginDate(authUser.id);
  logger.info(`Password created Successfully`);
  res.json({ message: 'Password Created Successfully' });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  logger.debug(`${email} ${password}`);
  const authUser = await authService.validateUSer(email, password);
  if (!authUser) {
    throw new BadRequestError('Invalid Credentials');
  }
  await userService.updateUserLoginDate(authUser.id);
  const token = await authService.generateToken(authUser);
  logger.info(`${authUser.email} Logged In Successfully `);
  res.json({
    user: authUser,
    token: token,
    message: `${authUser.email}, Login Successful!`,
  });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await userService.getAllUsers();
  if (users == null) {
    throw new NotFoundError('No users available');
  }
  res.json(users);
});

const checkUser = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(email)) {
    throw new BadRequestError('Invalid Email format');
  }

  const user = await userService.getUserByEmail(email);
  if (user == null) {
    return res.status(200).json({ message: 'Email is valid' });
  }

  throw new BadRequestError('User Already Exists!');
});

const getUserByEmail = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const user = await userService.getUserByEmail(email);
  if (user != null) {
    return res.status(200).json({ user: user });
  }
  throw new NotFoundError('User does not Exist!');
});

const getUserById = asyncHandler(async (req, res) => {
  const id = req.params.id;
  logger.debug(id);
  const user = await userService.getUserById(id);
  if (user != null) {
    return res.status(200).json({ user: user });
  }
  throw new NotFoundError('User does not not Exist!');
});

const getUserFromToken = asyncHandler(async (req, res) => {
  const id = req.user.id;
  logger.debug(id);
  const user = await userService.getUserById(id);
  if (user != null) {
    return res.status(200).json({ user: user });
  }
  throw new NotFoundError('User does not Exist!');
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  await userService.handleForgotPassword(email);
  res.json({ message: 'Verification code sent to your email' });
});

const verifyResetCode = asyncHandler(async (req, res) => {
  const { email, resetCode } = req.body;
  await userService.handleVerifyResetCode(email, resetCode);
  res.json({ message: 'Verification successful' });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email, resetCode, password, confirmPassword } = req.body;
  logger.debug(`${email}, ${resetCode}, ${password}, ${confirmPassword}`);
  if (password !== confirmPassword) {
    throw new BadRequestError("Passwords Don't match");
  }
  await userService.handleResetPassword(email, resetCode, password);

  const authUser = await authService.validateUSer(email, password);

  res.json({ message: 'Password reset successful', user: authUser });
});

module.exports = {
  createUser,
  loginUser,
  createPassword,
  getAllUsers,
  checkUser,
  getUserByEmail,
  getUserById,
  getUserFromToken,
  forgotPassword,
  verifyResetCode,
  resetPassword,
};
