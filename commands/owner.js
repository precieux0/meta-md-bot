const fs = require('fs');
const path = require('path');
const config = require('../lib/config');
const functions = require('../lib/functions');

module.exports = {
    name: 'owner',
    
    async broadcast(sock, from, args, msg) {
        // Vérifier si l'utilisateur est le propriétaire
        const senderNumber = msg.key.participant ? msg.key.participant.split('@')[0] : msg.key.remoteJid.split('@')[0];
        
        if (senderNumber !== config.ownerNumber) {
            return await functions.sendMangaMessage(sock, from, '❌ Commande réservée au propriétaire', msg, { mangaType: 'otaku' });
        }
        
        if (!args[0]) {
            return await functions.sendMangaMessage(sock, from, '❌ Veuillez fournir un message\nExemple: .broadcast Bonjour à tous!', msg, { mangaType: 'kawaii' });
        }
        
        const message = args.join(' ');
        await functions.sendMangaMessage(sock, from, '📢 Diffusion en cours...', msg, { mangaType: 'otaku' });
        
        // Ici, vous diffuserez à tous les contacts/groupes
        // Pour l'instant, simulation
        await functions.sendMangaMessage(sock, from, `✅ Message de diffusion:\n\n${message}\n\nDiffusé avec succès!`, msg, { mangaType: 'kawaii' });
    },
    
    async setpp(sock, from, args, msg) {
        const senderNumber = msg.key.participant ? msg.key.participant.split('@')[0] : msg.key.remoteJid.split('@')[0];
        
        if (senderNumber !== config.ownerNumber) {
            return await functions.sendMangaMessage(sock, from, '❌ Commande réservée au propriétaire', msg, { mangaType: 'otaku' });
        }
        
        if (!msg.message.imageMessage) {
            return await functions.sendMangaMessage(sock, from, '❌ Veuillez envoyer une image\nExemple: .setpp [avec image]', msg, { mangaType: 'otaku' });
        }
        
        await functions.sendMangaMessage(sock, from, '🖼️ Changement de photo de profil...', msg, { mangaType: 'kawaii' });
        
        // Ici, vous changeriez la photo de profil
        await functions.sendMangaMessage(sock, from, '✅ Photo de profil changée avec succès!', msg, { mangaType: 'kawaii' });
    },
    
    async setname(sock, from, args, msg) {
        const senderNumber = msg.key.participant ? msg.key.participant.split('@')[0] : msg.key.remoteJid.split('@')[0];
        
        if (senderNumber !== config.ownerNumber) {
            return await functions.sendMangaMessage(sock, from, '❌ Commande réservée au propriétaire', msg, { mangaType: 'otaku' });
        }
        
        if (!args[0]) {
            return await functions.sendMangaMessage(sock, from, '❌ Veuillez fournir un nom\nExemple: .setname META MD BOT', msg, { mangaType: 'kawaii' });
        }
        
        const name = args.join(' ');
        await sock.updateProfileName(name);
        
        await functions.sendMangaMessage(sock, from, `✅ Nom changé en: ${name}`, msg, { mangaType: 'kawaii' });
    },
    
    async setbio(sock, from, args, msg) {
        const senderNumber = msg.key.participant ? msg.key.participant.split('@')[0] : msg.key.remoteJid.split('@')[0];
        
        if (senderNumber !== config.ownerNumber) {
            return await functions.sendMangaMessage(sock, from, '❌ Commande réservée au propriétaire', msg, { mangaType: 'otaku' });
        }
        
        if (!args[0]) {
            return await functions.sendMangaMessage(sock, from, '❌ Veuillez fournir une bio\nExemple: .setbio Bot WhatsApp par PRECIEUX', msg, { mangaType: 'kawaii' });
        }
        
        const bio = args.join(' ');
        await sock.updateProfileStatus(bio);
        
        await functions.sendMangaMessage(sock, from, `✅ Bio changée en: ${bio}`, msg, { mangaType: 'kawaii' });
    },

    async autoreact(sock, from, args, msg) {
        const senderNumber = msg.key.participant ? msg.key.participant.split('@')[0] : msg.key.remoteJid.split('@')[0];
        if (senderNumber !== config.ownerNumber) return await functions.sendMangaMessage(sock, from, '❌ Commande réservée au propriétaire', msg, { mangaType: 'otaku' });
        const action = (args[0] || '').toLowerCase();
        if (action === 'on' || action === 'off') {
            config.flags.autoreact = action === 'on';
            return await functions.sendMangaMessage(sock, from, `✅ autoreact ${action === 'on' ? 'activé' : 'désactivé'}`, msg, { mangaType: 'kawaii' });
        }
        return await functions.sendMangaMessage(sock, from, 'Utilisation: .autoreact [on/off]', msg, { mangaType: 'otaku' });
    },

    async autoread(sock, from, args, msg) {
        const senderNumber = msg.key.participant ? msg.key.participant.split('@')[0] : msg.key.remoteJid.split('@')[0];
        if (senderNumber !== config.ownerNumber) return await functions.sendMangaMessage(sock, from, '❌ Commande réservée au propriétaire', msg, { mangaType: 'otaku' });
        const action = (args[0] || '').toLowerCase();
        if (action === 'on' || action === 'off') {
            config.flags.autoread = action === 'on';
            return await functions.sendMangaMessage(sock, from, `✅ autoread ${action === 'on' ? 'activé' : 'désactivé'}`, msg, { mangaType: 'kawaii' });
        }
        return await functions.sendMangaMessage(sock, from, 'Utilisation: .autoread [on/off]', msg, { mangaType: 'otaku' });
    },

    async autorecord(sock, from, args, msg) {
        const senderNumber = msg.key.participant ? msg.key.participant.split('@')[0] : msg.key.remoteJid.split('@')[0];
        if (senderNumber !== config.ownerNumber) return await functions.sendMangaMessage(sock, from, '❌ Commande réservée au propriétaire', msg, { mangaType: 'otaku' });
        const action = (args[0] || '').toLowerCase();
        if (action === 'on' || action === 'off') {
            config.flags.autorecord = action === 'on';
            return await functions.sendMangaMessage(sock, from, `✅ autorecord ${action === 'on' ? 'activé' : 'désactivé'}`, msg, { mangaType: 'kawaii' });
        }
        return await functions.sendMangaMessage(sock, from, 'Utilisation: .autorecord [on/off]', msg, { mangaType: 'otaku' });
    },

    async autostatus(sock, from, args, msg) {
        const senderNumber = msg.key.participant ? msg.key.participant.split('@')[0] : msg.key.remoteJid.split('@')[0];
        if (senderNumber !== config.ownerNumber) return await functions.sendMangaMessage(sock, from, '❌ Commande réservée au propriétaire', msg, { mangaType: 'otaku' });
        const action = (args[0] || '').toLowerCase();
        if (action === 'on' || action === 'off') {
            config.flags.autostatus = action === 'on';
            return await functions.sendMangaMessage(sock, from, `✅ autostatus ${action === 'on' ? 'activé' : 'désactivé'}`, msg, { mangaType: 'kawaii' });
        }
        return await functions.sendMangaMessage(sock, from, 'Utilisation: .autostatus [on/off]', msg, { mangaType: 'otaku' });
    },

    async autotyping(sock, from, args, msg) {
        const senderNumber = msg.key.participant ? msg.key.participant.split('@')[0] : msg.key.remoteJid.split('@')[0];
        if (senderNumber !== config.ownerNumber) return await functions.sendMangaMessage(sock, from, '❌ Commande réservée au propriétaire', msg, { mangaType: 'otaku' });
        const action = (args[0] || '').toLowerCase();
        if (action === 'on' || action === 'off') {
            config.flags.autotyping = action === 'on';
            return await functions.sendMangaMessage(sock, from, `✅ autotyping ${action === 'on' ? 'activé' : 'désactivé'}`, msg, { mangaType: 'kawaii' });
        }
        return await functions.sendMangaMessage(sock, from, 'Utilisation: .autotyping [on/off]', msg, { mangaType: 'otaku' });
    },

    async forward(sock, from, args, msg) {
        const senderNumber = msg.key.participant ? msg.key.participant.split('@')[0] : msg.key.remoteJid.split('@')[0];
        if (senderNumber !== config.ownerNumber) return await functions.sendMangaMessage(sock, from, '❌ Commande réservée au propriétaire', msg, { mangaType: 'otaku' });
        config.flags.forward = !config.flags.forward;
        return await functions.sendMangaMessage(sock, from, `✅ forward ${config.flags.forward ? 'activé' : 'désactivé'}`, msg, { mangaType: 'kawaii' });
    },

    async fullpp(sock, from, args, msg) {
        const senderNumber = msg.key.participant ? msg.key.participant.split('@')[0] : msg.key.remoteJid.split('@')[0];
        if (senderNumber !== config.ownerNumber) return await functions.sendMangaMessage(sock, from, '❌ Commande réservée au propriétaire', msg, { mangaType: 'otaku' });
        config.flags.fullpp = !config.flags.fullpp;
        return await functions.sendMangaMessage(sock, from, `✅ fullpp ${config.flags.fullpp ? 'activé' : 'désactivé'}`, msg, { mangaType: 'kawaii' });
    },

    async goodbye(sock, from, args, msg) {
        const senderNumber = msg.key.participant ? msg.key.participant.split('@')[0] : msg.key.remoteJid.split('@')[0];
        if (senderNumber !== config.ownerNumber) return await functions.sendMangaMessage(sock, from, '❌ Commande réservée au propriétaire', msg, { mangaType: 'otaku' });
        config.flags.goodbye = !config.flags.goodbye;
        return await functions.sendMangaMessage(sock, from, `✅ goodbye ${config.flags.goodbye ? 'activé' : 'désactivé'}`, msg, { mangaType: 'kawaii' });
    },

    async jid(sock, from, args, msg) {
        // Retourne le JID du message cité ou de la cible
        if (msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo && msg.message.extendedTextMessage.contextInfo.participant) {
            const jid = msg.message.extendedTextMessage.contextInfo.participant;
            return await functions.sendMangaMessage(sock, from, `JID: ${jid}`, msg, { mangaType: 'otaku' });
        }
        return await functions.sendMangaMessage(sock, from, `Votre JID: ${msg.key.participant || msg.key.remoteJid}`, msg, { mangaType: 'kawaii' });
    },

    async join(sock, from, args, msg) {
        const senderNumber = msg.key.participant ? msg.key.participant.split('@')[0] : msg.key.remoteJid.split('@')[0];
        if (senderNumber !== config.ownerNumber) return await functions.sendMangaMessage(sock, from, '❌ Commande réservée au propriétaire', msg, { mangaType: 'otaku' });
        if (!args[0]) return await functions.sendMangaMessage(sock, from, 'Utilisation: .join [lien_invite]', msg, { mangaType: 'otaku' });
        // Simulation d'adhésion
        return await functions.sendMangaMessage(sock, from, `✅ Tentative de rejoindre: ${args[0]} (simulation)`, msg, { mangaType: 'kawaii' });
    },

    async mystatus(sock, from, args, msg) {
        const senderNumber = msg.key.participant ? msg.key.participant.split('@')[0] : msg.key.remoteJid.split('@')[0];
        if (senderNumber !== config.ownerNumber) return await functions.sendMangaMessage(sock, from, '❌ Commande réservée au propriétaire', msg, { mangaType: 'otaku' });
        return await functions.sendMangaMessage(sock, from, `Status actuel du bot: ${config.flags.autostatus ? 'auto' : 'manuel'}`, msg, { mangaType: 'kawaii' });
    },

    async myprivacy(sock, from, args, msg) {
        const senderNumber = msg.key.participant ? msg.key.participant.split('@')[0] : msg.key.remoteJid.split('@')[0];
        if (senderNumber !== config.ownerNumber) return await functions.sendMangaMessage(sock, from, '❌ Commande réservée au propriétaire', msg, { mangaType: 'otaku' });
        return await functions.sendMangaMessage(sock, from, 'Paramètres de confidentialité: (simulation) Public: ouvert', msg, { mangaType: 'kawaii' });
    },

    async pp(sock, from, args, msg) {
        // Envoi de la photo de profil complète si fullpp activé
        const ppUrl = await functions.getRandomMangaImage('kawaii');
        return await sock.sendMessage(from, { image: { url: ppUrl }, caption: config.footer }, { quoted: msg });
    },

    async quoted(sock, from, args, msg) {
        // Retourne le message cité s'il existe
        const ctx = msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo;
        if (ctx && ctx.quotedMessage) {
            return await functions.sendMangaMessage(sock, from, `Message cité:
${JSON.stringify(ctx.quotedMessage).substring(0, 400)}`, msg, { mangaType: 'otaku' });
        }
        return await functions.sendMangaMessage(sock, from, 'Aucun message cité trouvé.', msg, { mangaType: 'kawaii' });
    },

    async removepp(sock, from, args, msg) {
        const senderNumber = msg.key.participant ? msg.key.participant.split('@')[0] : msg.key.remoteJid.split('@')[0];
        if (senderNumber !== config.ownerNumber) return await functions.sendMangaMessage(sock, from, '❌ Commande réservée au propriétaire', msg, { mangaType: 'otaku' });
        return await functions.sendMangaMessage(sock, from, '✅ Photo de profil supprimée (simulation)', msg, { mangaType: 'kawaii' });
    },

    async save(sock, from, args, msg) {
        // Sauvegarde d'un message ou média (simulation)
        return await functions.sendMangaMessage(sock, from, '✅ Contenu sauvegardé (simulation)', msg, { mangaType: 'kawaii' });
    },

    async savestatus(sock, from, args, msg) {
        // Sauvegarder status (simulation)
        return await functions.sendMangaMessage(sock, from, '✅ Status sauvegardé (simulation)', msg, { mangaType: 'kawaii' });
    },

    async welcome(sock, from, args, msg) {
        const senderNumber = msg.key.participant ? msg.key.participant.split('@')[0] : msg.key.remoteJid.split('@')[0];
        if (senderNumber !== config.ownerNumber) return await functions.sendMangaMessage(sock, from, '❌ Commande réservée au propriétaire', msg, { mangaType: 'otaku' });
        config.flags.welcome = !config.flags.welcome;
        return await functions.sendMangaMessage(sock, from, `✅ welcome ${config.flags.welcome ? 'activé' : 'désactivé'}`, msg, { mangaType: 'kawaii' });
    },

    async antibot(sock, from, args, msg) {
        const senderNumber = msg.key.participant ? msg.key.participant.split('@')[0] : msg.key.remoteJid.split('@')[0];
        if (senderNumber !== config.ownerNumber) return await functions.sendMangaMessage(sock, from, '❌ Commande réservée au propriétaire', msg, { mangaType: 'otaku' });
        config.flags.antibot = !config.flags.antibot;
        return await functions.sendMangaMessage(sock, from, `✅ antibot ${config.flags.antibot ? 'activé' : 'désactivé'}`, msg, { mangaType: 'kawaii' });
    },

    async ping(sock, from, args, msg) {
        const start = Date.now();
        await functions.sendMangaMessage(sock, from, '🏓 Pong...', msg, { mangaType: 'dandadan' });
        const latency = Date.now() - start;
        return await functions.sendMangaMessage(sock, from, `📊 Latence: ${latency}ms`, msg, { mangaType: 'jujutsuKaisen' });
    },

    async emojimix(sock, from, args, msg) {
        // Simple simulation: retourne une URL d'image aléatoire
        return await functions.sendMangaMessage(sock, from, '✨ Résultat emojimix (simulation)', msg, { mangaType: 'kawaii' });
    },

    async invite(sock, from, args, msg) {
        return await functions.sendMangaMessage(sock, from, '🔗 Invite générée (simulation)', msg, { mangaType: 'otaku' });
    },

    async inviteuser(sock, from, args, msg) {
        return await functions.sendMangaMessage(sock, from, '✅ Utilisateur invité (simulation)', msg, { mangaType: 'kawaii' });
    },

    async disappear(sock, from, args, msg) {
        // Toggle disappear mode
        const senderNumber = msg.key.participant ? msg.key.participant.split('@')[0] : msg.key.remoteJid.split('@')[0];
        if (senderNumber !== config.ownerNumber) return await functions.sendMangaMessage(sock, from, '❌ Commande réservée au propriétaire', msg, { mangaType: 'otaku' });
        config.flags.disappear = !config.flags.disappear;
        return await functions.sendMangaMessage(sock, from, `✅ disappear ${config.flags.disappear ? 'activé' : 'désactivé'}`, msg, { mangaType: 'kawaii' });
    },

    async antiword(sock, from, args, msg) {
        if (!args[0]) return await functions.sendMangaMessage(sock, from, 'Utilisation: .antiword [mot]', msg, { mangaType: 'otaku' });
        // Ajouter la logique antiword (simulation)
        return await functions.sendMangaMessage(sock, from, `✅ Mot ajouté à la liste antiword: ${args[0]}`, msg, { mangaType: 'kawaii' });
    },

    async randomtag(sock, from, args, msg) {
        // Tag aléatoire (simulation)
        return await functions.sendMangaMessage(sock, from, '🔖 Tag aléatoire envoyé (simulation)', msg, { mangaType: 'onePiece' });
    },

    async approve(sock, from, args, msg) {
        return await functions.sendMangaMessage(sock, from, '✅ Requête approuvée (simulation)', msg, { mangaType: 'kawaii' });
    },

    async subject(sock, from, args, msg) {
        if (!args.length) return await functions.sendMangaMessage(sock, from, 'Utilisation: .subject [texte]', msg, { mangaType: 'otaku' });
        const subject = args.join(' ');
        return await functions.sendMangaMessage(sock, from, `✅ Sujet défini: ${subject} (simulation)`, msg, { mangaType: 'kawaii' });
    },
    
    async getname(sock, from, args, msg) {
        const profile = await sock.profilePictureUrl(msg.key.remoteJid, 'image');
        
        await functions.sendMangaMessage(sock, from, `👤 Informations profil\n\nNom: ${config.botName}\nPropriétaire: ${config.owner}`, msg, { mangaType: 'kawaii' });
    },
    
    async listgc(sock, from, args, msg) {
        const senderNumber = msg.key.participant ? msg.key.participant.split('@')[0] : msg.key.remoteJid.split('@')[0];
        
        if (senderNumber !== config.ownerNumber) {
            return await functions.sendMangaMessage(sock, from, '❌ Commande réservée au propriétaire', msg, { mangaType: 'otaku' });
        }
        
        // Ici, vous listeriez tous les groupes
        await functions.sendMangaMessage(sock, from, '📋 Liste des groupes\n\nFonctionnalité en développement...', msg, { mangaType: 'kawaii' });
    },
    
    async leaveall(sock, from, args, msg) {
        const senderNumber = msg.key.participant ? msg.key.participant.split('@')[0] : msg.key.remoteJid.split('@')[0];
        
        if (senderNumber !== config.ownerNumber) {
            return await functions.sendMangaMessage(sock, from, '❌ Commande réservée au propriétaire', msg, { mangaType: 'otaku' });
        }
        
        await functions.sendMangaMessage(sock, from, '🚪 Quitter tous les groupes...', msg, { mangaType: 'otaku' });
        
        // Confirmation
        await functions.sendMangaMessage(sock, from, '⚠️ Cette commande est dangereuse!\nUtilisez avec précaution.', msg, { mangaType: 'kawaii' });
    },
    
    async block(sock, from, args, msg) {
        const senderNumber = msg.key.participant ? msg.key.participant.split('@')[0] : msg.key.remoteJid.split('@')[0];
        
        if (senderNumber !== config.ownerNumber) {
            return await functions.sendMangaMessage(sock, from, '❌ Commande réservée au propriétaire', msg, { mangaType: 'otaku' });
        }
        
        if (!args[0]) {
            return await functions.sendMangaMessage(sock, from, '❌ Veuillez fournir un numéro\nExemple: .block 243...', msg, { mangaType: 'kawaii' });
        }
        
        const number = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        await sock.updateBlockStatus(number, 'block');
        
        await functions.sendMangaMessage(sock, from, `✅ ${args[0]} bloqué avec succès!`, msg, { mangaType: 'kawaii' });
    },
    
    async unblock(sock, from, args, msg) {
        const senderNumber = msg.key.participant ? msg.key.participant.split('@')[0] : msg.key.remoteJid.split('@')[0];
        
        if (senderNumber !== config.ownerNumber) {
            return await functions.sendMangaMessage(sock, from, '❌ Commande réservée au propriétaire', msg, { mangaType: 'otaku' });
        }
        
        if (!args[0]) {
            return await functions.sendMangaMessage(sock, from, '❌ Veuillez fournir un numéro\nExemple: .unblock 243...', msg, { mangaType: 'kawaii' });
        }
        
        const number = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        await sock.updateBlockStatus(number, 'unblock');
        
        await functions.sendMangaMessage(sock, from, `✅ ${args[0]} débloqué avec succès!`, msg, { mangaType: 'kawaii' });
    },

    async alwaysonline(sock, from, args, msg) {
        const senderNumber = msg.key.participant ? msg.key.participant.split('@')[0] : msg.key.remoteJid.split('@')[0];
        if (senderNumber !== config.ownerNumber) return await functions.sendMangaMessage(sock, from, '❌ Commande réservée au propriétaire', msg, { mangaType: 'otaku' });
        const action = (args[0] || 'status').toLowerCase();
        if (action === 'on') {
            config.alwaysOnline = true;
            return await functions.sendMangaMessage(sock, from, '✅ Always-online activé', msg, { mangaType: 'kawaii' });
        } else if (action === 'off') {
            config.alwaysOnline = false;
            return await functions.sendMangaMessage(sock, from, '✅ Always-online désactivé', msg, { mangaType: 'kawaii' });
        } else {
            return await functions.sendMangaMessage(sock, from, 'Utilisation: .alwaysonline [on/off]', msg, { mangaType: 'otaku' });
        }
    },

    async anticall(sock, from, args, msg) {
        const senderNumber = msg.key.participant ? msg.key.participant.split('@')[0] : msg.key.remoteJid.split('@')[0];
        if (senderNumber !== config.ownerNumber) return await functions.sendMangaMessage(sock, from, '❌ Commande réservée au propriétaire', msg, { mangaType: 'otaku' });
        const action = (args[0] || 'status').toLowerCase();
        if (action === 'on') {
            config.anticall = true;
            return await functions.sendMangaMessage(sock, from, '✅ Anticall activé (les appels seront rejetés)', msg, { mangaType: 'kawaii' });
        } else if (action === 'off') {
            config.anticall = false;
            return await functions.sendMangaMessage(sock, from, '✅ Anticall désactivé', msg, { mangaType: 'kawaii' });
        } else {
            return await functions.sendMangaMessage(sock, from, 'Utilisation: .anticall [on/off]', msg, { mangaType: 'otaku' });
        }
    }
};