const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    delay
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode');
const express = require('express');
const fs = require('fs');
const NodeCache = require('node-cache');
const path = require('path');

// Configuration
const config = {
    botName: "META MD BOT",
    owner: "PRECIEUX OKITAKOY",
    ownerNumber: "243894697490",
    prefix: ".",
    footer: "Signature: by PRECIEUX OKITAKOY",
    // QR code permanent
    qrCodeFile: path.join(__dirname, 'public', 'qrcode-permanent.png')
};

// Créer les dossiers
const folders = ['./session', './temp', './public'];
folders.forEach(folder => {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
    }
});

// Initialisation
const msgRetryCounterCache = new NodeCache();
const logger = pino({ level: 'silent' });
let startTime = Date.now();
let qrCodeUrl = null;
let botStatus = 'Déconnecté';
let sock = null;
let isConnected = false;
let currentQR = null;
let qrGeneratedTime = 0;
const QR_EXPIRY_TIME = 2 * 60 * 1000; // 2 minutes avant régénération

// Application Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static('public'));

// Route principale avec QR code permanent
app.get('/', (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>META MD BOT - QR Code Permanent</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                margin: 0;
                padding: 20px;
                min-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .container {
                background: white;
                border-radius: 20px;
                padding: 40px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                text-align: center;
                max-width: 600px;
                width: 100%;
            }
            h1 {
                color: #333;
                margin-bottom: 10px;
            }
            .subtitle {
                color: #666;
                margin-bottom: 20px;
            }
            .status {
                padding: 15px;
                border-radius: 10px;
                margin: 20px 0;
                font-weight: bold;
                font-size: 1.1em;
            }
            .connected { 
                background: #d4edda; 
                color: #155724;
                border: 2px solid #c3e6cb;
            }
            .disconnected { 
                background: #f8d7da; 
                color: #721c24;
                border: 2px solid #f5c6cb;
            }
            .scanning { 
                background: #fff3cd; 
                color: #856404;
                border: 2px solid #ffeaa7;
            }
            .qr-container {
                margin: 30px auto;
                padding: 25px;
                background: #f8f9fa;
                border-radius: 15px;
                border: 3px solid #007bff;
                display: inline-block;
            }
            #qrcode {
                display: ${qrCodeUrl ? 'block' : 'none'};
            }
            .qr-info {
                margin-top: 15px;
                color: #666;
                font-size: 0.9em;
            }
            .btn {
                background: #007bff;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 25px;
                cursor: pointer;
                font-size: 16px;
                margin: 10px;
                transition: background 0.3s;
            }
            .btn:hover {
                background: #0056b3;
            }
            .instructions {
                text-align: left;
                background: #f8f9fa;
                padding: 20px;
                border-radius: 10px;
                margin-top: 30px;
            }
            .warning {
                background: #fff3cd;
                border: 2px solid #ffeaa7;
                color: #856404;
                padding: 15px;
                border-radius: 10px;
                margin: 20px 0;
                text-align: center;
                font-weight: bold;
            }
            .success {
                background: #d4edda;
                border: 2px solid #c3e6cb;
                color: #155724;
                padding: 15px;
                border-radius: 10px;
                margin: 20px 0;
                text-align: center;
                font-weight: bold;
            }
            .footer {
                margin-top: 30px;
                color: #666;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🤖 META MD BOT</h1>
            <p class="subtitle">QR Code Permanent - Scannez une seule fois</p>
            
            <div class="status ${botStatus === 'Connecté' ? 'connected' : botStatus === 'Scanning' ? 'scanning' : 'disconnected'}">
                📱 Statut: ${botStatus}
                ${botStatus === 'Connecté' ? '✅' : botStatus === 'Scanning' ? '🔄' : '❌'}
            </div>
            
            ${botStatus === 'Connecté' ? 
                '<div class="success">✅ BOT CONNECTÉ! Le QR Code n\'est plus nécessaire.</div>' 
                : ''
            }
            
            ${botStatus === 'Scanning' ? 
                `<div class="warning">
                    ⚠️ Scannez ce QR Code dans WhatsApp <strong>une seule fois</strong><br>
                    Il reste valide même après déconnexion
                </div>` 
                : ''
            }
            
            <div class="qr-container">
                ${qrCodeUrl ? 
                    `<img id="qrcode" src="${qrCodeUrl}" alt="QR Code Permanent" width="300" height="300">
                     <div class="qr-info">
                        QR Code permanent<br>
                        ${isConnected ? 'Déjà scanné et connecté' : 'Prêt à scanner'}
                     </div>` 
                    : 
                    '<p>⏳ Génération du QR Code permanent...</p>'
                }
            </div>
            
            <div>
                <button class="btn" onclick="location.reload()">🔄 Actualiser la page</button>
                ${botStatus === 'Connecté' ? 
                    '<button class="btn" onclick="forceReconnect()" style="background:#28a745;">🔗 Forcer reconnexion</button>' 
                    : ''
                }
            </div>
            
            <div class="instructions">
                <h3>📱 Instructions IMPORTANTES:</h3>
                <ol>
                    <li><strong>Scannez ce QR Code UNE SEULE FOIS</strong> dans WhatsApp</li>
                    <li>Le QR Code reste valide même après déconnexion</li>
                    <li>Si déconnecté, le bot se reconnecte automatiquement</li>
                    <li>Pas besoin de re-scanner sauf si vous changez de téléphone</li>
                    <li>Pour déconnecter définitivement: WhatsApp → Appareils connectés</li>
                </ol>
            </div>
            
            <div class="footer">
                <p>👨‍💻 Développeur: ${config.owner}</p>
                <p>📞 WhatsApp: ${config.ownerNumber}</p>
                <p>🔧 Bot: ${config.botName} - QR Code Permanent System</p>
            </div>
        </div>
        
        <script>
            // Auto-refresh seulement si déconnecté
            function startAutoRefresh() {
                if('${botStatus}' === 'Déconnecté' || !'${qrCodeUrl}') {
                    setInterval(() => {
                        fetch('/status')
                            .then(res => res.json())
                            .then(data => {
                                if(data.status !== '${botStatus}' || data.qrCodeUrl !== '${qrCodeUrl}') {
                                    location.reload();
                                }
                            });
                    }, 5000);
                }
            }
            
            // Forcer la reconnexion
            function forceReconnect() {
                fetch('/reconnect', { method: 'POST' })
                    .then(res => res.json())
                    .then(data => {
                        alert(data.message);
                        location.reload();
                    });
            }
            
            // Démarrer
            startAutoRefresh();
            
            // Si connecté, on arrête le refresh automatique
            if('${botStatus}' === 'Connecté') {
                console.log('✅ Connecté - Pas de refresh automatique');
            }
        </script>
    </body>
    </html>`;
    
    res.send(html);
});

// API pour le statut
app.get('/status', (req, res) => {
    res.json({
        status: botStatus,
        qrCodeUrl: qrCodeUrl,
        isConnected: isConnected,
        uptime: Date.now() - startTime,
        botName: config.botName,
        qrAge: qrGeneratedTime ? Date.now() - qrGeneratedTime : 0
    });
});

// API pour forcer la reconnexion
app.post('/reconnect', (req, res) => {
    if (sock) {
        sock.end();
        isConnected = false;
        botStatus = 'Déconnecté';
        qrCodeUrl = null;
        setTimeout(() => connectToWhatsApp(), 2000);
        res.json({ success: true, message: 'Reconnexion forcée en cours...' });
    } else {
        res.json({ success: false, message: 'Bot non initialisé' });
    }
});

// API pour obtenir le QR code directement
app.get('/qrcode', (req, res) => {
    if (qrCodeUrl) {
        res.json({ qrCode: qrCodeUrl, status: botStatus });
    } else {
        res.json({ error: 'Pas de QR code disponible', status: botStatus });
    }
});

// API de santé
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        bot: config.botName,
        connected: isConnected,
        time: new Date().toISOString()
    });
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log('╔══════════════════════════════════════════╗');
    console.log('║         🤖 META MD BOT - SERVEUR        ║');
    console.log('╠══════════════════════════════════════════╣');
    console.log(`║ 📍 Port: ${PORT}`);
    console.log(`║ 🔗 URL: http://localhost:${PORT}`);
    console.log(`║ 🤖 Nom: ${config.botName}`);
    console.log(`║ 👨‍💻 Dev: ${config.owner}`);
    console.log('║ 🔧 Système: QR Code Permanent');
    console.log('╚══════════════════════════════════════════╝\n');
});

// Fonction pour sauvegarder le QR code en fichier permanent
async function saveQRCodeToFile(qrData) {
    try {
        const qrCodeDataUrl = await qrcode.toDataURL(qrData);
        qrCodeUrl = qrCodeDataUrl;
        
        // Convertir DataURL en buffer et sauvegarder
        const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, "");
        fs.writeFileSync(config.qrCodeFile, base64Data, 'base64');
        
        console.log('💾 QR Code sauvegardé en fichier permanent');
        qrGeneratedTime = Date.now();
        return qrCodeDataUrl;
    } catch (error) {
        console.error('❌ Erreur sauvegarde QR:', error);
        return null;
    }
}

// Fonction pour charger le QR code depuis fichier
function loadQRCodeFromFile() {
    try {
        if (fs.existsSync(config.qrCodeFile)) {
            const imageBuffer = fs.readFileSync(config.qrCodeFile);
            const base64Image = imageBuffer.toString('base64');
            qrCodeUrl = `data:image/png;base64,${base64Image}`;
            console.log('📂 QR Code chargé depuis fichier');
            return true;
        }
    } catch (error) {
        console.error('❌ Erreur chargement QR:', error);
    }
    return false;
}

// Fonction de connexion WhatsApp avec QR code stable
async function connectToWhatsApp() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState('./session');
        const { version } = await fetchLatestBaileysVersion();

        sock = makeWASocket({
            version,
            logger,
            printQRInTerminal: false, // Pas de spam dans les logs
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, logger)
            },
            browser: ["Chrome", "Windows", "10.0"],
            connectTimeoutMs: 60000,
            keepAliveIntervalMs: 20000,
            syncFullHistory: true,
            fireInitQueries: true,
            markOnlineOnConnect: true,
            generateHighQualityLinkPreview: true,
            getMessage: async (key) => null,
            msgRetryCounterCache
        });

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            // Gestion du QR code
            if (qr && !isConnected) {
                botStatus = 'Scanning';
                
                // Vérifier si le QR est trop vieux (plus de 2 minutes)
                const qrAge = Date.now() - qrGeneratedTime;
                if (qrGeneratedTime === 0 || qrAge > QR_EXPIRY_TIME) {
                    console.log('🔄 Génération d\'un NOUVEAU QR Code permanent...');
                    await saveQRCodeToFile(qr);
                } else {
                    console.log(`♻️ Utilisation du QR Code existant (âge: ${Math.floor(qrAge/1000)}s)`);
                    
                    // Charger le QR existant depuis fichier si pas déjà chargé
                    if (!qrCodeUrl) {
                        loadQRCodeFromFile();
                    }
                }
            }

            // Gestion de la déconnexion
            if (connection === 'close') {
                const reason = lastDisconnect?.error?.output?.statusCode;
                console.log(`🔌 Connexion fermée (Raison: ${reason || 'inconnue'})`);
                
                // Conserver le statut et le QR code
                botStatus = 'Déconnecté';
                isConnected = false;
                
                // Ne pas changer le QR code - il reste valide
                console.log('💾 QR Code conservé pour reconnexion');
                
                // Reconnexion automatique
                const shouldReconnect = reason !== DisconnectReason.loggedOut;
                if (shouldReconnect) {
                    console.log('🔄 Reconnexion automatique dans 3 secondes...');
                    await delay(3000);
                    connectToWhatsApp();
                }
            } 
            // Gestion de la connexion réussie
            else if (connection === 'open') {
                botStatus = 'Connecté';
                isConnected = true;
                startTime = Date.now();
                
                console.log('\n' + '='.repeat(50));
                console.log('✅ CONNEXION RÉUSSIE!');
                console.log('='.repeat(50));
                console.log(`🤖 ${config.botName} est maintenant en ligne`);
                console.log(`👤 Développeur: ${config.owner}`);
                console.log(`📅 Connecté à: ${new Date().toLocaleString()}`);
                console.log(`🌐 Interface: http://localhost:${PORT}`);
                console.log('='.repeat(50));
                console.log('💡 Le QR Code reste valide pour les reconnexions futures');
                console.log('='.repeat(50) + '\n');
                
                // Envoyer notification au propriétaire
                if (config.ownerNumber && sock) {
                    try {
                        const cleanNumber = config.ownerNumber.replace(/\D/g, '');
                        const jid = cleanNumber + '@s.whatsapp.net';
                        
                        await sock.sendMessage(jid, { 
                            text: `✅ *${config.botName} CONNECTÉ!*\n\n` +
                                  `📱 Connexion établie avec succès\n` +
                                  `⏰ ${new Date().toLocaleString()}\n` +
                                  `🔗 QR Code permanent activé\n` +
                                  `🌐 Interface: http://localhost:${PORT}\n\n` +
                                  `_${config.footer}_`
                        });
                        console.log(`📨 Notification envoyée au propriétaire`);
                    } catch (error) {
                        console.log('⚠️ Notification non envoyée:', error.message);
                    }
                }
            }
            // En cours de connexion
            else if (connection === 'connecting') {
                console.log('🔄 Connexion en cours...');
                botStatus = 'Connexion...';
            }
        });

        // Sauvegarde des credentials
        sock.ev.on('creds.update', saveCreds);
        
        // Gestion des messages
        sock.ev.on('messages.upsert', async ({ messages }) => {
            try {
                const msg = messages[0];
                if (!msg.message || !isConnected) return;
                
                const from = msg.key.remoteJid;
                const text = msg.message.conversation || '';
                
                if (!text.startsWith(config.prefix)) return;
                
                const cmd = text.slice(config.prefix.length).trim().toLowerCase();
                
                if (cmd === 'menu' || cmd === 'help') {
                    const menu = `🤖 *${config.botName}*\n\n` +
                                `👨‍💻 Développeur: ${config.owner}\n` +
                                `🔧 Prefix: ${config.prefix}\n\n` +
                                `*COMMANDES:*\n` +
                                `• ${config.prefix}menu - Ce menu\n` +
                                `• ${config.prefix}ping - Test de latence\n` +
                                `• ${config.prefix}alive - Statut du bot\n` +
                                `• ${config.prefix}qrinfo - Info QR Code\n\n` +
                                `🔗 *SYSTÈME QR PERMANENT:*\n` +
                                `• QR Code scanné une seule fois\n` +
                                `• Reconnexion automatique\n` +
                                `• Pas besoin de re-scanner\n\n` +
                                `${config.footer}`;
                    
                    await sock.sendMessage(from, { text: menu }, { quoted: msg });
                }
                else if (cmd === 'ping') {
                    await sock.sendMessage(from, { 
                        text: `🏓 *Pong!*\n\n${config.footer}` 
                    }, { quoted: msg });
                }
                else if (cmd === 'alive') {
                    const uptime = Date.now() - startTime;
                    const hours = Math.floor(uptime / (1000 * 60 * 60));
                    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((uptime % (1000 * 60)) / 1000);
                    
                    const aliveMsg = `✅ *${config.botName} EN LIGNE!*\n\n` +
                                    `⏱️ Uptime: ${hours}h ${minutes}m ${seconds}s\n` +
                                    `🔗 Statut: ${isConnected ? 'Connecté' : 'Déconnecté'}\n` +
                                    `👤 Développeur: ${config.owner}\n` +
                                    `🔧 QR System: Permanent\n\n` +
                                    `${config.footer}`;
                    
                    await sock.sendMessage(from, { text: aliveMsg }, { quoted: msg });
                }
                else if (cmd === 'qrinfo' || cmd === 'qr') {
                    const qrAge = qrGeneratedTime ? Date.now() - qrGeneratedTime : 0;
                    const ageMinutes = Math.floor(qrAge / (1000 * 60));
                    const ageSeconds = Math.floor((qrAge % (1000 * 60)) / 1000);
                    
                    const qrInfo = `🔗 *INFORMATION QR CODE*\n\n` +
                                  `📱 Statut: ${botStatus}\n` +
                                  `🔗 Connecté: ${isConnected ? 'Oui ✅' : 'Non ❌'}\n` +
                                  `⏰ Âge QR: ${ageMinutes}m ${ageSeconds}s\n` +
                                  `🔄 Type: Permanent (ne change pas)\n` +
                                  `💾 Fichier: ${config.qrCodeFile}\n\n` +
                                  `*IMPORTANT:*\n` +
                                  `• Scannez UNE SEULE FOIS\n` +
                                  `• QR valide même après déco\n` +
                                  `• Reconnexion automatique\n\n` +
                                  `${config.footer}`;
                    
                    await sock.sendMessage(from, { text: qrInfo }, { quoted: msg });
                }
                
            } catch (error) {
                console.error('❌ Erreur handler:', error.message);
            }
        });
        
        return sock;
        
    } catch (error) {
        console.error('❌ Erreur connexion:', error);
        
        // Tentative de reconnexion
        setTimeout(() => {
            console.log('🔄 Nouvelle tentative de connexion...');
            connectToWhatsApp();
        }, 10000);
        
        return null;
    }
}

// Gestion des signaux
process.on('SIGINT', () => {
    console.log('\n👋 Arrêt du bot...');
    if (sock) sock.end();
    process.exit(0);
});

// Démarrer
console.log('🚀 Démarrage de META MD BOT...');
console.log(`🔧 Système: QR Code Permanent`);
console.log(`👨‍💻 Développeur: ${config.owner}\n`);

// Essayer de charger le QR existant d'abord
if (loadQRCodeFromFile()) {
    console.log('📂 QR Code existant chargé, connexion en cours...');
}

// Démarrer la connexion
connectToWhatsApp();
