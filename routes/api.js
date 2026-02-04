require("module-alias/register");
const express = require("express");
const router = express.Router();
/* Helpers */
const uploadInspection = require("@helpers/inspectionUpload");
/* Middleware */
const authMiddleware = require("@middleware/authMiddleware");
/* Controllers */
const {
  Logout,
  AddUser,
  profileDetails,
  login,
  editProfile,
  changePassword,
  deleteAccount,
  corporates,
  getRegionals,
  getUnits,
} = require("@controllers/authController");
const {
  inspectionList,
  storeInspection,
  deleteInspection,
  inspectionSaveStatus,
  followInspection,
  inspectionFollowUp,
  inspectionLog,
  bulkUploadData,
  postAfterImage,
  inspectionbreakdown,
  brakedownhistory,
  updateBreakdownStatus,
  followclosure,
} = require("@controllers/InspectionController");

const {
  departmentList,
  storeDepartment,
  deleteDepartment,
  responsibility
} = require("@controllers/departmentController");

const {
  roleList,
  storeRole,
  deleteRole,
} = require("@controllers/roleController");

const {
  topicList,
  storeTopic,
  deleteTopic,
} = require("@controllers/topicController");

/* ================= AUTH APIs ================= */
router.post("/auth/add-user", AddUser);
router.post("/auth/login", login);
router.post("/auth/logout", authMiddleware, Logout);
router.get("/auth/profileDetails", authMiddleware, profileDetails);
router.post("/auth/changePassword", authMiddleware, changePassword);
router.post("/auth/deleteAccount", authMiddleware, deleteAccount);
router.post("/auth/editProfile", authMiddleware, editProfile);
router.get("/auth/corporates", corporates);
router.get("/auth/regionals/:corporate_id", getRegionals);
router.get("/auth/units/:regional_id", getUnits);
/* ================= INSPECTION APIs ================= */
router.post("/auth/inspectionList",authMiddleware,inspectionList);
router.post("/auth/inspection-store",authMiddleware,uploadInspection.array("file", 5),storeInspection);
router.delete("/auth/inspection-delete/:id",authMiddleware,deleteInspection);
router.post("/auth/inspection-save-status",authMiddleware,inspectionSaveStatus);
router.post("/auth/follow-inspection",authMiddleware,followInspection);
router.post("/auth/inspection-closure",authMiddleware,followclosure);
router.post("/auth/inspectionFollowUp",authMiddleware,inspectionFollowUp);
router.post("/auth/inspection-bulk-upload",authMiddleware,uploadInspection.array("images", 100),bulkUploadData);
router.post("/auth/post-after-image",authMiddleware,uploadInspection.array("files", 5),postAfterImage);
router.post("/auth/inspection-breakdown",authMiddleware,inspectionbreakdown);
router.post("/auth/brakedown-history", authMiddleware,brakedownhistory);
router.post("/auth/update-breakdown-status",authMiddleware,updateBreakdownStatus);
router.get("/auth/inspectionLog/:inspection_id",authMiddleware,inspectionLog);

/* ================= Departments APIs ================= */
router.post("/auth/departments", authMiddleware,departmentList);           // List
router.post("/auth/responsibility", authMiddleware,responsibility);           // List
router.post("/auth/department/store", authMiddleware,storeDepartment);    // Add / Edit
router.delete("/auth/department/:id", authMiddleware,deleteDepartment);

/* ================= Role APIs ================= */
router.post("/auth/roles", authMiddleware,roleList);           // List
router.post("/auth/role/store", authMiddleware,storeRole);    // Add / Edit
router.delete("/auth/role/:id", authMiddleware,deleteRole);

/* ================= Topic APIs ================= */

router.post("/auth/topics", authMiddleware, topicList);
router.post("/auth/topic/store", authMiddleware, storeTopic);
router.delete("/auth/topic/:id", authMiddleware, deleteTopic);

module.exports = router;