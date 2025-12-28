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

// Configuration
const config = {
    botName: "META MD BOT",
    owner: "PRECIEUX OKITAKOY",
    ownerNumber: "243894697490",
    prefix: ".",
    footer: "Signature: by PRECIEUX OKITAKOY"
};

// Créer les dossiers
if (!fs.existsSync('./session')) fs.mkdirSync('./session', { recursive: true });
if (!fs.existsSync('./temp')) fs.mkdirSync('./temp', { recursive: true });

// Initialisation
const msgRetryCounterCache = new NodeCache();
const logger = pino({ level: 'silent' });
let startTime = Date.now();
let qrCodeUrl = null;
let botStatus = 'Déconnecté';
let sock = null;

// Application Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static('public'));

// Route principale
app.get('/', (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>META MD BOT</title>
        <style>
            body { font-family: Arial; background: #667eea; margin: 0; padding: 20px; min-height: 100vh; display: flex; justify-content: center; align-items: center; }
            .container { background: white; border-radius: 15px; padding: 30px; max-width: 500px; width: 100%; text-align: center; }
            h1 { color: #333; }
            .status { padding: 10px; border-radius: 5px; margin: 15px 0; }
            .connected { background: #d4edda; color: #155724; }
            .disconnected { background: #f8d7da; color: #721c24; }
            .scanning { background: #fff3cd; color: #856404; }
            .qr-container { margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 10px; }
            .btn { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🤖 META MD BOT</h1>
            <div class="status ${botStatus === 'Connecté' ? 'connected' : botStatus === 'Scanning' ? 'scanning' : 'disconnected'}">
                Statut: ${botStatus}
            </div>
            
            <div class="qr-container">
                ${qrCodeUrl ? `<img src="${qrCodeUrl}" alt="QR Code" width="250" height="250">` : '<p>En attente du QR Code...</p>'}
            </div>
            
            <button class="btn" onclick="location.reload()">🔄 Actualiser</button>
            
            <div style="margin-top: 20px; text-align: left; background: #f8f9fa; padding: 15px; border-radius: 8px;">
                <h3>📱 Instructions:</h3>
                <ol>
                    <li>Ouvrez WhatsApp</li>
                    <li>Menu ⋮ → Appareils connectés</li>
                    <li>Connecter un appareil</li>
                    <li>Scannez le QR code</li>
                </ol>
            </div>
            
            <div style="margin-top: 20px; color: #666; font-size: 14px;">
                <p>👨‍💻 ${config.owner}</p>
                <p>📞 ${config.ownerNumber}</p>
            </div>
        </div>
        
        <script>
            setInterval(() => {
                fetch('/status')
                    .then(res => res.json())
                    .then(data => {
                        if (data.status !== '${botStatus}' || data.qrCodeUrl !== '${qrCodeUrl}') {
                            location.reload();
                        }
                    });
            }, 3000);
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
        uptime: Date.now() - startTime,
        botName: config.botName
    });
});

// API de santé
app.get('/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`🌐 Serveur démarré sur le port ${PORT}`);
    console.log(`🔗 http://localhost:${PORT}`);
});

// Fonction de connexion WhatsApp
async function connectToWhatsApp() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState('./session');
        const { version } = await fetchLatestBaileysVersion();

        sock = makeWASocket({
            version,
            logger,
            printQRInTerminal: true,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, logger)
            },
            browser: ["Chrome", "Windows", "10.0"],
            connectTimeoutMs: 60000,
            syncFullHistory: true
        });

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            if (qr) {
                botStatus = 'Scanning';
                console.log('📱 QR Code généré');
                
                try {
                    const qrCodeDataUrl = await qrcode.toDataURL(qr);
                    qrCodeUrl = qrCodeDataUrl;
                    console.log(`✅ QR Code disponible sur http://localhost:${PORT}`);
                } catch (error) {
                    console.error('Erreur QR:', error);
                }
            }

            if (connection === 'close') {
                botStatus = 'Déconnecté';
                qrCodeUrl = null;
                
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                
                if (shouldReconnect) {
                    console.log('🔄 Reconnexion dans 5 secondes...');
                    await delay(5000);
                    connectToWhatsApp();
                }
            } 
            else if (connection === 'open') {
                botStatus = 'Connecté';
                qrCodeUrl = null;
                startTime = Date.now();
                
                console.log('✅ BOT CONNECTÉ AVEC SUCCÈS!');
                console.log(`🤖 Nom: ${config.botName}`);
                console.log(`👨‍💻 Dev: ${config.owner}`);
                
                // Envoyer un message au propriétaire
                if (config.ownerNumber) {
                    try {
                        const cleanNumber = config.ownerNumber.replace(/\D/g, '');
                        await sock.sendMessage(cleanNumber + '@s.whatsapp.net', { 
                            text: `✅ ${config.botName} est en ligne!\n${new Date().toLocaleString()}\n${config.footer}`
                        });
                    } catch (error) {
                        console.log('⚠️ Notification non envoyée:', error.message);
                    }
                }
            }
        });

        sock.ev.on('creds.update', saveCreds);
        
        // Gestion des messages
        sock.ev.on('messages.upsert', async ({ messages }) => {
            try {
                const msg = messages[0];
                if (!msg.message) return;
                
                const from = msg.key.remoteJid;
                const text = msg.message.conversation || '';
                
                if (!text.startsWith(config.prefix)) return;
                
                const cmd = text.slice(config.prefix.length).trim().toLowerCase();
                
                if (cmd === 'menu' || cmd === 'help') {
                    const menu = `🤖 ${config.botName}\n👨‍💻 ${config.owner}\n🔧 Prefix: ${config.prefix}\n\nCommands:\n${config.prefix}menu - Menu\n${config.prefix}ping - Test\n${config.prefix}alive - Status\n\n${config.footer}`;
                    await sock.sendMessage(from, { text: menu }, { quoted: msg });
                }
                else if (cmd === 'ping') {
                    await sock.sendMessage(from, { text: '🏓 Pong!\n' + config.footer }, { quoted: msg });
                }
                else if (cmd === 'alive') {
                    const uptime = Date.now() - startTime;
                    const hours = Math.floor(uptime / (1000 * 60 * 60));
                    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
                    const aliveMsg = `✅ ${config.botName} EN LIGNE!\n⏱️ Uptime: ${hours}h ${minutes}m\n👤 ${config.owner}\n${config.footer}`;
                    await sock.sendMessage(from, { text: aliveMsg }, { quoted: msg });
                }
                
            } catch (error) {
                console.error('Erreur handler:', error);
            }
        });
        
        return sock;
        
    } catch (error) {
        console.error('Erreur connexion:', error);
        setTimeout(() => connectToWhatsApp(), 10000);
        return null;
    }
}

// Démarrer
console.log('🚀 Démarrage META MD BOT...');
connectToWhatsApp();
