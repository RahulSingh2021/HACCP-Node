require("module-alias/register");
const { DataTypes } = require("sequelize");
const sequelize = require("@config/config");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },

    mobile_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    is_role: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Admin=0, Corporate=2, Regional=1, Unit=3',
    },

    login_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    email_verified_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    two_factor_secret: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    two_factor_recovery_codes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    two_factor_confirmed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    remember_token: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    current_team_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },

    profile_photo_path: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    company_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    Company_address: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    Contact_Person_Name: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    designation: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    created_by1: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    Compliance_status: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    push_token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    device_type: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    otp: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    mpin: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    expire_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    is_verified: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
  },
  {
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = User;