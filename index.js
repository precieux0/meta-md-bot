// IMPORTANT: Sauvegardez ce fichier comme index.mjs (pas .js)
// OU modifiez package.json avec "type": "module"

import { 
    makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    delay,
    Browsers 
} from '@whiskeysockets/baileys';
import pino from 'pino';
import express from 'express';
import fs from 'fs';
import NodeCache from 'node-cache';

// Configuration
const config = {
    botName: "META MD BOT",
    owner: "PRECIEUX OKITAKOY", 
    ownerNumber: "243894697490",
    prefix: ".",
    footer: "by PRECIEUX OKITAKOY"
};

// Nettoyage
console.log('🧹 Initialisation META MD BOT...');
['./session', './temp'].forEach(dir => {
    if (fs.existsSync(dir)) {
        try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
    }
    fs.mkdirSync(dir, { recursive: true });
});

// Variables
const msgRetryCounterCache = new NodeCache();
const logger = pino({ level: 'error' });
let botStatus = 'Initialisation';
let sock = null;

// Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>META MD BOT</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
                max-width: 500px;
                width: 100%;
                text-align: center;
            }
            h1 {
                color: #333;
                margin-bottom: 10px;
            }
            .status-box {
                padding: 15px;
                margin: 20px 0;
                border-radius: 10px;
                font-weight: bold;
                font-size: 1.1em;
            }
            .status-ready { background: #e3f2fd; color: #1565c0; border: 2px solid #bbdefb; }
            .status-connected { background: #e8f5e9; color: #2e7d32; border: 2px solid #c8e6c9; }
            .status-scanning { background: #fff3cd; color: #856404; border: 2px solid #ffeaa7; }
            .status-error { background: #ffebee; color: #c62828; border: 2px solid #ef9a9a; }
            .instructions {
                text-align: left;
                background: #f8f9fa;
                padding: 20px;
                border-radius: 10px;
                margin: 25px 0;
                border-left: 4px solid #667eea;
            }
            .btn {
                background: #667eea;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 25px;
                cursor: pointer;
                font-size: 16px;
                margin: 10px;
                transition: all 0.3s;
            }
            .btn:hover {
                background: #5a67d8;
                transform: translateY(-2px);
            }
            .footer {
                margin-top: 25px;
                color: #666;
                font-size: 0.9em;
            }
            .qr-info {
                background: #f0f7ff;
                padding: 15px;
                border-radius: 8px;
                margin: 15px 0;
                border: 1px dashed #667eea;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🤖 META MD BOT</h1>
            <p>Version Render - ESM Fix</p>
            
            <div class="status-box ${botStatus === 'Connecté' ? 'status-connected' : 
                                  botStatus === 'Scan QR' ? 'status-scanning' : 
                                  botStatus.includes('Erreur') ? 'status-error' : 'status-ready'}">
                📱 ${botStatus}
            </div>
            
            <div class="qr-info">
                <strong>📍 QR Code dans les LOGS</strong><br>
                <small>Voir Render → Logs pour scanner</small>
            </div>
            
            <div class="instructions">
                <h3>🚀 Comment se connecter:</h3>
                <ol>
                    <li>Ouvrez Render → Logs</li>
                    <li>Scannez le QR Code affiché</li>
                    <li>Validez sur votre téléphone</li>
                    <li>Le bot se connecte automatiquement</li>
                </ol>
                
                <h3 style="margin-top: 15px;">🔧 Si problème:</h3>
                <ul>
                    <li>Déconnectez tous les appareils dans WhatsApp</li>
                    <li>Redémarrez le bot sur Render</li>
                    <li>Attendez 1 minute entre les tentatives</li>
                </ul>
            </div>
            
            <button class="btn" onclick="location.reload()">🔄 Actualiser</button>
            <button class="btn" onclick="window.open('https://dashboard.render.com/logs', '_blank')">📊 Voir Logs</button>
            
            <div class="footer">
                <p>👨‍💻 ${config.owner}</p>
                <p>📞 ${config.ownerNumber}</p>
                <p>🚀 Render.com | Node.js v18+</p>
            </div>
        </div>
        
        <script>
            // Auto-refresh toutes les 15 secondes
            let refreshCount = 0;
            const maxRefreshes = 20; // 5 minutes max
            
            function checkStatus() {
                if (refreshCount >= maxRefreshes) {
                    console.log('🛑 Arrêt auto-refresh après 5 minutes');
                    return;
                }
                
                fetch('/health')
                    .then(res => res.json())
                    .then(data => {
                        if (data.status !== '${botStatus}') {
                            location.reload();
                        }
                        refreshCount++;
                    })
                    .catch(() => {
                        // En cas d'erreur, attendre plus longtemps
                        setTimeout(() => location.reload(), 30000);
                    });
            }
            
            // Démarrer le check
            setInterval(checkStatus, 15000);
            checkStatus(); // Premier check immédiat
        </script>
    </body>
    </html>`;
    
    res.send(html);
});

app.get('/health', (req, res) => {
    res.json({
        status: botStatus,
        timestamp: new Date().toISOString(),
        bot: config.botName,
        node: process.version
    });
});

app.get('/api/status', (req, res) => {
    res.json({
        connected: botStatus === 'Connecté',
        status: botStatus,
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

// Fonction de connexion WhatsApp
async function connectToWhatsApp() {
    try {
        console.log('🔗 Connexion à WhatsApp...');
        
        const { state, saveCreds } = await useMultiFileAuthState('./session');
        const { version } = await fetchLatestBaileysVersion();
        
        console.log('📦 Baileys version:', version);
        
        sock = makeWASocket({
            version,
            logger,
            printQRInTerminal: true,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, logger),
            },
            browser: Browsers.ubuntu('Chrome'),
            connectTimeoutMs: 60000,
            keepAliveIntervalMs: 20000,
            defaultQueryTimeoutMs: 30000,
            emitOwnEvents: true,
            generateHighQualityLinkPreview: true,
            syncFullHistory: false,
            fireInitQueries: true,
            markOnlineOnConnect: true,
            getMessage: async (key) => {
                return null;
            },
            msgRetryCounterCache,
            transactionOpts: {
                maxCommitRetries: 3,
                delayBetweenTriesMs: 1000
            }
        });

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            if (qr) {
                botStatus = 'Scan QR';
                console.log('\n'.repeat(2));
                console.log('='.repeat(60));
                console.log('📱 SCANNEZ CE QR CODE AVEC WHATSAPP!');
                console.log('='.repeat(60));
                console.log('⚠️ Scannez rapidement (expire en ~20 secondes)');
                console.log('='.repeat(60));
                console.log('\n');
                
                // QR sera affiché via printQRInTerminal: true
            }

            if (connection === 'close') {
                botStatus = 'Déconnecté';
                console.log('🔌 Connexion fermée');
                
                const reason = lastDisconnect?.error?.output?.statusCode;
                console.log('Raison:', reason || 'Inconnue');
                
                const shouldReconnect = reason !== DisconnectReason.loggedOut;
                
                if (shouldReconnect) {
                    console.log('🔄 Reconnexion dans 3 secondes...');
                    await delay(3000);
                    connectToWhatsApp();
                }
            } 
            else if (connection === 'open') {
                botStatus = 'Connecté';
                console.log('\n' + '='.repeat(50));
                console.log('✅ CONNEXION RÉUSSIE!');
                console.log('='.repeat(50));
                console.log(`🤖 ${config.botName}`);
                console.log(`👤 ${config.owner}`);
                console.log(`📅 ${new Date().toLocaleString()}`);
                
                if (process.env.RENDER_EXTERNAL_URL) {
                    console.log(`🌐 ${process.env.RENDER_EXTERNAL_URL}`);
                }
                console.log('='.repeat(50) + '\n');
                
                // Notification au propriétaire
                if (config.ownerNumber && sock) {
                    setTimeout(async () => {
                        try {
                            const cleanNumber = config.ownerNumber.replace(/\D/g, '');
                            await sock.sendMessage(`${cleanNumber}@s.whatsapp.net`, {
                                text: `✅ ${config.botName} connecté!\n` +
                                      `⏰ ${new Date().toLocaleString()}\n` +
                                      `🚀 Déployé sur Render\n\n` +
                                      `${config.footer}`
                            });
                        } catch (e) {
                            console.log('⚠️ Notification non envoyée:', e.message);
                        }
                    }, 2000);
                }
            }
            else if (connection === 'connecting') {
                botStatus = 'Connexion...';
                console.log('🔄 Connexion en cours...');
            }
        });

        sock.ev.on('creds.update', saveCreds);
        
        // Handler messages
        sock.ev.on('messages.upsert', async ({ messages }) => {
            try {
                const msg = messages[0];
                if (!msg.message || !sock) return;
                
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
                              `• ${config.prefix}ping - Test de réponse\n` +
                              `• ${config.prefix}menu - Afficher ce menu\n` +
                              `• ${config.prefix}status - Statut du bot\n\n` +
                              `${config.footer}`
                    });
                }
                else if (cmd === 'status') {
                    const uptime = process.uptime();
                    const hours = Math.floor(uptime / 3600);
                    const minutes = Math.floor((uptime % 3600) / 60);
                    
                    await sock.sendMessage(from, {
                        text: `📊 *STATUT DU BOT*\n\n` +
                              `🤖 Nom: ${config.botName}\n` +
                              `🔗 Statut: ${botStatus}\n` +
                              `⏱️ Uptime: ${hours}h ${minutes}m\n` +
                              `👤 Dev: ${config.owner}\n` +
                              `🚀 Host: Render.com\n\n` +
                              `${config.footer}`
                    });
                }
                
            } catch (error) {
                console.error('❌ Erreur handler:', error.message);
            }
        });
        
        console.log('✅ Socket WhatsApp initialisé');
        return sock;
        
    } catch (error) {
        console.error('❌ ERREUR CONNEXION:', error);
        botStatus = `Erreur: ${error.message}`;
        
        // Réessayer après délai
        setTimeout(() => {
            console.log('🔄 Nouvelle tentative...');
            connectToWhatsApp();
        }, 10000);
        
        return null;
    }
}

// Démarrer serveur
app.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(55));
    console.log('🚀 META MD BOT - VERSION RENDER');
    console.log('='.repeat(55));
    console.log(`📍 Port: ${PORT}`);
    console.log(`🤖 Bot: ${config.botName}`);
    console.log(`👤 Dev: ${config.owner}`);
    console.log(`🖥️ Node: ${process.version}`);
    console.log(`📅 ${new Date().toLocaleString()}`);
    
    if (process.env.RENDER_EXTERNAL_URL) {
        console.log(`🌐 URL: ${process.env.RENDER_EXTERNAL_URL}`);
    } else {
        console.log(`🌐 Local: http://localhost:${PORT}`);
    }
    
    console.log('='.repeat(55));
    console.log('🔄 Démarrage WhatsApp dans 2 secondes...\n');
    
    setTimeout(() => {
        connectToWhatsApp();
    }, 2000);
});

// Gestion erreurs
process.on('uncaughtException', (error) => {
    console.error('⚠️ Erreur non catchée:', error.message);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('⚠️ Promesse rejetée:', reason);
});
