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

// Selectores del DOM
const editorTexto = document.getElementById("editorTexto");
const tituloDocumento = document.getElementById("tituloDocumento");
const valPalabras = document.getElementById("valPalabras");
const valTiempo = document.getElementById("valTiempo");
const btnEnfoque = document.getElementById("btnEnfoque");

// NUEVO: Selectores para el menú de usuario
const userNombre = document.getElementById("userNombre");
const userCorreo = document.getElementById("userCorreo");
const userAvatar = document.getElementById("userAvatar");

let uidUsuarioActual = null;

// 1. PROTEGER RUTA Y CARGAR DATOS DE USUARIO
onAuthStateChanged(auth, (usuario) => {
    if (usuario) {
        uidUsuarioActual = usuario.uid;
        
        // NUEVO: Inyectar datos reales del usuario en el menú lateral
        userCorreo.innerText = usuario.email;
        userNombre.innerText = usuario.displayName ? usuario.displayName : "Usuario de SuperDocs";
        
        // Si el usuario inició sesión con Google y tiene foto de perfil, ponerla
        if (usuario.photoURL) {
            userAvatar.innerHTML = `<img src="${usuario.photoURL}" alt="Avatar">`;
        } else {
            userAvatar.innerText = "👤"; // Respaldo por defecto
        }

        cargarDocumentoLocal();
    } else {
        window.location.href = "login.html";
    }
});

// 2. FUNCIÓN DE FORMATO ENRIQUECIDO
window.ejecutarComando = function(comando) {
    document.execCommand(comando, false, null);
    editorTexto.focus();
    guardarProgresoLocal();
}

// 3. INSERCIÓN DE BLOQUES DE CÓDIGO INTELIGENTE
window.insertarBloqueCodigo = function() {
    const seleccion = window.getSelection();
    if (!seleccion.rangeCount) return;

    const rango = seleccion.getRangeAt(0);
    const bloque = document.createElement("pre");
    bloque.className = "bloque-codigo";
    
    bloque.innerText = seleccion.toString() || "-- Escribe tu script de Luau o JS aquí...";
    
    rango.deleteContents();
    rango.insertNode(bloque);
    
    const saltoDeLinea = document.createElement("p");
    saltoDeLinea.innerHTML = "<br>";
    bloque.after(saltoDeLinea);
    
    rango.setStartAfter(saltoDeLinea);
    rango.setEndAfter(saltoDeLinea);
    seleccion.removeAllRanges();
    seleccion.addRange(rango);

    editorTexto.focus();
    guardarProgresoLocal();
}

// 4. CONTROL DEL MODO ENFOQUE CYBERPUNK
window.conmutarModoEnfoque = function() {
    document.body.classList.toggle("modo-enfoque-activo");
    const enEnfoque = document.body.classList.contains("modo-enfoque-activo");
    
    btnEnfoque.innerHTML = enEnfoque ? "<span class='icon'>👁️</span> Mostrar Interfaz" : "<span class='icon'>🤫</span> Modo Enfoque";
}

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("modo-enfoque-activo")) {
        conmutarModoEnfoque();
    }
});

// 5. CÁLCULO DE MÉTRICAS EN TIEMPO REAL
function actualizarMetricas() {
    const texto = editorTexto.innerText.trim();
    const numeroPalabras = texto === "" ? 0 : texto.split(/\s+/).length;
    valPalabras.innerText = numeroPalabras;
    
    const tiempoSegundos = Math.ceil((numeroPalabras / 200) * 60);
    
    if (numeroPalabras === 0) {
        valTiempo.innerText = "0s";
    } else if (tiempoSegundos < 60) {
        valTiempo.innerText = `${tiempoSegundos}s`;
    } else {
        const minutos = Math.floor(tiempoSegundos / 60);
        valTiempo.innerText = `${minutos}m`;
    }
}

// 6. PERSISTENCIA: Guardado Automático en LocalStorage (Por Cuenta de Usuario)
function guardarProgresoLocal() {
    if (!uidUsuarioActual) return;
    
    actualizarMetricas();
    localStorage.setItem(`superdocs_content_${uidUsuarioActual}`, editorTexto.innerHTML);
    localStorage.setItem(`superdocs_title_${uidUsuarioActual}`, tituloDocumento.value);
}

editorTexto.addEventListener("input", guardarProgresoLocal);
tituloDocumento.addEventListener("input", guardarProgresoLocal);

// 7. CARGAR DOCUMENTO AL ENTRAR
function cargarDocumentoLocal() {
    if (!uidUsuarioActual) return;

    const contenidoGuardado = localStorage.getItem(`superdocs_content_${uidUsuarioActual}`);
    const tituloGuardado = localStorage.getItem(`superdocs_title_${uidUsuarioActual}`);

    if (contenidoGuardado) editorTexto.innerHTML = contenidoGuardado;
    if (tituloGuardado) tituloDocumento.value = tituloGuardado;
    
    actualizarMetricas();
}

// 8. CIERRE DE SESIÓN SEGURO
window.cerrarSesion = function() {
    signOut(auth).then(() => {
        window.location.href = "login.html";
    }).catch((error) => {
        console.error("Error al cerrar sesión: ", error);
    });
}
