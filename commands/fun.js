const functions = require('../lib/functions');

module.exports = {
    name: 'fun',

    async roll(sock, from, args, msg) {
        const max = parseInt(args[0]) || 6;
        const val = Math.floor(Math.random() * max) + 1;
        await functions.sendMangaMessage(sock, from, `🎲 Roll: 1-${max} → *${val}*`, msg, { mangaType: 'kawaii' });
    },

    async coin(sock, from, args, msg) {
        const val = Math.random() > 0.5 ? 'Face' : 'Pile';
        await functions.sendMangaMessage(sock, from, `🪙 Coin: *${val}*`, msg, { mangaType: 'otaku' });
    },

    async '8ball'(sock, from, args, msg) {
        const answers = ['Oui', 'Non', 'Peut-être', 'Demandez plus tard', 'C’est certain', 'Très douteux'];
        const ans = answers[Math.floor(Math.random() * answers.length)];
        await functions.sendMangaMessage(sock, from, `🎱 8Ball: *${ans}*`, msg, { mangaType: 'otaku' });
    },

    async joke(sock, from, args, msg) {
        const jokes = [
            'Pourquoi le programmeur a faim? Parce qu’il n’a pas de cache!',
            'Un bug entre dans un bar… bar.find(bug)'
        ];
        const j = jokes[Math.floor(Math.random() * jokes.length)];
        await functions.sendMangaMessage(sock, from, `😂 Blague: ${j}`, msg, { mangaType: 'kawaii' });
    },

    async meme(sock, from, args, msg) {
        await functions.sendMangaMessage(sock, from, `📸 Meme aléatoire (placeholder)`, msg, { mangaType: 'otaku' });
    },

    async animefact(sock, from, args, msg) {
        const facts = ['One Piece est la série la plus longue...', 'Naruto a été publié pour la première fois en 1999'];
        const f = facts[Math.floor(Math.random() * facts.length)];
        await functions.sendMangaMessage(sock, from, `🎌 Anime Fact: ${f}`, msg, { mangaType: 'otaku' });
    },

    async ship(sock, from, args, msg) {
        if (!args[1]) {
            return await functions.sendMangaMessage(sock, from, 'Usage: .ship @user1 @user2', msg, { mangaType: 'kawaii' });
        }
        const score = Math.floor(Math.random() * 101);
        await functions.sendMangaMessage(sock, from, `💞 Ship: ${args[0]} + ${args[1]} → *${score}%*`, msg, { mangaType: 'kawaii' });
    },

    async randomquote(sock, from, args, msg) {
        const quotes = ['La persévérance est la clé', 'Toujours viser plus haut'];
        const q = quotes[Math.floor(Math.random() * quotes.length)];
        await functions.sendMangaMessage(sock, from, `📜 Quote: ${q}`, msg, { mangaType: 'otaku' });
    },

    async say(sock, from, args, msg) {
        if (!args[0]) return await functions.sendMangaMessage(sock, from, 'Usage: .say votre message', msg, { mangaType: 'kawaii' });
        await functions.sendMangaMessage(sock, from, args.join(' '), msg, { mangaType: 'otaku' });
    }
};