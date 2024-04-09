const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong to a Tour!']
  },
  date: { type: Date, required: [true, 'Please provide the Start Date.'] },
  participants: { type: Number, default: 0 },
  soldOut: { type: Boolean, default: false }
});

// Virtual populate
appointmentSchema.virtual('bookings', {
  ref: 'Booking',
  foreignField: 'appointment',
  localField: '_id'
});

appointmentSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'tour',
    select: 'name'
  });
  next();
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
