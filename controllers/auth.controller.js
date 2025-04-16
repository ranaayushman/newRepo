import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// controllers/auth.controller.js

export const register = async (req, res) => {
  const { name, email, password, isAdmin } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    // Add this to your register controller
    if (isAdmin && req.body.adminKey !== process.env.ADMIN_CREATION_KEY) {
      return res
        .status(403)
        .json({ msg: "Not authorized to create admin accounts" });
    }

    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    user = new User({
      name,
      email,
      password,
      // Set role to admin if isAdmin flag is true
      role: isAdmin ? "admin" : "user",
    });

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Return JWT
    const payload = {
      id: user.id,
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Return JWT
    const payload = {
      id: user.id,
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          name: user.name,
          email: user.email,
          role: user.role,
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
