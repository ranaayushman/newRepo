import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/user.model.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ======================= REGISTER =======================
export const register = async (req, res) => {
  const { name, email, password, isAdmin, adminKey } = req.body;

  try {
    let user = await User.findOne({ email });

    if (isAdmin && adminKey !== process.env.ADMIN_CREATION_KEY) {
      return res
        .status(403)
        .json({ msg: "Not authorized to create admin accounts" });
    }

    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
      role: isAdmin ? "admin" : "user",
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({ token, user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// ======================= EMAIL/PASSWORD LOGIN =======================
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !user.password) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({
      token,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// ======================= GOOGLE LOGIN =======================
export const googleLogin = async (req, res) => {
  const { id_token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const { email, name } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        password: null, // No password for Google users
        role: "user",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Google Auth Error:", err);
    res.status(401).json({ msg: "Invalid Google token" });
  }
};

// ======================= GET CURRENT USER =======================
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
