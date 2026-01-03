module.exports = {
    // Configuration du bot
    botName: "META MD BOT",
    owner: "PRECIEUX OKITAKOY",
    ownerNumber: "243894697490",
    prefix: ".",
    footer: "powered by precieux okitakoy",
    // Mode du bot: 'public' ou 'private'
    botMode: 'public',
    // Nom affiché du propriétaire (pour header du menu)
    ownerName: 'PRECIEUX OKITAKOY',
    // Flags runtime (modifiable via commandes owner)
    flags: {
        autoreact: false,
        autoread: false,
        autorecord: false,
        autostatus: false,
        autotyping: false,
        forward: false,
        fullpp: false,
        goodbye: false,
        disappear: false,
        welcome: true,
        antibot: false
    },
    
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
        // Thèmes supplémentaires
        otaku: [
            "https://cdn.myanimelist.net/images/characters/13/256123.jpg",
            "https://images.unsplash.com/photo-1544986581-efac024faf62?w=800&q=80",
            "https://cdn.myanimelist.net/images/manga/3/245319.jpg"
        ],
        kawaii: [
            "https://images.unsplash.com/photo-1541233349642-6e425fe6190e?w=800&q=80",
            "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=80",
            "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&q=80"
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
        main: `*🌸 ✦ META MD BOT — MENU PRINCIPAL ✦ 🌸*\n\n*🎴 Dév:* PRECIEUX OKITAKOY    •    *Prefix:* ${this.prefix}\n*🎭 Style:* Otaku • Kawaii • Manga\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n✨ *Catégories principales* ✨\n• 📥 *Downloader*    • 🔄 *Converter*    • 🎵 *Music*\n• 👥 *Group*         • 📺 *Anime & Manga*  • 😄 *Reactions*\n• 🎨 *Logo*          • 🔍 *Search*        • 🛠️ *Tools*\n• 📷 *Media*         • ⚙️ *Owner*         • 🧩 *Fun & Games*\n\n*Astuce rapide:*\n• .gmenu → Menu détaillé et pro\n• .menu → Menu rapide\n• .<commande> → Exécuter une commande (ex: .play naruto op)\n\n*Chaque réponse inclut une image manga aléatoire — ambiance Otaku ✨*\n\n${this.footer}`,
        gmenu: `*🎯 MENU DÉTAILLÉ — META MD BOT*\n\n*📂 Catégories & commandes (utilisez: .<commande> )*\n\n*📥 Downloader*\n• fb · git · insta · mp4 · pint · play · song · tiktok · tubidy · video · yta · ytmp3 · ytv\n\n*🔄 Converter*\n• fileio · imgbb · telegraph · url · shorturl\n\n*🎵 Music*\n• play · song · ytmp3 · yta · ytv · tiktok · tubidy · mp4\n\n*👥 Group / Admin*\n• add · admin · admins · announce · antibot · antilink · antistatus · antiword · approve · close · demote · desc · disappear\n• everyone · groupinfo · groupstats · hidetag · invite · inviteuser · kick · leave · lock · open · poll · promote · randomtag · reject · requests · revoke · setgpp · subject · tagadmins · tagall · totag · unlock\n\n*📺 Anime & Recherches*\n• anime · achar · aquote · arecommend · asearch · ass · awoo · cuddle · ecchi · ero · loli · maid · megumin · milf · neko · pat · quote · ranime · shinobu · waifu · character · manga · lyrics\n\n*😄 Reactions & Fun*\n• awoo · bite · blush · bonk · cringe · cry · cuddle · dance · glomp · handhold · happy · highfive · hug · kill · kiss · nom · pat · poke · slap · smile · smug · wave · wink · yeet\n\n*🎨 Logo & Création*\n• 3dcomic · 3Dpaper · america · angel · blackpink · boom · cat · clouds · deadpool · dragonball · eraser · floral · futuristic · galaxy · hacker · leaf · naruto · neonlight · sadgirl · sand · thor · zodiac\n\n*🛠 Tools / Media*\n• emojimix · imagehelp · imageinfo · s · sticker · sticker2img · take · toimage · video2img · vs · img · imgBB\n\n*🔍 Search & Utilitaires*\n• img · wiki · yts · github · weather · calc · qr · ssweb · shorturl\n\n*⚙️ Owner & Auto Features*\n• anticall · autoreact · autoread · autorecord · autostatus · autotyping · always-online · block · blocklist · broadcast · delete · forward · fullpp · getbio · getname · goodbye · jid · join · leaveall · listgc · myname · myprivacy · mystatus · pp · removepp · quoted · save · savestatus · setbio · setname · setpp · unblock · unblockall · welcome\n\n*📌 Divers*\n• ping · trt · uptime · alive · gmenu · list · menu\n\n*Chaque commande renvoie une image manga aléatoire et une signature: ${this.footer}*` 
    },
    
    // Liste des commandes par catégorie (nom en minuscules)
    commands: {
        downloader: ['fb','git','insta','mp4','pint','play','song','tiktok','tubidy','video','yta','ytmp3','ytv','pint'],
        converter: ['fileio','imgbb','telegraph','url','shorturl'],
        social: ['fb','git','insta','github','pint'],
        music: ['play','song','ytmp3','yta','tubidy','tiktok','ytv','mp4','video','tomp3'],
        group: ['add','admin','admins','announce','antibot','antilink','antistatus','antiword','approve','close','demote','desc','disappear','everyone','groupinfo','groupstats','hidetag','invite','inviteuser','kick','leave','lock','open','poll','promote','randomtag','reject','requests','revoke','setgpp','subject','tagadmins','tagall','totag','unlock'],
        anime: ['anime','achar','aquote','arecommend','asearch','ass','awoo','cuddle','ecchi','ero','loli','maid','megumin','milf','neko','pat','quote','ranime','shinobu','waifu','character','manga','lyrics'],
        reactions: ['awoo','bite','blush','bonk','cringe','cry','cuddle','dance','glomp','handhold','happy','highfive','hug','kill','kiss','nom','pat','poke','slap','smile','smug','wave','wink','yeet'],
        logo: ['3dcomic','3Dpaper','america','angel','blackpink','boom','cat','clouds','deadpool','dragonball','eraser','floral','futuristic','galaxy','hacker','leaf','naruto','neonlight','sadgirl','sand','thor','zodiac'],
        search: ['img','wiki','yts','search','asearch','github','yts'],
        tools: ['calc','circle','get','qr','shorturl','ssweb','tomp3','temp3','url','fileio'],
        media: ['emojimix','imagehelp','imageinfo','s','sticker','sticker2img','take','toimage','video2img','vs','img','imgbb'],
        info: ['anime','character','lyrics','manga','weather','get','getbio','getname'],
        owner: ['anticall','autoreact','autoread','autorecord','autostatus','autotyping','always-online','block','blocklist','broadcast','delete','forward','fullpp','getbio','getname','goodbye','jid','join','leaveall','listgc','myname','myprivacy','mystatus','pp','removepp','quoted','save','savestatus','setbio','setname','setpp','unblock','unblockall','welcome','approve','reject','requests'],
        viewonce: ['vv','vv2','viewonce','vs'],
        misc: ['ping','trt','uptime','alive','gmenu','list','menu','add','remove','save','quoted','broadcast','block','unblock'],
        fun: ['img','wiki','yts','calc','randomtag','tagall','everyone','hidetag','totag','tagadmins','roll','coin','8ball','joke','meme','animefact','ship','randomquote','say']
    }
};