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
const { exec } = require('child_process');

// ========== CONFIGURATION ==========
const config = {
    botName: "META MD BOT",
    owner: "PRECIEUX OKITAKOY",
    ownerNumber: "243894697490",
    prefix: ".",
    footer: "by PRECIEUX OKITAKOY",
    
    // Important: Configuration anti-blocage
    browserConfig: Browsers.windows('Chrome', '120.0.0.0'),
    connectTimeout: 45000,
    maxRetries: 3,
    qrDuration: 5 * 60 * 1000, // 5 minutes (WhatsApp limite à 5 min max)
    
    // URLs des images de fallback
    defaultAvatar: "https://i.imgur.com/3NQ2z9D.png"
};

// ========== NETTOYAGE COMPLET ==========
console.log('🔧 META MD BOT - DÉMARRAGE');
console.log('🧹 Nettoyage des sessions problématiques...');

// Supprimer TOUTES les sessions précédentes
const cleanDirs = ['./session', './temp', './auth_info', './creds'];
cleanDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
        try {
            fs.rmSync(dir, { recursive: true, force: true });
            console.log(`✅ ${dir} supprimé`);
        } catch (err) {
            console.log(`⚠️  ${dir} non supprimé: ${err.message}`);
        }
    }
});

// Recréer les dossiers nécessaires
['./session', './temp', './public'].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// ========== VARIABLES GLOBALES ==========
const msgRetryCounterCache = new NodeCache();
let botStatus = '🔄 Initialisation...';
let sock = null;
let currentQR = null;
let qrGeneratedAt = 0;
let qrImageUrl = null;
let isConnected = false;
let retryCount = 0;
const MAX_RETRIES = 3;
let connectionAttempts = 0;

// ========== APPLICATION EXPRESS ==========
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

// ========== FONCTION CRITIQUE : Génération QR ==========
async function generateAndSaveQR(qrData) {
    try {
        console.log('🔄 Génération du QR Code pour le site web...');
        
        // Générer QR avec options optimisées
        const qrDataUrl = await QRCode.toDataURL(qrData, {
            width: 350,
            height: 350,
            margin: 1,
            color: {
                dark: '#000000FF',
                light: '#FFFFFFFF'
            },
            errorCorrectionLevel: 'M'
        });
        
        qrImageUrl = qrDataUrl;
        currentQR = qrData;
        qrGeneratedAt = Date.now();
        
        console.log('✅ QR Code généré avec succès!');
        console.log(`⏰ Expiration: ${new Date(qrGeneratedAt + config.qrDuration).toLocaleTimeString()}`);
        console.log(`🔗 Disponible sur: ${process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`}`);
        
        return qrDataUrl;
    } catch (error) {
        console.error('❌ Erreur génération QR:', error);
        
        // Fallback: QR code basique
        const fallbackQR = `data:image/svg+xml,${encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="350" height="350">
                <rect width="100%" height="100%" fill="white"/>
                <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial" font-size="14">
                    QR Code WhatsApp
                </text>
            </svg>
        `)}`;
        
        qrImageUrl = fallbackQR;
        return fallbackQR;
    }
}

// ========== ROUTES WEB ==========
app.get('/', (req, res) => {
    const statusColor = botStatus.includes('✅') ? 'success' : 
                       botStatus.includes('🔄') ? 'warning' : 
                       botStatus.includes('❌') ? 'error' : 'info';
    
    const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>META MD BOT - Connexion WhatsApp</title>
        <style>
            :root {
                --primary: #667eea;
                --secondary: #764ba2;
                --success: #28a745;
                --warning: #ffc107;
                --danger: #dc3545;
                --info: #17a2b8;
            }
            
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
                background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
                min-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 20px;
                color: #333;
            }
            
            .container {
                background: white;
                border-radius: 20px;
                padding: 40px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                width: 100%;
                max-width: 800px;
                text-align: center;
            }
            
            .header {
                margin-bottom: 30px;
            }
            
            .logo {
                font-size: 3.5em;
                margin-bottom: 10px;
            }
            
            h1 {
                color: #2d3748;
                font-size: 2.2em;
                margin-bottom: 5px;
            }
            
            .subtitle {
                color: #718096;
                font-size: 1.1em;
                margin-bottom: 20px;
            }
            
            .status-container {
                margin: 25px 0;
            }
            
            .status-badge {
                display: inline-block;
                padding: 12px 25px;
                border-radius: 50px;
                font-weight: 600;
                font-size: 1.1em;
                letter-spacing: 0.5px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            
            .status-success {
                background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
                color: #155724;
                border: 2px solid #28a745;
            }
            
            .status-warning {
                background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
                color: #856404;
                border: 2px solid #ffc107;
            }
            
            .status-error {
                background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
                color: #721c24;
                border: 2px solid #dc3545;
            }
            
            .status-info {
                background: linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%);
                color: #0c5460;
                border: 2px solid #17a2b8;
            }
            
            .qr-section {
                margin: 40px 0;
                padding: 30px;
                background: #f8fafc;
                border-radius: 15px;
                border: 2px solid #e2e8f0;
            }
            
            .qr-title {
                font-size: 1.3em;
                color: #4a5568;
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
            }
            
            .qr-box {
                display: inline-block;
                padding: 20px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 8px 25px rgba(0,0,0,0.1);
                border: 2px solid #cbd5e0;
                margin-bottom: 20px;
            }
            
            .qr-image {
                width: 320px;
                height: 320px;
                border-radius: 8px;
                display: block;
            }
            
            .qr-loading {
                width: 320px;
                height: 320px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #edf2f7;
                border-radius: 8px;
                font-size: 1.1em;
                color: #718096;
            }
            
            .qr-timer {
                margin-top: 15px;
                font-size: 1.1em;
                font-weight: 600;
                color: #4a5568;
                padding: 10px 20px;
                background: #edf2f7;
                border-radius: 8px;
                display: inline-block;
            }
            
            .qr-expired {
                color: #e53e3e;
                background: #fed7d7;
            }
            
            .qr-instructions {
                margin-top: 20px;
                font-size: 0.95em;
                color: #718096;
                max-width: 500px;
                margin-left: auto;
                margin-right: auto;
            }
            
            .actions {
                margin: 30px 0;
                display: flex;
                justify-content: center;
                flex-wrap: wrap;
                gap: 15px;
            }
            
            .btn {
                padding: 14px 28px;
                border: none;
                border-radius: 10px;
                font-size: 1em;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                min-width: 180px;
            }
            
            .btn-primary {
                background: linear-gradient(135deg, var(--primary) 0%, #5a67d8 100%);
                color: white;
            }
            
            .btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
            }
            
            .btn-success {
                background: linear-gradient(135deg, var(--success) 0%, #218838 100%);
                color: white;
            }
            
            .btn-success:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(40, 167, 69, 0.4);
            }
            
            .btn-danger {
                background: linear-gradient(135deg, var(--danger) 0%, #c82333 100%);
                color: white;
            }
            
            .btn-danger:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(220, 53, 69, 0.4);
            }
            
            .btn-warning {
                background: linear-gradient(135deg, var(--warning) 0%, #e0a800 100%);
                color: #212529;
            }
            
            .btn-warning:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(255, 193, 7, 0.4);
            }
            
            .instructions {
                text-align: left;
                background: #f7fafc;
                padding: 30px;
                border-radius: 15px;
                margin-top: 40px;
                border-left: 5px solid var(--primary);
            }
            
            .instructions h3 {
                color: #2d3748;
                margin-bottom: 20px;
                font-size: 1.4em;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .steps {
                list-style: none;
                counter-reset: step-counter;
                padding: 0;
            }
            
            .steps li {
                counter-increment: step-counter;
                margin: 18px 0;
                padding: 20px 20px 20px 70px;
                background: white;
                border-radius: 10px;
                position: relative;
                border: 1px solid #e2e8f0;
                transition: all 0.3s;
                font-size: 1.05em;
            }
            
            .steps li:hover {
                transform: translateX(8px);
                border-color: var(--primary);
                box-shadow: 0 5px 15px rgba(0,0,0,0.05);
            }
            
            .steps li:before {
                content: counter(step-counter);
                position: absolute;
                left: 20px;
                top: 50%;
                transform: translateY(-50%);
                background: var(--primary);
                color: white;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 1.1em;
                box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
            }
            
            .troubleshooting {
                margin-top: 30px;
                padding: 25px;
                background: #fff3cd;
                border-radius: 10px;
                border: 2px solid #ffeaa7;
                text-align: left;
            }
            
            .troubleshooting h4 {
                color: #856404;
                margin-bottom: 15px;
                font-size: 1.2em;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .troubleshooting ul {
                list-style: none;
                padding: 0;
            }
            
            .troubleshooting li {
                margin: 12px 0;
                padding-left: 30px;
                position: relative;
            }
            
            .troubleshooting li:before {
                content: "⚠️";
                position: absolute;
                left: 0;
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
                border-top: 4px solid var(--primary);
                box-shadow: 0 5px 15px rgba(0,0,0,0.05);
                transition: transform 0.3s;
            }
            
            .info-card:hover {
                transform: translateY(-5px);
            }
            
            .info-card h4 {
                color: #2d3748;
                margin-bottom: 10px;
                font-size: 1.1em;
            }
            
            .info-card p {
                color: #718096;
                font-size: 0.95em;
            }
            
            .footer {
                margin-top: 50px;
                padding-top: 25px;
                border-top: 1px solid #e2e8f0;
                color: #718096;
                font-size: 0.9em;
            }
            
            .footer p {
                margin: 8px 0;
            }
            
            .version {
                font-size: 0.8em;
                color: #a0aec0;
                margin-top: 15px;
            }
            
            @media (max-width: 768px) {
                .container {
                    padding: 25px;
                }
                
                h1 {
                    font-size: 1.8em;
                }
                
                .qr-image, .qr-loading {
                    width: 280px;
                    height: 280px;
                }
                
                .btn {
                    width: 100%;
                }
                
                .actions {
                    flex-direction: column;
                }
            }
            
            @media (max-width: 480px) {
                .qr-image, .qr-loading {
                    width: 250px;
                    height: 250px;
                }
                
                .container {
                    padding: 20px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🤖</div>
                <h1>META MD BOT</h1>
                <p class="subtitle">Connexion WhatsApp sécurisée avec QR Code</p>
            </div>
            
            <div class="status-container">
                <div class="status-badge status-${statusColor}">
                    ${botStatus}
                </div>
            </div>
            
            ${botStatus.includes('✅ Connecté') ? 
                `<div style="margin: 25px 0; padding: 20px; background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); 
                    border-radius: 12px; border: 2px solid #28a745; color: #155724; font-weight: 600;">
                    🎉 Connexion réussie! Le bot est maintenant opérationnel.
                </div>` 
                : ''
            }
            
            <div class="qr-section">
                <div class="qr-title">
                    <span>📱</span> QR Code de connexion WhatsApp
                </div>
                
                <div class="qr-box">
                    ${qrImageUrl ? 
                        `<img src="${qrImageUrl}" alt="QR Code WhatsApp" class="qr-image" id="qrImage">` 
                        : 
                        `<div class="qr-loading">
                            <div>
                                <div style="margin-bottom: 10px;">⏳</div>
                                Génération du QR Code...
                            </div>
                        </div>`
                    }
                </div>
                
                ${qrImageUrl ? 
                    `<div class="qr-timer" id="qrTimer">
                        ⏳ QR Code valide: <span id="timerValue">05:00</span>
                    </div>
                    <p class="qr-instructions">
                        Scannez ce code dans WhatsApp → Paramètres → Appareils connectés
                    </p>` 
                    : ''
                }
            </div>
            
            ${!botStatus.includes('✅ Connecté') && qrImageUrl ? 
                `<div class="troubleshooting">
                    <h4><span>🚨</span> Problème de connexion?</h4>
                    <ul>
                        <li><strong>Déconnectez TOUS les appareils</strong> dans WhatsApp → Appareils connectés</li>
                        <li>Assurez-vous d'avoir <strong>moins de 4 appareils connectés</strong></li>
                        <li>Vérifiez votre connexion internet</li>
                        <li>Redémarrez WhatsApp sur votre téléphone</li>
                        <li>Scannez le QR code <strong>dans les 5 minutes</strong></li>
                    </ul>
                </div>` 
                : ''
            }
            
            <div class="info-grid">
                <div class="info-card">
                    <h4>👨‍💻 Développeur</h4>
                    <p>${config.owner}</p>
                </div>
                <div class="info-card">
                    <h4>📞 Contact</h4>
                    <p>${config.ownerNumber}</p>
                </div>
                <div class="info-card">
                    <h4>⏱️ Durée QR</h4>
                    <p>5 minutes</p>
                </div>
                <div class="info-card">
                    <h4>🔄 Reconnexion</h4>
                    <p>Automatique</p>
                </div>
            </div>
            
            <div class="actions">
                <button class="btn btn-primary" onclick="location.reload()">
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
                
                ${botStatus.includes('✅ Connecté') ? 
                    `<button class="btn btn-danger" onclick="disconnectBot()">
                        ⏹️ Déconnecter
                    </button>` 
                    : ''
                }
            </div>
            
            <div class="instructions">
                <h3><span>📋</span> Instructions étape par étape</h3>
                <ol class="steps">
                    <li>Ouvrez <strong>WhatsApp</strong> sur votre téléphone</li>
                    <li>Cliquez sur les <strong>3 points (⋮)</strong> en haut à droite</li>
                    <li>Sélectionnez <strong>"Appareils connectés"</strong></li>
                    <li>Appuyez sur <strong>"Connecter un appareil"</strong></li>
                    <li><strong>Scannez le QR Code</strong> ci-dessus avec votre caméra</li>
                    <li>Appuyez sur <strong>"Connexion"</strong> pour confirmer</li>
                    <li>Le bot se connectera <strong>automatiquement</strong></li>
                </ol>
            </div>
            
            <div class="footer">
                <p><strong>🤖 META MD BOT</strong> - Version anti-blocage WhatsApp</p>
                <p>👨‍💻 Développé par: ${config.owner}</p>
                <p>📞 Support: ${config.ownerNumber}</p>
                <p>🚀 Hébergé sur Render.com | Système de connexion optimisé</p>
                <p class="version">Version 7.0 | ${new Date().getFullYear()} © Tous droits réservés</p>
            </div>
        </div>
        
        <script>
            // Timer pour le QR code
            function updateQRTimer() {
                const timerElement = document.getElementById('timerValue');
                const qrTimerElement = document.getElementById('qrTimer');
                if (!timerElement || !qrTimerElement) return;
                
                const qrDuration = 300; // 5 minutes en secondes
                const qrStartTime = ${qrGeneratedAt};
                const now = Date.now();
                const elapsed = Math.floor((now - qrStartTime) / 1000);
                const remaining = qrDuration - elapsed;
                
                if (remaining > 0) {
                    const minutes = Math.floor(remaining / 60);
                    const seconds = remaining % 60;
                    timerElement.textContent = 
                        minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
                    
                    // Changement de couleur quand moins de 1 minute
                    if (remaining < 60) {
                        qrTimerElement.style.background = '#fed7d7';
                        qrTimerElement.style.color = '#c53030';
                    }
                } else {
                    timerElement.textContent = '00:00';
                    qrTimerElement.classList.add('qr-expired');
                    timerElement.textContent = 'EXPIRÉ';
                    
                    // Demander un nouveau QR
                    if (!${isConnected}) {
                        setTimeout(() => {
                            if (confirm('QR Code expiré. Voulez-vous en générer un nouveau?')) {
                                forceNewQR();
                            }
                        }, 1000);
                    }
                }
            }
            
            // Télécharger le QR code
            function downloadQR() {
                const qrImage = document.getElementById('qrImage');
                if (qrImage) {
                    const link = document.createElement('a');
                    link.href = qrImage.src;
                    link.download = 'whatsapp-qr-code-meta-md-bot.png';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            }
            
            // Forcer un nouveau QR code
            function forceNewQR() {
                if (confirm('Générer un nouveau QR Code? L\'ancien deviendra invalide.')) {
                    fetch('/api/new-qr', { method: 'POST' })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                alert('Nouveau QR Code en cours de génération...');
                                setTimeout(() => location.reload(), 2000);
                            } else {
                                alert('Erreur: ' + data.message);
                            }
                        })
                        .catch(() => {
                            alert('Erreur de communication avec le serveur');
                        });
                }
            }
            
            // Déconnecter le bot
            function disconnectBot() {
                if (confirm('Déconnecter le bot? Vous devrez re-scanner le QR Code pour vous reconnecter.')) {
                    fetch('/api/disconnect', { method: 'POST' })
                        .then(() => {
                            alert('Bot déconnecté. Actualisation de la page...');
                            setTimeout(() => location.reload(), 1500);
                        });
                }
            }
            
            // Vérification automatique de l'état
            function checkStatus() {
                fetch('/api/status')
                    .then(response => response.json())
                    .then(data => {
                        // Si le statut a changé, recharger la page
                        if (data.status !== '${botStatus}' || data.connected !== ${isConnected}) {
                            console.log('Statut changé, rechargement...');
                            setTimeout(() => location.reload(), 1000);
                        }
                        
                        // Mettre à jour l'indicateur de connexion
                        const statusIndicator = document.querySelector('.status-badge');
                        if (statusIndicator && data.connected) {
                            statusIndicator.classList.remove('status-warning', 'status-error', 'status-info');
                            statusIndicator.classList.add('status-success');
                        }
                    })
                    .catch(error => {
                        console.error('Erreur vérification statut:', error);
                    });
            }
            
            // Initialisation
            document.addEventListener('DOMContentLoaded', function() {
                // Démarrer le timer si QR disponible
                if (${qrGeneratedAt} > 0) {
                    updateQRTimer();
                    setInterval(updateQRTimer, 1000);
                }
                
                // Vérifier le statut toutes les 3 secondes
                setInterval(checkStatus, 3000);
                
                // Auto-rechargement si en attente de QR
                if (!'${qrImageUrl}' && !${isConnected}) {
                    setTimeout(() => {
                        if (!'${qrImageUrl}') {
                            console.log('Auto-rechargement pour QR...');
                            location.reload();
                        }
                    }, 5000);
                }
                
                // Notification si QR bientôt expiré
                setTimeout(() => {
                    if (!${isConnected} && ${qrGeneratedAt} > 0) {
                        const elapsed = Date.now() - ${qrGeneratedAt};
                        if (elapsed > 240000) { // 4 minutes
                            if (confirm('QR Code bientôt expiré (1 minute restante). Voulez-vous un nouveau QR?')) {
                                forceNewQR();
                            }
                        }
                    }
                }, 241000);
            });
        </script>
    </body>
    </html>`;
    
    res.send(html);
});

// ========== API ENDPOINTS ==========
app.get('/api/status', (req, res) => {
    res.json({
        status: botStatus,
        connected: isConnected,
        hasQR: !!qrImageUrl,
        qrAge: qrGeneratedAt ? Date.now() - qrGeneratedAt : 0,
        qrValid: qrGeneratedAt ? (Date.now() - qrGeneratedAt < config.qrDuration) : false,
        botName: config.botName,
        connectionAttempts: connectionAttempts,
        retryCount: retryCount
    });
});

app.post('/api/new-qr', (req, res) => {
    if (sock) {
        // Réinitialiser les variables QR
        qrImageUrl = null;
        currentQR = null;
        qrGeneratedAt = 0;
        
        // Forcer une nouvelle génération
        botStatus = '🔄 Génération nouveau QR...';
        
        res.json({ 
            success: true, 
            message: 'Nouveau QR Code en cours de génération' 
        });
    } else {
        res.json({ 
            success: false, 
            message: 'Bot non initialisé. Veuillez attendre.' 
        });
    }
});

app.post('/api/disconnect', (req, res) => {
    if (sock) {
        sock.end();
        botStatus = '❌ Déconnecté manuellement';
        isConnected = false;
        res.json({ success: true, message: 'Bot déconnecté' });
    } else {
        res.json({ success: false, message: 'Bot non connecté' });
    }
});

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        bot: config.botName,
        connected: isConnected,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

// ========== FONCTION DE CONNEXION WHATSAPP ==========
async function connectToWhatsApp() {
    connectionAttempts++;
    
    if (connectionAttempts > MAX_RETRIES) {
        console.error('❌ TROP DE TENTATIVES. Attendez 10 minutes.');
        botStatus = '❌ Trop de tentatives - Attendez 10 min';
        setTimeout(() => {
            connectionAttempts = 0;
            connectToWhatsApp();
        }, 600000);
        return;
    }
    
    console.log(`🔗 Tentative de connexion ${connectionAttempts}/${MAX_RETRIES}...`);
    botStatus = '🔄 Connexion en cours...';
    
    try {
        const { state, saveCreds } = await useMultiFileAuthState('./session');
        const { version } = await fetchLatestBaileysVersion();

        console.log('📦 Baileys version:', version);
        
        // Configuration OPTIMISÉE pour éviter les blocages
        sock = makeWASocket({
            version,
            printQRInTerminal: false,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, { level: 'fatal' })
            },
            browser: config.browserConfig,
            connectTimeoutMs: config.connectTimeout,
            keepAliveIntervalMs: 25000,
            defaultQueryTimeoutMs: 30000,
            emitOwnEvents: true,
            generateHighQualityLinkPreview: false, // Désactivé pour éviter les flags
            syncFullHistory: false,
            fireInitQueries: true,
            markOnlineOnConnect: false, // Désactivé au début
            getMessage: async () => null,
            msgRetryCounterCache,
            transactionOpts: {
                maxCommitRetries: 2,
                delayBetweenTriesMs: 1000
            },
            // Désactiver les features qui peuvent trigger des blocages
            linkPreviewImageThumbnailWidth: 0,
            qrTimeout: config.qrDuration,
            mobile: false
        });

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            // QR Code reçu
            if (qr && qr !== currentQR) {
                botStatus = '📱 QR Code disponible - Scannez!';
                console.log('\n' + '='.repeat(60));
                console.log('📱 NOUVEAU QR CODE DISPONIBLE!');
                console.log('='.repeat(60));
                
                await generateAndSaveQR(qr);
                currentQR = qr;
                
                // Réinitialiser le compteur de tentatives quand un nouveau QR arrive
                retryCount = 0;
                
                console.log('='.repeat(60));
                console.log('⚠️  IMPORTANT:');
                console.log('1. Scannez RAPIDEMENT ce QR code');
                console.log('2. Vérifiez que vous avez moins de 4 appareils connectés');
                console.log('3. Déconnectez les anciens appareils si nécessaire');
                console.log('='.repeat(60) + '\n');
            }

            // Gestion des déconnexions
            if (connection === 'close') {
                const reason = lastDisconnect?.error?.output?.statusCode;
                console.log(`🔌 Déconnexion détectée (Code: ${reason || 'Inconnu'})`);
                
                botStatus = '❌ Déconnecté';
                isConnected = false;
                
                // Analyser la raison
                switch (reason) {
                    case 401: // Unauthorized - Session expirée
                        console.log('🔑 Session expirée. Nouvelle session requise.');
                        botStatus = '🔑 Session expirée - Nouveau QR nécessaire';
                        
                        // Supprimer la session corrompue
                        if (fs.existsSync('./session')) {
                            fs.rmSync('./session', { recursive: true, force: true });
                            fs.mkdirSync('./session', { recursive: true });
                        }
                        
                        // Attendre avant de réessayer
                        setTimeout(() => connectToWhatsApp(), 10000);
                        break;
                        
                    case 403: // Forbidden - Compte bloqué
                        console.log('🚫 COMPTE BLOQUÉ TEMPORAIREMENT! Attendez 24h.');
                        botStatus = '🚫 Compte bloqué - Attendez 24h';
                        break;
                        
                    case 429: // Too Many Requests
                        console.log('⚠️ Trop de requêtes. Pause de 30 secondes...');
                        botStatus = '⚠️ Trop de requêtes - Pause';
                        setTimeout(() => connectToWhatsApp(), 30000);
                        break;
                        
                    default:
                        // Autres déconnexions - Reconnexion standard
                        const shouldReconnect = reason !== DisconnectReason.loggedOut;
                        retryCount++;
                        
                        if (shouldReconnect && retryCount <= config.maxRetries) {
                            console.log(`🔄 Reconnexion ${retryCount}/${config.maxRetries} dans 5 secondes...`);
                            botStatus = `🔄 Reconnexion ${retryCount}/${config.maxRetries}`;
                            await delay(5000);
                            connectToWhatsApp();
                        } else if (shouldReconnect) {
                            console.log('⚠️ Trop de tentatives de reconnexion. Pause...');
                            botStatus = '⚠️ Pause avant nouvelle tentative';
                            setTimeout(() => {
                                retryCount = 0;
                                connectToWhatsApp();
                            }, 30000);
                        }
                        break;
                }
            } 
            // Connexion réussie
            else if (connection === 'open') {
                botStatus = '✅ Connecté avec succès!';
                isConnected = true;
                retryCount = 0;
                connectionAttempts = 0;
                
                console.log('\n' + '='.repeat(60));
                console.log('🎉 🎉 🎉 CONNEXION RÉUSSIE! 🎉 🎉 🎉');
                console.log('='.repeat(60));
                console.log(`🤖 Bot: ${config.botName}`);
                console.log(`👤 Développeur: ${config.owner}`);
                console.log(`📅 Connecté à: ${new Date().toLocaleString()}`);
                console.log(`🌐 URL: ${process.env.RENDER_EXTERNAL_URL || 'Local'}`);
                console.log('='.repeat(60));
                console.log('✅ Le bot est maintenant opérationnel');
                console.log('💾 Session sauvegardée pour reconnexions futures');
                console.log('='.repeat(60) + '\n');
                
                // Activer le statut online
                sock.sendPresenceUpdate('available');
                
                // Notification au propriétaire
                if (config.ownerNumber && sock) {
                    setTimeout(async () => {
                        try {
                            const cleanNumber = config.ownerNumber.replace(/\D/g, '');
                            const jid = `${cleanNumber}@s.whatsapp.net`;
                            
                            await sock.sendMessage(jid, {
                                text: `✅ *${config.botName} CONNECTÉ AVEC SUCCÈS!*\n\n` +
                                      `📱 Connexion WhatsApp établie\n` +
                                      `⏰ ${new Date().toLocaleString()}\n` +
                                      `🌐 ${process.env.RENDER_EXTERNAL_URL || 'Serveur Local'}\n` +
                                      `🔧 Version: Anti-blocage 7.0\n\n` +
                                      `_${config.footer}_`
                            });
                            
                            console.log('📨 Notification envoyée au propriétaire');
                        } catch (error) {
                            console.log('⚠️ Notification non envoyée:', error.message);
                        }
                    }, 3000);
                }
            }
            // En cours de connexion
            else if (connection === 'connecting') {
                console.log('🔄 Connexion à WhatsApp en cours...');
                botStatus = '🔄 Connexion en cours...';
            }
        });

        sock.ev.on('creds.update', saveCreds);
        
        // Gestion des messages entrants
        sock.ev.on('messages.upsert', async ({ messages }) => {
            try {
                const msg = messages[0];
                if (!msg.message || !isConnected) return;
                
                const from = msg.key.remoteJid;
                const text = msg.message.conversation || 
                           msg.message.extendedTextMessage?.text || '';
                
                if (!text.startsWith(config.prefix)) return;
                
                const cmd = text.slice(config.prefix.length).trim().toLowerCase().split(' ')[0];
                
                // Commande ping
                if (cmd === 'ping') {
                    const startTime = Date.now();
                    await sock.sendMessage(from, {
                        text: `🏓 *Pong!*\n\n` +
                              `📶 Latence: ${Date.now() - startTime}ms\n` +
                              `🤖 ${config.botName}\n` +
                              `${config.footer}`
                    });
                }
                
                // Commande menu
                else if (cmd === 'menu' || cmd === 'help') {
                    await sock.sendMessage(from, {
                        text: `🤖 *${config.botName}*\n\n` +
                              `👨‍💻 Développeur: ${config.owner}\n` +
                              `📞 Contact: ${config.ownerNumber}\n` +
                              `🔧 Prefix: ${config.prefix}\n\n` +
                              `*📋 COMMANDES DISPONIBLES:*\n\n` +
                              `• ${config.prefix}ping - Test de réponse\n` +
                              `• ${config.prefix}menu - Afficher ce menu\n` +
                              `• ${config.prefix}status - Statut du bot\n` +
                              `• ${config.prefix}owner - Contacter le dev\n\n` +
                              `*⚙️ SYSTÈME:*\n` +
                              `• QR Code: 5 minutes\n` +
                              `• Reconnexion: Automatique\n` +
                              `• Version: Anti-blocage 7.0\n\n` +
                              `${config.footer}`
                    });
                }
                
                // Commande status
                else if (cmd === 'status' || cmd === 'info') {
                    const uptime = process.uptime();
                    const hours = Math.floor(uptime / 3600);
                    const minutes = Math.floor((uptime % 3600) / 60);
                    const seconds = Math.floor(uptime % 60);
                    
                    await sock.sendMessage(from, {
                        text: `📊 *STATUT ${config.botName}*\n\n` +
                              `🔗 Connexion: ${isConnected ? '✅ Connecté' : '❌ Déconnecté'}\n` +
                              `⏱️ Uptime: ${hours}h ${minutes}m ${seconds}s\n` +
                              `📅 Démarrage: ${new Date(Date.now() - (uptime * 1000)).toLocaleString()}\n` +
                              `👤 Développeur: ${config.owner}\n` +
                              `🌐 Hébergement: Render.com\n` +
                              `🔧 Version: 7.0 (Anti-blocage)\n\n` +
                              `${config.footer}`
                    });
                }
                
                // Commande owner
                else if (cmd === 'owner' || cmd === 'dev') {
                    await sock.sendMessage(from, {
                        text: `👨‍💻 *CONTACTER LE DÉVELOPPEUR*\n\n` +
                              `📛 Nom: ${config.owner}\n` +
                              `📞 WhatsApp: ${config.ownerNumber}\n\n` +
                              `💬 Contact pour:\n` +
                              `• Support technique\n` +
                              `• Développement de bots\n` +
                              `• Projets personnalisés\n\n` +
                              `${config.footer}`
                    });
                }
                
            } catch (error) {
                console.error('❌ Erreur traitement message:', error.message);
            }
        });
        
        console.log('✅ Socket WhatsApp initialisé avec succès');
        return sock;
        
    } catch (error) {
        console.error('❌ ERREUR CRITIQUE lors de la connexion:', error);
        botStatus = `❌ Erreur: ${error.message.substring(0, 50)}...`;
        
        // Réessayer après délai exponentiel
        const retryDelay = Math.min(30000, 5000 * Math.pow(2, retryCount));
        console.log(`⏳ Nouvelle tentative dans ${retryDelay/1000} secondes...`);
        
        setTimeout(() => {
            retryCount++;
            connectToWhatsApp();
        }, retryDelay);
        
        return null;
    }
}

// ========== DÉMARRAGE DU SERVEUR ==========
app.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(70));
    console.log('🚀 META MD BOT - SERVEUR LANCÉ');
    console.log('='.repeat(70));
    console.log(`📍 Port: ${PORT}`);
    console.log(`🤖 Nom: ${config.botName}`);
    console.log(`👤 Développeur: ${config.owner}`);
    console.log(`📞 Contact: ${config.ownerNumber}`);
    console.log(`🖥️ Node.js: ${process.version}`);
    console.log(`📅 Démarrage: ${new Date().toLocaleString()}`);
    console.log(`🌐 URL: ${process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`}`);
    console.log('='.repeat(70));
    console.log('🔧 Configuration anti-blocage WhatsApp activée');
    console.log('⏰ QR Code durée: 5 minutes');
    console.log('🔄 Reconnexion automatique: Activée');
    console.log('='.repeat(70));
    console.log('\n🔄 Connexion à WhatsApp dans 3 secondes...\n');
    
    // Démarrer la connexion WhatsApp
    setTimeout(() => {
        connectToWhatsApp();
    }, 3000);
});

// ========== GESTION DES SIGNAUX ==========
process.on('SIGINT', () => {
    console.log('\n\n👋 Arrêt propre du bot demandé...');
    botStatus = '⏹️ Arrêt en cours...';
    
    if (sock) {
        sock.end();
        console.log('✅ Socket WhatsApp fermé');
    }
    
    setTimeout(() => {
        console.log('✅ META MD BOT arrêté proprement');
        process.exit(0);
    }, 2000);
});

process.on('SIGTERM', () => {
    console.log('\n🔚 Signal d\'arrêt reçu...');
    if (sock) sock.end();
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    console.error('⚠️ ERREUR NON CATCHÉE:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('⚠️ PROMESSE REJETÉE:', reason);
});
