module.exports = {
    // Configuration du bot
    botName: "META MD BOT",
    owner: "PRECIEUX OKITAKOY",
    ownerNumber: "243894697490",
    prefix: ".",
    footer: "Signature: by PRECIEUX OKITAKOY",
    
    // URLs d'images manga aléatoires
    mangaImages: {
        dandadan: [
            "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=800&q=80",
            "https://images.unsplash.com/photo-1639322537501-1d4b6d4f3e8f?w=800&q=80",
            "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=800&q=75",
            "https://cdn.myanimelist.net/images/manga/3/245319.jpg",
            "https://cdn.myanimelist.net/images/manga/2/245318.jpg"
        ],
        tokyoGhoul: [
            "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80",
            "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=75",
            "https://cdn.myanimelist.net/images/manga/2/223311.jpg",
            "https://cdn.myanimelist.net/images/manga/1/223310.jpg",
            "https://cdn.myanimelist.net/images/manga/3/223312.jpg"
        ],
        jujutsuKaisen: [
            "https://images.unsplash.com/photo-1639322537501-1d4b6d4f3e8f?w=800&q=80",
            "https://cdn.myanimelist.net/images/manga/2/210238.jpg",
            "https://cdn.myanimelist.net/images/manga/3/210239.jpg"
        ],
        chainsawMan: [
            "https://images.unsplash.com/photo-1639322537501-1d4b6d4f3e8f?w=800&q=80",
            "https://cdn.myanimelist.net/images/manga/3/222011.jpg",
            "https://cdn.myanimelist.net/images/manga/2/222010.jpg"
        ],
        onePiece: [
            "https://cdn.myanimelist.net/images/manga/2/253146.jpg",
            "https://cdn.myanimelist.net/images/manga/3/253147.jpg"
        ],
        naruto: [
            "https://cdn.myanimelist.net/images/manga/3/249721.jpg",
            "https://cdn.myanimelist.net/images/manga/2/249720.jpg"
        ],
        demonSlayer: [
            "https://cdn.myanimelist.net/images/manga/3/179023.jpg",
            "https://cdn.myanimelist.net/images/manga/2/179022.jpg"
        ],
        // Images génériques manga/anime
        generic: [
            "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=800&q=80",
            "https://images.unsplash.com/photo-1639322537501-1d4b6d4f3e8f?w=800&q=80",
            "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80",
            "https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?w=800&q=80",
            "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800&q=80",
            "https://images.unsplash.com/photo-1542744094-0a3f4c4b6d7c?w=800&q=80"
        ]
    },
    
    // Fonction pour obtenir une image aléatoire
    getRandomMangaImage: function(manga = 'generic') {
        const images = this.mangaImages[manga] || this.mangaImages.generic;
        const randomIndex = Math.floor(Math.random() * images.length);
        return images[randomIndex];
    },
    
    // Menus
    menus: {
        main: `╔═══════════════════════════╗
║     🤖 META MD BOT     ║
╚═══════════════════════════╝

👨‍💻 *Développeur:* PRECIEUX OKITAKOY
🔧 *Prefix:* .
⏰ *Uptime:* En ligne
🎨 *Manga Mode:* Activé

═══════════════════════════
📂 *CATÉGORIES DISPONIBLES:*

1. 📥 *DOWNLOADER* - Téléchargements
2. 🔄 *CONVERTER* - Conversions
3. 👥 *GROUP* - Gestion de groupe
4. 🎨 *LOGO* - Création de logos
5. 📺 *ANIME* - Commandes anime
6. 😄 *REACTIONS* - Réactions
7. 🔍 *SEARCH* - Recherches
8. 🛠️ *TOOLS* - Outils
9. 📷 *MEDIA* - Médias
10. ⚙️ *OWNER* - Propriétaire
11. ℹ️ *INFO* - Informations
12. 👁️ *VIEW-ONCE* - View once

═══════════════════════════
🔹 Tapez *.[catégorie]* pour voir les commandes
🔹 Exemple: *.downloader*
🔹 *.menu* - Voir ce menu
🔹 *.alive* - Vérifier le statut

🎮 *Images manga aléatoires activées!*

${this.footer}`
    },
    
    // Liste des commandes par catégorie
    commands: {
        downloader: ['fb', 'git', 'insta', 'mp4', 'pint', 'play', 'song', 'tiktok', 'tubidy', 'video', 'yta', 'ytmp3', 'ytv'],
        converter: ['fileio', 'impbb', 'telegraph', 'url'],
        group: ['add', 'admin', 'admins', 'announce', 'antibot', 'antilink', 'antistatus', 'antiword', 'approve', 'close', 'demote', 'desc', 'disappear', 'everyone', 'groupinfo', 'groupstats', 'hidetag', 'invite', 'inviteuser', 'kick', 'leave', 'lock', 'open', 'poll', 'promote', 'randomtag', 'reject', 'requests', 'revoke', 'setgpp', 'subject', 'tagadmins', 'tagall', 'totag', 'unlock'],
        anime: ['achar', 'aguote', 'arecommend', 'asearch', 'ass', 'avoo', 'cuddle', 'ecchi', 'ero', 'loli', 'maid', 'megumin', 'milf', 'neko', 'pat', 'quote', 'ranime', 'shinobu', 'waifu'],
        reactions: ['awoo', 'bite', 'blush', 'bonk', 'bully', 'cringe', 'cry', 'cuddle', 'dance', 'glomp', 'handhold', 'happy', 'highfive', 'hug', 'kill', 'kiss', 'lick', 'nom', 'pat', 'poke', 'slap', 'smile', 'smug', 'wave', 'wink', 'yeet'],
        logo: ['3dcomic', '3dpaper', 'america', 'angel', 'blackpink', 'boom', 'cat', 'clouds', 'deadpool', 'dragonball', 'eraser', 'floral', 'futuristic', 'galaxy', 'hacker', 'leaf', 'naruto', 'neonlight', 'sadgirl', 'sand', 'thor', 'zodiac'],
        search: ['img', 'wiki', 'yts'],
        tools: ['calc', 'circle', 'get', 'qr', 'shorturl', 'ssweb', 'temp3'],
        stalk: ['github'],
        info: ['anime', 'character', 'lyrics', 'manga', 'weather'],
        media: ['emojimix', 'imagehelp', 'imageinfo', 's', 'sticker', 'sticker2img', 'take', 'toimage', 'video2img', 'vs'],
        mics: ['ping', 'trt', 'uptime'],
        owner: ['anticall', 'autoreact', 'autoread', 'autorecord', 'autostatus', 'autotyping', 'block', 'blocklist', 'broadcast', 'delete', 'forward', 'fullpp', 'getbio', 'getname', 'goodbye', 'jid', 'join', 'leaveall', 'listgc', 'myname', 'myprivacy', 'mystatus', 'pp', 'quoted', 'removepp', 'save', 'savestatus', 'setbio', 'setname', 'setpp', 'unblock', 'unblockall', 'welcome'],
        viewonce: ['vv', 'vv2']
    }
};