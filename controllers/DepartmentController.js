require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Department = require("@models/Department");
const Responsibility = require("@models/Responsibility");
const User = require('@models/User');
const path = require("path");
const fs = require("fs");
exports.departmentList = async (req, res) => {
  try {
    const { unit_id } = req.query;

    let whereCondition = {};
    if (unit_id) whereCondition.unit_id = unit_id;

    const departments = await Department.findAll({
      where: whereCondition,
      order: [["id", "DESC"]],
    });

    return res.json({
      status: true,
      message: "Department list fetched successfully",
      data: departments,
    });
  } catch (error) {
    console.error("Department List Error:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};
exports.responsibility = async (req, res) => {
  try {
    const { unit_id } = req.query;

    let whereCondition = {};
    if (unit_id) whereCondition.unit_id = unit_id;

    const departments = await Responsibility.findAll({
      where: whereCondition,
      order: [["id", "DESC"]],
    });

    return res.json({
      status: true,
      message: "Department list fetched successfully",
      data: departments,
    });
  } catch (error) {
    console.error("Department List Error:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

/* ================= ADD / UPDATE ================= */
exports.storeDepartment = async (req, res) => {
  try {
    const user_id = req.user.id;

    const dataArr = {
      unit_id: req.body.unit_id,
      name: req.body.name,
      parent: req.body.parent || null,
    };

    if (req.body.edit_id) {
      dataArr.updated_by = user_id;

      await Department.update(dataArr, {
        where: { id: req.body.edit_id },
      });

      return res.json({
        status: true,
        message: "Department updated successfully",
      });
    }

    dataArr.created_by = user_id;
    await Department.create(dataArr);

    return res.json({
      status: true,
      message: "Department added successfully",
    });
  } catch (error) {
    console.error("Department Store Error:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

/* ================= DELETE ================= */
exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Department.destroy({
      where: { id },
    });

    if (!deleted) {
      return res.status(404).json({
        status: false,
        message: "Department not found",
      });
    }

    return res.json({
      status: true,
      message: "Department deleted successfully",
    });
  } catch (error) {
    console.error("Department Delete Error:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

