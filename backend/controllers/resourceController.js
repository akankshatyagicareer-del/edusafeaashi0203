const Resource = require('../models/Resource');
const ResourceCompletion = require('../models/ResourceCompletion');

// Helper: build absolute URL for uploaded file
const buildFileUrl = (req, filename) => {
  return `${req.protocol}://${req.get('host')}/uploads/resources/${filename}`;
};

// @desc Get all resources
const getResources = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const resources = await Resource.find({ tenantId })
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(resources);
  } catch (error) {
    console.error('❌ getResources error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc Create new resource
const createResource = async (req, res) => {
  try {
    const { title, description, type, content, tags, isPublic } = req.body;
    const { _id: createdBy, tenantId } = req.user;

    let fileUrl = content; // external URL if provided
    if (req.file) {
      fileUrl = buildFileUrl(req, req.file.filename); // absolute URL
    }

    const resource = await Resource.create({
      title,
      description,
      type,
      content: fileUrl,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      isPublic,
      tenantId,
      createdBy,
    });

    const populatedResource = await Resource.findById(resource._id)
      .populate('createdBy', 'firstName lastName');

    res.status(201).json(populatedResource);
  } catch (error) {
    console.error('❌ createResource error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc Update resource
const updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;

    const resource = await Resource.findOne({ _id: id, tenantId });
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found or access denied' });
    }

    const updateData = { ...req.body };
    if (req.file) {
      updateData.content = buildFileUrl(req, req.file.filename);
    }

    const updatedResource = await Resource.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName');

    res.json(updatedResource);
  } catch (error) {
    console.error('❌ updateResource error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc Mark complete
const completeResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { timeSpent } = req.body;
    const { _id: studentId, tenantId } = req.user;

    const resource = await Resource.findOne({ _id: id, tenantId });
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found or access denied' });
    }

    const existingCompletion = await ResourceCompletion.findOne({ resourceId: id, studentId });
    if (existingCompletion) {
      return res.status(400).json({ message: 'Resource already completed' });
    }

    const completion = await ResourceCompletion.create({
      resourceId: id,
      studentId,
      timeSpent,
    });

    const populatedCompletion = await ResourceCompletion.findById(completion._id)
      .populate('resourceId');

    res.status(201).json(populatedCompletion);
  } catch (error) {
    console.error('❌ completeResource error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all completions for current student
const getResourceCompletion = async (req, res) => {
  try {
    const { _id: studentId } = req.user;
    const completions = await ResourceCompletion.find({ studentId })
      .populate('resourceId');

    res.json(completions);
  } catch (error) {
    console.error('❌ getResourceCompletion error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete resource
const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;

    const resource = await Resource.findOne({ _id: id, tenantId });
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found or access denied' });
    }

    await Resource.findByIdAndDelete(id);
    await ResourceCompletion.deleteMany({ resourceId: id });

    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('❌ deleteResource error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getResources,
  createResource,
  updateResource,
  completeResource,
  getResourceCompletion,
  deleteResource,
};
