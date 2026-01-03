const config = require('../lib/config');
const functions = require('../lib/functions');

module.exports = {
    name: 'group',
    
    async add(sock, from, args, msg) {
        if (!args[0]) {
            return await functions.sendMangaMessage(sock, from, '❌ Veuillez mentionner ou fournir un numéro\nExemple: .add @user ou .add 243...', msg, { mangaType: 'otaku' });
        }
        
        await functions.sendMangaMessage(sock, from, '👥 Ajout de membre...', msg, { mangaType: 'kawaii' });
    },
    
    async kick(sock, from, args, msg) {
        if (!args[0]) {
            return await functions.sendMangaMessage(sock, from, '❌ Veuillez mentionner un membre\nExemple: .kick @user', msg, { mangaType: 'otaku' });
        }
        
        await functions.sendMangaMessage(sock, from, '👢 Expulsion de membre...', msg, { mangaType: 'kawaii' });
    },
    
    async promote(sock, from, args, msg) {
        if (!args[0]) {
            return await functions.sendMangaMessage(sock, from, '❌ Veuillez mentionner un membre\nExemple: .promote @user', msg, { mangaType: 'otaku' });
        }
        
        await functions.sendMangaMessage(sock, from, '⬆️ Promotion en admin...', msg, { mangaType: 'kawaii' });
    },
    
    async demote(sock, from, args, msg) {
        if (!args[0]) {
            return await functions.sendMangaMessage(sock, from, '❌ Veuillez mentionner un admin\nExemple: .demote @user', msg, { mangaType: 'otaku' });
        }
        
        await functions.sendMangaMessage(sock, from, '⬇️ Rétrogradation admin...', msg, { mangaType: 'kawaii' });
    },
    
    async antilink(sock, from, args, msg) {
        const action = args[0] || 'status';
        
        if (action === 'on') {
            await functions.sendMangaMessage(sock, from, '🔗 Anti-lien activé!', msg, { mangaType: 'otaku' });
        } else if (action === 'off') {
            await functions.sendMangaMessage(sock, from, '🔗 Anti-lien désactivé!', msg, { mangaType: 'otaku' });
        } else {
            await functions.sendMangaMessage(sock, from, '🔗 Statut Anti-lien\nUtilisation: .antilink [on/off]', msg, { mangaType: 'kawaii' });
        }
    },
    
    async groupinfo(sock, from, args, msg) {
        const groupMetadata = await sock.groupMetadata(from);
        
        const info = `👥 *INFORMATIONS DU GROUPE*\n\n*Nom:* ${groupMetadata.subject}\n*ID:* ${groupMetadata.id}\n*Créateur:* ${groupMetadata.owner ? groupMetadata.owner.split('@')[0] : 'Inconnu'}\n*Date création:* ${new Date(groupMetadata.creation * 1000).toLocaleDateString()}\n*Description:* ${groupMetadata.desc || 'Aucune'}\n\n*Membres:* ${groupMetadata.participants.length}\n*Admins:* ${groupMetadata.participants.filter(p => p.admin).length}\n\n*Paramètres:*\n- Messages éphemères: ${groupMetadata.ephemeralDuration ? 'Activé' : 'Désactivé'}\n- Annonces: ${groupMetadata.announce ? 'Activé' : 'Désactivé'}`;
        
        await functions.sendMangaMessage(sock, from, info, msg, { mangaType: 'otaku' });
    },
    
    async everyone(sock, from, args, msg) {
        const groupMetadata = await sock.groupMetadata(from);
        const participants = groupMetadata.participants;
        
        let mentions = [];
        let text = '👥 *TAG TOUT LE MONDE*\n\n';
        
        participants.forEach((participant, i) => {
            text += `@${participant.id.split('@')[0]} `;
            mentions.push(participant.id);
            if ((i + 1) % 5 === 0) text += '\n';
        });
        
        text += '\n\n' + config.footer;
        
        await functions.sendMangaMessage(sock, from, '👥 Tagging everyone...', msg, { mangaType: 'kawaii' });
        
        await sock.sendMessage(from, { 
            text: text,
            mentions: mentions
        }, { quoted: msg });
    },

    async hidetag(sock, from, args, msg) {
        const groupMetadata = await sock.groupMetadata(from);
        const participants = groupMetadata.participants || [];
        if (!participants.length) {
            return await functions.sendMangaMessage(sock, from, '❌ Impossible de récupérer les membres du groupe.', msg, { mangaType: 'otaku' });
        }
        const mentions = participants.map(p => p.id);
        const text = args.length ? args.join(' ') : '👻 Hidetag!';
        await sock.sendMessage(from, { text: text, mentions: mentions }, { quoted: msg });
        await functions.sendMangaMessage(sock, from, '✅ Message envoyé (hidetag)', msg, { mangaType: 'kawaii' });
    },

    async tagadmin(sock, from, args, msg) {
        const groupMetadata = await sock.groupMetadata(from);
        const admins = groupMetadata.participants.filter(p => p.admin);
        if (!admins || admins.length === 0) return await functions.sendMangaMessage(sock, from, '❌ Aucun administrateur trouvé.', msg, { mangaType: 'otaku' });
        const admin = admins[0].id;
        await sock.sendMessage(from, { text: `👑 @${admin.split('@')[0]}`, mentions: [admin] }, { quoted: msg });
        await functions.sendMangaMessage(sock, from, '✅ Admin tagué', msg, { mangaType: 'kawaii' });
    },

    async tagadmins(sock, from, args, msg) {
        const groupMetadata = await sock.groupMetadata(from);
        const admins = groupMetadata.participants.filter(p => p.admin);
        if (!admins || admins.length === 0) return await functions.sendMangaMessage(sock, from, '❌ Aucun administrateur trouvé.', msg, { mangaType: 'otaku' });
        const mentions = admins.map(a => a.id);
        const text = '👑 Admins: ' + admins.map(a => `@${a.id.split('@')[0]}`).join(' ');
        await sock.sendMessage(from, { text: text, mentions: mentions }, { quoted: msg });
        await functions.sendMangaMessage(sock, from, '✅ Tous les admins ont été tagués', msg, { mangaType: 'kawaii' });
    },
    
    async close(sock, from, args, msg) {
        await sock.groupSettingUpdate(from, 'announcement');
        await functions.sendMangaMessage(sock, from, '🔒 Groupe fermé!\nSeuls les admins peuvent envoyer des messages.', msg, { mangaType: 'otaku' });
    },
    
    async open(sock, from, args, msg) {
        await sock.groupSettingUpdate(from, 'not_announcement');
        await functions.sendMangaMessage(sock, from, '🔓 Groupe ouvert!\nTous les membres peuvent envoyer des messages.', msg, { mangaType: 'kawaii' });
    }
};