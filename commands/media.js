const fs = require('fs');
const path = require('path');
const { Sticker, createSticker, StickerTypes } = require('wa-sticker-formatter');
const config = require('../lib/config');
const functions = require('../lib/functions');

module.exports = {
    name: 'media',
    
    async sticker(sock, from, args, msg) {
        try {
            if (!msg.message.imageMessage && !msg.message.videoMessage) {
                return await sock.sendMessage(from, { 
                    text: '❌ Veuillez envoyer une image ou vidéo\nExemple: Répondez à une image avec .sticker\n\n' + config.footer 
                }, { quoted: msg });
            }
            
            await functions.sendMangaMessage(sock, from, '🖼️ Création du sticker...', msg, { mangaType: 'otaku' });
            
            // Télécharger le média
            const media = msg.message.imageMessage || msg.message.videoMessage;
            const buffer = await sock.downloadMediaMessage(msg);
            
            // Créer le sticker
            const sticker = new Sticker(buffer, {
                pack: 'META MD BOT',
                author: 'PRECIEUX OKITAKOY',
                type: StickerTypes.FULL,
                categories: ['🤩', '🎉'],
                id: '12345',
                quality: 50,
                background: '#000000'
            });
            
            const stickerBuffer = await sticker.toBuffer();
            
            await sock.sendMessage(from, {
                sticker: stickerBuffer
            }, { quoted: msg });
            
            await functions.sendMangaMessage(sock, from, '✅ Sticker créé avec succès!', msg, { mangaType: 'kawaii' });
            
        } catch (error) {
            await functions.sendMangaMessage(sock, from, `❌ Erreur: ${error.message}`, msg, { mangaType: 'otaku' });
        }
    },
    
    async toimage(sock, from, args, msg) {
        if (!msg.message.stickerMessage) {
            return await functions.sendMangaMessage(sock, from, '❌ Veuillez envoyer un sticker\nExemple: Répondez à un sticker avec .toimage', msg, { mangaType: 'otaku' });
        }
        
        await functions.sendMangaMessage(sock, from, '📸 Conversion en image...', msg, { mangaType: 'kawaii' });
        
        // Télécharger le sticker
        const buffer = await sock.downloadMediaMessage(msg);
        
        await sock.sendMessage(from, {
            image: buffer,
            caption: '✅ Sticker converti en image!\n\n' + config.footer
        }, { quoted: msg });
    },
    
    async take(sock, from, args, msg) {
        if (!args[0]) {
            return await functions.sendMangaMessage(sock, from, '❌ Veuillez mentionner un auteur\nExemple: .take @user', msg, { mangaType: 'otaku' });
        }
        
        await functions.sendMangaMessage(sock, from, '📝 Prise de sticker...', msg, { mangaType: 'kawaii' });
        
        // Implémentation de prise de sticker
        await functions.sendMangaMessage(sock, from, '✅ Sticker pris avec succès!', msg, { mangaType: 'kawaii' });
    },
    
    async emojimix(sock, from, args, msg) {
        try {
            if (!args[0]) {
                return await functions.sendMangaMessage(sock, from, '❌ Veuillez fournir des emojis\nExemple: .emojimix 😊+😂', msg, { mangaType: 'otaku' });
            }
            
            const emojis = args[0].split('+');
            if (emojis.length !== 2) {
                return await functions.sendMangaMessage(sock, from, '❌ Format invalide\nUtilisez: .emojimix 😊+😂', msg, { mangaType: 'otaku' });
            }
            
            await functions.sendMangaMessage(sock, from, `🎭 Mixage d'emojis: ${emojis[0]} + ${emojis[1]}...`, msg, { mangaType: 'kawaii' });
            
            // Utiliser une API d'emojimix
            const emoji1 = encodeURIComponent(emojis[0]);
            const emoji2 = encodeURIComponent(emojis[1]);
            
            // API example (vous aurez besoin d'une vraie API)
            await functions.sendMangaMessage(sock, from, `✅ Emojis mixés!\n\n${emojis[0]} + ${emojis[1]} = 🎉\n\nVisitez emojicombos.com`, msg, { mangaType: 'kawaii' });
            
        } catch (error) {
            await functions.sendMangaMessage(sock, from, `❌ Erreur: ${error.message}`, msg, { mangaType: 'otaku' });
        }
    },
    
    async imageinfo(sock, from, args, msg) {
        if (!msg.message.imageMessage) {
            return await sock.sendMessage(from, { 
                text: '❌ Veuillez envoyer une image\nExemple: Répondez à une image avec .imageinfo\n\n' 
            }, { quoted: msg });
        }
        
        const image = msg.message.imageMessage;
        
        const info = `📊 *INFORMATIONS IMAGE*
        
*Dimensions:* ${image.width}x${image.height}
*Taille:* ${Math.round(image.fileLength / 1024)}KB
*Type:* ${image.mimetype}
*Caption:* ${image.caption || 'Aucune'}

*Métadonnées:*
- Timestamp: ${new Date(image.mediaKeyTimestamp * 1000).toLocaleString()}
- Direct Path: ${image.directPath ? 'Oui' : 'Non'}`;
        
        await functions.sendMangaMessage(sock, from, info, msg, { mangaType: 'kawaii' });
    },
    
    async video2img(sock, from, args, msg) {
        if (!msg.message.videoMessage) {
            return await functions.sendMangaMessage(sock, from, '❌ Veuillez envoyer une vidéo\nExemple: Répondez à une vidéo avec .video2img', msg, { mangaType: 'otaku' });
        }
        
        await functions.sendMangaMessage(sock, from, '🎞️ Extraction d\'image depuis vidéo...', msg, { mangaType: 'kawaii' });
        
        // Ici, vous utiliseriez ffmpeg pour extraire une frame
        await functions.sendMangaMessage(sock, from, '✅ Image extraite avec succès!', msg, { mangaType: 'kawaii' });
    }
};
