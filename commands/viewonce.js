const config = require('../lib/config');

module.exports = {
    name: 'viewonce',
    
    async vv(sock, from, args, msg) {
        if (!msg.message.extendedTextMessage?.contextInfo?.quotedMessage?.viewOnceMessageV2) {
            return await sock.sendMessage(from, { 
                text: '❌ Veuillez répondre à un message view once\nExemple: Répondez avec .vv\n\n' + config.footer 
            }, { quoted: msg });
        }
        
        const quoted = msg.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2;
        
        await sock.sendMessage(from, { 
            text: '👁️ Révélation du message view once...\n\n' + config.footer 
        }, { quoted: msg });
        
        // Extraire le contenu
        if (quoted.message.imageMessage) {
            const buffer = await sock.downloadMediaMessage({
                key: msg.key,
                message: { viewOnceMessageV2: quoted }
            });
            
            await functions.sendMangaMessage(sock, from, '✅ Message view once révélé!', msg, { mangaType: 'otaku' });
            
        } else if (quoted.message.videoMessage) {
            const buffer = await sock.downloadMediaMessage({
                key: msg.key,
                message: { viewOnceMessageV2: quoted }
            });
            
            await sock.sendMessage(from, {
                video: buffer,
                caption: '✅ Message view once révélé!\n\n' + config.footer
            }, { quoted: msg });
            
        } else {
            await sock.sendMessage(from, { 
                text: '✅ Message view once révélé!\n\n' + config.footer 
            }, { quoted: msg });
        }
    },
    
    async vv2(sock, from, args, msg) {
        // Version alternative
        await this.vv(sock, from, args, msg);
    }
};