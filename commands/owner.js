const fs = require('fs');
const path = require('path');
const config = require('../lib/config');

module.exports = {
    name: 'owner',
    
    async broadcast(sock, from, args, msg) {
        // Vérifier si l'utilisateur est le propriétaire
        const senderNumber = msg.key.participant ? msg.key.participant.split('@')[0] : msg.key.remoteJid.split('@')[0];
        
        if (senderNumber !== config.ownerNumber) {
            return await sock.sendMessage(from, { 
                text: '❌ Commande réservée au propriétaire\n\n_Signature: by PRECIEUX OKITAKOY_' 
            }, { quoted: msg });
        }
        
        if (!args[0]) {
            return await sock.sendMessage(from, { 
                text: '❌ Veuillez fournir un message\nExemple: .broadcast Bonjour à tous!\n\n_Signature: by PRECIEUX OKITAKOY_' 
            }, { quoted: msg });
        }
        
        const message = args.join(' ');
        await sock.sendMessage(from, { 
            text: '📢 Diffusion en cours...\n\n_Signature: by PRECIEUX OKITAKOY_' 
        }, { quoted: msg });
        
        // Ici, vous diffuserez à tous les contacts/groupes
        // Pour l'instant, simulation
        await sock.sendMessage(from, { 
            text: `✅ Message de diffusion:\n\n${message}\n\n_Diffusé avec succès!\n\nSignature: by PRECIEUX OKITAKOY_` 
        }, { quoted: msg });
    },
    
    async setpp(sock, from, args, msg) {
        const senderNumber = msg.key.participant ? msg.key.participant.split('@')[0] : msg.key.remoteJid.split('@')[0];
        
        if (senderNumber !== config.ownerNumber) {
            return await sock.sendMessage(from, { 
                text: '❌ Commande réservée au propriétaire\n\n_Signature: by PRECIEUX OKITAKOY_' 
            }, { quoted: msg });
        }
        
        if (!msg.message.imageMessage) {
            return await sock.sendMessage(from, { 
                text: '❌ Veuillez envoyer une image\nExemple: .setpp [avec image]\n\n_Signature: by PRECIEUX OKITAKOY_' 
            }, { quoted: msg });
        }
        
        await sock.sendMessage(from, { 
            text: '🖼️ Changement de photo de profil...\n\n_Signature: by PRECIEUX OKITAKOY_' 
        }, { quoted: msg });
        
        // Ici, vous changeriez la photo de profil
        await sock.sendMessage(from, { 
            text: '✅ Photo de profil changée avec succès!\n\n_Signature: by PRECIEUX OKITAKOY_' 
        }, { quoted: msg });
    },
    
    async setname(sock, from, args, msg) {
        const senderNumber = msg.key.participant ? msg.key.participant.split('@')[0] : msg.key.remoteJid.split('@')[0];
        
        if (senderNumber !== config.ownerNumber) {
            return await sock.sendMessage(from, { 
                text: '❌ Commande réservée au propriétaire\n\n_Signature: by PRECIEUX OKITAKOY_' 
            }, { quoted: msg });
        }
        
        if (!args[0]) {
            return await sock.sendMessage(from, { 
                text: '❌ Veuillez fournir un nom\nExemple: .setname META MD BOT\n\n_Signature: by PRECIEUX OKITAKOY_' 
            }, { quoted: msg });
        }
        
        const name = args.join(' ');
        await sock.updateProfileName(name);
        
        await sock.sendMessage(from, { 
            text: `✅ Nom changé en: ${name}\n\n_Signature: by PRECIEUX OKITAKOY_` 
        }, { quoted: msg });
    },
    
    async setbio(sock, from, args, msg) {
        const senderNumber = msg.key.participant ? msg.key.participant.split('@')[0] : msg.key.remoteJid.split('@')[0];
        
        if (senderNumber !== config.ownerNumber) {
            return await sock.sendMessage(from, { 
                text: '❌ Commande réservée au propriétaire\n\n_Signature: by PRECIEUX OKITAKOY_' 
            }, { quoted: msg });
        }
        
        if (!args[0]) {
            return await sock.sendMessage(from, { 
                text: '❌ Veuillez fournir une bio\nExemple: .setbio Bot WhatsApp par PRECIEUX\n\n_Signature: by PRECIEUX OKITAKOY_' 
            }, { quoted: msg });
        }
        
        const bio = args.join(' ');
        await sock.updateProfileStatus(bio);
        
        await sock.sendMessage(from, { 
            text: `✅ Bio changée en: ${bio}\n\n_Signature: by PRECIEUX OKITAKOY_` 
        }, { quoted: msg });
    },
    
    async getname(sock, from, args, msg) {
        const profile = await sock.profilePictureUrl(msg.key.remoteJid, 'image');
        
        await sock.sendMessage(from, { 
            text: `👤 Informations profil\n\nNom: ${config.botName}\nPropriétaire: ${config.owner}\n\n_Signature: by PRECIEUX OKITAKOY_` 
        }, { quoted: msg });
    },
    
    async listgc(sock, from, args, msg) {
        const senderNumber = msg.key.participant ? msg.key.participant.split('@')[0] : msg.key.remoteJid.split('@')[0];
        
        if (senderNumber !== config.ownerNumber) {
            return await sock.sendMessage(from, { 
                text: '❌ Commande réservée au propriétaire\n\n_Signature: by PRECIEUX OKITAKOY_' 
            }, { quoted: msg });
        }
        
        // Ici, vous listeriez tous les groupes
        await sock.sendMessage(from, { 
            text: '📋 Liste des groupes\n\nFonctionnalité en développement...\n\n_Signature: by PRECIEUX OKITAKOY_' 
        }, { quoted: msg });
    },
    
    async leaveall(sock, from, args, msg) {
        const senderNumber = msg.key.participant ? msg.key.participant.split('@')[0] : msg.key.remoteJid.split('@')[0];
        
        if (senderNumber !== config.ownerNumber) {
            return await sock.sendMessage(from, { 
                text: '❌ Commande réservée au propriétaire\n\n_Signature: by PRECIEUX OKITAKOY_' 
            }, { quoted: msg });
        }
        
        await sock.sendMessage(from, { 
            text: '🚪 Quitter tous les groupes...\n\n_Signature: by PRECIEUX OKITAKOY_' 
        }, { quoted: msg });
        
        // Confirmation
        await sock.sendMessage(from, { 
            text: '⚠️ Cette commande est dangereuse!\nUtilisez avec précaution.\n\n_Signature: by PRECIEUX OKITAKOY_' 
        }, { quoted: msg });
    },
    
    async block(sock, from, args, msg) {
        const senderNumber = msg.key.participant ? msg.key.participant.split('@')[0] : msg.key.remoteJid.split('@')[0];
        
        if (senderNumber !== config.ownerNumber) {
            return await sock.sendMessage(from, { 
                text: '❌ Commande réservée au propriétaire\n\n_Signature: by PRECIEUX OKITAKOY_' 
            }, { quoted: msg });
        }
        
        if (!args[0]) {
            return await sock.sendMessage(from, { 
                text: '❌ Veuillez fournir un numéro\nExemple: .block 243...\n\n_Signature: by PRECIEUX OKITAKOY_' 
            }, { quoted: msg });
        }
        
        const number = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        await sock.updateBlockStatus(number, 'block');
        
        await sock.sendMessage(from, { 
            text: `✅ ${args[0]} bloqué avec succès!\n\n_Signature: by PRECIEUX OKITAKOY_` 
        }, { quoted: msg });
    },
    
    async unblock(sock, from, args, msg) {
        const senderNumber = msg.key.participant ? msg.key.participant.split('@')[0] : msg.key.remoteJid.split('@')[0];
        
        if (senderNumber !== config.ownerNumber) {
            return await sock.sendMessage(from, { 
                text: '❌ Commande réservée au propriétaire\n\n_Signature: by PRECIEUX OKITAKOY_' 
            }, { quoted: msg });
        }
        
        if (!args[0]) {
            return await sock.sendMessage(from, { 
                text: '❌ Veuillez fournir un numéro\nExemple: .unblock 243...\n\n_Signature: by PRECIEUX OKITAKOY_' 
            }, { quoted: msg });
        }
        
        const number = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        await sock.updateBlockStatus(number, 'unblock');
        
        await sock.sendMessage(from, { 
            text: `✅ ${args[0]} débloqué avec succès!\n\n_Signature: by PRECIEUX OKITAKOY_` 
        }, { quoted: msg });
    }
};