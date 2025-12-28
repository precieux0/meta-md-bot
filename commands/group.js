module.exports = {
    name: 'group',
    
    async add(sock, from, args, msg) {
        if (!args[0]) {
            return await sock.sendMessage(from, { 
                text: '❌ Veuillez mentionner ou fournir un numéro\nExemple: .add @user ou .add 243...\n\n_Signature: by PRECIEUX OKITAKOY_' 
            }, { quoted: msg });
        }
        
        await sock.sendMessage(from, { 
            text: '👥 Ajout de membre...\n\n_Signature: by PRECIEUX OKITAKOY_' 
        }, { quoted: msg });
    },
    
    async kick(sock, from, args, msg) {
        if (!args[0]) {
            return await sock.sendMessage(from, { 
                text: '❌ Veuillez mentionner un membre\nExemple: .kick @user\n\n_Signature: by PRECIEUX OKITAKOY_' 
            }, { quoted: msg });
        }
        
        await sock.sendMessage(from, { 
            text: '👢 Expulsion de membre...\n\n_Signature: by PRECIEUX OKITAKOY_' 
        }, { quoted: msg });
    },
    
    async promote(sock, from, args, msg) {
        if (!args[0]) {
            return await sock.sendMessage(from, { 
                text: '❌ Veuillez mentionner un membre\nExemple: .promote @user\n\n_Signature: by PRECIEUX OKITAKOY_' 
            }, { quoted: msg });
        }
        
        await sock.sendMessage(from, { 
            text: '⬆️ Promotion en admin...\n\n_Signature: by PRECIEUX OKITAKOY_' 
        }, { quoted: msg });
    },
    
    async demote(sock, from, args, msg) {
        if (!args[0]) {
            return await sock.sendMessage(from, { 
                text: '❌ Veuillez mentionner un admin\nExemple: .demote @user\n\n_Signature: by PRECIEUX OKITAKOY_' 
            }, { quoted: msg });
        }
        
        await sock.sendMessage(from, { 
            text: '⬇️ Rétrogradation admin...\n\n_Signature: by PRECIEUX OKITAKOY_' 
        }, { quoted: msg });
    },
    
    async antilink(sock, from, args, msg) {
        const action = args[0] || 'status';
        
        if (action === 'on') {
            await sock.sendMessage(from, { 
                text: '🔗 Anti-lien activé!\n\n_Signature: by PRECIEUX OKITAKOY_' 
            }, { quoted: msg });
        } else if (action === 'off') {
            await sock.sendMessage(from, { 
                text: '🔗 Anti-lien désactivé!\n\n_Signature: by PRECIEUX OKITAKOY_' 
            }, { quoted: msg });
        } else {
            await sock.sendMessage(from, { 
                text: '🔗 Statut Anti-lien\nUtilisation: .antilink [on/off]\n\n_Signature: by PRECIEUX OKITAKOY_' 
            }, { quoted: msg });
        }
    },
    
    async groupinfo(sock, from, args, msg) {
        const groupMetadata = await sock.groupMetadata(from);
        
        const info = `👥 *INFORMATIONS DU GROUPE*
        
*Nom:* ${groupMetadata.subject}
*ID:* ${groupMetadata.id}
*Créateur:* ${groupMetadata.owner ? groupMetadata.owner.split('@')[0] : 'Inconnu'}
*Date création:* ${new Date(groupMetadata.creation * 1000).toLocaleDateString()}
*Description:* ${groupMetadata.desc || 'Aucune'}

*Membres:* ${groupMetadata.participants.length}
*Admins:* ${groupMetadata.participants.filter(p => p.admin).length}

*Paramètres:*
- Messages éphemères: ${groupMetadata.ephemeralDuration ? 'Activé' : 'Désactivé'}
- Annonces: ${groupMetadata.announce ? 'Activé' : 'Désactivé'}

_Signature: by PRECIEUX OKITAKOY_`;
        
        await sock.sendMessage(from, { text: info }, { quoted: msg });
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
        
        text += '\n\n_Signature: by PRECIEUX OKITAKOY_';
        
        await sock.sendMessage(from, { 
            text: text,
            mentions: mentions
        }, { quoted: msg });
    },
    
    async close(sock, from, args, msg) {
        await sock.groupSettingUpdate(from, 'announcement');
        await sock.sendMessage(from, { 
            text: '🔒 Groupe fermé!\nSeuls les admins peuvent envoyer des messages.\n\n_Signature: by PRECIEUX OKITAKOY_' 
        }, { quoted: msg });
    },
    
    async open(sock, from, args, msg) {
        await sock.groupSettingUpdate(from, 'not_announcement');
        await sock.sendMessage(from, { 
            text: '🔓 Groupe ouvert!\nTous les membres peuvent envoyer des messages.\n\n_Signature: by PRECIEUX OKITAKOY_' 
        }, { quoted: msg });
    }
};