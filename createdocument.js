import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";

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

// Componentes del DOM
const editorTexto = document.getElementById("editorTexto");
const tituloDocumento = document.getElementById("tituloDocumento");
const valPalabras = document.getElementById("valPalabras");
const valTiempo = document.getElementById("valTiempo");
const notificacionEstado = document.getElementById("notificacionEstado");

const selectorPrivacidad = document.getElementById("selectorPrivacidad");
const cajaAmigosEspecificos = document.getElementById("cajaAmigosEspecificos");
const inputAmigosEspecificos = document.getElementById("inputAmigosEspecificos");
const selectorFuente = document.getElementById("selectorFuente");

const userNombre = document.getElementById("userNombre");
const userCorreo = document.getElementById("userCorreo");
const userAvatar = document.getElementById("userAvatar");

let uidUsuarioActual = null;

// 1. CONTROL DE RUTA PROTEGIDA
onAuthStateChanged(auth, (usuario) => {
    if (usuario) {
        uidUsuarioActual = usuario.uid;
        userCorreo.innerText = usuario.email;
        userNombre.innerText = usuario.displayName ? usuario.displayName : "Usuario de SuperDocs";
        if (usuario.photoURL) {
            userAvatar.innerHTML = `<img src="${usuario.photoURL}" alt="Avatar">`;
        }
    } else {
        window.location.href = "login.html";
    }
});

// 2. DESPLEGAR INPUT PARA AMIGOS ESPECÍFICOS SI SE SELECCIONA LA OPCIÓN
window.evaluarOpcionPrivacidad = function() {
    if (selectorPrivacidad.value === "especifico") {
        cajaAmigosEspecificos.style.display = "flex";
        inputAmigosEspecificos.focus();
    } else {
        cajaAmigosEspecificos.style.display = "none";
    }
}

// 3. CAMBIAR DINÁMICAMENTE LA FUENTE DE LA HOJA DE ESCRITURA
window.cambiarTipografia = function(fuenteElegida) {
    editorTexto.style.fontFamily = fuenteElegida;
}

// 4. FORMATOS DE TEXTO ENRIQUECIDO
window.ejecutarComando = function(comando) {
    document.execCommand(comando, false, null);
    editorTexto.focus();
    actualizarMetricas();
}

window.insertarBloqueCodigo = function() {
    const seleccion = window.getSelection();
    if (!seleccion.rangeCount) return;

    const rango = seleccion.getRangeAt(0);
    const bloque = document.createElement("pre");
    bloque.className = "bloque-codigo";
    bloque.innerText = seleccion.toString() || "-- Código o apunte aquí...";
    
    rango.deleteContents();
    rango.insertNode(bloque);
    
    const salto = document.createElement("p");
    salto.innerHTML = "<br>";
    bloque.after(salto);
    
    rango.setStartAfter(salto);
    rango.setEndAfter(salto);
    seleccion.removeAllRanges();
    seleccion.addRange(rango);

    editorTexto.focus();
    actualizarMetricas();
}

// 5. CÁLCULO DE MÉTRICAS EN TIEMPO REAL
function actualizarMetricas() {
    const texto = editorTexto.innerText.trim();
    const numeroPalabras = texto === "" ? 0 : texto.split(/\s+/).length;
    valPalabras.innerText = numeroPalabras;
    
    const tiempoSegundos = Math.ceil((numeroPalabras / 200) * 60);
    valTiempo.innerText = numeroPalabras === 0 ? "0s" : (tiempoSegundos < 60 ? `${tiempoSegundos}s` : `${Math.floor(tiempoSegundos/60)}m`);
}

editorTexto.addEventListener("input", actualizarMetricas);

// 6. GUARDAR ARCHIVO EN EL HISTORIAL (LOCALSTORAGE SEGURO)
window.guardarArchivoFinal = function() {
    const nombreDoc = tituloDocumento.value.trim();
    const contenidoDoc = editorTexto.innerHTML.trim();

    if (!nombreDoc) {
        alert("⚠️ Por favor, escribe un nombre para tu documento antes de guardarlo.");
        tituloDocumento.focus();
        return;
    }

    if (contenidoDoc === "" || editorTexto.innerText.trim() === "") {
        alert("⚠️ No puedes guardar un documento completamente vacío.");
        editorTexto.focus();
        return;
    }

    // Estructurar metadatos del documento
    const nuevoDocumento = {
        id: "doc_" + Date.now(),
        titulo: nombreDoc,
        cuerpo: contenidoDoc,
        privacidad: selectorPrivacidad.value,
        amigosEspecificos: selectorPrivacidad.value === "especifico" ? inputAmigosEspecificos.value : "",
        fuente: selectorFuente.value,
        fecha: new Date().toLocaleString("es-ES")
    };

    // Obtener historial existente del usuario
    const claveHistorial = `superdocs_history_${uidUsuarioActual}`;
    let historialActual = JSON.parse(localStorage.getItem(claveHistorial)) || [];
    
    // Añadir al inicio del historial
    historialActual.unshift(nuevoDocumento);
    
    // Guardar base de datos simulada
    localStorage.setItem(claveHistorial, JSON.stringify(historialActual));

    // Notificación visual de éxito y redirección
    notificacionEstado.innerText = "💾 ¡Guardado con éxito!";
    notificacionEstado.style.color = "#10b981";

    alert(`🎉 ¡El documento "${nombreDoc}" se ha guardado correctamente en tu historial!`);
    window.location.href = "history.html";
}
