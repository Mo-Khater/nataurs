const catchasync = require('../utils/catchAsync');
const appError = require('../utils/appError');
const ApiFeatures = require('../utils/apifeatures');
exports.deleteOne = (Model) =>
  catchasync(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);

    if (!document) {
      return next(new appError('document not found', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchasync(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!document) {
      return next(new appError('document not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        document,
      },
    });
  });

exports.createOne = (Model) =>
  catchasync(async (req, res, next) => {
    const document = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        document,
      },
    });
  });

exports.getOne = (Model, populate) =>
  catchasync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populate) query.populate(populate);
    const doc = await query;
    if (!doc) {
      return next(new appError('document not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchasync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter.tour = req.params.tourId;
    const features = new ApiFeatures(Model.find(filter), req.query)
      .filtering()
      .sort()
      .pageing()
      .projection();
    const docs = await features.query;

    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: {
        docs,
      },
    });
  });
