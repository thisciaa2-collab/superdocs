import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getAuth, signInWithCustomToken, signOut } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";

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

// 1. RECUPERACIÓN: Windows nos manda el token y Firebase lo re-autentica
window.rehidratarSesion = async (token) => {
    try {
        await signInWithCustomToken(auth, token);
        window.location.href = "home.html";
    } catch (e) { console.error("Error al rehidratar", e); }
};

// 2. GUARDADO: Al loguear con Google (ejemplo en tu lógica de login)
window.guardarLogin = (user) => {
    if (window.chrome && window.chrome.webview) {
        // Enviar token a C# para guardarlo en sesion.dat
        window.chrome.webview.postMessage("TOKEN:" + user.accessToken);
    }
    window.location.href = "home.html";
};

// 3. LOGOUT: Borrar de Windows y Firebase
window.cerrarSesion = () => {
    signOut(auth).then(() => {
        if (window.chrome && window.chrome.webview) window.chrome.webview.postMessage("LOGOUT");
        window.location.href = "logininapp";
    });
};
