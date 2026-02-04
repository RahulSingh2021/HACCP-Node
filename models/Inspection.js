const { DataTypes } = require("sequelize");
const sequelize = require("@config/config");

const Inspection = sequelize.define(
  "Inspection",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    title: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    unit_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    image1: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    type1: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    type2: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    responsibility: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    sublocation: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    concern: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    subconcern: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    comments: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    closure_comments: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "closureComments",
    },

    time_line: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    select_action: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "Open",
    },

    sops: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    price: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    image_thumb1: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    image_thumb2: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    corporate: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    regional: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    starred: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    breakdownStatus: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    unit: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    people: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    equipment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    food: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "inspection",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Inspection;