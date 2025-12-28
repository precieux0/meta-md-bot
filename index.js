const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    delay,
    Browsers
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode');
const express = require('express');
const fs = require('fs');
const NodeCache = require('node-cache');
const qrcodeTerminal = require('qrcode-terminal');

// Configuration
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

// Créer les dossiers nécessaires
const folders = ['./session', './temp', './public'];
folders.forEach(folder => {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
    }
});

// Initialiser le cache
const msgRetryCounterCache = new NodeCache();
const logger = pino({ 
    level: 'silent',
    transport: {
        target: 'pino-pretty',
        options: { colorize: true }
    }
});

// Variables globales
let startTime = Date.now();
let qrCodeUrl = null;
let botStatus = 'Déconnecté';
let sock = null;
let currentQR = null;

// Application Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Route principale
app.get('/', (req, res) => {
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
                max-width: 700px;
                width: 100%;
            }
            
            .header {
                margin-bottom: 30px;
            }
            
            h1 {
                color: #333;
                margin-bottom: 10px;
                font-size: 2.5em;
            }
            
            .subtitle {
                color: #666;
                font-size: 1.1em;
                margin-bottom: 20px;
            }
            
            .status-container {
                margin: 25px 0;
            }
            
            .status {
                padding: 15px 25px;
                border-radius: 12px;
                font-weight: bold;
                font-size: 1.1em;
                display: inline-block;
                min-width: 200px;
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
                border: 3px dashed #dee2e6;
                display: inline-block;
            }
            
            #qrcode {
                display: ${qrCodeUrl ? 'block' : 'none'};
                margin: 0 auto;
            }
            
            .no-qr {
                padding: 40px;
                color: #6c757d;
                font-style: italic;
            }
            
            .actions {
                margin: 25px 0;
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
            }
            
            .btn:hover {
                background: #0056b3;
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0,123,255,0.4);
            }
            
            .btn-refresh {
                background: #28a745;
            }
            
            .btn-refresh:hover {
                background: #218838;
                box-shadow: 0 5px 15px rgba(40,167,69,0.4);
            }
            
            .btn-reset {
                background: #dc3545;
            }
            
            .btn-reset:hover {
                background: #c82333;
                box-shadow: 0 5px 15px rgba(220,53,69,0.4);
            }
            
            .instructions {
                text-align: left;
                background: #f8f9fa;
                padding: 25px;
                border-radius: 12px;
                margin-top: 35px;
                border-left: 5px solid #007bff;
            }
            
            .instructions h3 {
                color: #333;
                margin-bottom: 15px;
                font-size: 1.3em;
            }
            
            .steps {
                list-style: none;
                padding: 0;
            }
            
            .steps li {
                margin: 12px 0;
                padding: 12px 15px 12px 45px;
                background: white;
                border-radius: 8px;
                position: relative;
                border: 1px solid #e9ecef;
                transition: transform 0.2s;
            }
            
            .steps li:hover {
                transform: translateX(5px);
                border-color: #007bff;
            }
            
            .steps li:before {
                content: '✓';
                position: absolute;
                left: 15px;
                top: 50%;
                transform: translateY(-50%);
                background: #28a745;
                color: white;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
            }
            
            .info-cards {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin: 30px 0;
            }
            
            .card {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 12px;
                text-align: center;
                border-top: 4px solid #007bff;
            }
            
            .card h4 {
                color: #333;
                margin-bottom: 10px;
                font-size: 1.1em;
            }
            
            .card p {
                color: #666;
                font-size: 0.9em;
            }
            
            .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #dee2e6;
                color: #6c757d;
                font-size: 0.9em;
            }
            
            .footer p {
                margin: 5px 0;
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
            
            @media (max-width: 768px) {
                .container {
                    padding: 20px;
                }
                
                h1 {
                    font-size: 2em;
                }
                
                .qr-container {
                    padding: 15px;
                }
                
                #qrcode {
                    width: 250px;
                    height: 250px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🤖 META MD BOT</h1>
                <p class="subtitle">Scanner le QR Code pour connecter le bot WhatsApp</p>
            </div>
            
            <div class="status-container">
                <div class="status ${botStatus === 'Connecté' ? 'connected' : botStatus === 'Scanning' ? 'scanning' : 'disconnected'}">
                    📱 Statut: ${botStatus}
                </div>
            </div>
            
            <div class="qr-container">
                ${qrCodeUrl ? 
                    `<img id="qrcode" src="${qrCodeUrl}" alt="QR Code WhatsApp" width="300" height="300">
                     <p style="margin-top: 15px; color: #666; font-size: 0.9em;">Scannez ce code dans WhatsApp > Appareils connectés</p>` 
                    : 
                    '<div class="no-qr">⏳ En attente de la génération du QR Code...</div>'
                }
            </div>
            
            ${botStatus === 'Scanning' ? 
                '<div class="warning">⚠️ IMPORTANT: Scannez rapidement! Le QR Code expire en 60 secondes</div>' 
                : ''
            }
            
            <div class="info-cards">
                <div class="card">
                    <h4>👨‍💻 Développeur</h4>
                    <p>${config.owner}</p>
                </div>
                <div class="card">
                    <h4>🤖 Nom du Bot</h4>
                    <p>${config.botName}</p>
                </div>
                <div class="card">
                    <h4>⏱️ Temps écoulé</h4>
                    <p id="uptime">Chargement...</p>
                </div>
            </div>
            
            <div class="actions">
                <button class="btn btn-refresh" onclick="location.reload()">
                    🔄 Actualiser la page
                </button>
                <button class="btn" onclick="resetSession()">
                    🗑️ Nouvelle session
                </button>
                <button class="btn" onclick="showTerminalQR()">
                    📟 QR dans le terminal
                </button>
            </div>
            
            <div class="instructions">
                <h3>📱 Instructions de connexion:</h3>
                <ol class="steps">
                    <li>Ouvrez WhatsApp sur votre téléphone</li>
                    <li>Appuyez sur les 3 points (⋮) en haut à droite</li>
                    <li>Sélectionnez "Appareils connectés"</li>
                    <li>Appuyez sur "Connecter un appareil"</li>
                    <li>Scannez le QR code ci-dessus IMMÉDIATEMENT</li>
                    <li>Validez la connexion sur votre téléphone</li>
                </ol>
                
                <div style="margin-top: 20px; padding: 15px; background: #e7f3ff; border-radius: 8px;">
                    <strong>💡 Conseil important:</strong> Si la connexion échoue, utilisez le bouton "Nouvelle session" pour réinitialiser.
                </div>
            </div>
            
            <div class="footer">
                <p>🔧 <strong>META MD BOT</strong> - Édition Manga Premium</p>
                <p>🎌 Thèmes: Dandadan • Tokyo Ghoul • Jujutsu Kaisen</p>
                <p>📞 Support: ${config.ownerNumber}</p>
                <p>© ${new Date().getFullYear()} - Tous droits réservés</p>
            </div>
        </div>
        
        <script>
            // Mettre à jour le temps écoulé
            function updateUptime() {
                fetch('/status')
                    .then(res => res.json())
                    .then(data => {
                        const uptime = data.uptime || 0;
                        const hours = Math.floor(uptime / (1000 * 60 * 60));
                        const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
                        const seconds = Math.floor((uptime % (1000 * 60)) / 1000);
                        
                        document.getElementById('uptime').textContent = 
                            `${hours}h ${minutes}m ${seconds}s`;
                    });
            }
            
            // Réinitialiser la session
            function resetSession() {
                if(confirm('Êtes-vous sûr de vouloir réinitialiser la session? Toute connexion existante sera perdue.')) {
                    fetch('/reset-session', { method: 'POST' })
                        .then(res => res.json())
                        .then(data => {
                            alert(data.message);
                            location.reload();
                        })
                        .catch(() => {
                            alert('Erreur lors de la réinitialisation');
                        });
                }
            }
            
            // Afficher le QR dans le terminal
            function showTerminalQR() {
                fetch('/terminal-qr')
                    .then(res => res.json())
                    .then(data => {
                        if(data.success) {
                            alert('QR Code affiché dans le terminal du serveur!');
                        } else {
                            alert('Aucun QR Code disponible actuellement');
                        }
                    });
            }
            
            // Auto-refresh toutes les 3 secondes si en attente
            let refreshInterval;
            
            function startAutoRefresh() {
                if('${botStatus}' === 'Scanning' || !'${qrCodeUrl}') {
                    refreshInterval = setInterval(() => {
                        fetch('/status')
                            .then(res => res.json())
                            .then(data => {
                                if(data.status !== '${botStatus}' || data.qrCodeUrl !== '${qrCodeUrl}') {
                                    clearInterval(refreshInterval);
                                    location.reload();
                                }
                            });
                    }, 3000);
                }
            }
            
            // Démarrer les mises à jour
            updateUptime();
            startAutoRefresh();
            setInterval(updateUptime, 1000);
            
            // Rafraîchir la page si le QR change
            let lastQR = '${qrCodeUrl}';
            setInterval(() => {
                fetch('/status')
                    .then(res => res.json())
                    .then(data => {
                        if(data.qrCodeUrl !== lastQR || data.status !== '${botStatus}') {
                            location.reload();
                        }
                    });
            }, 2000);
        </script>
    </body>
    </html>`;
    
    res.send(html);
});

// API pour le statut
app.get('/status', (req, res) => {
    const uptime = Date.now() - startTime;
    res.json({
        status: botStatus,
        qrCodeUrl: qrCodeUrl,
        uptime: uptime,
        botName: config.botName,
        developer: config.owner,
        connected: botStatus === 'Connecté'
    });
});

// API pour réinitialiser la session
app.post('/reset-session', (req, res) => {
    try {
        // Supprimer le dossier de session
        if (fs.existsSync('./session')) {
            fs.rmSync('./session', { recursive: true, force: true });
        }
        
        // Réinitialiser les variables
        qrCodeUrl = null;
        botStatus = 'Déconnecté';
        currentQR = null;
        
        // Redémarrer la connexion
        setTimeout(() => {
            if (sock) {
                sock.end();
            }
            connectToWhatsApp();
        }, 1000);
        
        res.json({ 
            success: true, 
            message: 'Session réinitialisée avec succès! Redémarrage en cours...' 
        });
    } catch (error) {
        res.json({ 
            success: false, 
            message: 'Erreur: ' + error.message 
        });
    }
});

// API pour afficher le QR dans le terminal
app.get('/terminal-qr', (req, res) => {
    if (currentQR) {
        console.log('\n\n📟 QR CODE POUR LE TERMINAL:');
        qrcodeTerminal.generate(currentQR, { small: true });
        res.json({ success: true });
    } else {
        res.json({ success: false, message: 'Pas de QR disponible' });
    }
});

// API de santé
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        bot: config.botName,
        time: new Date().toISOString(),
        memory: process.memoryUsage(),
        uptime: process.uptime()
    });
});

// Gestion des erreurs 404
app.use((req, res) => {
    res.status(404).send(`
        <div style="text-align:center;padding:50px;font-family:Arial;">
            <h1>404 - Page non trouvée</h1>
            <p><a href="/">Retour à l'accueil</a></p>
        </div>
    `);
});

// Démarrer le serveur
const server = app.listen(PORT, () => {
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║                🌐 META MD BOT SERVEUR               ║');
    console.log('╠══════════════════════════════════════════════════════╣');
    console.log(`║ 📍 Port: ${PORT}`);
    console.log(`║ 🔗 URL: http://localhost:${PORT}`);
    console.log(`║ 🤖 Nom: ${config.botName}`);
    console.log(`║ 👨‍💻 Dev: ${config.owner}`);
    console.log('║ 📅 Démarrage: ' + new Date().toLocaleString());
    console.log('╚══════════════════════════════════════════════════════╝\n');
});

// Fonction principale de connexion WhatsApp
async function connectToWhatsApp() {
    try {
        console.log('🔗 Tentative de connexion à WhatsApp...');
        
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
            browser: Browsers.ubuntu('Chrome'),
            connectTimeoutMs: 60000,
            keepAliveIntervalMs: 15000,
            defaultQueryTimeoutMs: 60000,
            maxRetries: 10,
            emitOwnEvents: true,
            generateHighQualityLinkPreview: true,
            syncFullHistory: true,
            fireInitQueries: true,
            markOnlineOnConnect: true,
            linkPreviewImageThumbnailWidth: 192,
            transactionOpts: {
                maxCommitRetries: 10,
                delayBetweenTriesMs: 3000
            },
            getMessage: async (key) => {
                return null;
            },
            msgRetryCounterCache
        });

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            if (qr) {
                botStatus = 'Scanning';
                currentQR = qr;
                console.log('\n📱 NOUVEAU QR CODE GÉNÉRÉ');
                console.log('⏰ Scannez-le rapidement (expire dans 60 secondes)');
                
                try {
                    qrcodeTerminal.generate(qr, { small: true });
                    const qrCodeDataUrl = await qrcode.toDataURL(qr);
                    qrCodeUrl = qrCodeDataUrl;
                    
                    console.log(`🌐 QR Code disponible sur: http://localhost:${PORT}`);
                    console.log('💡 Conseil: Scannez IMMÉDIATEMENT avec WhatsApp!');
                } catch (error) {
                    console.error('❌ Erreur génération QR:', error.message);
                    qrcodeTerminal.generate(qr, { small: true });
                }
            }

            if (connection === 'close') {
                botStatus = 'Déconnecté';
                qrCodeUrl = null;
                currentQR = null;
                
                const reason = lastDisconnect?.error?.output?.statusCode;
                console.log(`\n🔌 Connexion fermée (Raison: ${reason || 'inconnue'})`);
                
                // Vérifier si c'est une déconnexion normale
                const shouldReconnect = reason !== DisconnectReason.loggedOut;
                
                if (shouldReconnect) {
                    console.log('🔄 Reconnexion dans 5 secondes...');
                    await delay(5000);
                    connectToWhatsApp();
                } else {
                    console.log('❌ Session déconnectée manuellement. Nouveau QR requis.');
                }
            } 
            else if (connection === 'open') {
                botStatus = 'Connecté';
                qrCodeUrl = null;
                currentQR = null;
                startTime = Date.now();
                
                console.log('\n' + '='.repeat(50));
                console.log('✅ BOT CONNECTÉ AVEC SUCCÈS!');
                console.log('='.repeat(50));
                console.log(`🤖 Nom: ${config.botName}`);
                console.log(`👨‍💻 Développeur: ${config.owner}`);
                console.log(`📅 Connecté à: ${new Date().toLocaleString()}`);
                console.log(`🌐 Interface: http://localhost:${PORT}`);
                console.log('='.repeat(50) + '\n');
                
                // Envoyer un message au propriétaire
                if (config.ownerNumber) {
                    try {
                        const cleanNumber = config.ownerNumber.replace(/\D/g, '');
                        const jid = cleanNumber + '@s.whatsapp.net';
                        
                        await sock.sendMessage(jid, { 
                            text: `✅ *${config.botName} EST MAINTENANT EN LIGNE!*\n\n📱 Connexion établie avec succès\n⏰ ${new Date().toLocaleString()}\n🌐 Interface: http://localhost:${PORT}\n\n_Signature: by ${config.owner}_`
                        });
                        console.log(`📨 Notification envoyée au propriétaire: ${cleanNumber}`);
                    } catch (error) {
                        console.log('⚠️ Impossible d\'envoyer la notification:', error.message);
                    }
                }
            }
            else if (connection === 'connecting') {
                botStatus = 'Connexion...';
                console.log('🔄 Connexion en cours...');
            }
        });

        sock.ev.on('creds.update', saveCreds);
        
        // Gestion des messages
        sock.ev.on('messages.upsert', async ({ messages }) => {
            try {
                const msg = messages[0];
                if (!msg.message) return;
                
                const from = msg.key.remoteJid;
                const text = msg.message.conversation || 
                            msg.message.extendedTextMessage?.text || 
                            msg.message.imageMessage?.caption || '';
                
                if (!text.startsWith(config.prefix)) return;
                
                const cmd = text.slice(config.prefix.length).trim().toLowerCase().split(' ')[0];
                const args = text.slice(config.prefix.length + cmd.length).trim();
                
                // Menu d'aide
                if (cmd === 'menu' || cmd === 'help' || cmd === 'aide') {
                    const menu = `🤖 *${config.botName}*\n\n` +
                                `👨‍💻 Développeur: ${config.owner}\n` +
                                `🔧 Prefix: ${config.prefix}\n\n` +
                                `*📋 COMMANDES DISPONIBLES:*\n\n` +
                                `• ${config.prefix}menu - Afficher ce menu\n` +
                                `• ${config.prefix}ping - Tester la latence\n` +
                                `• ${config.prefix}alive - Vérifier le statut\n` +
                                `• ${config.prefix}time - Heure actuelle\n` +
                                `• ${config.prefix}owner - Contacter le dev\n\n` +
                                `${config.footer}`;
                    
                    await sock.sendMessage(from, {
                        image: { url: config.getRandomMangaImage() },
                        caption: menu
                    }, { quoted: msg });
                }
                
                // Commande ping
                else if (cmd === 'ping') {
                    const start = Date.now();
                    await sock.sendMessage(from, { 
                        text: `🏓 *Pong!*\n\n` +
                              `📶 Latence: ${Date.now() - start}ms\n\n` +
                              `${config.footer}`
                    }, { quoted: msg });
                }
                
                // Commande alive
                else if (cmd === 'alive' || cmd === 'status') {
                    const uptime = Date.now() - startTime;
                    const hours = Math.floor(uptime / (1000 * 60 * 60));
                    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((uptime % (1000 * 60)) / 1000);
                    
                    const aliveMsg = `✅ *${config.botName} EN LIGNE!*\n\n` +
                                    `⏱️ Uptime: ${hours}h ${minutes}m ${seconds}s\n` +
                                    `👤 Développeur: ${config.owner}\n` +
                                    `📅 Démarrage: ${new Date(startTime).toLocaleString()}\n\n` +
                                    `${config.footer}`;
                    
                    await sock.sendMessage(from, {
                        image: { url: config.getRandomMangaImage() },
                        caption: aliveMsg
                    }, { quoted: msg });
                }
                
                // Commande time
                else if (cmd === 'time' || cmd === 'heure') {
                    const now = new Date();
                    await sock.sendMessage(from, { 
                        text: `🕐 *HEURE ACTUELLE*\n\n` +
                              `📅 Date: ${now.toLocaleDateString()}\n` +
                              `⏰ Heure: ${now.toLocaleTimeString()}\n` +
                              `🌍 Fuseau: UTC${now.getTimezoneOffset() / -60}\n\n` +
                              `${config.footer}`
                    }, { quoted: msg });
                }
                
                // Commande owner
                else if (cmd === 'owner' || cmd === 'dev') {
                    await sock.sendMessage(from, { 
                        text: `👨‍💻 *CONTACTER LE DÉVELOPPEUR*\n\n` +
                              `📛 Nom: ${config.owner}\n` +
                              `📞 WhatsApp: ${config.ownerNumber}\n\n` +
                              `💬 Contactez-moi pour:\n` +
                              `• Support technique\n` +
                              `• Développement de bots\n` +
                              `• Projets personnalisés\n\n` +
                              `${config.footer}`
                    }, { quoted: msg });
                }
                
            } catch (error) {
                console.error('❌ Erreur dans le handler:', error.message);
            }
        });
        
        // Gestion des erreurs de connexion
        sock.ev.on('connection.update', (update) => {
            if (update.qr) {
                console.log('🔑 QR Code reçu, prêt à scanner');
            }
            if (update.connection === 'close') {
                if (update.lastDisconnect?.error?.message?.includes('401')) {
                    console.log('❌ Session expirée. Nouvelle connexion requise.');
                }
            }
        });
        
        return sock;
        
    } catch (error) {
        console.error('❌ ERREUR CRITIQUE lors de la connexion:', error);
        botStatus = 'Erreur';
        
        // Tentative de reconnexion après 10 secondes
        setTimeout(() => {
            console.log('🔄 Nouvelle tentative de connexion...');
            connectToWhatsApp();
        }, 10000);
        
        return null;
    }
}

// Gestion des signaux système
process.on('SIGINT', () => {
    console.log('\n\n👋 Arrêt du bot...');
    if (sock) {
        sock.end();
    }
    server.close(() => {
        console.log('✅ Serveur arrêté proprement');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n\n🔚 Arrêt demandé...');
    if (sock) {
        sock.end();
    }
    server.close(() => {
        process.exit(0);
    });
});

process.on('uncaughtException', (err) => {
    console.error('❌ ERREUR NON CATCHÉE:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ PROMESSE REJETÉE:', reason);
});

// Démarrer l'application
console.log('🚀 Démarrage de META MD BOT...');
console.log(`👨‍💻 Développeur: ${config.owner}`);
console.log(`🤖 Version: 2.0.0`);
console.log(`📅 ${new Date().toLocaleString()}\n`);

// Démarrer la connexion WhatsApp
connectToWhatsApp().catch(err => {
    console.error('❌ ERREUR AU DÉMARRAGE:', err);
});
