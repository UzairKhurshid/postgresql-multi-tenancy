// models/userModel.js
const pool = require("../config/db");

// Get all users
async function getAllUsers() {
  const result = await pool.query("SELECT * FROM users ORDER BY id ASC");
  return result.rows;
}

// Get user by ID
async function getUserById(id) {
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return result.rows[0];
}

// Create new user
async function createUser(name, email) {
  const result = await pool.query(
    "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
    [name, email]
  );
  return result.rows[0];
}

// Update user
async function updateUser(id, name, email) {
  const result = await pool.query(
    "UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *",
    [name, email, id]
  );
  return result.rows[0];
}

// Delete user
async function deleteUser(id) {
  const result = await pool.query("DELETE FROM users WHERE id = $1", [id]);
  return result.rowCount;
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
