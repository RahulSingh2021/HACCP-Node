const { DataTypes } = require("sequelize");
const sequelize = require("@config/config");

const InspectionStatus = sequelize.define(
  "InspectionStatus",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    unit_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },

    responsibility: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },

    location: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },

    sublocation: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },

    concern: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },

    subconcern: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    tableName: "inspection_status",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = InspectionStatus;