const { DataTypes } = require("sequelize");
const sequelize = require("@config/config");

const BreakdownHistory = sequelize.define(
    "BreakdownHistory",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      inspection_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      breakdownStatus: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "breakdownStatus",
      },

      equipment_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      breakdown: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      tentative_closure_date: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      Reported_Date: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "Reported_Date",
      },

      current_step_taken: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      incurred_cost: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      verification_comments: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      signature: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "brakdown_history",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

module.exports = BreakdownHistory;