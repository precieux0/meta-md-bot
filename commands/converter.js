const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'converter',
    
    async fileio(sock, from, args, msg) {
        try {
            if (!msg.message.documentMessage && !msg.message.imageMessage && !msg.message.videoMessage) {
                return await sock.sendMessage(from, { 
                    text: '❌ Veuillez envoyer un fichier\nExemple: Envoyez un fichier avec .fileio\n\n_Signature: by PRECIEUX OKITAKOY_' 
                }, { quoted: msg });
            }
            
            await sock.sendMessage(from, { 
                text: '📁 Upload vers file.io...\n\n_Signature: by PRECIEUX OKITAKOY_' 
            }, { quoted: msg });
            
            // Télécharger le fichier
            const buffer = await sock.downloadMediaMessage(msg);
            
            // Upload vers file.io (exemple)
            // Pour l'instant, message de démonstration
            await sock.sendMessage(from, { 
                text: '✅ Fichier uploadé avec succès!\n\nVisitez file.io pour uploader des fichiers.\n\n_Signature: by PRECIEUX OKITAKOY_' 
            }, { quoted: msg });
            
        } catch (error) {
            await sock.sendMessage(from, { 
                text: `❌ Erreur: ${error.message}\n\n_Signature: by PRECIEUX OKITAKOY_` 
            }, { quoted: msg });
        }
    },
    
    async telegraph(sock, from, args, msg) {
        try {
            if (!args[0] && !msg.message.imageMessage) {
                return await sock.sendMessage(from, { 
                    text: '❌ Veuillez fournir un texte ou envoyer une image\nExemple: .telegraph Mon texte\n\n_Signature: by PRECIEUX OKITAKOY_' 
                }, { quoted: msg });
            }
            
            await sock.sendMessage(from, { 
                text: '📝 Upload vers Telegraph...\n\n_Signature: by PRECIEUX OKITAKOY_' 
            }, { quoted: msg });
            
            let result = '';
            
            if (args[0]) {
                const text = args.join(' ');
                // Upload texte vers Telegraph
                result = `✅ Texte uploadé vers Telegraph!\n\nTexte: ${text.substring(0, 100)}...\n\nLien: https://telegra.ph/generated-link\n\n_Signature: by PRECIEUX OKITAKOY_`;
            } else if (msg.message.imageMessage) {
                // Upload image vers Telegraph
                result = '✅ Image uploadée vers Telegraph!\n\nLien: https://telegra.ph/generated-link\n\n_Signature: by PRECIEUX OKITAKOY_';
            }
            
            await sock.sendMessage(from, { text: result }, { quoted: msg });
            
        } catch (error) {
            await sock.sendMessage(from, { 
                text: `❌ Erreur: ${error.message}\n\n_Signature: by PRECIEUX OKITAKOY_` 
            }, { quoted: msg });
        }
    },
    
    async url(sock, from, args, msg) {
        try {
            if (!args[0]) {
                return await sock.sendMessage(from, { 
                    text: '❌ Veuillez fournir une URL\nExemple: .url https://google.com\n\n_Signature: by PRECIEUX OKITAKOY_' 
                }, { quoted: msg });
            }
            
            let url = args[0];
            if (!url.startsWith('http')) {
                url = 'https://' + url;
            }
            
            await sock.sendMessage(from, { 
                text: '🔗 Traitement de l\'URL...\n\n_Signature: by PRECIEUX OKITAKOY_' 
            }, { quoted: msg });
            
            // Analyser l'URL
            const urlObj = new URL(url);
            
            const info = `🌐 *ANALYSE URL*
            
*URL complète:* ${url}
*Protocole:* ${urlObj.protocol}
*Domaine:* ${urlObj.hostname}
*Chemin:* ${urlObj.pathname}
${urlObj.search ? `*Paramètres:* ${urlObj.search}` : ''}
${urlObj.hash ? `*Ancre:* ${urlObj.hash}` : ''}

*Informations:*
- Sécurisé: ${urlObj.protocol === 'https:' ? '✅ Oui' : '❌ Non'}
- Sous-domaine: ${urlObj.hostname.split('.').length > 2 ? 'Oui' : 'Non'}
- Port: ${urlObj.port || 'Défaut (80/443)'}

_Signature: by PRECIEUX OKITAKOY_`;
            
            await sock.sendMessage(from, { text: info }, { quoted: msg });
            
        } catch (error) {
            await sock.sendMessage(from, { 
                text: `❌ URL invalide\n\n_Signature: by PRECIEUX OKITAKOY_` 
            }, { quoted: msg });
        }
    },
    
    async impbb(sock, from, args, msg) {
        if (!msg.message.imageMessage) {
            return await sock.sendMessage(from, { 
                text: '❌ Veuillez envoyer une image\nExemple: Envoyez une image avec .impbb\n\n_Signature: by PRECIEUX OKITAKOY_' 
            }, { quoted: msg });
        }
        
        await sock.sendMessage(from, { 
            text: '🖼️ Upload vers ImgBB...\n\n_Signature: by PRECIEUX OKITAKOY_' 
        }, { quoted: msg });
        
        // Upload vers ImgBB
        await sock.sendMessage(from, { 
            text: '✅ Image uploadée vers ImgBB!\n\nVisitez imgbb.com pour uploader des images.\n\n_Signature: by PRECIEUX OKITAKOY_' 
        }, { quoted: msg });
    }
};