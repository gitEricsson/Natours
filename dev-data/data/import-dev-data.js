const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewModel');
const Appointment = require('./../../models/appointmentModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log('DB connection successful!'));

//READ JSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

//IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

//DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
// This also works but note that forEach doesn't work with await hence why we used for of
// const importAppointments = async () => {
//   try {
//     for (const tour of tours) {
//       for (const date of tour.startDates) {
//         console.log(tour._id, date);
//         await Appointment.create({
//           tour: tour._id,
//           date: date
//         });
//       }
//     }

//     console.log('Appointments successfully loaded');
//   } catch (err) {
//     console.log(err);
//   }
//   process.exit();
// };

const importAppointments = async () => {
  try {
    const data = tours.flatMap(tour => {
      return tour.startDates.map(date => {
        return {
          tour: `${tour._id}`,
          date: `${date}`,
          participants: 0,
          soldOut: false
        };
      });
    });

    console.log(data);
    await Appointment.create(data);

    console.log('Appointments successfully loaded');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
}
if (process.argv[2] === '--delete') {
  deleteData();
}
if (process.argv[2] === '--importDates') {
  importAppointments();
}
