import {
    makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    delay,
    Browsers
} from '@whiskeysockets/baileys';
import express from 'express';
import fs from 'fs';
import NodeCache from 'node-cache';
import QRCode from 'qrcode';

// Configuration
const config = {
    botName: "META MD BOT",
    owner: "PRECIEUX OKITAKOY",
    ownerNumber: "243894697490",
    prefix: ".",
    footer: "by PRECIEUX OKITAKOY",
    // QR code plus long
    qrTimeout: 15 * 60 * 1000, // 15 minutes (900000 ms)
    qrRefreshInterval: 10 * 60 * 1000 // 10 minutes
};

// Nettoyage et initialisation
console.log('🚀 Démarrage META MD BOT...');
['./session', './temp', './public'].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Variables globales
const msgRetryCounterCache = new NodeCache();
let botStatus = '🔄 Initialisation';
let sock = null;
let currentQR = null;
let qrGeneratedAt = 0;
let qrImageUrl = null;
let isConnected = false;
let qrRefreshTimer = null;

// Application Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Fonction pour générer/sauvegarder QR
async function generateAndSaveQR(qrData) {
    try {
        console.log('🔄 Génération QR code pour le site web...');
        
        // Générer QR code en Data URL
        const qrDataUrl = await QRCode.toDataURL(qrData, {
            width: 400,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });
        
        // Sauvegarder dans variable globale
        qrImageUrl = qrDataUrl;
        currentQR = qrData;
        qrGeneratedAt = Date.now();
        
        console.log('✅ QR code généré pour le site web');
        console.log(`⏰ Valide jusqu'à: ${new Date(qrGeneratedAt + config.qrTimeout).toLocaleTimeString()}`);
        
        return qrDataUrl;
    } catch (error) {
        console.error('❌ Erreur génération QR:', error);
        return null;
    }
}

// Fonction pour vérifier si le QR a expiré
function isQRValid() {
    if (!qrGeneratedAt || !currentQR) return false;
    const age = Date.now() - qrGeneratedAt;
    return age < config.qrTimeout; // 15 minutes
}

// Route principale avec QR code
app.get('/', async (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>META MD BOT - QR Code</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 20px;
            }
            
            .container {
                background: white;
                border-radius: 20px;
                padding: 40px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                text-align: center;
                max-width: 800px;
                width: 100%;
            }
            
            .header {
                margin-bottom: 30px;
            }
            
            h1 {
                color: #333;
                font-size: 2.5em;
                margin-bottom: 10px;
            }
            
            .subtitle {
                color: #666;
                font-size: 1.2em;
                margin-bottom: 5px;
            }
            
            .status-container {
                margin: 25px 0;
            }
            
            .status {
                padding: 15px 25px;
                border-radius: 12px;
                font-weight: bold;
                font-size: 1.2em;
                display: inline-block;
                min-width: 250px;
            }
            
            .connected { 
                background: #d4edda; 
                color: #155724;
                border: 3px solid #c3e6cb;
            }
            .disconnected { 
                background: #f8d7da; 
                color: #721c24;
                border: 3px solid #f5c6cb;
            }
            .scanning { 
                background: #fff3cd; 
                color: #856404;
                border: 3px solid #ffeaa7;
            }
            .initializing {
                background: #e3f2fd;
                color: #1565c0;
                border: 3px solid #bbdefb;
            }
            
            .qr-section {
                margin: 40px 0;
                padding: 30px;
                background: #f8f9fa;
                border-radius: 15px;
                border: 3px solid #dee2e6;
            }
            
            .qr-container {
                margin: 0 auto;
                padding: 20px;
                background: white;
                border-radius: 10px;
                display: inline-block;
                border: 2px dashed #adb5bd;
            }
            
            #qrcode-image {
                width: 350px;
                height: 350px;
                border-radius: 10px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            
            .no-qr {
                padding: 50px;
                font-size: 1.1em;
                color: #6c757d;
            }
            
            .qr-info {
                margin-top: 20px;
                color: #495057;
            }
            
            .qr-timer {
                font-size: 1.1em;
                font-weight: bold;
                margin-top: 10px;
                padding: 10px;
                background: #e7f5ff;
                border-radius: 8px;
                display: inline-block;
            }
            
            .actions {
                margin: 30px 0;
            }
            
            .btn {
                background: #007bff;
                color: white;
                border: none;
                padding: 14px 28px;
                border-radius: 30px;
                cursor: pointer;
                font-size: 16px;
                font-weight: bold;
                margin: 10px;
                transition: all 0.3s;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                min-width: 180px;
            }
            
            .btn:hover {
                background: #0056b3;
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(0,123,255,0.3);
            }
            
            .btn-success {
                background: #28a745;
            }
            
            .btn-success:hover {
                background: #218838;
                box-shadow: 0 8px 20px rgba(40,167,69,0.3);
            }
            
            .btn-warning {
                background: #ffc107;
                color: #212529;
            }
            
            .btn-warning:hover {
                background: #e0a800;
                box-shadow: 0 8px 20px rgba(255,193,7,0.3);
            }
            
            .instructions {
                text-align: left;
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                padding: 30px;
                border-radius: 15px;
                margin-top: 40px;
                border-left: 5px solid #007bff;
            }
            
            .instructions h3 {
                color: #333;
                margin-bottom: 20px;
                font-size: 1.4em;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .steps {
                list-style: none;
                padding: 0;
            }
            
            .steps li {
                margin: 15px 0;
                padding: 18px 20px 18px 60px;
                background: white;
                border-radius: 10px;
                position: relative;
                border: 1px solid #dee2e6;
                transition: all 0.3s;
                font-size: 1.05em;
            }
            
            .steps li:hover {
                transform: translateX(10px);
                border-color: #007bff;
                box-shadow: 0 5px 15px rgba(0,0,0,0.05);
            }
            
            .steps li:before {
                content: counter(step);
                counter-increment: step;
                position: absolute;
                left: 20px;
                top: 50%;
                transform: translateY(-50%);
                background: #007bff;
                color: white;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 1.1em;
            }
            
            .steps {
                counter-reset: step;
            }
            
            .info-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin: 40px 0;
            }
            
            .info-card {
                background: white;
                padding: 25px;
                border-radius: 12px;
                text-align: center;
                border-top: 4px solid #007bff;
                box-shadow: 0 5px 15px rgba(0,0,0,0.05);
                transition: transform 0.3s;
            }
            
            .info-card:hover {
                transform: translateY(-5px);
            }
            
            .info-card h4 {
                color: #333;
                margin-bottom: 10px;
                font-size: 1.1em;
            }
            
            .info-card p {
                color: #666;
                font-size: 0.95em;
            }
            
            .warning-box {
                background: #fff3cd;
                border: 2px solid #ffeaa7;
                color: #856404;
                padding: 20px;
                border-radius: 10px;
                margin: 25px 0;
                text-align: center;
                font-weight: bold;
                font-size: 1.05em;
            }
            
            .success-box {
                background: #d4edda;
                border: 2px solid #c3e6cb;
                color: #155724;
                padding: 20px;
                border-radius: 10px;
                margin: 25px 0;
                text-align: center;
                font-weight: bold;
                font-size: 1.05em;
            }
            
            .footer {
                margin-top: 50px;
                padding-top: 25px;
                border-top: 1px solid #dee2e6;
                color: #6c757d;
                font-size: 0.95em;
            }
            
            .footer p {
                margin: 8px 0;
            }
            
            .qr-expiry {
                margin-top: 15px;
                font-size: 0.9em;
                color: #6c757d;
            }
            
            @media (max-width: 768px) {
                .container {
                    padding: 20px;
                }
                
                h1 {
                    font-size: 2em;
                }
                
                .qr-section {
                    padding: 20px;
                }
                
                #qrcode-image {
                    width: 280px;
                    height: 280px;
                }
                
                .btn {
                    width: 100%;
                    margin: 10px 0;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🤖 META MD BOT</h1>
                <p class="subtitle">Connectez votre WhatsApp en scannant le QR Code</p>
                <p style="color: #666; font-size: 0.95em;">QR Code valide 15 minutes - Connexion permanente</p>
            </div>
            
            <div class="status-container">
                <div class="status ${botStatus.includes('Connecté') ? 'connected' : 
                                  botStatus.includes('Scan') ? 'scanning' : 
                                  botStatus.includes('Initialisation') ? 'initializing' : 'disconnected'}">
                    ${botStatus}
                </div>
            </div>
            
            ${botStatus.includes('Connecté') ? 
                '<div class="success-box">✅ BOT CONNECTÉ! Le QR Code n\'est plus nécessaire.</div>' 
                : ''
            }
            
            ${botStatus.includes('Scan') && qrImageUrl ? 
                '<div class="warning-box">⚠️ Scannez le QR Code ci-dessous avec WhatsApp (valide 15 minutes)</div>' 
                : ''
            }
            
            <div class="qr-section">
                ${qrImageUrl ? 
                    `<div class="qr-container">
                        <img id="qrcode-image" src="${qrImageUrl}" alt="QR Code WhatsApp">
                     </div>
                     <div class="qr-info">
                        <div class="qr-timer" id="qr-timer">⏳ QR Code valide: 15:00</div>
                        <p>Scannez avec WhatsApp → Appareils connectés</p>
                        <p class="qr-expiry">Le QR Code se régénère automatiquement après expiration</p>
                     </div>` 
                    : 
                    '<div class="no-qr">⏳ Génération du QR Code en cours...<br><small>Actualisez dans quelques secondes</small></div>'
                }
            </div>
            
            <div class="info-grid">
                <div class="info-card">
                    <h4>👨‍💻 Développeur</h4>
                    <p>${config.owner}</p>
                </div>
                <div class="info-card">
                    <h4>🤖 Nom du Bot</h4>
                    <p>${config.botName}</p>
                </div>
                <div class="info-card">
                    <h4>⏱️ Statut</h4>
                    <p id="connection-status">${isConnected ? 'Connecté' : 'Déconnecté'}</p>
                </div>
                <div class="info-card">
                    <h4>🔗 QR Durée</h4>
                    <p>15 minutes</p>
                </div>
            </div>
            
            <div class="actions">
                <button class="btn" onclick="location.reload()">
                    🔄 Actualiser la page
                </button>
                
                ${qrImageUrl ? 
                    `<button class="btn btn-success" onclick="downloadQR()">
                        📥 Télécharger QR
                    </button>` 
                    : ''
                }
                
                <button class="btn btn-warning" onclick="forceNewQR()">
                    🔄 Nouveau QR Code
                </button>
            </div>
            
            <div class="instructions">
                <h3><span>📱</span> Instructions de connexion:</h3>
                <ol class="steps">
                    <li>Ouvrez WhatsApp sur votre téléphone</li>
                    <li>Appuyez sur <strong>⋮ (trois points)</strong> en haut à droite</li>
                    <li>Sélectionnez <strong>"Appareils connectés"</strong></li>
                    <li>Appuyez sur <strong>"Connecter un appareil"</strong></li>
                    <li>Scannez le QR code ci-dessus avec votre caméra</li>
                    <li>Validez la connexion sur votre téléphone</li>
                    <li>Le bot restera connecté même après fermeture</li>
                </ol>
                
                <div style="margin-top: 25px; padding: 20px; background: #e7f5ff; border-radius: 10px;">
                    <h4 style="color: #0056b3; margin-bottom: 10px;">💡 Fonctionnalités importantes:</h4>
                    <p>• QR Code valide <strong>15 minutes</strong> (pas 20 secondes!)</p>
                    <p>• Reconnexion automatique si déconnecté</p>
                    <p>• Pas besoin de re-scanner après connexion</p>
                    <p>• Interface web optimisée pour mobile et desktop</p>
                </div>
            </div>
            
            <div class="footer">
                <p>🔧 <strong>META MD BOT</strong> - Édition Premium avec QR Code longue durée</p>
                <p>📞 Support WhatsApp: ${config.ownerNumber}</p>
                <p>👨‍💻 Développeur: ${config.owner}</p>
                <p>🚀 Hébergé sur Render.com | Node.js ${process.version}</p>
                <p>© ${new Date().getFullYear()} - Tous droits réservés</p>
            </div>
        </div>
        
        <script>
            // Timer pour le QR code
            function updateQRTimer() {
                if (!'${qrImageUrl}') return;
                
                const expiryTime = 15 * 60; // 15 minutes en secondes
                const generatedAt = ${qrGeneratedAt};
                const now = Date.now();
                const elapsed = Math.floor((now - generatedAt) / 1000);
                const remaining = expiryTime - elapsed;
                
                if (remaining > 0) {
                    const minutes = Math.floor(remaining / 60);
                    const seconds = remaining % 60;
                    document.getElementById('qr-timer').textContent = 
                        `⏳ QR Code valide: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                } else {
                    document.getElementById('qr-timer').textContent = '⏳ QR Code expiré - Actualisez la page';
                    document.getElementById('qr-timer').style.background = '#ffebee';
                    document.getElementById('qr-timer').style.color = '#c62828';
                }
            }
            
            // Télécharger QR code
            function downloadQR() {
                const qrImage = document.getElementById('qrcode-image');
                if (qrImage) {
                    const link = document.createElement('a');
                    link.href = qrImage.src;
                    link.download = 'whatsapp-qr-code.png';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            }
            
            // Forcer nouveau QR code
            function forceNewQR() {
                if (confirm('Générer un nouveau QR Code? L\'ancien ne sera plus valide.')) {
                    fetch('/api/new-qr', { method: 'POST' })
                        .then(res => res.json())
                        .then(data => {
                            if (data.success) {
                                alert('Nouveau QR Code généré!');
                                location.reload();
                            } else {
                                alert('Erreur: ' + data.message);
                            }
                        });
                }
            }
            
            // Vérifier l'état de connexion
            function checkConnectionStatus() {
                fetch('/api/status')
                    .then(res => res.json())
                    .then(data => {
                        const statusEl = document.getElementById('connection-status');
                        if (statusEl) {
                            statusEl.textContent = data.connected ? '✅ Connecté' : '❌ Déconnecté';
                            statusEl.style.color = data.connected ? '#155724' : '#721c24';
                        }
                        
                        // Si statut changé, recharger
                        if (data.status !== '${botStatus}' || data.connected !== ${isConnected}) {
                            console.log('Statut changé, rechargement...');
                            setTimeout(() => location.reload(), 1000);
                        }
                    })
                    .catch(() => {
                        console.log('Erreur vérification statut');
                    });
            }
            
            // Démarrer les mises à jour
            if ('${qrImageUrl}') {
                updateQRTimer();
                setInterval(updateQRTimer, 1000);
            }
            
            // Vérifier statut toutes les 5 secondes
            setInterval(checkConnectionStatus, 5000);
            checkConnectionStatus();
            
            // Auto-refresh si pas de QR mais en attente
            if (!'${qrImageUrl}' && '${botStatus}'.includes('Scan')) {
                setTimeout(() => location.reload(), 3000);
            }
            
            // Notification si QR expiré
            setTimeout(() => {
                if (!'${botStatus}'.includes('Connecté') && '${qrImageUrl}') {
                    const elapsed = Date.now() - ${qrGeneratedAt};
                    if (elapsed > 15 * 60 * 1000) {
                        if (confirm('QR Code expiré. Voulez-vous en générer un nouveau?')) {
                            forceNewQR();
                        }
                    }
                }
            }, 16 * 60 * 1000); // 16 minutes
        </script>
    </body>
    </html>`;
    
    res.send(html);
});

// API pour obtenir le statut
app.get('/api/status', (req, res) => {
    res.json({
        status: botStatus,
        connected: isConnected,
        hasQR: !!qrImageUrl,
        qrAge: qrGeneratedAt ? Date.now() - qrGeneratedAt : 0,
        qrValid: isQRValid(),
        botName: config.botName
    });
});

// API pour forcer un nouveau QR
app.post('/api/new-qr', (req, res) => {
    if (sock && currentQR) {
        // Forcer une nouvelle génération de QR
        qrImageUrl = null;
        currentQR = null;
        qrGeneratedAt = 0;
        
        // Émettre un événement pour regénérer le QR
        sock.ev.emit('connection.update', { qr: 'regenerate' });
        
        res.json({ success: true, message: 'Nouveau QR en cours de génération' });
    } else {
        res.json({ success: false, message: 'Socket non disponible' });
    }
});

// API de santé pour Render
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        bot: config.botName,
        connected: isConnected,
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Démarrer le serveur
app.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(60));
    console.log('🚀 META MD BOT - SERVEUR DÉMARRÉ');
    console.log('='.repeat(60));
    console.log(`📍 Port: ${PORT}`);
    console.log(`🤖 Bot: ${config.botName}`);
    console.log(`👤 Dev: ${config.owner}`);
    console.log(`🖥️ Node: ${process.version}`);
    console.log(`📅 Démarrage: ${new Date().toLocaleString()}`);
    console.log('='.repeat(60));
    console.log('🔗 QR Code disponible sur le site web');
    console.log('⏰ Durée QR: 15 minutes');
    console.log('='.repeat(60));
});

// Fonction de connexion WhatsApp avec QR longue durée
async function connectToWhatsApp() {
    try {
        console.log('🔗 Connexion à WhatsApp...');
        
        const { state, saveCreds } = await useMultiFileAuthState('./session');
        const { version } = await fetchLatestBaileysVersion();

        sock = makeWASocket({
            version,
            printQRInTerminal: false, // On affiche sur le site, pas dans le terminal
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, { level: 'error' })
            },
            browser: Browsers.ubuntu('Chrome'),
            connectTimeoutMs: 60000,
            keepAliveIntervalMs: 25000,
            defaultQueryTimeoutMs: 30000,
            emitOwnEvents: true,
            generateHighQualityLinkPreview: true,
            syncFullHistory: false,
            fireInitQueries: true,
            markOnlineOnConnect: true,
            getMessage: async () => null,
            msgRetryCounterCache,
            // Configuration pour QR plus long
            qrTimeout: config.qrTimeout, // 15 minutes
            linkPreviewImageThumbnailWidth: 192
        });

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            // Gestion du QR Code
            if (qr) {
                botStatus = '📱 Scan QR Code';
                
                // Vérifier si le QR actuel est encore valide
                if (!isQRValid() || qr !== currentQR) {
                    console.log('🔄 Nouveau QR Code détecté');
                    const qrUrl = await generateAndSaveQR(qr);
                    
                    if (qrUrl) {
                        console.log('✅ QR Code prêt sur le site web');
                        console.log(`🌐 Accès: ${process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`}`);
                        
                        // Planifier un refresh automatique du QR après 10 minutes
                        if (qrRefreshTimer) {
                            clearTimeout(qrRefreshTimer);
                        }
                        
                        qrRefreshTimer = setTimeout(() => {
                            if (!isConnected) {
                                console.log('🔄 Refresh automatique du QR après 10 minutes');
                                qrImageUrl = null;
                                currentQR = null;
                                qrGeneratedAt = 0;
                            }
                        }, config.qrRefreshInterval);
                    }
                } else {
                    console.log('♻️ QR Code toujours valide, pas de regénération');
                }
            }

            // Gestion déconnexion
            if (connection === 'close') {
                const reason = lastDisconnect?.error?.output?.statusCode;
                console.log(`🔌 Déconnexion (Code: ${reason || 'inconnu'})`);
                
                botStatus = '❌ Déconnecté';
                isConnected = false;
                
                // Garder le QR code pour reconnexion
                console.log('💾 QR Code conservé pour reconnexion');
                
                const shouldReconnect = reason !== DisconnectReason.loggedOut;
                if (shouldReconnect) {
                    console.log('🔄 Reconnexion dans 5 secondes...');
                    await delay(5000);
                    connectToWhatsApp();
                }
            } 
            // Connexion réussie
            else if (connection === 'open') {
                botStatus = '✅ Connecté';
                isConnected = true;
                
                console.log('\n' + '='.repeat(50));
                console.log('🎉 CONNEXION RÉUSSIE!');
                console.log('='.repeat(50));
                console.log(`🤖 ${config.botName} en ligne`);
                console.log(`👤 ${config.owner}`);
                console.log(`📅 ${new Date().toLocaleString()}`);
                console.log('='.repeat(50));
                console.log('🔗 Connexion permanente activée');
                console.log('💾 QR Code sauvegardé pour reconnexions futures');
                console.log('='.repeat(50) + '\n');
                
                // Nettoyer le QR de l'affichage
                qrImageUrl = null;
                
                // Notification au propriétaire
                if (config.ownerNumber && sock) {
                    setTimeout(async () => {
                        try {
                            const cleanNumber = config.ownerNumber.replace(/\D/g, '');
                            await sock.sendMessage(`${cleanNumber}@s.whatsapp.net`, {
                                text: `✅ *${config.botName} CONNECTÉ!*\n\n` +
                                      `📱 Connexion permanente activée\n` +
                                      `⏰ ${new Date().toLocaleString()}\n` +
                                      `🌐 ${process.env.RENDER_EXTERNAL_URL || 'Local'}\n\n` +
                                      `_${config.footer}_`
                            });
                            console.log('📨 Notification envoyée au propriétaire');
                        } catch (e) {
                            console.log('⚠️ Notification non envoyée:', e.message);
                        }
                    }, 2000);
                }
            }
        });

        sock.ev.on('creds.update', saveCreds);
        
        // Gestion des messages
        sock.ev.on('messages.upsert', async ({ messages }) => {
            try {
                const msg = messages[0];
                if (!msg.message || !isConnected) return;
                
                const from = msg.key.remoteJid;
                const text = msg.message.conversation || 
                           msg.message.extendedTextMessage?.text || '';
                
                if (!text.startsWith(config.prefix)) return;
                
                const cmd = text.slice(config.prefix.length).trim().toLowerCase();
                
                if (cmd === 'ping') {
                    await sock.sendMessage(from, {
                        text: '🏓 Pong!\n\n' + config.footer
                    });
                }
                else if (cmd === 'menu' || cmd === 'help') {
                    await sock.sendMessage(from, {
                        text: `🤖 *${config.botName}*\n\n` +
                              `👨‍💻 Développeur: ${config.owner}\n` +
                              `🔧 Prefix: ${config.prefix}\n\n` +
                              `*Commandes:*\n` +
                              `• ${config.prefix}ping - Test réponse\n` +
                              `• ${config.prefix}menu - Ce menu\n` +
                              `• ${config.prefix}status - Info bot\n\n` +
                              `*Fonctionnalités:*\n` +
                              `• QR Code 15 minutes\n` +
                              `• Reconnexion auto\n` +
                              `• Interface web\n\n` +
                              `${config.footer}`
                    });
                }
                else if (cmd === 'status') {
                    const uptime = process.uptime();
                    const hours = Math.floor(uptime / 3600);
                    const minutes = Math.floor((uptime % 3600) / 60);
                    
                    await sock.sendMessage(from, {
                        text: `📊 *STATUT ${config.botName}*\n\n` +
                              `🔗 Connecté: ${isConnected ? '✅ Oui' : '❌ Non'}\n` +
                              `⏱️ Uptime: ${hours}h ${minutes}m\n` +
                              `👤 Dev: ${config.owner}\n` +
                              `🌐 Host: Render.com\n` +
                              `🔧 QR Durée: 15 minutes\n\n` +
                              `${config.footer}`
                    });
                }
                
            } catch (error) {
                console.error('❌ Erreur message:', error.message);
            }
        });
        
        console.log('✅ WhatsApp socket initialisé');
        return sock;
        
    } catch (error) {
        console.error('❌ Erreur connexion:', error);
        botStatus = '❌ Erreur connexion';
        
        // Réessayer après délai
        setTimeout(() => {
            console.log('🔄 Nouvelle tentative...');
            connectToWhatsApp();
        }, 10000);
        
        return null;
    }
}

// Démarrer la connexion après 2 secondes
setTimeout(() => {
    connectToWhatsApp();
}, 2000);

// Gestion arrêt propre
process.on('SIGINT', () => {
    console.log('\n👋 Arrêt du bot...');
    if (sock) sock.end();
    process.exit(0);
});
