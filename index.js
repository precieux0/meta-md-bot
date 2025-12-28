const {
    makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    delay,
    Browsers
} = require('@whiskeysockets/baileys');

const express = require('express');
const fs = require('fs');
const path = require('path');
const NodeCache = require('node-cache');
const QRCode = require('qrcode');

// Configuration
const config = {
    botName: "META MD BOT",
    owner: "PRECIEUX OKITAKOY",
    ownerNumber: "243894697490",
    prefix: ".",
    footer: "by PRECIEUX OKITAKOY",
    qrTimeout: 10 * 60 * 1000 // 10 minutes
};

// Nettoyage
console.log('🧹 Initialisation...');
['./session', './temp', './public'].forEach(dir => {
    if (fs.existsSync(dir)) {
        try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
    }
    fs.mkdirSync(dir, { recursive: true });
});

// Variables
const msgRetryCounterCache = new NodeCache();
let botStatus = 'Initialisation';
let sock = null;
let currentQR = null;
let qrGeneratedAt = 0;
let qrImageUrl = null;
let isConnected = false;

// Express app
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

// Générer QR pour le web
async function generateQRForWeb(qrData) {
    try {
        console.log('📱 Génération QR code pour le site...');
        const qrDataUrl = await QRCode.toDataURL(qrData, {
            width: 400,
            margin: 2
        });
        
        qrImageUrl = qrDataUrl;
        currentQR = qrData;
        qrGeneratedAt = Date.now();
        
        console.log('✅ QR code généré');
        console.log(`⏰ Valide 10 minutes`);
        
        return qrDataUrl;
    } catch (error) {
        console.error('❌ Erreur QR:', error);
        return null;
    }
}

// Route principale
app.get('/', (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>META MD BOT - QR Code</title>
        <style>
            body {
                font-family: Arial, sans-serif;
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
                border-radius: 15px;
                padding: 30px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                text-align: center;
                max-width: 500px;
                width: 100%;
            }
            h1 {
                color: #333;
                margin-bottom: 10px;
            }
            .status {
                padding: 12px;
                border-radius: 8px;
                margin: 20px 0;
                font-weight: bold;
            }
            .connected { background: #d4edda; color: #155724; }
            .scanning { background: #fff3cd; color: #856404; }
            .disconnected { background: #f8d7da; color: #721c24; }
            .qr-box {
                margin: 25px 0;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 10px;
            }
            #qrcode {
                width: 300px;
                height: 300px;
                margin: 0 auto;
                display: block;
            }
            .timer {
                margin-top: 15px;
                font-weight: bold;
                color: #495057;
            }
            .btn {
                background: #007bff;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 16px;
                margin: 10px;
            }
            .btn:hover {
                background: #0056b3;
            }
            .instructions {
                text-align: left;
                margin-top: 25px;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 8px;
            }
            .footer {
                margin-top: 20px;
                color: #666;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🤖 META MD BOT</h1>
            <p>QR Code sur le site - Valide 10 minutes</p>
            
            <div class="status ${botStatus.includes('Connecté') ? 'connected' : 
                              botStatus.includes('Scan') ? 'scanning' : 'disconnected'}">
                ${botStatus}
            </div>
            
            <div class="qr-box">
                ${qrImageUrl ? 
                    `<img id="qrcode" src="${qrImageUrl}" alt="QR Code">
                     <div class="timer" id="timer">⏳ Valide: 10:00</div>
                     <p>Scannez avec WhatsApp → Appareils connectés</p>` 
                    : 
                    '<p>⏳ Génération du QR Code...</p>'
                }
            </div>
            
            <div>
                <button class="btn" onclick="location.reload()">🔄 Actualiser</button>
                <button class="btn" onclick="newQR()">🔄 Nouveau QR</button>
            </div>
            
            <div class="instructions">
                <h3>📱 Instructions:</h3>
                <ol>
                    <li>Ouvrez WhatsApp sur votre téléphone</li>
                    <li>Menu ⋮ → Appareils connectés</li>
                    <li>Connecter un appareil</li>
                    <li>Scannez le QR code ci-dessus</li>
                    <li>Validez sur votre téléphone</li>
                </ol>
                <p><strong>💡 QR Code valide 10 minutes</strong></p>
            </div>
            
            <div class="footer">
                <p>👨‍💻 ${config.owner}</p>
                <p>📞 ${config.ownerNumber}</p>
                <p>🚀 Render.com</p>
            </div>
        </div>
        
        <script>
            // Timer QR
            function updateTimer() {
                if (!'${qrImageUrl}') return;
                
                const startTime = ${qrGeneratedAt};
                const now = Date.now();
                const elapsed = Math.floor((now - startTime) / 1000);
                const remaining = 600 - elapsed; // 10 minutes
                
                if (remaining > 0) {
                    const minutes = Math.floor(remaining / 60);
                    const seconds = remaining % 60;
                    document.getElementById('timer').textContent = 
                        '⏳ Valide: ' + minutes + ':' + seconds.toString().padStart(2, '0');
                } else {
                    document.getElementById('timer').textContent = '⌛ QR expiré';
                    document.getElementById('timer').style.color = '#dc3545';
                }
            }
            
            // Nouveau QR
            function newQR() {
                fetch('/new-qr', { method: 'POST' })
                    .then(() => location.reload());
            }
            
            // Auto-update
            if ('${qrImageUrl}') {
                setInterval(updateTimer, 1000);
                updateTimer();
            }
            
            // Auto-refresh
            setInterval(() => {
                fetch('/status')
                    .then(res => res.json())
                    .then(data => {
                        if (data.status !== '${botStatus}') {
                            location.reload();
                        }
                    });
            }, 5000);
        </script>
    </body>
    </html>`;
    
    res.send(html);
});

// API status
app.get('/status', (req, res) => {
    res.json({
        status: botStatus,
        connected: isConnected,
        hasQR: !!qrImageUrl
    });
});

// Nouveau QR
app.post('/new-qr', (req, res) => {
    qrImageUrl = null;
    currentQR = null;
    res.json({ success: true });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', bot: config.botName });
});

// Démarrer serveur
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log('🚀 META MD BOT DÉMARRÉ');
    console.log('='.repeat(50));
    console.log(`📍 Port: ${PORT}`);
    console.log(`🤖 ${config.botName}`);
    console.log(`👤 ${config.owner}`);
    console.log(`📅 ${new Date().toLocaleString()}`);
    console.log('='.repeat(50));
    console.log('🔗 QR Code sur le site web');
    console.log('⏰ Durée: 10 minutes');
    console.log('='.repeat(50));
});

// Connexion WhatsApp
async function connectToWhatsApp() {
    try {
        console.log('🔗 Connexion WhatsApp...');
        
        const { state, saveCreds } = await useMultiFileAuthState('./session');
        const { version } = await fetchLatestBaileysVersion();

        sock = makeWASocket({
            version,
            printQRInTerminal: false,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, { level: 'silent' })
            },
            browser: Browsers.ubuntu('Chrome'),
            connectTimeoutMs: 60000,
            syncFullHistory: true,
            fireInitQueries: true,
            getMessage: async () => null,
            msgRetryCounterCache
        });

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            if (qr && qr !== currentQR) {
                botStatus = '📱 Scan QR Code';
                console.log('🔄 Nouveau QR Code');
                
                await generateQRForWeb(qr);
                currentQR = qr;
            }

            if (connection === 'close') {
                botStatus = '❌ Déconnecté';
                isConnected = false;
                console.log('🔌 Déconnexion');
                
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                if (shouldReconnect) {
                    console.log('🔄 Reconnexion dans 5s...');
                    await delay(5000);
                    connectToWhatsApp();
                }
            } 
            else if (connection === 'open') {
                botStatus = '✅ Connecté';
                isConnected = true;
                console.log('\n🎉 CONNEXION RÉUSSIE!');
                console.log(`🤖 ${config.botName}`);
                console.log(`👤 ${config.owner}`);
                
                // Notification
                if (config.ownerNumber && sock) {
                    setTimeout(async () => {
                        try {
                            const cleanNumber = config.ownerNumber.replace(/\D/g, '');
                            await sock.sendMessage(`${cleanNumber}@s.whatsapp.net`, {
                                text: `✅ ${config.botName} connecté!\\n${new Date().toLocaleString()}\\n${config.footer}`
                            });
                        } catch (e) {}
                    }, 2000);
                }
            }
        });

        sock.ev.on('creds.update', saveCreds);
        
        // Messages
        sock.ev.on('messages.upsert', async ({ messages }) => {
            try {
                const msg = messages[0];
                if (!msg.message || !isConnected) return;
                
                const from = msg.key.remoteJid;
                const text = msg.message.conversation || '';
                
                if (text === config.prefix + 'ping') {
                    await sock.sendMessage(from, { text: '🏓 Pong!' });
                }
                else if (text === config.prefix + 'menu') {
                    await sock.sendMessage(from, { 
                        text: `🤖 ${config.botName}\\n👤 ${config.owner}\\n🔧 ${config.prefix}ping - Test\\n🔧 ${config.prefix}menu - Aide` 
                    });
                }
            } catch (e) {}
        });
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        setTimeout(() => connectToWhatsApp(), 10000);
    }
}

// Démarrer
setTimeout(() => connectToWhatsApp(), 2000);
