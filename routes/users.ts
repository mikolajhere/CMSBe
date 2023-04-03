import express from "express";
import { deleteUser, getUserInfo, updateUserInfo } from "../controllers/user";
const router = express.Router();

router.get("/:id", getUserInfo);
router.put("/:id", updateUserInfo);
router.delete("/:id", deleteUser);

export default router;
