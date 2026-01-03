const axios = require('axios');
const config = require('../lib/config');
const functions = require('../lib/functions');

module.exports = {
    name: 'reactions',
    
    async getReactionGif(type, sock, from, msg) {
        try {
            const apis = {
                'hug': 'https://api.waifu.pics/sfw/hug',
                'kiss': 'https://api.waifu.pics/sfw/kiss',
                'slap': 'https://api.waifu.pics/sfw/slap',
                'pat': 'https://api.waifu.pics/sfw/pat',
                'cuddle': 'https://api.waifu.pics/sfw/cuddle',
                'cry': 'https://api.waifu.pics/sfw/cry'
            };
            
            if (!apis[type]) {
                return await functions.sendMangaMessage(sock, from, `❌ Réaction ${type} non disponible`, msg, { mangaType: 'otaku' });
            }
            
            const response = await axios.get(apis[type]);
            const imageUrl = response.data.url;
            
            const reactions = {
                'hug': '🤗', 'kiss': '💋', 'slap': '👋',
                'pat': '👋', 'cuddle': '🤗', 'cry': '😢',
                'dance': '💃', 'smile': '😊', 'blush': '😊',
                'happy': '😄', 'wink': '😉', 'wave': '👋'
            };
            
            let caption = `${reactions[type] || '🎭'} ${type.charAt(0).toUpperCase() + type.slice(1)}!`;
            
            // Gérer les mentions
            if (msg.message.extendedTextMessage?.contextInfo?.mentionedJid) {
                const mentioned = msg.message.extendedTextMessage.contextInfo.mentionedJid[0].split('@')[0];
                caption = `${reactions[type] || '🎭'} ${type} pour @${mentioned}!`;
            }
            
            await sock.sendMessage(from, { 
                image: { url: imageUrl },
                caption: caption + '\n\n' + config.footer
            }, { quoted: msg });
            
        } catch (error) {
            await functions.sendMangaMessage(sock, from, `❌ Erreur: ${error.message}`, msg, { mangaType: 'otaku' });
        }
    },
    
    async handleReaction(sock, from, args, msg, reaction) {
        return this.getReactionGif(reaction, sock, from, msg);
    },
    
    async dance(sock, from, args, msg) {
        await functions.sendMangaMessage(sock, from, '💃 Danse avec moi!', msg, { mangaType: 'kawaii' });
    },
    
    async smile(sock, from, args, msg) {
        await functions.sendMangaMessage(sock, from, '😊 Souriez!', msg, { mangaType: 'kawaii' });
    },
    
    async blush(sock, from, args, msg) {
        await functions.sendMangaMessage(sock, from, '😳 *rougit*', msg, { mangaType: 'otaku' });
    },
    
    async wink(sock, from, args, msg) {
        await functions.sendMangaMessage(sock, from, '😉 Clin d\'œil!', msg, { mangaType: 'kawaii' });
    },
    
    async wave(sock, from, args, msg) {
        await functions.sendMangaMessage(sock, from, '👋 Salut!', msg, { mangaType: 'kawaii' });
    },
    
    async bonk(sock, from, args, msg) {
        let text = '🔨 Bonk!';
        if (msg.message.extendedTextMessage?.contextInfo?.mentionedJid) {
            const mentioned = msg.message.extendedTextMessage.contextInfo.mentionedJid[0].split('@')[0];
            text = `🔨 Bonk @${mentioned}! Va en horny jail!`;
        }
        
        await functions.sendMangaMessage(sock, from, text, msg, { mangaType: 'otaku' });
    },
    
    async yeet(sock, from, args, msg) {
        let text = '💨 Yeet!';
        if (msg.message.extendedTextMessage?.contextInfo?.mentionedJid) {
            const mentioned = msg.message.extendedTextMessage.contextInfo.mentionedJid[0].split('@')[0];
            text = `💨 Yeet @${mentioned}!`;
        }
        
        await functions.sendMangaMessage(sock, from, text, msg, { mangaType: 'kawaii' });
    }
};