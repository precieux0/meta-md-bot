const axios = require('axios');

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
                return await sock.sendMessage(from, { 
                    text: `❌ Réaction ${type} non disponible\n\n_Signature: by PRECIEUX OKITAKOY_` 
                }, { quoted: msg });
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
                caption: caption + '\n\n_Signature: by PRECIEUX OKITAKOY_'
            }, { quoted: msg });
            
        } catch (error) {
            await sock.sendMessage(from, { 
                text: `❌ Erreur: ${error.message}\n\n_Signature: by PRECIEUX OKITAKOY_` 
            }, { quoted: msg });
        }
    },
    
    async handleReaction(sock, from, args, msg, reaction) {
        return this.getReactionGif(reaction, sock, from, msg);
    },
    
    async dance(sock, from, args, msg) {
        await sock.sendMessage(from, { 
            text: '💃 Danse avec moi!\n\n_Signature: by PRECIEUX OKITAKOY_' 
        }, { quoted: msg });
    },
    
    async smile(sock, from, args, msg) {
        await sock.sendMessage(from, { 
            text: '😊 Souriez!\n\n_Signature: by PRECIEUX OKITAKOY_' 
        }, { quoted: msg });
    },
    
    async blush(sock, from, args, msg) {
        await sock.sendMessage(from, { 
            text: '😳 *rougit*\n\n_Signature: by PRECIEUX OKITAKOY_' 
        }, { quoted: msg });
    },
    
    async wink(sock, from, args, msg) {
        await sock.sendMessage(from, { 
            text: '😉 Clin d\'œil!\n\n_Signature: by PRECIEUX OKITAKOY_' 
        }, { quoted: msg });
    },
    
    async wave(sock, from, args, msg) {
        await sock.sendMessage(from, { 
            text: '👋 Salut!\n\n_Signature: by PRECIEUX OKITAKOY_' 
        }, { quoted: msg });
    },
    
    async bonk(sock, from, args, msg) {
        let text = '🔨 Bonk!';
        if (msg.message.extendedTextMessage?.contextInfo?.mentionedJid) {
            const mentioned = msg.message.extendedTextMessage.contextInfo.mentionedJid[0].split('@')[0];
            text = `🔨 Bonk @${mentioned}! Va en horny jail!`;
        }
        
        await sock.sendMessage(from, { 
            text: text + '\n\n_Signature: by PRECIEUX OKITAKOY_' 
        }, { quoted: msg });
    },
    
    async yeet(sock, from, args, msg) {
        let text = '💨 Yeet!';
        if (msg.message.extendedTextMessage?.contextInfo?.mentionedJid) {
            const mentioned = msg.message.extendedTextMessage.contextInfo.mentionedJid[0].split('@')[0];
            text = `💨 Yeet @${mentioned}!`;
        }
        
        await sock.sendMessage(from, { 
            text: text + '\n\n_Signature: by PRECIEUX OKITAKOY_' 
        }, { quoted: msg });
    }
};