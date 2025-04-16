import express from "express";
import { protect, admin } from "../middleware/auth.middleware.js";
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";

const router = express.Router();

// Get all users - admin only
router.get("/", protect, admin, getUsers);

// Get user by ID - admin only
router.get("/:id", protect, admin, getUserById);

// Update user - admin only
router.put("/:id", protect, admin, updateUser);

// Delete user - admin only
router.delete("/:id", protect, admin, deleteUser);

export default router;
