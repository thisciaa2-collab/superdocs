import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDJw_sL9YLe2WbUMf6j5MDTEdHhqvy1u7s",
  authDomain: "superdocs2026.firebaseapp.com",
  projectId: "superdocs2026",
  storageBucket: "superdocs2026.firebasestorage.app",
  messagingSenderId: "517642206953",
  appId: "1:517642206953:web:f732ae4dc855feb3aafa78",
  measurementId: "G-KN295LVLHK"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Lógica de Redirección y Puente
onAuthStateChanged(auth, (usuario) => {
    const ruta = window.location.pathname;

    if (usuario) {
        // Si está logueado y está en login, saltar al home
        if (ruta.includes("logininapp")) {
            window.location.href = "home.html";
        }
    } else {
        // Si no está logueado y está en home, volver al login
        if (ruta.includes("home.html")) {
            window.location.href = "logininapp";
        }
    }
});

// Función de salida
window.cerrarSesion = function() {
    signOut(auth).then(() => {
        if (window.chrome && window.chrome.webview) {
            window.chrome.webview.postMessage("CERRAR_SESION");
        }
        window.location.href = "logininapp";
    });
};
