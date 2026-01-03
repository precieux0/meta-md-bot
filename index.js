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

const config = require('./lib/config');
const handlers = require('./lib/handlers');

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
let qrTimeout = null;

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
                ${qrCodeUrl ? `<p style="font-size:12px;color:#555;margin-top:8px;">QR valable ~10 minutes. Si expiré, rafraîchissez la page.</p>` : ''}
                ${qrCodeUrl ? `<p><a href="/qr.png" download style="font-size:12px;">⬇️ Télécharger le QR (PNG)</a></p>` : ''}
            </div>
            
            <button class="btn" onclick="location.reload()">🔄 Actualiser</button>
            
            <div style="margin-top: 20px; text-align: left; background: #f8f9fa; padding: 15px; border-radius: 8px;">
                <h3>📱 Instructions:</h3>
                <ol>
                    <li>Ouvrez WhatsApp</li>
                    <li>Menu ⋮ → Appareils connectés</li>
                    <li>Connecter un ou plusieurs appareils (Scan QR)</li>
                    <li>Scannez le QR code sur la page pour autoriser</li>
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
                        // Reload only when QR changes or status changes
                        if (data.status !== '${botStatus}' || (data.qrCodeUrl && data.qrCodeUrl !== '${qrCodeUrl}')) {
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
                    // Save PNG to public/qr.png for download and stable serving
                    const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, "");
                    fs.writeFileSync('./public/qr.png', base64Data, 'base64');

                    // Clear any previous timeout and set a 10-minute expiry for the displayed QR
                    if (qrTimeout) clearTimeout(qrTimeout);
                    qrTimeout = setTimeout(() => {
                        qrCodeUrl = null;
                        try { fs.unlinkSync('./public/qr.png'); } catch (e) {}
                    }, 10 * 60 * 1000);

                    console.log(`✅ QR Code disponible sur http://localhost:${PORT}`);
                } catch (error) {
                    console.error('Erreur QR:', error);
                }
            }

            if (connection === 'close') {
                botStatus = 'Déconnecté';
                
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

                // Ne pas effacer immédiatement le QR si nous prévoyons de nous reconnecter;
                // cela permet à l'utilisateur plus de temps pour scanner sans retoucher l'architecture
                if (!shouldReconnect) {
                    qrCodeUrl = null;
                    if (qrTimeout) { clearTimeout(qrTimeout); qrTimeout = null; }
                    try { fs.unlinkSync('./public/qr.png'); } catch (e) {}
                }

                if (shouldReconnect) {
                    console.log('🔄 Reconnexion dans 5 secondes...');
                    await delay(5000);
                    connectToWhatsApp();
                }
            } 
            else if (connection === 'open') {
                botStatus = 'Connecté';
                qrCodeUrl = null;
                if (qrTimeout) { clearTimeout(qrTimeout); qrTimeout = null; }
                try { fs.unlinkSync('./public/qr.png'); } catch (e) {}
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
        
        // Déléguer la gestion des messages au handler centralisé
        sock.ev.on('messages.upsert', handlers(sock, startTime));
        
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
