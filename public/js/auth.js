/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const signup = async (name, email, password, passwordConfirm) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v4/users/signup',
      data: {
        name,
        email,
        password,
        passwordConfirm
      }
    });

    if (res.status === 200) {
      // localStorage.setItem('accessToken', res.data.token);

      const res = await axios({
        method: 'GET',
        url: 'http://127.0.0.1:3000/confirmSignup'
      });

      if (res.status === 200) {
        return res.data;
      }
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const login = async (email, password) => {
  try {
    // submit login details
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v4/users/login',
      data: {
        email,
        password
      }
    });

    if (res.status === 200) {
      // localStorage.setItem('accessToken', res.data.token);

      // get confirmLogin form and send html response to index.js to activate pin functionality
      const res = await axios({
        method: 'GET',
        url: 'http://127.0.0.1:3000/confirmLogin'
      });

      if (res.status === 200) {
        return res.data;
      }
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

// const accessToken = localStorage.getItem('accessToken');
// axios.defaults.headers.common = {
//   Authorization: `Bearer ${accessToken}`
// };
// localStorage.removeItem('accessToken');

export const confirmLogin = async (email, signinToken) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v4/users/confirmLogin',
      data: {
        email,
        signinToken
      }
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:3000/api/v4/users/logout'
    });

    if ((res.data.status = 'success')) location.reload(true);
  } catch (err) {
    showAlert('error', 'Error logging out! Try again.');
  }
};

axios.interceptors.response.use(
  response => response,
  async error => {
    // Check for specific error codes indicating expired access token (e.g., 401)
    if (error.response && error.response.status === 401) {
      try {
        const res = await axios({
          method: 'GET',
          url: 'http://127.0.0.1:3000/api/v4/users/refreshToken'
        });

        if (res.status === 200) {
          error.config.headers.Authorization = `Bearer ${res.data.token}`;
          return axios.request(error.config); // Retry the request with new token
        }
      } catch (err) {
        return Promise.reject(error);
      }
    }

    // Handle other errors
    return Promise.reject(error);
  }
);

export const getMe = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:3000/me'
    });

    if (res.status === 200) document.body.innerHTML = res.data;
  } catch (err) {
    // Handle err;
    document.body.innerHTML = err.response.data;
  }
};
