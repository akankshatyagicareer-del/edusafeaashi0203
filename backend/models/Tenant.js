const mongoose = require("mongoose");

const tenantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tenant name is required"],
      unique: true,
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    contactEmail: {
      type: String,
      required: [true, "Contact email is required"],
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Please enter a valid email address"],
    },
    contactPhone: {
      type: String,
      required: [true, "Contact phone is required"],
      trim: true,
      match: [/^\d{10}$/, "Contact phone must be a valid 10-digit number"],
    },
    emergencyContacts: [
      {
        name: {
          type: String,
          required: [true, "Emergency contact name is required"],
          trim: true,
        },
        phone: {
          type: String,
          required: [true, "Emergency contact phone is required"],
          match: [/^\d{10}$/, "Emergency contact phone must be 10 digits"],
        },
        role: {
          type: String,
          required: [true, "Emergency contact role is required"],
          trim: true,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tenant", tenantSchema);
