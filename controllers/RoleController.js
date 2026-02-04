require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Role = require("@models/Role");
const User = require('@models/User');
const path = require("path");
const fs = require("fs");
exports.roleList = async (req, res) => {
  try {
    const { unit_id } = req.query;

    let whereCondition = {};
    if (unit_id) whereCondition.unit_id = unit_id;

    const departments = await Role.findAll({
      where: whereCondition,
      order: [["id", "DESC"]],
    });

    return res.json({
      status: true,
      message: "list fetched successfully",
      data: departments,
    });
  } catch (error) {
    console.error("List Error:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

/* ================= ADD / UPDATE ================= */
exports.storeRole = async (req, res) => {
  try {
    const user_id = req.user.id;

    const dataArr = {
      created_for: req.body.created_for,
      name: req.body.name,
      parent: req.body.parent || null,
    };

    if (req.body.edit_id) {
      dataArr.updated_by = user_id;

      await Role.update(dataArr, {
        where: { id: req.body.edit_id },
      });

      return res.json({
        status: true,
        message: "Role updated successfully",
      });
    }

    dataArr.created_by = user_id;
    await Role.create(dataArr);

    return res.json({
      status: true,
      message: "Role added successfully",
    });
  } catch (error) {
    console.error("Role Store Error:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

/* ================= DELETE ================= */
exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Role.destroy({
      where: { id },
    });

    if (!deleted) {
      return res.status(404).json({
        status: false,
        message: "Role not found",
      });
    }

    return res.json({
      status: true,
      message: "Role deleted successfully",
    });
  } catch (error) {
    console.error("Role Delete Error:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

