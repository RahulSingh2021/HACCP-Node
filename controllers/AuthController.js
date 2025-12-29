require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('@models/User');
const nodemailer = require('nodemailer');
const authMiddleware = require('@middleware/tokenBlacklist');
const { addToken } = require('@middleware/tokenBlacklist');
const { getUserDetails } = require('@helpers/commonHelper');
const { Op } = require("sequelize");

exports.Logout = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Authentication token is required.' });
    }
    addToken(token);


    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    const userId = decoded.id;
    if (!userId) {
      return res.status(401).json({ message: "Invalid token payload." });
    }

    const existingUser = await User.findByPk(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Prepare update data
    let updateData = {
      push_token: null,
    };

    // Update user
    await existingUser.update(updateData);


    return res.status(200).json({
      status: true,
      message: 'Logged out successfully.',
    });

  } catch (err) {
    return res.status(401).json({
      status: false,
      message: 'Invalid or expired token.',
    });
  }
};

exports.register = async (req, res) => {
  try {
    // ✅ Step 1: Handle file upload (multer) as a promise
    await new Promise((resolve, reject) => {
      uploadProfilePic(req, res, (err) => (err ? reject(err) : resolve()));
    });

    // ✅ Step 2: Extract body fields
    let {
      clinic_name,
      full_name,
      firstName,
      lastName,
      email,
      mobile,
      country_code,
      gender,
      dob,
      password,
      confirm_password,
      terms_accepted,
      push_token,
      device_type,
      user_type
    } = req.body;

    // ✅ Step 3: Convert and clean inputs
    email = email?.trim().toLowerCase();
    full_name = full_name?.trim();
    firstName = firstName?.trim() || null;
    lastName = lastName?.trim() || null;

    // ✅ Step 4: Basic validations
    if (!full_name || !email || !mobile || !password || !confirm_password) {
      return res.status(400).json({ status: false, message: 'All required fields must be filled.' });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ status: false, message: 'Invalid email format.' });
    }

    if (!terms_accepted || terms_accepted === 'false') {
      return res.status(400).json({ status: false, message: 'You must accept terms and conditions.' });
    }

    if (password !== confirm_password) {
      return res.status(400).json({ status: false, message: 'Passwords do not match.' });
    }

    // ✅ Step 5: Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email },
          { mobile }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({
          status: false,
          message: 'Email already registered.'
        });
      }
      if (existingUser.mobile === mobile) {
        return res.status(400).json({
          status: false,
          message: 'Mobile number already registered.'
        });
      }
    }

    if (!user_type) {
      if (!dob) {
        return res.status(400).json({ status: false, message: 'Date of birth is required.' });
      }
      // ✅ Check date format YYYY-MM-DD
      const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dobRegex.test(dob)) {
        return res.status(400).json({ status: false, message: 'Date of birth must be in YYYY-MM-DD format.' });
      }

      // ✅ Check if it's a valid date
      const parsedDate = new Date(dob);
      const [year, month, day] = dob.split('-').map(Number);
      if (
        parsedDate.getFullYear() !== year ||
        parsedDate.getMonth() + 1 !== month ||
        parsedDate.getDate() !== day
      ) {
        return res.status(400).json({ status: false, message: 'Invalid date of birth.' });
      }
    }

    // ✅ Step 6: Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const user_role_id = user_type ? user_type : 1;

    // ✅ Step 7: Profile picture path (if uploaded)
    const avatar = req.files?.avatar ? `/uploads/users/${req.files.avatar[0].filename}` : null;

    // ✅ Step 8: Create user
    const newUser = await User.create({
      clinic_name,
      avatar,
      firstName,
      lastName,
      full_name,
      email,
      mobile,
      country_code,
      gender,
      dob,
      push_token,
      device_type,
      password: hashedPassword,
      terms_accepted,
      user_role_id
    });


    const existingClient = await Client.findOne({
  where: { email: email }
});

if (existingClient) {
  await Client.update(
    { user_id: newUser.id },
    { where: { email: email } }
  );
}



    // ✅ Step 9: Remove password from response
    const userResponse = { ...newUser.toJSON() };
    delete userResponse.password;
    const userDetails = await getUserDetails(newUser.id);

    // ✅ Step 10: Generate token
const token = jwt.sign(
  { id: newUser.id, role: user_role_id },
  process.env.JWT_SECRET
);

    // ✅ Step 11: Send Welcome Email
try {
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    subject: '🎉 Welcome to Our Platform!',
    html: `
      <div style="font-family: 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 30px; background-color: #ffffff;">
        <div style="text-align: center;">
          <img src="https://servicecue.com.au/web/assets/img/logo.png" alt="Logo" style="max-height: 60px; margin-bottom: 20px;">
        </div>
        <h2 style="color: #2D89EF; text-align: center;">Welcome to Service Cue! 🎉</h2>
        <p style="font-size: 16px; color: #333;">
          Hi <strong>${full_name || "there"}</strong>,
        </p>
        <p style="font-size: 16px; color: #333;">
          We're thrilled to have you join our platform! You're now part of a growing community of awesome people 🚀
        </p>
        <p style="font-size: 16px; color: #333;">
          If you have any questions, feel free to reply to this email. We’re here to help!
        </p>
        <p style="font-size: 16px; color: #333;">
    Warm regards,<br/>
    <strong>Shamara Jarrett</strong><br/>
    Founder | <strong>Service Cue™</strong>
  </p>
      </div>
    `,
  });

  //console.log("✅ Welcome email sent to", email);
} catch (mailErr) {
  console.error("❌ Welcome email error:", mailErr.message);
}

    return res.status(201).json({
      status: true,
      message: 'User registered successfully.',
      user: userDetails,
      token,
    });

  } catch (err) {
    console.error('Register Error:', err);
    return res.status(500).json({
      status: false,
      message: 'Internal server error.',
      error: process.env.NODE_ENV !== 'production' ? err.message : undefined
    });
  }
};


exports.login = async (req, res) => {
  try {
    let { email, password, push_token, device_type } = req.body;

    // -------------------------------
    // Validation
    // -------------------------------
    if (!email || !password) {
      return res.status(400).json({
        status: false,
        message: "Email and password are required.",
      });
    }

    email = email.trim().toLowerCase();

    // -------------------------------
    // Fetch user (ALL columns)
    // -------------------------------
    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found.",
      });
    }

    // -------------------------------
    // Password check
    // -------------------------------
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        status: false,
        message: "Invalid password.",
      });
    }

    // -------------------------------
    // JWT Token (No expiry)
    // -------------------------------
    const token = jwt.sign(
      { id: user.id, role: user.is_role },
      process.env.JWT_SECRET || "fallback_secret"
    );

    // -------------------------------
    // Update device info
    // -------------------------------
    await User.update(
      {
        push_token: push_token || user.push_token,
        device_type: device_type || user.device_type,
      },
      { where: { id: user.id } }
    );

    // -------------------------------
    // Remove sensitive fields
    // -------------------------------
    const userData = user.toJSON();
    delete userData.password;
    delete userData.mpin;
    delete userData.otp;

    // -------------------------------
    // Response
    // -------------------------------
    return res.status(200).json({
      status: true,
      message: "Login successful.",
      token,
      user: userData,
    });

  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({
      status: false,
      message: "Internal server error.",
    });
  }
};



exports.profileDetails = async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({
        status: false,
        message: "Authentication token is required.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");

    const userId = decoded.id;
    if (!userId) {
      return res.status(401).json({
        status: false,
        message: "Invalid token payload.",
      });
    }

    const userDetails = await getUserDetails(userId);

    // Fetch ACTIVE OR COMPLETE subscription with plan details
    const activeSubscription = await Subscription.findOne({
      where: {
        user_id: userId,
        stripe_status: ["active", "complete"],
      },
      include: [
        {
          model: SubscriptionPlans,
          as: "planDetails",
          attributes: [
            "id",
            "title",
            "stripe_product_id",
            "stripe_price_id",
            "amount",
            "currency",
            "interval",
            "post_limit",
            "content",
            "image"
          ]
        }
      ]
    });

    return res.status(200).json({
      status: true,
      message: "Details Found",
      user: { userId, ...userDetails },
      activeSubscription: activeSubscription,
    });

  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};


exports.editProfile = async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Authentication token is required." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    const userId = decoded.id;
    if (!userId) {
      return res.status(401).json({ message: "Invalid token payload." });
    }

    const existingUser = await User.findByPk(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Handle file upload
    await new Promise((resolve, reject) => {
      uploadProfilePic(req, res, (err) => (err ? reject(err) : resolve()));
    });

    // Extract and clean fields
    let {
      full_name,
      email,
      mobile,
      country_code,
      gender,
      dob
    } = req.body;

    email = email?.trim().toLowerCase();
    full_name = full_name?.trim();
    mobile = mobile?.trim();
    country_code = country_code?.trim();

    // Normalize mobile number (remove leading 0s)
    const normalizedMobile = mobile?.replace(/^0+/, '') || "";
    const existingMobile = existingUser.mobile?.replace(/^0+/, '') || "";
    const sameMobile = normalizedMobile === existingMobile;

    // Validations
    if (!full_name || !email || !mobile) {
      return res.status(400).json({ status: false, message: "All required fields must be filled." });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ status: false, message: "Invalid email format." });
    }
    // ✅ Handle DOB cleanly (nullify invalid or empty)
    if (!dob || dob === "0000-00-00" || dob === "Invalid date" || dob.trim() === "") {
      dob = null;
    } else {
      const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dobRegex.test(dob)) {
        return res.status(400).json({ status: false, message: "DOB must be in YYYY-MM-DD format." });
      }

      const parsedDate = new Date(dob);
      const [year, month, day] = dob.split("-").map(Number);

      if (
        parsedDate.getFullYear() !== year ||
        parsedDate.getMonth() + 1 !== month ||
        parsedDate.getDate() !== day
      ) {
        return res.status(400).json({ status: false, message: "Invalid DOB." });
      }
    }

    // Check for duplicate email if changed
    if (email !== existingUser.email) {
      const emailExists = await User.findOne({ where: { email } });
      if (emailExists && emailExists.id !== userId) {
        return res.status(400).json({ status: false, message: "Email already in use." });
      }
    }

    // ✅ Check for duplicate mobile regardless of country_code
    if (!sameMobile) {
      const mobileExists = await User.findOne({
        where: {
          mobile: normalizedMobile,
        },
      });

      if (mobileExists && mobileExists.id !== userId) {
        return res.status(400).json({ status: false, message: "Mobile number already in use." });
      }
    }

    // Prepare update data
    let updateData = {
      full_name,
      email,
      mobile: normalizedMobile,
      country_code,
      gender,
      dob,
    };

    if (req.files?.avatar?.[0]) {
      updateData.avatar = `/uploads/users/${req.files.avatar[0].filename}`;
    }

    // Update user
    await existingUser.update(updateData);

    const userDetails = await getUserDetails(userId);

    return res.status(200).json({
      status: true,
      message: "Profile updated successfully.",
      user: userDetails,
    });

  } catch (err) {
    console.error("Edit Profile Error:", err);
    return res.status(500).json({
      status: false,
      message: process.env.NODE_ENV !== "production" ? err.message : "Internal server error.",
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.id; // Middleware se aapko login user ka id milega

    // Step 1: Confirm new password and confirmPassword match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ status: false,message: "New Password and Confirm Password do not match." });
    }

    // Step 2: Find user by ID
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Step 3: Match old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ status: false, message: "Old password is incorrect." });
    }

    // Step 4: Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Step 5: Update user password
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ status: true, message: "Password updated successfully." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, message: "Something went wrong." });
  }
};


exports.deleteAccount = async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Authentication token is required." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    const userId = decoded.id;
    if (!userId) {
      return res.status(401).json({ message: "Invalid token payload." });
    }

    const existingUser = await User.findByPk(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Prepare update data
    let updateData = {
      status: 0,
    };

    // Update user
    await existingUser.update(updateData);

    const userDetails = await getUserDetails(userId);

    return res.status(200).json({
      status: true,
      message: "Your account has been deleted successfully.",
      user: userDetails,
    });

  } catch (err) {
    console.error("Account Delete Error:", err);
    return res.status(500).json({
      status: false,
      message: process.env.NODE_ENV !== "production" ? err.message : "Internal server error.",
    });
  }
};

