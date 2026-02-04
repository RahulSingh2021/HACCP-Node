const { DataTypes } = require("sequelize");
const sequelize = require("@config/config");

const Topic = sequelize.define(
  "Topic",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,   // null = topic, number = subtopic
    },

    created_for: {
      type: DataTypes.INTEGER,
      allowNull: true,   // unit_id
    },

    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "topics",
    timestamps: true,
    createdAt: "create_at",
    updatedAt: "update_at",
  }
);

module.exports = Topic;