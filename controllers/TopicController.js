require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Topic = require("@models/Topic");
const User = require('@models/User');
const path = require("path");
const fs = require("fs");

exports.topicList = async (req, res) => {
  try {
    const { created_for, parent_id } = req.query;

    let whereCondition = {};

    if (created_for) whereCondition.created_for = created_for;
    if (parent_id !== undefined) whereCondition.parent_id = parent_id;

    const topics = await Topic.findAll({
      where: whereCondition,
      order: [["id", "DESC"]],
    });

    return res.json({
      status: true,
      message: "Topic list fetched successfully",
      data: topics,
    });
  } catch (error) {
    console.error("Topic List Error:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};


/* ================= ADD / UPDATE ================= */
exports.storeTopic = async (req, res) => {
  try {
    const user_id = req.user.id;

    let dataArr = {
      name: req.body.name || null,
      parent_id: req.body.parent_id || null,   // null = topic
      created_for: req.body.created_for || null,
    };

    /* ========== UPDATE ========== */
    if (req.body.edit_id) {
      await Topic.update(
        { ...dataArr, updated_by: user_id },
        { where: { id: req.body.edit_id } }
      );

      return res.json({
        status: true,
        message: "Topic updated successfully",
      });
    }

    /* ========== CREATE ========== */
    dataArr.created_by = user_id;
    await Topic.create(dataArr);

    return res.json({
      status: true,
      message: "Topic added successfully",
    });

  } catch (error) {
    console.error("Topic Store Error:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};


/* ================= DELETE ================= */
exports.deleteTopic = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Topic.destroy({
      where: { id },
    });

    if (!deleted) {
      return res.status(404).json({
        status: false,
        message: "Topic not found",
      });
    }

    return res.json({
      status: true,
      message: "Topic deleted successfully",
    });

  } catch (error) {
    console.error("Topic Delete Error:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};
