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

// Configuration MINIMALE
const config = {
    botName: "META MD BOT",
    owner: "PRECIEUX OKITAKOY",
    ownerNumber: "243894697490",
    prefix: ".",
    footer: "by PRECIEUX OKITAKOY"
};

// Nettoyage COMPLET
console.log('🧹 Nettoyage des sessions précédentes...');
if (fs.existsSync('./session')) {
    fs.rmSync('./session', { recursive: true, force: true });
}
if (fs.existsSync('./temp')) {
    fs.rmSync('./temp', { recursive: true, force: true });
}

// Créer dossiers frais
fs.mkdirSync('./session', { recursive: true });
fs.mkdirSync('./temp', { recursive: true });

// Initialisation SIMPLE
const msgRetryCounterCache = new NodeCache();
const logger = pino({ level: 'error' }); // Seulement les erreurs

let botStatus = 'Initialisation...';
let sock = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 3;

// Application Express MINIMALE
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><title>META MD BOT</title>
    <style>
        body { font-family: Arial; text-align: center; padding: 50px; }
        .status { padding: 20px; margin: 20px; border-radius: 10px; }
        .error { background: #ffebee; color: #c62828; border: 2px solid #ef9a9a; }
        .info { background: #e3f2fd; color: #1565c0; border: 2px solid #90caf9; }
        .success { background: #e8f5e9; color: #2e7d32; border: 2px solid #a5d6a7; }
    </style>
    </head>
    <body>
        <h1>🤖 META MD BOT</h1>
        <div class="status ${botStatus.includes('Erreur') ? 'error' : botStatus.includes('Connecté') ? 'success' : 'info'}">
            <h2>${botStatus}</h2>
            ${botStatus.includes('Erreur') ? 
                '<p><strong>SOLUTION:</strong><br>1. Déconnectez TOUS les appareils dans WhatsApp<br>2. Redémarrez le bot<br>3. Attendez 5 minutes</p>' 
                : ''}
        </div>
        <div style="margin-top: 30px; text-align: left; display: inline-block;">
            <h3>📋 PROCÉDURE DE RÉPARATION:</h3>
            <ol>
                <li>Ouvrez WhatsApp sur votre téléphone</li>
                <li>Paramètres → Appareils connectés</li>
                <li>Déconnectez <strong>TOUS</strong> les appareils</li>
                <li>Fermez WhatsApp complètement</li>
                <li>Redémarrez WhatsApp</li>
                <li>Redémarrez ce bot (npm start)</li>
                <li>Attendez 5 minutes avant de scanner</li>
            </ol>
        </div>
        <p style="margin-top: 30px; color: #666;">
            👨‍💻 ${config.owner} | 📞 ${config.ownerNumber}
        </p>
    </body>
    </html>`;
    res.send(html);
});

app.get('/health', (req, res) => {
    res.json({ status: botStatus, timestamp: new Date().toISOString() });
});

// Fonction de connexion AVEC DÉLAI INITIAL
async function connectToWhatsApp() {
    reconnectAttempts++;
    
    if (reconnectAttempts > MAX_RECONNECT_ATTEMPTS) {
        botStatus = 'Erreur: Trop de tentatives. Attendez 10 minutes.';
        console.error('❌ TROP DE TENTATIVES. Attendez 10 minutes.');
        return;
    }
    
    console.log(`🔄 Tentative de connexion ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}...`);
    
    try {
        const { state, saveCreds } = await useMultiFileAuthState('./session');
        const { version } = await fetchLatestBaileysVersion();

        // Configuration ULTRA SIMPLE pour éviter les blocages
        sock = makeWASocket({
            version,
            logger,
            printQRInTerminal: true, // SEULEMENT dans le terminal
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, logger)
            },
            // Configuration MINIMALE
            connectTimeoutMs: 30000,
            defaultQueryTimeoutMs: 30000,
            keepAliveIntervalMs: 10000,
            emitOwnEvents: false,
            generateHighQualityLinkPreview: false,
            syncFullHistory: false,
            fireInitQueries: false,
            mobile: false,
            // Browser réaliste MAIS SIMPLE
            browser: ["Ubuntu", "Chrome", "110.0"],
            // Désactiver les features problématiques
            markOnlineOnConnect: false,
            linkPreviewImageThumbnailWidth: 0,
            transactionOpts: {
                maxCommitRetries: 3,
                delayBetweenTriesMs: 1000
            },
            getMessage: async () => null,
            msgRetryCounterCache
        });

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            if (qr) {
                botStatus = 'QR Code disponible dans le TERMINAL';
                console.log('\n'.repeat(5));
                console.log('='.repeat(60));
                console.log('📱 SCANNEZ CE QR CODE MAINTENANT:');
                console.log('='.repeat(60));
                
                // Afficher le QR code dans le terminal SEULEMENT
                require('qrcode-terminal').generate(qr, { small: true });
                
                console.log('='.repeat(60));
                console.log('⚠️  IMPORTANT:');
                console.log('1. Scannez IMMÉDIATEMENT');
                console.log('2. Ne quittez pas cette page');
                console.log('3. Validez sur votre téléphone');
                console.log('='.repeat(60));
                console.log('\n');
                
                // Attendre 60 secondes max pour le scan
                setTimeout(() => {
                    if (connection !== 'open') {
                        console.log('⏰ QR expiré. Nouvelle tentative...');
                        if (sock) sock.end();
                        setTimeout(() => connectToWhatsApp(), 2000);
                    }
                }, 60000);
            }

            if (connection === 'close') {
                const reason = lastDisconnect?.error?.output?.statusCode;
                console.log(`🔌 Déconnecté (Code: ${reason || 'inconnu'})`);
                
                // Analyser la raison
                if (reason === 401) {
                    botStatus = 'Erreur: Session expirée. Nouveau QR requis.';
                    console.log('❌ SESSION EXPIREE. Suppression...');
                    
                    // Supprimer la session corrompue
                    if (fs.existsSync('./session')) {
                        fs.rmSync('./session', { recursive: true, force: true });
                    }
                    
                    // Attendre avant de réessayer
                    setTimeout(() => {
                        fs.mkdirSync('./session', { recursive: true });
                        connectToWhatsApp();
                    }, 5000);
                    
                } else if (reason === 403) {
                    botStatus = 'ERREUR: COMPTE BLOQUE TEMPORAIREMENT';
                    console.log('🚫 COMPTE BLOQUE! Attendez 24h.');
                    
                } else if (reason === 429) {
                    botStatus = 'Trop de tentatives. Attendez 5 minutes.';
                    console.log('⚠️ Trop de requêtes. Pause de 5 minutes...');
                    setTimeout(() => connectToWhatsApp(), 300000);
                    
                } else {
                    botStatus = 'Déconnecté. Reconnexion...';
                    const shouldReconnect = reason !== DisconnectReason.loggedOut;
                    
                    if (shouldReconnect) {
                        await delay(3000);
                        connectToWhatsApp();
                    }
                }
            } 
            else if (connection === 'open') {
                botStatus = '✅ CONNECTÉ AVEC SUCCÈS!';
                reconnectAttempts = 0; // Réinitialiser le compteur
                
                console.log('\n'.repeat(3));
                console.log('🎉 🎉 🎉 CONNEXION RÉUSSIE! 🎉 🎉 🎉');
                console.log('🤖 Bot: ' + config.botName);
                console.log('👤 Dev: ' + config.owner);
                console.log('📅 ' + new Date().toLocaleString());
                console.log('\nLe bot est maintenant opérationnel!');
                
                // Message de bienvenue MINIMAL
                if (config.ownerNumber && sock) {
                    setTimeout(async () => {
                        try {
                            const cleanNumber = config.ownerNumber.replace(/\D/g, '');
                            await sock.sendMessage(cleanNumber + '@s.whatsapp.net', { 
                                text: `✅ ${config.botName} connecté!\n${new Date().toLocaleString()}\n${config.footer}`
                            });
                        } catch (e) {
                            // Ignorer les erreurs d'envoi
                        }
                    }, 3000);
                }
            }
        });

        sock.ev.on('creds.update', saveCreds);
        
        // Handler de messages MINIMAL
        sock.ev.on('messages.upsert', async ({ messages }) => {
            try {
                const msg = messages[0];
                if (!msg.message) return;
                
                const from = msg.key.remoteJid;
                const text = msg.message.conversation || '';
                
                if (text.startsWith(config.prefix + 'ping')) {
                    await sock.sendMessage(from, { text: '🏓 Pong!' }, { quoted: msg });
                }
                else if (text.startsWith(config.prefix + 'menu')) {
                    await sock.sendMessage(from, { 
                        text: `🤖 ${config.botName}\n👤 ${config.owner}\n🔧 ${config.prefix}ping - Test\n🔧 ${config.prefix}menu - Aide` 
                    }, { quoted: msg });
                }
                
            } catch (error) {
                // Ignorer les erreurs de messages
            }
        });
        
    } catch (error) {
        console.error('❌ ERREUR INITIALE:', error.message);
        botStatus = 'Erreur: ' + error.message;
        
        // Supprimer la session corrompue
        if (fs.existsSync('./session')) {
            fs.rmSync('./session', { recursive: true, force: true });
            fs.mkdirSync('./session', { recursive: true });
        }
        
        // Réessayer après délai
        setTimeout(() => connectToWhatsApp(), 5000);
    }
}

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`🌐 Interface: http://localhost:${PORT}`);
    console.log(`🤖 ${config.botName} par ${config.owner}`);
    console.log('🔄 Démarrage dans 3 secondes...');
    
    // DÉLAI CRITIQUE: Attendre avant la première connexion
    setTimeout(() => {
        connectToWhatsApp();
    }, 3000);
});
