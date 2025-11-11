// controllers/userController.js
const userModel = require("../models/user");

async function getUsers(req, res) {
  try {
    const users = await userModel.getAllUsers();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
}

async function getUser(req, res) {
  const { id } = req.params;
  try {
    const user = await userModel.getUserById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
}

async function createUser(req, res) {
  const { name, email } = req.body;
  try {
    const newUser = await userModel.createUser(name, email);
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: "Failed to create user" });
  }
}

async function updateUser(req, res) {
  const { id } = req.params;
  const { name, email } = req.body;
  try {
    const updatedUser = await userModel.updateUser(id, name, email);
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: "Failed to update user" });
  }
}

async function deleteUser(req, res) {
  const { id } = req.params;
  try {
    await userModel.deleteUser(id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user" });
  }
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};
