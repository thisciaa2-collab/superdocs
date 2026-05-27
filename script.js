// IMPORTAMOS LOS MÓDULOS DE AUTENTICACIÓN DIRECTAMENTE DESDE LA CDN DE FIREBASE
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";

// Credenciales de Firebase de tu proyecto SuperDocs
const firebaseConfig = {
    apiKey: "AIzaSyDJw_sL9YLe2WbUMf6j5MDTEdHhqvy1u7s",
    authDomain: "superdocs2026.firebaseapp.com",
    projectId: "superdocs2026",
    storageBucket: "superdocs2026.firebasestorage.app",
    messagingSenderId: "517642206953",
    appId: "1:517642206953:web:f732ae4dc855feb3aafa78",
    measurementId: "G-KN295LVLHK"
};

// Inicialización
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Selectores del DOM
const editorTexto = document.getElementById("editorTexto");
const tituloDocumento = document.getElementById("tituloDocumento");
const valPalabras = document.getElementById("valPalabras");
const valTiempo = document.getElementById("valTiempo");
const btnEnfoque = document.getElementById("btnEnfoque");

let uidUsuarioActual = null;

// 1. PROTEGER RUTA: Verificar si el usuario está logueado
onAuthStateChanged(auth, (usuario) => {
    if (usuario) {
        // Usuario autenticado correctamente
        uidUsuarioActual = usuario.uid;
        cargarDocumentoLocal();
    } else {
        // Si no hay usuario activo, patearlo de inmediato a la pantalla de login
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
    
    // Captura el texto seleccionado o añade plantilla por defecto
    bloque.innerText = seleccion.toString() || "-- Escribe tu script de Luau o JS aquí...";
    
    rango.deleteContents();
    rango.insertNode(bloque);
    
    // Inyectar un párrafo vacío abajo para poder seguir escribiendo normal
    const saltoDeLinea = document.createElement("p");
    saltoDeLinea.innerHTML = "<br>";
    bloque.after(saltoDeLinea);
    
    // Reubicar cursor en el salto limpio
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
    
    btnEnfoque.innerHTML = enEnfoque ? "👁️ Mostrar Interfaz" : "🤫 Modo Enfoque";
}

// Atajo rápido: Salir del modo enfoque presionando la tecla Escape
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("modo-enfoque-activo")) {
        conmutarModoEnfoque();
    }
});

// 5. CÁLCULO DE MÉTRICAS EN TIEMPO REAL
function actualizarMetricas() {
    const texto = editorTexto.innerText.trim();
    
    // Filtro limpio para contar palabras omitiendo espacios dobles
    const numeroPalabras = texto === "" ? 0 : texto.split(/\s+/).length;
    valPalabras.innerText = numeroPalabras;
    
    // Tiempo estimado de lectura (Velocidad estándar de 200 palabras por minuto)
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
    
    // Guardamos usando el UID del usuario como llave única para que si prestas la PC no se mezclen documentos
    localStorage.setItem(`superdocs_content_${uidUsuarioActual}`, editorTexto.innerHTML);
    localStorage.setItem(`superdocs_title_${uidUsuarioActual}`, tituloDocumento.value);
}

// Escuchar pulsaciones de teclas para guardar al vuelo
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
        // Redirige al login de manera automática tras cerrar sesión con Firebase
        window.location.href = "login.html";
    }).catch((error) => {
        console.error("Error al cerrar sesión: ", error);
    });
}
