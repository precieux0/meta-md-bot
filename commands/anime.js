const axios = require('axios');
const config = require('../lib/config');
const functions = require('../lib/functions');

module.exports = {
    name: 'anime',
    
    async waifu(sock, from, args, msg) {
        try {
            await sock.sendMessage(from, { 
                text: '⏳ Recherche d\'une waifu manga...\n\n' + config.footer
            }, { quoted: msg });
            
            // Utiliser les images manga configurées
            const mangaImage = config.getRandomMangaImage('generic');
            
            await sock.sendMessage(from, { 
                image: { url: mangaImage },
                caption: '✨ Voici votre waifu manga!\n\n' + config.footer
            }, { quoted: msg });
            
        } catch (error) {
            await functions.sendMangaMessage(sock, from, `❌ Erreur: ${error.message}`, msg);
        }
    },
    
    async neko(sock, from, args, msg) {
        try {
            const response = await axios.get('https://api.waifu.pics/sfw/neko');
            const imageUrl = response.data.url;
            
            await sock.sendMessage(from, { 
                image: { url: imageUrl },
                caption: '🐱 Neko-chan manga style!\n\n' + config.footer
            }, { quoted: msg });
            
        } catch (error) {
            // Fallback vers image manga
            const mangaImage = config.getRandomMangaImage();
            await sock.sendMessage(from, {
                image: { url: mangaImage },
                caption: '🐱 Neko-chan!\n\n' + config.footer
            }, { quoted: msg });
        }
    },
    
    async hug(sock, from, args, msg) {
        try {
            const response = await axios.get('https://api.waifu.pics/sfw/hug');
            const imageUrl = response.data.url;
            
            let caption = '🤗 Hug manga style!';
            if (msg.message.extendedTextMessage?.contextInfo?.mentionedJid) {
                const mentioned = msg.message.extendedTextMessage.contextInfo.mentionedJid[0].split('@')[0];
                caption = `🤗 Hug pour @${mentioned}!`;
            }
            
            await sock.sendMessage(from, { 
                image: { url: imageUrl },
                caption: caption + '\n\n' + config.footer
            }, { quoted: msg });
            
        } catch (error) {
            await functions.sendMangaMessage(sock, from, '🤗 Hug!', msg);
        }
    },
    
    async kiss(sock, from, args, msg) {
        try {
            const response = await axios.get('https://api.waifu.pics/sfw/kiss');
            const imageUrl = response.data.url;
            
            let caption = '💋 Kiss manga style!';
            if (msg.message.extendedTextMessage?.contextInfo?.mentionedJid) {
                const mentioned = msg.message.extendedTextMessage.contextInfo.mentionedJid[0].split('@')[0];
                caption = `💋 Kiss pour @${mentioned}!`;
            }
            
            await sock.sendMessage(from, { 
                image: { url: imageUrl },
                caption: caption + '\n\n' + config.footer
            }, { quoted: msg });
            
        } catch (error) {
            await functions.sendMangaMessage(sock, from, '💋 Kiss!', msg);
        }
    },
    
    async slap(sock, from, args, msg) {
        try {
            const response = await axios.get('https://api.waifu.pics/sfw/slap');
            const imageUrl = response.data.url;
            
            let caption = '👋 Slap manga style!';
            if (msg.message.extendedTextMessage?.contextInfo?.mentionedJid) {
                const mentioned = msg.message.extendedTextMessage.contextInfo.mentionedJid[0].split('@')[0];
                caption = `👋 Slap pour @${mentioned}!`;
            }
            
            await sock.sendMessage(from, { 
                image: { url: imageUrl },
                caption: caption + '\n\n' + config.footer
            }, { quoted: msg });
            
        } catch (error) {
            await functions.sendMangaMessage(sock, from, '👋 Slap!', msg);
        }
    },
    
    async pat(sock, from, args, msg) {
        try {
            const response = await axios.get('https://api.waifu.pics/sfw/pat');
            const imageUrl = response.data.url;
            
            let caption = '👋 Pat pat manga style!';
            if (msg.message.extendedTextMessage?.contextInfo?.mentionedJid) {
                const mentioned = msg.message.extendedTextMessage.contextInfo.mentionedJid[0].split('@')[0];
                caption = `👋 Pat pat pour @${mentioned}!`;
            }
            
            await sock.sendMessage(from, { 
                image: { url: imageUrl },
                caption: caption + '\n\n' + config.footer
            }, { quoted: msg });
            
        } catch (error) {
            await functions.sendMangaMessage(sock, from, '👋 Pat pat!', msg);
        }
    },
    
    // Nouvelle commande pour images manga spécifiques
    async dandadan(sock, from, args, msg) {
        try {
            const images = config.mangaImages.dandadan;
            const randomImage = images[Math.floor(Math.random() * images.length)];
            
            await sock.sendMessage(from, {
                image: { url: randomImage },
                caption: '🎌 *DANDADAN*\nImage aléatoire de la série!\n\n' + config.footer
            }, { quoted: msg });
            
        } catch (error) {
            await functions.sendMangaMessage(sock, from, '❌ Erreur chargement image Dandadan', msg);
        }
    },
    
    async tokyoghoul(sock, from, args, msg) {
        try {
            const images = config.mangaImages.tokyoGhoul;
            const randomImage = images[Math.floor(Math.random() * images.length)];
            
            await sock.sendMessage(from, {
                image: { url: randomImage },
                caption: '🎌 *TOKYO GHOUL*\nImage aléatoire de la série!\n\n' + config.footer
            }, { quoted: msg });
            
        } catch (error) {
            await functions.sendMangaMessage(sock, from, '❌ Erreur chargement image Tokyo Ghoul', msg);
        }
    },
    
    async randommanga(sock, from, args, msg) {
        try {
            // Sélectionner un manga aléatoire
            const mangaTypes = Object.keys(config.mangaImages);
            const randomManga = mangaTypes[Math.floor(Math.random() * mangaTypes.length)];
            const images = config.mangaImages[randomManga];
            const randomImage = images[Math.floor(Math.random() * images.length)];
            
            const mangaNames = {
                'dandadan': 'Dandadan',
                'tokyoGhoul': 'Tokyo Ghoul', 
                'jujutsuKaisen': 'Jujutsu Kaisen',
                'chainsawMan': 'Chainsaw Man',
                'onePiece': 'One Piece',
                'naruto': 'Naruto',
                'demonSlayer': 'Demon Slayer',
                'generic': 'Manga Générique'
            };
            
            await sock.sendMessage(from, {
                image: { url: randomImage },
                caption: `🎌 *${mangaNames[randomManga] || 'MANGA'}*\nImage aléatoire!\n\n` + config.footer
            }, { quoted: msg });
            
        } catch (error) {
            await functions.sendMangaMessage(sock, from, '❌ Erreur chargement image manga', msg);
        }
    }
};