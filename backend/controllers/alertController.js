const Alert = require("../models/Alert");
const User = require("../models/User");
const { sendAlertEmail } = require("../utils/emailClient");

// @desc    Send alert
// @route   POST /api/alerts
// @access  Private
const sendAlert = async (req, res) => {
  try {
    const { message, targetRoles, emergencyLevel } = req.body;
    const { _id: senderId, tenantId } = req.user;

    if (!message || !targetRoles || targetRoles.length === 0) {
      return res.status(400).json({ message: "Message and targetRoles are required" });
    }

    const alert = await Alert.create({
      message,
      senderId,
      tenantId,
      targetRoles,
      emergencyLevel,
      sent: false,
      dismissed: false,
    });

    const recipients = await User.find({
      tenantId,
      role: { $in: targetRoles },
      isActive: true,
    }).select("email");

    if (recipients.length === 0) {
      return res.status(404).json({ message: "No active users found for selected roles" });
    }

    await sendAlertEmail(recipients, message, emergencyLevel);

    alert.sent = true;
    await alert.save();

    res.status(201).json({
      success: true,
      alert,
      message: "Alert sent successfully",
    });
  } catch (error) {
    console.error("❌ Error sending alert:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get alerts for tenant
// @route   GET /api/alerts
// @access  Private
const getAlerts = async (req, res) => {
  try {
    const { tenantId } = req.user;

    const alerts = await Alert.find({ tenantId, dismissed: { $ne: true } })
      .populate("senderId", "firstName lastName email role")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: alerts.length,
      alerts,
    });
  } catch (error) {
    console.error("❌ Error fetching alerts:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update alert status
// @route   PUT /api/alerts/:id/status
// @access  Private
const updateAlertStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { tenantId } = req.user;

    const alert = await Alert.findOneAndUpdate(
      { _id: id, tenantId },
      { status },
      { new: true, runValidators: true }
    ).populate("senderId", "firstName lastName email role");

    if (!alert) {
      return res.status(404).json({ message: "Alert not found or access denied" });
    }

    res.json({
      success: true,
      alert,
      message: "Alert status updated successfully",
    });
  } catch (error) {
    console.error("❌ Error updating alert status:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Dismiss alert
// @route   PUT /api/alerts/:id/dismiss
// @access  Private
const dismissAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;

    const alert = await Alert.findOneAndUpdate(
      { _id: id, tenantId },
      { dismissed: true },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ message: "Alert not found or access denied" });
    }

    res.json({
      success: true,
      alert,
      message: "Alert dismissed successfully",
    });
  } catch (error) {
    console.error("❌ Error dismissing alert:", error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendAlert, getAlerts, updateAlertStatus, dismissAlert };
