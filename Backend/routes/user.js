import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { User, Account } from "../models/user.js";
import { auth, JWT_SECRET } from "../middleware/auth.js";

const router = express.Router();

const SignUpSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName:  z.string().min(2, "Last name must be at least 2 characters"),
  username:  z.string().min(1, "Username is required").transform((v) => v.trim().toLowerCase()),
  mobile:    z
    .string()
    .regex(/^\d{10}$/, "Mobile number must be exactly 10 digits"),
  email:     z.string().email("Email must be a valid email").optional(),
  password:  z.string().min(8, "Password must be at least 8 characters").max(72),
});

const LoginSchema = z.object({
  username: z.string().min(1, "Username is required").transform((v) => v.trim().toLowerCase()),
  password: z.string().min(1, "Password is required"),
});

const UpdateSchema = z
  .object({
    firstName: z.string().min(2).optional(),
    lastName:  z.string().min(2).optional(),
    password:  z.string().min(8).max(72).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided to update",
  });

const signToken = (userId) =>
  jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "7d" });

router.post("/signup", async (req, res) => {
  try {
    const parsed = SignUpSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { firstName, lastName, username, mobile, email, password } = parsed.data;
    const normalizedEmail = email?.trim().toLowerCase();

    const duplicateChecks = [{ username }, { mobile }];
    if (normalizedEmail) duplicateChecks.push({ email: normalizedEmail });

    const exists = await User.findOne({ $or: duplicateChecks });
    if (exists) {
      return res.status(409).json({ message: "An account with this username, mobile, or email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      firstName,
      lastName,
      username,
      mobile,
      email: normalizedEmail,
      password: hashedPassword,
    });

    const seedBalance = Math.floor(Math.random() * 9000) + 1000;
    await Account.create({ userId: user._id, balance: seedBalance });

    const token = signToken(user._id);

    res.status(201).json({
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        mobile: user.mobile,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error during signup" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { username, password } = parsed.data;

    const user = await User.findOne({ $or: [{ username }, { mobile: username }] });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = signToken(user._id);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        mobile: user.mobile,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

router.put("/update", auth, async (req, res) => {
  try {
    const parsed = UpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const updates = { ...parsed.data };
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 12);
    }

    const updated = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true, select: "-password" }
    );

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user: {
        id: updated._id,
        firstName: updated.firstName,
        lastName: updated.lastName,
        username: updated.username,
        mobile: updated.mobile,
        email: updated.email,
      },
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Server error during update" });
  }
});

router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/bulk", auth, async (req, res) => {
  try {
    const filter = (req.query.filter || "").trim();
    const query = filter
      ? {
          _id: { $ne: req.userId },
          $or: [
            { firstName: { $regex: filter, $options: "i" } },
            { lastName:  { $regex: filter, $options: "i" } },
            { username:  { $regex: filter, $options: "i" } },
          ],
        }
      : { _id: { $ne: req.userId } };

    const users = await User.find(query)
      .select("firstName lastName username")
      .limit(20);

    res.json({
      users: users.map((u) => ({
        _id:       u._id,
        firstName: u.firstName,
        lastName:  u.lastName,
        username:  u.username,
      })),
    });
  } catch (err) {
    console.error("Bulk search error:", err);
    res.status(500).json({ message: "Server error during user search" });
  }
});

export { router };