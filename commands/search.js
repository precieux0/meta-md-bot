const axios = require('axios');
const config = require('../lib/config');
const functions = require('../lib/functions');

module.exports = {
    name: 'search',
    
    async img(sock, from, args, msg) {
        try {
            if (!args[0]) {
                return await functions.sendMangaMessage(sock, from, '❌ Veuillez fournir une recherche\nExemple: .img chat mignon', msg, { mangaType: 'otaku' });
            }
            
            const query = encodeURIComponent(args.join(' '));
            
            await functions.sendMangaMessage(sock, from, `🔍 Recherche d'images: ${args.join(' ')}...`, msg, { mangaType: 'otaku' });
            
            // Utiliser Google Custom Search API ou autre
            const apiUrl = `https://www.googleapis.com/customsearch/v1?q=${query}&searchType=image&key=YOUR_KEY&cx=YOUR_CX`;
            
            // Pour l'instant, réponse de démonstration
            await functions.sendMangaMessage(sock, from, `📷 Images trouvées pour: ${args.join(' ')}\n\nUtilisez Google Images ou:\n- unsplash.com\n- pixabay.com`, msg, { mangaType: 'kawaii' });
            
        } catch (error) {
            await functions.sendMangaMessage(sock, from, `❌ Erreur: ${error.message}`, msg, { mangaType: 'otaku' });
        }
    },
    
    async wiki(sock, from, args, msg) {
        try {
            if (!args[0]) {
                return await functions.sendMangaMessage(sock, from, '❌ Veuillez fournir un terme\nExemple: .wiki Albert Einstein', msg, { mangaType: 'otaku' });
            }
            
            const query = encodeURIComponent(args.join(' '));
            const response = await axios.get(`https://fr.wikipedia.org/api/rest_v1/page/summary/${query}`);
            const data = response.data;
            
            let result = `📚 *Wikipedia: ${data.title}*\n\n`;
            
            if (data.extract) {
                result += data.extract.substring(0, 1000);
                if (data.extract.length > 1000) result += '...';
            }
            
            if (data.description) {
                result += `\n\n📖 *Description:* ${data.description}`;
            }
            
            if (data.content_urls && data.content_urls.desktop) {
                result += `\n\n🔗 *Lien:* ${data.content_urls.desktop.page}`;
            }
            
            result += '\n\n' + config.footer; 
            
            await functions.sendMangaMessage(sock, from, result, msg, { mangaType: 'otaku' });
        } catch (error) {
            await functions.sendMangaMessage(sock, from, `❌ Article non trouvé pour: ${args.join(' ')}\n\n${error.message}`, msg, { mangaType: 'otaku' });
        }
    },
    
    async github(sock, from, args, msg) {
        try {
            if (!args[0]) {
                return await functions.sendMangaMessage(sock, from, '❌ Veuillez fournir un username GitHub\nExemple: .github precieux', msg, { mangaType: 'otaku' });
            }
            
            const username = args[0];
            const response = await axios.get(`https://api.github.com/users/${username}`);
            const data = response.data;
            
            const profile = `👨‍💻 *GitHub: ${data.login}*
            
*Nom:* ${data.name || 'Non spécifié'}
*Bio:* ${data.bio || 'Aucune bio'}
*Company:* ${data.company || 'Aucune'}
*Location:* ${data.location || 'Non spécifié'}

📊 *Statistiques:*
- Répositories: ${data.public_repos}
- Followers: ${data.followers}
- Following: ${data.following}
- Créé le: ${new Date(data.created_at).toLocaleDateString()}

🔗 *Liens:*
- Profile: ${data.html_url}
${data.blog ? `- Blog: ${data.blog}` : ''}

${data.avatar_url ? '*Avatar disponible*' : ''}

` + config.footer; 
            
            await functions.sendMangaMessage(sock, from, profile, msg, { mangaType: 'kawaii' });
            
            // Envoyer l'avatar si disponible
            if (data.avatar_url) {
                await sock.sendMessage(from, { 
                    image: { url: data.avatar_url },
                    caption: `🖼️ Avatar de ${data.login}\n\n` + config.footer
                }, { quoted: msg });
            }
            
        } catch (error) {
            await functions.sendMangaMessage(sock, from, `❌ Utilisateur GitHub non trouvé: ${args[0]}`, msg, { mangaType: 'otaku' });
        }
    },
    
    async yts(sock, from, args, msg) {
        try {
            if (!args[0]) {
                return await functions.sendMangaMessage(sock, from, '❌ Veuillez fournir un film/série\nExemple: .yts Inception', msg, { mangaType: 'otaku' });
            }
            
            const query = encodeURIComponent(args.join(' '));
            
            await functions.sendMangaMessage(sock, from, `🎬 Recherche YTS: ${args.join(' ')}...`, msg, { mangaType: 'otaku' });
            
            // Utiliser l'API YTS ou web scraping
            await functions.sendMangaMessage(sock, from, `🍿 Films trouvés pour: ${args.join(' ')}\n\nVisitez: yts.mx`, msg, { mangaType: 'kawaii' });
            
        } catch (error) {
            await functions.sendMangaMessage(sock, from, `❌ Erreur: ${error.message}`, msg, { mangaType: 'otaku' });
        }
    }
};