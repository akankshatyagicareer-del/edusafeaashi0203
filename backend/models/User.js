const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\d{10}$/, "Phone number must be 10 digits"]
    },
    role: {
      type: String,
      enum: ["director", "teacher", "student", "parent"],
      required: [true, "Role is required"],
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: [true, "Tenant is required"],
    },

    // For students
    grade: {
      type: String,
      required: function () {
        return this.role === "student";
      },
      trim: true,
    },

    // For parents - link to student (REQUIRED for parents)
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.role === "parent";
      },
      validate: {
        validator: async function(studentId) {
          if (this.role !== 'parent') return true;
          
          // Check if the referenced student exists and has role 'student'
          const student = await mongoose.model('User').findOne({
            _id: studentId,
            role: 'student',
            tenantId: this.tenantId
          });
          return !!student;
        },
        message: 'Student ID must reference an existing student in the same school'
      }
    },

    // Additional field for school/organization
    school: {
      type: String,
      default: ""
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // For tracking parent-student relationships
    parentOf: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }]
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for student info (for parents)
userSchema.virtual('student', {
  ref: 'User',
  localField: 'studentId',
  foreignField: '_id',
  justOne: true
});

// Virtual for parents (for students)
userSchema.virtual('parents', {
  ref: 'User',
  localField: '_id',
  foreignField: 'studentId'
});

// Index for better query performance
userSchema.index({ tenantId: 1, role: 1 });
userSchema.index({ email: 1 });
userSchema.index({ studentId: 1 });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  
  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to check if user is a parent of specific student
userSchema.methods.isParentOf = function(studentId) {
  return this.studentId && this.studentId.toString() === studentId.toString();
};

// Static method to find parents of a student
userSchema.statics.findParentsOfStudent = function(studentId) {
  return this.find({ 
    studentId: studentId,
    role: 'parent',
    isActive: true 
  });
};

// Static method to find students in a tenant
userSchema.statics.findStudentsByTenant = function(tenantId) {
  return this.find({ 
    tenantId: tenantId,
    role: 'student',
    isActive: true 
  }).select('firstName lastName email grade _id');
};

module.exports = mongoose.model("User", userSchema);