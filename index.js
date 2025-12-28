
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

const config = {
    botName: "META MD BOT",
    owner: "PRECIEUX OKITAKOY",
    ownerNumber: "243894697490",
    prefix: ".",
    footer: "Signature: by PRECIEUX OKITAKOY",
    mangaImages: {
        generic: [
            "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=800&q=80",
            "https://images.unsplash.com/photo-1639322537501-1d4b6d4f3e8f?w=800&q=80",
            "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80"
        ]
    },
    getRandomMangaImage: function() {
        const images = this.mangaImages.generic;
        return images[Math.floor(Math.random() * images.length)];
    }
};

const folders = ['./session', './temp'];
folders.forEach(folder => {
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
});

const msgRetryCounterCache = new NodeCache();
const logger = pino({ level: 'silent' });
let startTime = Date.now();
let qrCodeUrl = null;
let botStatus = 'Déconnecté';
let sock = null;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>META MD BOT - QR Code</title>
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
                margin-bottom: 30px;
            }
            .qr-container {
                margin: 30px auto;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 15px;
                display: inline-block;
            }
            #qrcode {
                display: ${qrCodeUrl ? 'block' : 'none'};
            }
            .status {
                padding: 15px;
                border-radius: 10px;
                margin: 20px 0;
                font-weight: bold;
            }
            .connected { background: #d4edda; color: #155724; }
            .disconnected { background: #f8d7da; color: #721c24; }
            .scanning { background: #fff3cd; color: #856404; }
            .instructions {
                text-align: left;
                background: #f8f9fa;
                padding: 20px;
                border-radius: 10px;
                margin-top: 30px;
            }
            .steps {
                list-style: none;
                padding: 0;
            }
            .steps li {
                margin: 10px 0;
                padding-left: 30px;
                position: relative;
            }
            .steps li:before {
                content: '✓';
                position: absolute;
                left: 0;
                color: #28a745;
                font-weight: bold;
            }
            .refresh-btn {
                background: #007bff;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 25px;
                cursor: pointer;
                font-size: 16px;
                margin-top: 20px;
                transition: background 0.3s;
            }
            .refresh-btn:hover {
                background: #0056b3;
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
            <p class="subtitle">Scanner le QR Code pour connecter le bot WhatsApp</p>
            
            <div class="status ${botStatus === 'Connecté' ? 'connected' : botStatus === 'Scanning' ? 'scanning' : 'disconnected'}">
                Statut: ${botStatus}
            </div>
            
            <div class="qr-container">
                ${qrCodeUrl ? `<img id="qrcode" src="${qrCodeUrl}" alt="QR Code" width="300" height="300">` : '<p>En attente du QR Code...</p>'}
            </div>
            
            <button class="refresh-btn" onclick="location.reload()">🔄 Actualiser</button>
            
            <div class="instructions">
                <h3>📱 Comment connecter:</h3>
                <ol class="steps">
                    <li>Ouvrez WhatsApp sur votre téléphone</li>
                    <li>Appuyez sur les 3 points (⋮) en haut à droite</li>
                    <li>Sélectionnez "Appareils connectés"</li>
                    <li>Appuyez sur "Connecter un appareil"</li>
                    <li>Scannez le QR code ci-dessus</li>
                    <li>Validez la connexion sur votre téléphone</li>
                </ol>
            </div>
            
            <div class="footer">
                <p>👨‍💻 Développeur: PRECIEUX OKITAKOY</p>
                <p>🔧 Bot: META MD BOT - Édition Manga</p>
                <p>🎌 Dandadan • Tokyo Ghoul • Jujutsu Kaisen</p>
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
            }, 5000);
            
            if (!'${qrCodeUrl}') {
                setInterval(() => location.reload(), 3000);
            }
        </script>
    </body>
    </html>`;
    
    res.send(html);
});

app.get('/status', (req, res) => {
    res.json({
        status: botStatus,
        qrCodeUrl: qrCodeUrl,
        uptime: Date.now() - startTime,
        botName: config.botName,
        developer: config.owner
    });
});

app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        bot: config.botName,
        time: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`🌐 Serveur web démarré sur le port ${PORT}`);
    console.log(`🔗 Accédez à: http://localhost:${PORT}`);
});

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
        version,
        logger,
        printQRInTerminal: true,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger),
        },
        browser: ["Chrome", "Windows", "10.0"],
        msgRetryCounterCache,
        generateHighQualityLinkPreview: true,
        getMessage: async (key) => {
            return null;
        },
        syncFullHistory: true,
        fireInitQueries: true,
        connectTimeoutMs: 60000
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            botStatus = 'Scanning';
            console.log('📱 QR Code généré');
            
            try {
                const qrCodeDataUrl = await qrcode.toDataURL(qr);
                qrCodeUrl = qrCodeDataUrl;
                
                console.log('✅ QR Code prêt pour le web');
                console.log(`🌐 Scannez-le à: http://localhost:${PORT}`);
                
            } catch (error) {
                console.error('Erreur génération QR:', error);
                require('qrcode-terminal').generate(qr, { small: true });
            }
        }

        if (connection === 'close') {
            botStatus = 'Déconnecté';
            qrCodeUrl = null;
            
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('🔌 Connexion fermée. Reconnexion...');
            
            if (shouldReconnect) {
                await delay(5000);
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            botStatus = 'Connecté';
            qrCodeUrl = null;
            startTime = Date.now();
            
            console.log('╔══════════════════════════════════╗');
            console.log('║   ✅ BOT CONNECTÉ AVEC SUCCÈS   ║');
            console.log('╠══════════════════════════════════╣');
            console.log('║ 🤖 Nom: META MD BOT             ║');
            console.log('║ 👨‍💻 Dev: PRECIEUX OKITAKOY      ║');
            console.log('║ 📅 Heure: ' + new Date().toLocaleTimeString() + '        ║');
            console.log('║ 🌐 Interface: http://localhost:' + PORT + ' ║');
            console.log('╚══════════════════════════════════╝');
            
            if (config.ownerNumber) {
                try {
                    await sock.sendMessage(config.ownerNumber.replace('+', '') + '@s.whatsapp.net', { 
                        text: `✅ *META MD BOT est maintenant en ligne!*\n\n📱 Connecté avec succès\n⏰ ${new Date().toLocaleString()}\n🌐 Interface: http://localhost:${PORT}\n\n_Signature: by PRECIEUX OKITAKOY_`
                    });
                } catch (error) {
                    console.log('⚠️ Impossible d\'envoyer le message au propriétaire:', error.message);
                }
            }
        }
    });

    sock.ev.on('creds.update', saveCreds);
    
    sock.ev.on('messages.upsert', async ({ messages }) => {
        try {
            const msg = messages[0];
            if (!msg.message) return;
            
            const from = msg.key.remoteJid;
            const text = msg.message.conversation || '';
            
            if (!text.startsWith(config.prefix)) return;
            
            const cmd = text.slice(config.prefix.length).trim().toLowerCase();
            
            if (cmd === 'menu' || cmd === 'help') {
                const menu = `🤖 *META MD BOT*\n\n👨‍💻 Développeur: PRECIEUX OKITAKOY\n🔧 Prefix: ${config.prefix}\n\nCommandes:\n${config.prefix}menu - Ce menu\n${config.prefix}ping - Test\n${config.prefix}alive - Statut\n\n${config.footer}`;
                
                await sock.sendMessage(from, {
                    image: { url: config.getRandomMangaImage() },
                    caption: menu
                }, { quoted: msg });
            }
            
            else if (cmd === 'ping') {
                await sock.sendMessage(from, { 
                    text: `🏓 Pong!\n\n${config.footer}` 
                }, { quoted: msg });
            }
            
            else if (cmd === 'alive') {
                const uptime = Date.now() - startTime;
                const hours = Math.floor(uptime / (1000 * 60 * 60));
                const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
                
                const aliveMsg = `✅ *${config.botName} EN LIGNE!*\n\n⏱️ Uptime: ${hours}h ${minutes}m\n👤 Dev: ${config.owner}\n\n${config.footer}`;
                
                await sock.sendMessage(from, {
                    image: { url: config.getRandomMangaImage() },
                    caption: aliveMsg
                }, { quoted: msg });
            }
            
        } catch (error) {
            console.error('Erreur handler:', error);
        }
    });
    
    return sock;
}

process.on('uncaughtException', (err) => {
    console.error('Erreur non catchée:', err);
});

process.on('unhandledRejection', (reason) => {
    console.error('Promesse rejetée:', reason);
});

console.log('🚀 Démarrage de META MD BOT...');
console.log('👨‍💻 Développeur: PRECIEUX OKITAKOY');

connectToWhatsApp().catch(err => {
    console.error('Erreur lors de la connexion:', err);
});
