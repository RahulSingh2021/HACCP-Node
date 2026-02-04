require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Inspection  = require('@models/Inspection');
const Inspectionfollow  = require('@models/Inspectionfollow');
const BreakdownHistory  = require('@models/BreakdownHistory');
const User = require('@models/User');
const path = require("path");
const fs = require("fs");


exports.inspectionList = async (req, res) => {
  try {
    const { unit_id } = req.body;

    console.log("Query:", req.body); // debug

    let whereCondition = {};

    // ✅ Only add if exists
    if (unit_id !== undefined && unit_id !== "") {
      whereCondition.unit_id = parseInt(unit_id);
    }

    // ✅ Starred filter
    if (typeof starred !== "undefined") {
      whereCondition.starred =
        starred == 1 || starred === "true" ? 1 : 0;
    }

    const inspections = await Inspection.findAll({
      where: whereCondition,
      order: [["id", "DESC"]],
      limit: 50,
    });

    return res.status(200).json({
      status: true,
      message: "Inspection list fetched successfully",
      data: inspections,
    });

  } catch (error) {
    console.error("Inspection List Error:", error);

    return res.status(500).json({
      status: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

exports.storeInspection = async (req, res) => {
  try {
    const unit_id = req.user.id;

    let dataArr = {
      responsibility: req.body.responsibility || null,
      unit_id,
      location: req.body.location || null,
      sublocation: req.body.sublocation || null,
      concern: req.body.concern || null,
      subconcern: req.body.subconcern || null,
      title: req.body.comments || null,
    };

    /* ================= FILE HANDLING ================= */

    // 🔹 SINGLE IMAGE
    if (req.file) {
      dataArr.image = req.file.filename;
    }

    // 🔹 MULTIPLE IMAGES
    if (req.files && req.files.length > 0) {
      dataArr.image = req.files.map(file => file.filename).join(",");
    }

    /* ================= UPDATE ================= */
    if (req.body.edit_id) {
      dataArr.updated_by = unit_id;

      await Inspection.update(dataArr, {
        where: { id: req.body.edit_id },
      });

      return res.json({
        status: true,
        message: "Inspection updated successfully",
      });
    }

    /* ================= CREATE ================= */
    await Inspection.create(dataArr);

    return res.json({
      status: true,
      message: "Inspection added successfully",
    });

  } catch (error) {
    console.error("Inspection Store Error:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};


exports.deleteInspection = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: false,
        message: "Inspection id is required",
      });
    }

    const deleted = await Inspection.destroy({
      where: { id },
    });

    if (!deleted) {
      return res.status(404).json({
        status: false,
        message: "Inspection not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Inspection deleted successfully",
    });

  } catch (error) {
    console.error("Delete Inspection Error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

exports.inspectionSaveStatus = async (req, res) => {
  try {
    const unit_id = req.user.id; // 🔐 from auth

    const { type, value } = req.body;

    if (!type) {
      return res.status(400).json({
        success: false,
        message: "Type is required",
      });
    }

    // dynamic column update
    const data = {
      [type]: value,
    };

    // find existing record
    const inspection = await InspectionStatus.findOne({
      where: { unit_id },
    });

    if (inspection) {
      // UPDATE
      await InspectionStatus.update(data, {
        where: { unit_id },
      });
    } else {
      // INSERT
      await InspectionStatus.create({
        unit_id,
        ...data,
      });
    }

    return res.json({
      success: true,
      message: "Status updated successfully",
    });

  } catch (error) {
    console.error("Inspection Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.followInspection = async (req, res) => {
  try {
    const { inspection_id, starred } = req.body;

    // ✅ Validation
    if (!inspection_id || typeof starred === "undefined") {
      return res.status(400).json({
        success: false,
        message: "inspection_id and starred are required",
      });
    }

    if (![0, 1, true, false].includes(starred)) {
      return res.status(400).json({
        success: false,
        message: "starred must be boolean (true/false or 0/1)",
      });
    }

    // ✅ Update starred status
    const [updated] = await Inspection.update(
      { starred: starred ? 1 : 0 },
      { where: { id: inspection_id } }
    );

    // ✅ Check update result
    if (updated > 0) {
      return res.status(200).json({
        success: true,
        message: "Inspection starred status updated successfully.",
      });
    }

    return res.status(400).json({
      success: false,
      message: "Failed to update. Invalid ID or no changes.",
    });
  } catch (error) {
    console.error("Follow Inspection Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};




exports.inspectionFollowUp = async (req, res) => {
  try {
    const { inspection_id, action, comments } = req.body;

    // ✅ Validation
    if (!inspection_id || !action) {
      return res.status(400).json({
        success: false,
        message: "inspection_id and action are required",
      });
    }

    // ✅ Allowed actions validation
    const allowedActions = ["Not Done", "N/A", "Compliance"];
    if (!allowedActions.includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Invalid action value",
      });
    }

    // ✅ Create follow-up record
    const followUp = await Inspectionfollow.create({
      inspection_id: inspection_id,
      action: action,
      comments: comments || null,
      updated_by: req.user?.id || null,   // agar auth middleware hai
    });

    return res.status(201).json({
      success: true,
      message: "Inspection follow-up added successfully.",
      data: followUp,
    });

  } catch (error) {
    console.error("Inspection FollowUp Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


exports.inspectionLog = async (req, res) => {
  try {
    const { inspection_id } = req.params;

    if (!inspection_id) {
      return res.status(400).json({
        success: false,
        message: "inspection_id is required",
      });
    }

    const logs = await Inspectionfollow.findAll({
      where: { inspection_id },
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Inspection logs fetched successfully",
      data: logs,
    });

  } catch (error) {
    console.error("Inspection Log Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

exports.followclosure = async (req, res) => {
  try {
    const { inspection_id, closure_comments, status } = req.body;

    // ✅ Validation
    if (!inspection_id || !status) {
      return res.status(400).json({
        success: false,
        message: "inspection_id and status are required",
      });
    }

    // ✅ Optional: Status validation
    const allowedStatus = ["Open", "Resolved", "Closed"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    // ✅ Update Inspection table
    const [updated] = await Inspection.update(
      {
        select_action: status,
        closure_comments: closure_comments || null,
      },
      {
        where: { id: inspection_id },
      }
    );

    if (updated === 0) {
      return res.status(404).json({
        success: false,
        message: "Inspection not found or no changes applied",
      });
    }

    // ✅ Optional: Save closure in follow-up log
    await Inspectionfollow.create({
      inspection_id: inspection_id,
      action: "Closure",
      comments: closure_comments || status,
      updated_by: req.user?.id || null,
    });

    return res.status(200).json({
      success: true,
      message: "Inspection closed successfully",
    });

  } catch (error) {
    console.error("Inspection Closure Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};



exports.bulkUploadData = async (req, res) => {
  try {
    const files = req.files;

    // ✅ No files check
    if (!files || files.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "No files uploaded.",
      });
    }

    // ✅ Unit ID (Session/Auth alternative)
    const unit_id = req.user?.unit_id || req.user?.id;

    // ✅ Location hierarchy
    const locationPath = req.body.location || "";
    const parts = locationPath.split("/").map((p) => p.trim());

    for (const file of files) {
      const ext = path.extname(file.originalname).toLowerCase().replace(".", "");

      const dataArr = {
        concern: req.body.concern || "Bulk Upload",
        unit_id,
        sops: "Bulk Upload: General Observation",
        corporate: parts[0] || null,
        regional: parts[1] || null,
        unit: parts[2] || null,
        sublocation: parts[3] || null,
        location: parts[4] || null,
        responsibility: "Unassigned",
        image: file.filename,
      };

      // ✅ Image compression (optional – placeholder)
      if (["jpg", "jpeg", "png"].includes(ext)) {
        // 👉 yaha sharp / imagemin laga sakte ho
        // abhi as-is rakha gaya hai
      }

      // ✅ Video thumbnail placeholder
      if (["mp4", "avi", "mov", "mkv"].includes(ext)) {
        const thumbName = Date.now() + "_thumb.jpg";
        const placeholder = path.join(
          __dirname,
          "../../public/inspection/default-video-placeholder.jpg"
        );
        const thumbPath = path.join("public/inspection", thumbName);

        if (fs.existsSync(placeholder)) {
          fs.copyFileSync(placeholder, thumbPath);
          dataArr.thumbnail = thumbName;
        } else {
          dataArr.thumbnail = "default-thumbnail.jpg";
        }
      }

      // ✅ Insert DB record
      await Inspection.create(dataArr);
    }

    return res.json({
      status: "success",
      message: "All inspection files uploaded successfully.",
    });
  } catch (error) {
    console.error("Bulk Upload Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};


exports.postAfterImage = async (req, res) => {
  try {
    const type = Number(req.body.type);

    const unit_id = req.session?.unit_id
      ? req.session.unit_id
      : req.user.id;

    /**
     * ==========================
     * TYPE == 2 (RE-OPEN CASE)
     * ==========================
     */
    if (type === 2) {
      // Update closure comments on old inspection
      await Inspection.update(
        { closureComments: req.body.corrective_action },
        { where: { id: req.body.closure_incident_id } }
      );

      const details = await Inspection.findOne({
        where: { id: req.body.closure_incident_id },
        raw: true,
      });

      if (!details) {
        return res.status(404).json({
          status: false,
          message: "Inspection not found",
        });
      }

      let dataArr = {
        unit_id: details.unit_id || unit_id,
        closure_comments: "",
        location: details.location || "",
        sublocation: details.sublocation || "",
        responsibility: details.responsibility || "",
        sops: details.sops || "",
        title: `(Re-opened) ${req.body.corrective_action}`,
        select_action: "Open",
      };

      // File upload (single file from files[])
      if (req.files && req.files.length > 0) {
        const file = req.files[0];
        dataArr.image = file.filename;

        const ext = path.extname(file.filename).toLowerCase();

        // Video thumbnail (placeholder)
        if ([".mp4", ".avi", ".mov", ".mkv"].includes(ext)) {
          const thumbName = Date.now() + "_thumb.jpg";
          const thumbPath = path.join("uploads/inspection", thumbName);
          const placeholder = path.join(
            "uploads/inspection",
            "default-video-placeholder.jpg"
          );

          if (fs.existsSync(placeholder)) {
            fs.copyFileSync(placeholder, thumbPath);
            dataArr.thumbnail = thumbName;
          } else {
            dataArr.thumbnail = "default-thumbnail.jpg";
          }
        }
      }

      await Inspection.create(dataArr);

      return res.json({
        status: true,
        message: "Inspection re-opened successfully",
      });
    }

    /**
     * ==========================
     * TYPE != 2 (RESOLVED CASE)
     * ==========================
     */
    let updateArr = {
      closure_comments: req.body.corrective_action,
      select_action: "Resolved",
    };

    if (req.files && req.files.length > 0) {
      const file = req.files[0];
      updateArr.image1 = file.filename;

      const ext = path.extname(file.filename).toLowerCase();

      if ([".mp4", ".avi", ".mov", ".mkv"].includes(ext)) {
        const thumbName = Date.now() + "_thumb.jpg";
        const thumbPath = path.join("uploads/inspection", thumbName);
        const placeholder = path.join(
          "uploads/inspection",
          "default-video-placeholder.jpg"
        );

        if (fs.existsSync(placeholder)) {
          fs.copyFileSync(placeholder, thumbPath);
          updateArr.thumbnail = thumbName;
        } else {
          updateArr.thumbnail = "default-thumbnail.jpg";
        }
      }
    }

    await Inspection.update(updateArr, {
      where: { id: req.body.closure_incident_id },
    });

    return res.json({
      status: true,
      message: "Inspection resolved successfully",
    });
  } catch (error) {
    console.error("postAfterImage Error:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

exports.inspectionbreakdown = async (req, res) => {
  try {
    let dataArr = {};

    dataArr.inspection_id = req.body.inspection_id;
    dataArr.equipment_id = req.body.breakdown_equipment || "";

    if (req.body.breakdown_equipment) {
      dataArr.breakdown = req.body.breakdown_root_cause || "";
    } else {
      dataArr.breakdown = req.body.breakdown_step_taken || "";
    }

    dataArr.tentative_closure_date = req.body.breakdown_closure_date;
    dataArr.Reported_Date = req.body.breakdown_closure_date;
    dataArr.current_step_taken = req.body.breakdown_step_taken;
    dataArr.incurred_cost = req.body.incurred_cost;

    // 🔹 Insert into brakdown_history
    await BreakdownHistory.create(dataArr);

    // 🔹 Update inspection status
    await Inspection.update(
      { select_action: "In Progress" },
      { where: { id: req.body.inspection_id } }
    );

    return res.json({
      status: "success",
      message: "Inspection data uploaded successfully",
    });
  } catch (error) {
    console.error("Breakdown API Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

exports.brakedownhistory = async (req, res) => {
  try {
    const inspectionId = req.body.inspection_id || req.query.inspection_id;

    if (!inspectionId) {
      return res.status(400).json({
        status: false,
        message: "inspection_id is required",
      });
    }

    const history = await BreakdownHistory.findAll({
      where: {
        inspection_id: inspectionId,
      },
      order: [["id", "DESC"]],
    });

    return res.json({
      status: true,
      data: history,
    });
  } catch (error) {
    console.error("Breakdown History Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

exports.updateBreakdownStatus = async (req, res) => {
  try {
    const { inspection_id, status } = req.body;

    // Validation (Laravel jaisa)
    if (!inspection_id || !status) {
      return res.status(400).json({
        status: "error",
        message: "inspection_id and status are required",
      });
    }

    // Update inspection table
    const inspectionUpdated = await Inspection.update(
      {
        breakdownStatus: "pending-verification",
      },
      {
        where: { id: inspection_id },
      }
    );

    // Update brakdown_history table
    const historyUpdated = await BreakdownHistory.update(
      {
        breakdownStatus: "pending-verification",
      },
      {
        where: { inspection_id: inspection_id },
      }
    );

    const isUpdated =
      inspectionUpdated[0] > 0 || historyUpdated[0] > 0;

    return res.json({
      status: isUpdated ? "success" : "error",
      message: isUpdated
        ? "Inspection status updated successfully."
        : "No record found to update.",
      data: {
        inspection_id: inspection_id,
        status: status,
      },
    });
  } catch (error) {
    console.error("Update Breakdown Status Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
};