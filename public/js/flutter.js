/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';

export const createBooking = async (appointmentId, tourId) => {
  try {
    // 1) Get Checkout session from API

    const res = await axios({
      method: 'POST',
      url: `http://127.0.0.1:3000/api/v4/bookings/checkout-session/${tourId}`,
      data: {
        appointment: appointmentId
      }
    });

    if (res.status === 200) {
      window.location = res.data.response.data.link;
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
