import express from "express";
import {
  getContacts,
  getContactById,
  postContact,
} from "../controllers/contact.controller.js";

const router = express.Router();

router.get("/contacts", getContacts);
router.get("/contacts/:id", getContactById);
router.post("/contacts", postContact);

export default router;
