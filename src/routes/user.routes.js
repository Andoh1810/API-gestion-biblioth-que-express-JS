import { Router } from "express";
import userController from "../controller/user.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const userRoutes = Router()

const patternUser = {
    signup: "/signup",
    login: "/login",
    logout: "/logout",
    profile: "/profile/:id"
}

userRoutes.post(patternUser.signup, userController.signup)
userRoutes.post(patternUser.login, userController.login)
userRoutes.post(patternUser.logout,authMiddleware, userController.logout)

userRoutes.get(patternUser.profile,authMiddleware, userController.getUser)

userRoutes.put(patternUser.profile,authMiddleware, userController.putUser)

userRoutes.delete(patternUser.profile,authMiddleware, userController.deleteUser)

export default userRoutes