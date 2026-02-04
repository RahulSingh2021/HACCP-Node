const { DataTypes } = require("sequelize");
const sequelize = require("@config/config");

const Responsibility = sequelize.define(
  "Responsibility",
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

    unit_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "authority",
    timestamps: true,
    createdAt: "create_at",
    updatedAt: "update_at",
  }
);

module.exports = Responsibility;