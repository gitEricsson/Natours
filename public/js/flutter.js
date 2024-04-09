/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async tourId => {
  try {
    console.log('yyyy');
    // 1) Get Checkout session from API
    const session = await axios({
      method: 'POST',
      url: `http://127.0.0.1:3000/api/v4/bookings/checkout-session/${tourId}`
    });
    console.log(session);

    window.location.href = session.data.response.data.link;
  } catch (err) {
    showAlert('error', err);
  }
};
