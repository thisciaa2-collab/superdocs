import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getAuth, signInWithCustomToken, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, onSnapshot, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

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
const db = getFirestore(app);

let usuarioLogueado = null;

// ==========================================
// PERSISTENCIA Y REHIDRATACIÓN NATIVA
// ==========================================
window.rehidratarSesion = async (token) => {
    try {
        await signInWithCustomToken(auth, token);
        window.switchView("home-view");
    } catch (e) {
        console.error("Error crítico de rehidratación automática:", e);
    }
};

onAuthStateChanged(auth, (user) => {
    if (user) {
        usuarioLogueado = user;
        if (window.chrome && window.chrome.webview) {
            window.chrome.webview.postMessage("TOKEN:" + user.refreshToken);
        }
        inicializarListenersEnTiempoReal();
    } else {
        if (!window.location.pathname.includes("logininapp")) {
            window.location.href = "logininapp";
        }
    }
});

window.cerrarSesion = () => {
    signOut(auth).then(() => {
        if (window.chrome && window.chrome.webview) {
            window.chrome.webview.postMessage("LOGOUT");
        }
        window.location.href = "logininapp";
    });
};

// ==========================================
// PASO 2: CREADOCUMENT - ACCIONES DEL EDITOR Y SINTAXIS
// ==========================================
const editor = document.getElementById("editor-wysiwyg");

// Capturador estricto de accesos directos por teclado (Atajos)
editor.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === "b") {
            e.preventDefault();
            window.ejecutarComando("bold");
        }
        if (e.key.toLowerCase() === "i") {
            e.preventDefault();
            window.ejecutarComando("italic");
        }
    }
});

window.ejecutarComando = (comando) => {
    document.execCommand(comando, false, null);
    editor.focus();
};

window.descargarTXT = () => {
    const titulo = document.getElementById("doc-title").value;
    const contenidoPlano = editor.innerText;
    const blob = new Blob([contenidoPlano], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${titulo}.txt`;
    link.click();
};

window.descargarPDF = () => {
    // Modo estructurado e integrado: aprovecha el motor de renderizado del cliente
    window.print();
};

window.compartirDocumento = async () => {
    const titulo = document.getElementById("doc-title").value;
    const contenidoHTML = editor.innerHTML;
    const destinoEmail = prompt("Ingresa el correo electrónico del amigo con quien deseas compartir este documento:");
    
    if (!destinoEmail) return;

    try {
        await addDoc(collection(db, "documents"), {
            title: titulo,
            content: contenidoHTML,
            ownerEmail: usuarioLogueado.email,
            sharedWith: destinoEmail,
            createdAt: serverTimestamp()
        });

        // Enviar alerta directa al Inbox del destinatario
        await addDoc(collection(db, "inbox"), {
            toEmail: destinoEmail,
            fromName: usuarioLogueado.displayName || "Usuario de SuperDoc",
            fromEmail: usuarioLogueado.email,
            type: "DOCUMENTO_COMPARTIDO",
            message: `Te ha compartido un nuevo documento titulado: "${titulo}".`,
            timestamp: serverTimestamp(),
            read: false
        });

        alert("Documento guardado en la nube y compartido con éxito.");
    } catch (err) {
        console.error("Error al compartir documento:", err);
    }
};

// ==========================================
// PASO 3: ADDFRIEND - LOGICA INTERNA DE ACCION
// ==========================================
window.procesarAñadirAmigo = async () => {
    const nombre = document.getElementById("friend-name").value.trim();
    const email = document.getElementById("friend-email").value.trim();

    if (!nombre || !email) {
        alert("Por favor completa todos los campos.");
        return;
    }

    try {
        // Guardamos la relación en la base de datos
        await addDoc(collection(db, "friends"), {
            userEmail: usuarioLogueado.email,
            friendName: nombre,
            friendEmail: email,
            timestamp: serverTimestamp()
        });

        // Enviamos la notificación inmediata al Inbox del amigo enlazado
        await addDoc(collection(db, "inbox"), {
            toEmail: email,
            fromName: nombre,
            fromEmail: usuarioLogueado.email,
            type: "SOLICITUD_AMISTAD",
            message: `${usuarioLogueado.email} te ha añadido a su lista de colaboradores profesionales.`,
            timestamp: serverTimestamp(),
            read: false
        });

        alert(`¡Enlace enviado con éxito a ${nombre}!`);
        document.getElementById("friend-name").value = "";
        document.getElementById("friend-email").value = "";
    } catch (error) {
        console.error("Error en módulo AddFriend:", error);
    }
};

// ==========================================
// PASO 4: INBOX - ESCUCHA ACTIVA EN TIEMPO REAL
// ==========================================
function inicializarListenersEnTiempoReal() {
    if (!usuarioLogueado) return;

    // Escucha de Notificaciones (Inbox)
    const qInbox = query(collection(db, "inbox"), where("toEmail", "==", usuarioLogueado.email));
    onSnapshot(qInbox, (snapshot) => {
        const inboxContainer = document.getElementById("inbox-render-target");
        inboxContainer.innerHTML = "";
        
        let alertasNoLeidas = 0;
        
        snapshot.forEach((doc) => {
            const data = doc.data();
            if (!data.read) alertasNoLeidas++;

            const item = document.createElement("div");
            item.className = "inbox-item";
            item.innerHTML = `
                <div class="inbox-meta">
                    <span class="inbox-sender">${data.fromName} (${data.fromEmail})</span>
                    <span class="inbox-msg">${data.message}</span>
                </div>
                <span class="inbox-badge">${data.type.replace("_", " ")}</span>
            `;
            inboxContainer.appendChild(item);
        });

        document.getElementById("stat-inbox").innerText = alertasNoLeidas;
    });

    // Escucha de métricas complementarias (Para actualización de contadores de Home)
    const qDocs = query(collection(db, "documents"), where("ownerEmail", "==", usuarioLogueado.email));
    onSnapshot(qDocs, (snap) => {
        document.getElementById("stat-docs").innerText = snap.size;
    });

    const qFriends = query(collection(db, "friends"), where("userEmail", "==", usuarioLogueado.email));
    onSnapshot(qFriends, (snap) => {
        document.getElementById("stat-friends").innerText = snap.size;
    });
}
