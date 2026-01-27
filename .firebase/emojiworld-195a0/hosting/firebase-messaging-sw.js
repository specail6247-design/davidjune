
importScripts('https://www.gstatic.com/firebasejs/10.12.3/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.3/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyCCoioGXreyhEdu9YAlsB7PBU_xoaXQKA8",
    authDomain: "emojiworld-195a0.firebaseapp.com",
    projectId: "emojiworld-195a0",
    storageBucket: "emojiworld-195a0.firebasestorage.app",
    messagingSenderId: "820644065220",
    appId: "1:820644065220:web:59d0f08bf6a9474714be91",
    measurementId: "G-8FWHKV0SDY",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();
