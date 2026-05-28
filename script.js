import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getAuth, signInWithCustomToken, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";

// ... tu firebaseConfig ...
const auth = getAuth(initializeApp(firebaseConfig));

// 1. ESTO ES LO QUE HACE QUE LA SESIÓN NO SE PIERDA
window.rehidratarSesion = async (token) => {
    try {
        await signInWithCustomToken(auth, token);
        window.location.href = "home.html";
    } catch (e) { console.error("Error al recuperar sesión", e); }
};

// 2. Al loguearte normal (Google/Email), guardamos el token
export function onLoginExitoso(user) {
    if (window.chrome && window.chrome.webview) {
        // Guardamos el token en Windows
        window.chrome.webview.postMessage("TOKEN:" + user.refreshToken);
    }
    window.location.href = "home.html";
}

// 3. Logout
window.cerrarSesion = () => {
    signOut(auth).then(() => {
        if (window.chrome && window.chrome.webview) window.chrome.webview.postMessage("LOGOUT");
        window.location.href = "logininapp";
    });
};
