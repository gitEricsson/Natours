/* eslint-disable */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { displayMap } from './leaflet';
import {
  signup,
  login,
  confirmLogin,
  logout,
  getMe,
  createBooking
} from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './flutter';
import SigninTokenFunctionality from './pinLogin';

// DOM ELEMENTS
const header = document.querySelector('.header');
const headingBox = document.querySelector('.heading-box');
const cardHeader = document.querySelector('.card__header');

const leaflet = document.getElementById('map');
const main = document.querySelector('.main');
const loginForm = document.querySelector('.form--login');
const signupForm = document.querySelector('.form--signup');
// const logOutBtn = document.querySelector('.nav__el--logout');
// const getMeBtn = document.querySelector('.nav__el--me');
// const userDataForm = document.querySelector('.form-user-data');
// const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');
const signupBtn = document.querySelector('.btn--signup');
const appointments = document.querySelectorAll('.booking');

// DELEGATION
if (leaflet) {
  const locations = JSON.parse(leaflet.dataset.locations);
  displayMap(locations);
}

if (signupForm) {
  signupForm.addEventListener('submit', async e => {
    e.preventDefault();
    signupBtn.textContent = 'Processing...';

    const name = document.getElementById('nameSignup').value;
    const email = document.getElementById('emailSignup').value;
    const password = document.getElementById('passwordSignup').value;
    const passwordConfirm = document.getElementById('passwordConfirmSignup')
      .value;

    const html = await signup(name, email, password, passwordConfirm);

    if (!html) {
      password.value = '';
      passwordConfirm.value = '';
      return;
    }

    // make container empty
    main.innerHTML = '';

    // convert the returned html file which would be in string format to html and appending it to the container
    main.appendChild(
      new DOMParser().parseFromString(html, 'text/html').querySelector('.main')
    );
  });
}

if (loginForm) {
  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const passwordInput = document.getElementById('password');
    const password = passwordInput.value;

    console.log(email, password);

    const html = await login(email, password);

    console.log(html);

    if (!html) return (passwordInput.value = '');

    // make container empty
    main.innerHTML = '';

    // convert the returned html file which would be in string format to html and appending it to the container
    main.appendChild(
      new DOMParser().parseFromString(html, 'text/html').querySelector('.main')
    );

    confirmLoginFunctionality(email);
  });
}

const confirmLoginFunctionality = email => {
  const confirmLoginForm = document.querySelector('.confirm--login');
  const activeSigninTokenFunctionality = new SigninTokenFunctionality();

  confirmLoginForm.addEventListener('submit', e => {
    e.preventDefault();

    const signinToken = activeSigninTokenFunctionality.getValue();

    confirmLogin(email, signinToken);
  });
};

// doing this instead of directly attaching the link to the href so as to access the axios interceptor feature for the refresh token
if (document.body) {
  document.body.addEventListener('click', async function(e) {
    if (e.target.classList.contains('nav__el--logout')) {
      logout();
    }

    if (
      e.target.closest('.nav__el--me') ||
      e.target.classList.contains('nav__el--me')
      // e.target.className.includes('nav__el--me') --- would return anSVGAnimated string if an svg icon is clicked on
    ) {
      // awaiting the page fetch before we can get access to the form on the page
      await getMe();
      const userDataForm = document.querySelector('.form-user-data');
      const userPasswordForm = document.querySelector('.form-user-password');
      console.log(userDataForm, userPasswordForm);
      userEdit(userDataForm, userPasswordForm);
    }

    if (e.target.classList.contains('arrow-left-circle')) {
      window.history.back();
    }

    // Function to display or hide mobile menu
    if (
      e.target.closest('.menu__btn') ||
      e.target.classList.contains('menu__btn')
    ) {
      menuFunction();
    }

    if (e.target.classList.contains('btn--close-modal')) {
      menuFunction();
    }

    if (e.target.classList.contains('overlay')) {
      menuFunction();
    }
  });
}

// if (logOutBtn) logOutBtn.addEventListener('click', logout);

// if (getMeBtn) getMeBtn.addEventListener('click', getMe);

const userEdit = (userDataForm, userPasswordForm) => {
  console.log('jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj');

  if (userDataForm) {
    console.log('yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy');

    userDataForm.addEventListener('submit', e => {
      console.log(userDataForm);
      e.preventDefault();
      const form = new FormData();
      form.append('name', document.getElementById('name').value);
      form.append('email', document.getElementById('email').value);
      form.append('photo', document.getElementById('photo').files[0]);

      console.log(form);

      // const name = document.getElementById('name').value;
      // const email = document.getElementById('email').value;
      updateSettings(form, 'data');
    });
  }

  if (userPasswordForm) {
    userPasswordForm.addEventListener('submit', async e => {
      e.preventDefault();
      document.querySelector('.btn--save-password').textContent = 'Updating...';

      const passwordCurrent = document.getElementById('password-current').value;
      const password = document.getElementById('password').value;
      const passwordConfirm = document.getElementById('password-confirm').value;
      await updateSettings(
        { passwordCurrent, password, passwordConfirm },
        'password'
      );

      document.querySelector('.btn--save-password').textContent =
        'Save password';
      document.getElementById('password-current').value = '';
      document.getElementById('password').value = '';
      document.getElementById('password-confirm').value = '';
    });
  }
};

if (bookBtn)
  bookBtn.addEventListener('click', e => {
    e.target.textContent = 'Processing...';
    // const { tourId } = e.target.dataset;
    // console.log(tourId);
    // bookTour(tourId);
  });

if (appointments)
  appointments.forEach(appointment => {
    appointment.addEventListener('click', e => {
      let appointmentId;
      let tourId;

      appointmentId = e.target.dataset.appointmentId;
      tourId = e.target.dataset.tourId;

      if (!appointmentId || !tourId) {
        appointmentId = e.target.closest('.booking').dataset.appointmentId;
        tourId = e.target.closest('.booking').dataset.tourId;
      }

      createBooking(appointmentId, tourId);
    });
  });

// Sticky Header Navigation
const navHeight = header.getBoundingClientRect().height;

const stickyNav = function(entries) {
  const [entry] = entries;

  if (!entry.isIntersecting) header.classList.add('sticky');
  else header.classList.remove('sticky');
};

const headerObserver = new IntersectionObserver(stickyNav, {
  root: null,
  threshold: 0,
  rootMargin: `-${navHeight}px`
});

if (headingBox) headerObserver.observe(headingBox);
if (cardHeader) headerObserver.observe(cardHeader);

//To toggle mobile menu
const menuFunction = () => {
  const menu = document.querySelector('.user-view__menu');
  const overlay = document.querySelector('.overlay');

  menu.classList.toggle('visible');
  overlay.classList.toggle('hidden');
};
