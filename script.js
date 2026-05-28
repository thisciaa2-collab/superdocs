import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";

const firebaseConfig = { /* TU CONFIGURACIÓN AQUÍ */ };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Lógica de puente nativo
window.guardarSesiónEnWindows = function(token) {
    if (window.chrome && window.chrome.webview) {
        window.chrome.webview.postMessage("GUARDAR:" + token);
    }
    localStorage.setItem("sesion", token);
};

window.cerrarSesion = function() {
    signOut(auth).then(() => {
        if (window.chrome && window.chrome.webview) {
            window.chrome.webview.postMessage("CERRAR_SESION");
        }
        localStorage.removeItem("sesion");
        window.location.href = "login.html";
    });
};

// Protección de ruta
onAuthStateChanged(auth, (usuario) => {
    if (usuario) {
        // Cargar datos usuario...
    } else if (window.location.pathname !== "/login.html") {
        window.location.href = "login.html";
    }
});
