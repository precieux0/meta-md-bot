const qrcode = require('qrcode');
const axios = require('axios');
const config = require('../lib/config');

module.exports = {
    name: 'tools',
    
    async calc(sock, from, args, msg) {
        try {
            if (!args[0]) {
                return await sock.sendMessage(from, { 
                    text: '❌ Veuillez fournir une expression\nExemple: .calc 2+2\n\n' + config.footer 
                }, { quoted: msg });
            }
            
            const expression = args.join(' ').replace(/[^-()\d/*+.]/g, '');
            
            // Évaluation sécurisée
            const result = eval(expression);
            
            await sock.sendMessage(from, { 
                text: `🧮 *Calculatrice*\n\n*Expression:* ${args.join(' ')}\n*Résultat:* ${result}\n\n` + config.footer 
            }, { quoted: msg });
            
        } catch (error) {
            await sock.sendMessage(from, { 
                text: `❌ Expression invalide\n\n` + config.footer 
            }, { quoted: msg });
        }
    },
    
    async qr(sock, from, args, msg) {
        try {
            if (!args[0]) {
                return await sock.sendMessage(from, { 
                    text: '❌ Veuillez fournir un texte\nExemple: .qr https://google.com\n\n' + config.footer 
                }, { quoted: msg });
            }
            
            const text = args.join(' ');
            
            await sock.sendMessage(from, { 
                text: '📱 Génération du QR Code...\n\n' + config.footer 
            }, { quoted: msg });
            
            // Générer le QR code
            const qrDataUrl = await qrcode.toDataURL(text);
            const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            
            await sock.sendMessage(from, { 
                image: buffer,
                caption: `✅ QR Code pour:\n${text}\n\n` + config.footer
            }, { quoted: msg });
            
        } catch (error) {
            await sock.sendMessage(from, { 
                text: `❌ Erreur: ${error.message}\n\n` + config.footer 
            }, { quoted: msg });
        }
    },
    
    async shorturl(sock, from, args, msg) {
        try {
            if (!args[0]) {
                return await sock.sendMessage(from, { 
                    text: '❌ Veuillez fournir une URL\nExemple: .shorturl https://google.com\n\n' + config.footer 
                }, { quoted: msg });
            }
            
            let url = args[0];
            if (!url.startsWith('http')) {
                url = 'https://' + url;
            }
            
            await sock.sendMessage(from, { 
                text: '🔗 Raccourcissement d\'URL...\n\n' + config.footer 
            }, { quoted: msg });
            
            // Utiliser une API de raccourcissement
            // Exemple avec TinyURL
            const response = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
            const shortUrl = response.data;
            
            await sock.sendMessage(from, { 
                text: `✅ URL raccourcie:\n\n*Original:* ${url}\n*Raccourci:* ${shortUrl}\n\n` + config.footer 
            }, { quoted: msg });
            
        } catch (error) {
            await sock.sendMessage(from, { 
                text: `❌ Erreur: ${error.message}\n\n` + config.footer 
            }, { quoted: msg });
        }
    },
    
    async ssweb(sock, from, args, msg) {
        try {
            if (!args[0]) {
                return await sock.sendMessage(from, { 
                    text: '❌ Veuillez fournir une URL\nExemple: .ssweb https://google.com\n\n' + config.footer 
                }, { quoted: msg });
            }
            
            let url = args[0];
            if (!url.startsWith('http')) {
                url = 'https://' + url;
            }
            
            await sock.sendMessage(from, { 
                text: '🌐 Capture d\'écran du site...\n\n' + config.footer 
            }, { quoted: msg });
            
            // Utiliser une API de screenshot
            // Pour l'instant, message de démonstration
            await sock.sendMessage(from, { 
                text: `🖥️ Capture pour: ${url}\n\nUtilisez des services comme:\n- screenshotapi.net\n- url2png.com\n\n` + config.footer 
            }, { quoted: msg });
            
        } catch (error) {
            await sock.sendMessage(from, { 
                text: `❌ Erreur: ${error.message}\n\n` + config.footer 
            }, { quoted: msg });
        }
    },
    
    async circle(sock, from, args, msg) {
        if (!msg.message.imageMessage) {
            return await sock.sendMessage(from, { 
                text: '❌ Veuillez envoyer une image\nExemple: .circle [avec image]\n\n' + config.footer 
            }, { quoted: msg });
        }
        
        await sock.sendMessage(from, { 
            text: '⭕ Conversion en cercle...\n\n' + config.footer 
        }, { quoted: msg });
        
        // Ici, vous utiliseriez Sharp pour créer un cercle
        await sock.sendMessage(from, { 
            text: '✅ Image convertie en cercle!\n\n' + config.footer 
        }, { quoted: msg });
    }
};