/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async tourId => {
  try {
    // 1) Get Checkout session from API
    const session = await axios({
      method: 'POST',
      url: `/api/v4/bookings/checkout-session/${tourId}`
    });

    window.location.href = session.data.response.data.link;
  } catch (err) {
    showAlert('error', err);
  }
};
