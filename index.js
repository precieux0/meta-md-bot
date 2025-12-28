const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    delay
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const express = require('express');
const fs = require('fs');
const NodeCache = require('node-cache');

// Configuration
const config = {
    botName: "META MD BOT",
    owner: "PRECIEUX OKITAKOY",
    ownerNumber: "243894697490",
    prefix: ".",
    footer: "by PRECIEUX OKITAKOY"
};

// Nettoyage initial
console.log('🧹 Initialisation...');
if (fs.existsSync('./session')) {
    try { fs.rmSync('./session', { recursive: true, force: true }); } catch {}
}
if (fs.existsSync('./temp')) {
    try { fs.rmSync('./temp', { recursive: true, force: true }); } catch {}
}

// Créer dossiers
fs.mkdirSync('./session', { recursive: true });
fs.mkdirSync('./temp', { recursive: true });

// Variables
const msgRetryCounterCache = new NodeCache();
const logger = pino({ level: 'error' });
let botStatus = 'Prêt';
let sock = null;

// Application Express
const app = express();
const PORT = process.env.PORT || 3000;

// Route simple
app.get('/', (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8">
    <title>META MD BOT</title>
    <style>
        body { font-family: Arial; text-align: center; padding: 20px; background: #f0f2f5; }
        .container { max-width: 500px; margin: 50px auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; }
        .status { padding: 15px; margin: 20px 0; border-radius: 8px; font-weight: bold; }
        .ready { background: #e3f2fd; color: #1565c0; }
        .connected { background: #e8f5e9; color: #2e7d32; }
        .scanning { background: #fff3cd; color: #856404; }
        .error { background: #ffebee; color: #c62828; }
        .instructions { text-align: left; margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; }
    </style>
    </head>
    <body>
        <div class="container">
            <h1>🤖 META MD BOT</h1>
            <div class="status ${botStatus === 'Connecté' ? 'connected' : botStatus === 'Scan QR' ? 'scanning' : botStatus.includes('Erreur') ? 'error' : 'ready'}">
                📱 ${botStatus}
            </div>
            
            <div class="instructions">
                <h3>📋 Instructions:</h3>
                <p>1. Vérifiez le terminal/logs pour le QR Code</p>
                <p>2. Scannez avec WhatsApp</p>
                <p>3. Le bot se connectera automatiquement</p>
                
                <h3 style="margin-top: 20px;">🔄 Si bloqué:</h3>
                <p>1. WhatsApp → Paramètres → Appareils connectés</p>
                <p>2. Déconnectez TOUS les appareils</p>
                <p>3. Redémarrez le bot</p>
            </div>
            
            <div style="margin-top: 30px; color: #666;">
                <p>👨‍💻 ${config.owner}</p>
                <p>📞 ${config.ownerNumber}</p>
                <p>🚀 Déployé sur Render</p>
            </div>
        </div>
        
        <script>
            // Auto-refresh toutes les 10 secondes
            setInterval(() => {
                fetch('/health')
                    .then(res => res.json())
                    .then(data => {
                        if (data.status !== '${botStatus}') {
                            location.reload();
                        }
                    });
            }, 10000);
        </script>
    </body>
    </html>`;
    res.send(html);
});

// API santé
app.get('/health', (req, res) => {
    res.json({ 
        status: botStatus, 
        time: new Date().toISOString(),
        bot: config.botName
    });
});

// Fonction pour afficher QR dans terminal (SANS qrcode-terminal)
function displayQRInTerminal(qr) {
    console.log('\n'.repeat(3));
    console.log('='.repeat(60));
    console.log('📱 SCANNEZ CE QR CODE DANS WHATSAPP:');
    console.log('='.repeat(60));
    
    // QR code texte basique (fallback)
    console.log('QR Code reçu. Ouvrez le lien ci-dessous dans un navigateur');
    console.log('pour le scanner:');
    console.log(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qr)}`);
    
    console.log('='.repeat(60));
    console.log('⚠️ Instructions:');
    console.log('1. Copiez le lien ci-dessus');
    console.log('2. Ouvrez-le dans un navigateur');
    console.log('3. Scannez l\'image QR avec WhatsApp');
    console.log('4. Validez sur votre téléphone');
    console.log('='.repeat(60));
    console.log('\nQR String (premier 50 chars):', qr.substring(0, 50) + '...');
    console.log('\n');
}

// Connexion WhatsApp
async function connectToWhatsApp() {
    try {
        console.log('🔗 Connexion à WhatsApp...');
        
        const { state, saveCreds } = await useMultiFileAuthState('./session');
        const { version } = await fetchLatestBaileysVersion();

        sock = makeWASocket({
            version,
            logger,
            printQRInTerminal: true, // Le QR s'affiche via Baileys
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, logger)
            },
            browser: ["Chrome", "Windows", "10.0"],
            connectTimeoutMs: 30000,
            syncFullHistory: false,
            fireInitQueries: true,
            generateHighQualityLinkPreview: false,
            getMessage: async () => null,
            msgRetryCounterCache
        });

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            if (qr) {
                botStatus = 'Scan QR';
                console.log('🔄 QR Code reçu');
                
                // Afficher le QR (Baileys le fait via printQRInTerminal)
                // + notre fallback
                displayQRInTerminal(qr);
            }

            if (connection === 'close') {
                botStatus = 'Déconnecté';
                console.log('🔌 Déconnexion détectée');
                
                const reason = lastDisconnect?.error?.output?.statusCode;
                const shouldReconnect = reason !== DisconnectReason.loggedOut;
                
                if (shouldReconnect) {
                    console.log('🔄 Reconnexion dans 5s...');
                    await delay(5000);
                    connectToWhatsApp();
                }
            } 
            else if (connection === 'open') {
                botStatus = 'Connecté';
                console.log('\n🎉 CONNEXION RÉUSSIE!');
                console.log(`🤖 ${config.botName}`);
                console.log(`👤 ${config.owner}`);
                console.log(`📅 ${new Date().toLocaleString()}`);
                console.log(`🌐 URL: ${process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`}`);
                
                // Notification
                if (config.ownerNumber && sock) {
                    setTimeout(async () => {
                        try {
                            const cleanNumber = config.ownerNumber.replace(/\D/g, '');
                            await sock.sendMessage(cleanNumber + '@s.whatsapp.net', { 
                                text: `✅ ${config.botName} connecté!\n${new Date().toLocaleString()}\n${config.footer}`
                            });
                        } catch (e) {
                            console.log('⚠️ Notification non envoyée');
                        }
                    }, 2000);
                }
            }
        });

        sock.ev.on('creds.update', saveCreds);
        
        // Messages
        sock.ev.on('messages.upsert', async ({ messages }) => {
            try {
                const msg = messages[0];
                if (!msg.message || !sock) return;
                
                const from = msg.key.remoteJid;
                const text = msg.message.conversation || '';
                
                if (text === config.prefix + 'ping') {
                    await sock.sendMessage(from, { text: '🏓 Pong!' });
                }
                else if (text === config.prefix + 'menu') {
                    await sock.sendMessage(from, { 
                        text: `🤖 ${config.botName}\n👤 ${config.owner}\n🔧 ${config.prefix}ping\n🔧 ${config.prefix}menu` 
                    });
                }
                
            } catch (error) {
                // Ignorer
            }
        });
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        botStatus = 'Erreur: ' + error.message;
        
        // Réessayer
        setTimeout(() => {
            console.log('🔄 Nouvelle tentative...');
            connectToWhatsApp();
        }, 10000);
    }
}

// Démarrer serveur
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log('🚀 META MD BOT');
    console.log('='.repeat(50));
    console.log(`📡 Port: ${PORT}`);
    console.log(`👤 Dev: ${config.owner}`);
    console.log(`🤖 Bot: ${config.botName}`);
    console.log('='.repeat(50));
    console.log('🔄 Démarrage dans 3 secondes...\n');
    
    setTimeout(() => {
        connectToWhatsApp();
    }, 3000);
});

// Gestion erreurs
process.on('uncaughtException', (err) => {
    console.error('⚠️ Erreur non catchée:', err.message);
});

process.on('unhandledRejection', (reason) => {
    console.error('⚠️ Promesse rejetée:', reason);
});
