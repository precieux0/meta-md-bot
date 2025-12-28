const config = require('./config');
const functions = require('./functions');
const path = require('path');
const fs = require('fs');

module.exports = (sock, startTime) => async ({ messages }) => {
    try {
        const msg = messages[0];
        if (!msg.message) return;
        
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || from;
        const isGroup = from.endsWith('@g.us');
        const pushName = msg.pushName || 'Utilisateur';
        
        // Extraire le texte du message
        let text = '';
        if (msg.message.conversation) text = msg.message.conversation;
        else if (msg.message.extendedTextMessage?.text) text = msg.message.extendedTextMessage.text;
        else if (msg.message.imageMessage?.caption) text = msg.message.imageMessage.caption;
        else if (msg.message.videoMessage?.caption) text = msg.message.videoMessage.caption;
        
        text = text.trim();
        const command = text.toLowerCase();
        
        // Ignorer les messages sans préfixe (sauf certaines commandes spéciales)
        if (!text.startsWith(config.prefix) && !['menu', 'alive', 'help', 'start'].includes(text.toLowerCase())) {
            return;
        }
        
        // Supprimer le préfixe
        const cmd = text.startsWith(config.prefix) ? text.slice(config.prefix.length).trim().toLowerCase() : text.toLowerCase();
        const args = cmd.split(' ').slice(1);
        const mainCmd = cmd.split(' ')[0];
        
        // Fonction pour envoyer des messages avec images manga
        const reply = async (text, options = {}) => {
            try {
                await functions.sendMangaMessage(sock, from, text, msg, options);
            } catch (error) {
                console.error('Erreur reply:', error);
                // Fallback
                await sock.sendMessage(from, { 
                    text: text + '\n\n' + config.footer 
                }, { quoted: msg });
            }
        };
        
        // Fonction pour envoyer seulement du texte
        const replyText = async (text) => {
            await sock.sendMessage(from, { 
                text: text + '\n\n' + config.footer 
            }, { quoted: msg });
        };
        
        // MENU PRINCIPAL AVEC IMAGE MANGA
        if (mainCmd === 'menu' || mainCmd === 'help' || mainCmd === 'start') {
            const menuImage = await functions.getRandomMangaImage();
            await sock.sendMessage(from, {
                image: { url: menuImage },
                caption: config.menus.main
            }, { quoted: msg });
        }
        
        // ALIVE AVEC IMAGE MANGA
        else if (mainCmd === 'alive') {
            const uptime = Date.now() - startTime;
            const hours = Math.floor(uptime / (1000 * 60 * 60));
            const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((uptime % (1000 * 60)) / 1000);
            
            const aliveMsg = `✅ *${config.botName} EST EN LIGNE!*

🤖 *Bot Name:* ${config.botName}
👤 *User:* ${pushName}
⚡ *Prefix:* ${config.prefix}
⏱️ *Uptime:* ${hours}h ${minutes}m ${seconds}s
💾 *Storage:* 141MB
👨‍💻 *Dev:* ${config.owner}
📡 *Status:* Opérationnel
🎨 *Manga Mode:* Activé

💬 *Commandes disponibles:* ${Object.values(config.commands).flat().length}+

*Powered by PRECIEUX OKITAKOY TECH*`;
            
            await reply(aliveMsg, { mangaType: 'dandadan' });
        }
        
        // PING
        else if (mainCmd === 'ping') {
            const start = Date.now();
            await sock.sendMessage(from, { 
                text: '🏓 *Pong!*\n\n' + config.footer 
            }, { quoted: msg });
            
            const latency = Date.now() - start;
            const pingMsg = `📊 *STATISTIQUES*

🏓 Latence: ${latency}ms
🤖 Bot: ${config.botName}
👑 Développeur: ${config.owner}
📅 Date: ${new Date().toLocaleDateString()}
⏰ Heure: ${new Date().toLocaleTimeString()}`;
            
            await reply(pingMsg, { mangaType: 'jujutsuKaisen' });
        }
        
        // UPTIME
        else if (mainCmd === 'uptime') {
            const uptime = Date.now() - startTime;
            const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
            const hours = Math.floor((uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((uptime % (1000 * 60)) / 1000);
            
            const uptimeMsg = `⏱️ *UPTIME BOT*

📅 Temps d'activité: 
${days > 0 ? `${days} jours, ` : ''}${hours} heures, ${minutes} minutes, ${seconds} secondes

📊 Depuis: ${new Date(startTime).toLocaleString()}
🔄 Dernier redémarrage: ${new Date(startTime).toLocaleTimeString()}
🎮 Mode Manga: Actif`;
            
            await reply(uptimeMsg, { mangaType: 'chainsawMan' });
        }
        
        // CATÉGORIES DE COMMANDES AVEC IMAGES MANGA
        else if (mainCmd === 'downloader') {
            const menu = `📥 *DOWNLOADER COMMANDS*

🔹 *.fb [url]* - Télécharger vidéo Facebook
🔹 *.insta [url]* - Télécharger vidéo Instagram
🔹 *.tiktok [url]* - Télécharger vidéo TikTok
🔹 *.ytmp3 [url]* - Télécharger YouTube en MP3
🔹 *.ytv [url]* - Télécharger vidéo YouTube
🔹 *.song [titre]* - Télécharger musique
🔹 *.video [query]* - Rechercher vidéo
🔹 *.mp4 [url]* - Convertir en MP4
🔹 *.git [url]* - Télécharger GitHub
🔹 *.pint [url]* - Télécharger Pinterest
🔹 *.play [query]* - Jouer musique
🔹 *.tubidy [query]* - Tubidy download
🔹 *.yta [url]* - YouTube audio

🎌 *Images manga: Dandadan, Tokyo Ghoul, Jujutsu Kaisen*`;
            await reply(menu, { mangaType: 'dandadan' });
        }
        
        else if (mainCmd === 'converter') {
            const menu = `🔄 *CONVERTER COMMANDS*

🔹 *.fileio [fichier]* - Convertir fichier
🔹 *.telegraph [texte]* - Upload vers Telegraph
🔹 *.url [url]* - Raccourcir URL
🔹 *.impbb [image]* - Upload image

⚡ *Powered by Manga Tech*`;
            await reply(menu, { mangaType: 'tokyoGhoul' });
        }
        
        else if (mainCmd === 'group') {
            const menu = `👥 *GROUP COMMANDS*

*Administration:*
🔹 *.add [num]* - Ajouter membre
🔹 *.kick @tag* - Expulser membre
🔹 *.promote @tag* - Promouvoir admin
🔹 *.demote @tag* - Rétrograder admin

*Paramètres:*
🔹 *.antilink [on/off]* - Anti-liens
🔹 *.antistatus [on/off]* - Anti-status
🔹 *.antiword [mot]* - Anti-mots
🔹 *.close* - Fermer groupe
🔹 *.open* - Ouvrir groupe
🔹 *.lock* - Verrouiller
🔹 *.unlock* - Déverrouiller

*Informations:*
🔹 *.groupinfo* - Info groupe
🔹 *.groupstats* - Statistiques
🔹 *.admins* - Liste admins

*Tags:*
🔹 *.everyone* - Tag tout le monde
🔹 *.tagall* - Tag tous
🔹 *.hidetag [msg]* - Tag caché
🔹 *.randomtag* - Tag aléatoire

🎮 *Gérez votre groupe avec style manga!*`;
            await reply(menu, { mangaType: 'naruto' });
        }
        
        else if (mainCmd === 'anime') {
            const menu = `📺 *ANIME COMMANDS*

🔹 *.waifu* - Image waifu aléatoire
🔹 *.neko* - Image neko
🔹 *.shinobu* - Shinobu
🔹 *.megumin* - Megumin
🔹 *.loli* - Loli (safe)
🔹 *.cuddle* - Cuddle GIF
🔹 *.hug* - Hug GIF
🔹 *.kiss* - Kiss GIF
🔹 *.pat* - Pat GIF
🔹 *.slap* - Slap GIF

*Recherche:*
🔹 *.asearch [anime]* - Rechercher anime
🔹 *.achar [personnage]* - Rechercher personnage
🔹 *.manga [titre]* - Rechercher manga
🔹 *.quote* - Citation anime

🎌 *Dandadan • Tokyo Ghoul • Jujutsu Kaisen*`;
            await reply(menu, { mangaType: 'onePiece' });
        }
        
        else if (mainCmd === 'reactions') {
            const menu = `😄 *REACTIONS COMMANDS*

*Interactions:*
🔹 *.hug @tag* - Faire un câlin
🔹 *.kiss @tag* - Faire un bisou
🔹 *.pat @tag* - Tapoter
🔹 *.slap @tag* - Gifler
🔹 *.cuddle @tag* - Câliner

*Émotions:*
🔹 *.cry* - Pleurer
🔹 *.smile* - Sourire
🔹 *.blush* - Rougir
🔹 *.happy* - Heureux
🔹 *.cringe* - Gêné

*Actions:*
🔹 *.dance* - Danser
🔹 *.wave* - Saluer
🔹 *.wink* - Faire un clin d'œil
🔹 *.bonk @tag* - Frapper
🔹 *.yeet @tag* - Lancer

🎭 *Réactions avec thème manga!*`;
            await reply(menu, { mangaType: 'demonSlayer' });
        }
        
        else if (mainCmd === 'logo') {
            const menu = `🎨 *LOGO COMMANDS*

🔹 *.3dcomic [texte]* - Logo 3D Comic
🔹 *.angel [texte]* - Logo Angel
🔹 *.blackpink [texte]* - Logo Blackpink
🔹 *.neonlight [texte]* - Logo Neon
🔹 *.naruto [texte]* - Logo Naruto
🔹 *.galaxy [texte]* - Logo Galaxy
🔹 *.hacker [texte]* - Logo Hacker
🔹 *.futuristic [texte]* - Logo Futuriste
🔹 *.floral [texte]* - Logo Floral
🔹 *.zodiac [texte]* - Logo Zodiac
🔹 *.thor [texte]* - Logo Thor
🔹 *.deadpool [texte]* - Logo Deadpool
🔹 *.dragonball [texte]* - Logo Dragon Ball

✨ *Créez des logos inspirés des mangas!*`;
            await reply(menu, { mangaType: 'dragonball' });
        }
        
        else if (mainCmd === 'search') {
            const menu = `🔍 *SEARCH COMMANDS*

🔹 *.img [query]* - Rechercher images
🔹 *.yts [film]* - Rechercher films
🔹 *.wiki [terme]* - Rechercher Wikipedia
🔹 *.github [user]* - Stalker GitHub
🔹 *.weather [ville]* - Météo

🔎 *Recherchez avec puissance manga!*`;
            await reply(menu, { mangaType: 'generic' });
        }
        
        else if (mainCmd === 'tools') {
            const menu = `🛠️ *TOOLS COMMANDS*

🔹 *.calc [expression]* - Calculatrice
🔹 *.qr [texte]* - Générer QR Code
🔹 *.shorturl [url]* - Raccourcir URL
🔹 *.ssweb [url]* - Capture d'écran site
🔹 *.circle [image]* - Image en cercle
🔹 *.temp3 [unités]* - Convertisseur température

⚙️ *Outils avec style anime!*`;
            await reply(menu, { mangaType: 'generic' });
        }
        
        else if (mainCmd === 'media') {
            const menu = `📷 *MEDIA COMMANDS*

🔹 *.sticker* - Créer sticker
🔹 *.sticker2img* - Sticker vers image
🔹 *.toimage* - Convertir en image
🔹 *.take [auteur]* - Prendre sticker
🔹 *.emojimix [emoji1+emoji2]* - Mixer emojis
🔹 *.imageinfo* - Info image
🔹 *.video2img* - Vidéo vers image
🔹 *.vs [@tag]* - VS sticker

📸 *Transformez vos médias avec flair manga!*`;
            await reply(menu, { mangaType: 'generic' });
        }
        
        else if (mainCmd === 'owner') {
            const menu = `⚙️ *OWNER COMMANDS*

*Bot Control:*
🔹 *.broadcast [msg]* - Broadcast message
🔹 *.join [lien]* - Rejoindre groupe
🔹 *.leaveall* - Quitter tous groupes
🔹 *.listgc* - Liste groupes

*Profile:*
🔹 *.setpp [image]* - Changer photo profil
🔹 *.setname [nom]* - Changer nom
🔹 *.setbio [bio]* - Changer bio
🔹 *.getname* - Obtenir nom
🔹 *.getbio* - Obtenir bio

*Auto Features:*
🔹 *.autoreact [on/off]* - Auto-réaction
🔹 *.autoread [on/off]* - Auto-lu
🔹 *.autostatus [on/off]* - Auto-status
🔹 *.autotyping [on/off]* - Auto-typing

*Block:*
🔹 *.block [num]* - Bloquer
🔹 *.unblock [num]* - Débloquer
🔹 *.blocklist* - Liste bloqués
            
🎮 *Commandes propriétaire exclusive!*`;
            
            // Vérifier si l'utilisateur est le propriétaire
            const senderNumber = sender.split('@')[0];
            if (senderNumber === config.ownerNumber) {
                await reply(menu, { mangaType: 'generic' });
            } else {
                await replyText('❌ Cette commande est réservée au propriétaire du bot.');
            }
        }
        
        else if (mainCmd === 'info') {
            const menu = `ℹ️ *INFO COMMANDS*

🔹 *.anime [titre]* - Info anime
🔹 *.character [nom]* - Info personnage
🔹 *.manga [titre]* - Info manga
🔹 *.lyrics [chanson]* - Paroles
🔹 *.weather [ville]* - Météo

📚 *Informations avec thème manga!*`;
            await reply(menu, { mangaType: 'generic' });
        }
        
        else if (mainCmd === 'viewonce') {
            const menu = `👁️ *VIEW-ONCE COMMANDS*

🔹 *.vv* - Voir view once
🔹 *.vv2* - Voir view once v2

👀 *Voyez l'invisible avec style!*`;
            await reply(menu, { mangaType: 'generic' });
        }
        
        else if (mainCmd === 'mics') {
            const menu = `🔧 *MICS COMMANDS*

🔹 *.ping* - Test latence
🔹 *.uptime* - Temps d'activité
🔹 *.trt [texte]* - Traduction

🔊 *Commandes diverses manga!*`;
            await reply(menu, { mangaType: 'generic' });
        }
        
        // COMMANDE SPÉCIALE MANGA
        else if (mainCmd === 'manga' || mainCmd === 'dandadan' || mainCmd === 'tokyoghoul') {
            const mangaType = mainCmd === 'dandadan' ? 'dandadan' : 
                            mainCmd === 'tokyoghoul' ? 'tokyoGhoul' : 'generic';
            
            const mangaInfo = {
                'dandadan': `🎌 *DANDADAN*
                
*Genre:* Action, Comédie, Surnaturel, Romance
*Auteur:* Yukinobu Tatsu
*Statut:* En cours
*Chapitres:* 100+
*Synopsis:* L'histoire suit Momo Ayase et Okarun, deux lycéens aux personnalités opposées qui se lancent dans une quête pour récupérer leurs parties intimes volées par des aliens et des esprits!`,
                
                'tokyoGhoul': `🎌 *TOKYO GHOUL*
                
*Genre:* Horreur, Drame, Surnaturel, Action, Psychologique
*Auteur:* Sui Ishida
*Statut:* Terminé
*Volumes:* 14
*Synopsis:* Dans un Tokyo alternatif, des créatures appelées goules ressemblant à des humains se nourrissent de chair humaine. Ken Kaneki, étudiant timide, devient mi-humain mi-goule après une rencontre fatale.`,
                
                'generic': `🎌 *MANGA COLLECTION*
                
Découvrez ces séries populaires:
• Dandadan - Action/Comédie
• Tokyo Ghoul - Horreur/Drame  
• Jujutsu Kaisen - Action/Surnaturel
• Chainsaw Man - Action/Horreur
• One Piece - Aventure/Comédie
• Naruto - Action/Aventure
• Demon Slayer - Action/Historique

Utilisez: .dandadan ou .tokyoghoul`
            };
            
            const info = mangaInfo[mangaType] || mangaInfo.generic;
            await reply(info, { mangaType: mangaType });
        }
        
        // GESTION DES ERREURS
        else if (mainCmd) {
            // Vérifier si la commande existe
            const allCommands = Object.values(config.commands).flat();
            if (allCommands.includes(mainCmd)) {
                await reply(`⚠️ Commande *${mainCmd}* reconnue mais non implémentée.\n\nUtilisez *.menu* pour voir les catégories disponibles.\n\n🎮 *Mode manga activé!*`);
            } else {
                await reply(`❌ Commande *${mainCmd}* non reconnue.\n\nUtilisez *.menu* pour voir toutes les commandes disponibles.\n\n🎌 *Essayez .manga pour des infos sur les séries!*`);
            }
        }
        
    } catch (error) {
        console.error('Erreur dans le handler:', error);
        try {
            const errorImage = await functions.getRandomMangaImage();
            await sock.sendMessage(from, {
                image: { url: errorImage },
                caption: `❌ *Erreur:* ${error.message}\n\nVeuillez réessayer plus tard.\n\n${config.footer}`
            });
        } catch (e) {
            console.error('Impossible d\'envoyer le message d\'erreur:', e);
        }
    }
};