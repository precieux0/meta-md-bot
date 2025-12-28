const axios = require('axios');

module.exports = {
    name: 'search',
    
    async img(sock, from, args, msg) {
        try {
            if (!args[0]) {
                return await sock.sendMessage(from, { 
                    text: '❌ Veuillez fournir une recherche\nExemple: .img chat mignon\n\n_Signature: by PRECIEUX OKITAKOY_' 
                }, { quoted: msg });
            }
            
            const query = encodeURIComponent(args.join(' '));
            
            await sock.sendMessage(from, { 
                text: `🔍 Recherche d'images: ${args.join(' ')}...\n\n_Signature: by PRECIEUX OKITAKOY_` 
            }, { quoted: msg });
            
            // Utiliser Google Custom Search API ou autre
            const apiUrl = `https://www.googleapis.com/customsearch/v1?q=${query}&searchType=image&key=YOUR_KEY&cx=YOUR_CX`;
            
            // Pour l'instant, réponse de démonstration
            await sock.sendMessage(from, { 
                text: `📷 Images trouvées pour: ${args.join(' ')}\n\nUtilisez Google Images ou:\n- unsplash.com\n- pixabay.com\n\n_Signature: by PRECIEUX OKITAKOY_` 
            }, { quoted: msg });
            
        } catch (error) {
            await sock.sendMessage(from, { 
                text: `❌ Erreur: ${error.message}\n\n_Signature: by PRECIEUX OKITAKOY_` 
            }, { quoted: msg });
        }
    },
    
    async wiki(sock, from, args, msg) {
        try {
            if (!args[0]) {
                return await sock.sendMessage(from, { 
                    text: '❌ Veuillez fournir un terme\nExemple: .wiki Albert Einstein\n\n_Signature: by PRECIEUX OKITAKOY_' 
                }, { quoted: msg });
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
            
            result += '\n\n_Signature: by PRECIEUX OKITAKOY_';
            
            await sock.sendMessage(from, { text: result }, { quoted: msg });
            
        } catch (error) {
            await sock.sendMessage(from, { 
                text: `❌ Article non trouvé pour: ${args.join(' ')}\n\n_Signature: by PRECIEUX OKITAKOY_` 
            }, { quoted: msg });
        }
    },
    
    async github(sock, from, args, msg) {
        try {
            if (!args[0]) {
                return await sock.sendMessage(from, { 
                    text: '❌ Veuillez fournir un username GitHub\nExemple: .github precieux\n\n_Signature: by PRECIEUX OKITAKOY_' 
                }, { quoted: msg });
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

_Signature: by PRECIEUX OKITAKOY_`;
            
            await sock.sendMessage(from, { text: profile }, { quoted: msg });
            
            // Envoyer l'avatar si disponible
            if (data.avatar_url) {
                await sock.sendMessage(from, { 
                    image: { url: data.avatar_url },
                    caption: `🖼️ Avatar de ${data.login}\n\n_Signature: by PRECIEUX OKITAKOY_`
                }, { quoted: msg });
            }
            
        } catch (error) {
            await sock.sendMessage(from, { 
                text: `❌ Utilisateur GitHub non trouvé: ${args[0]}\n\n_Signature: by PRECIEUX OKITAKOY_` 
            }, { quoted: msg });
        }
    },
    
    async yts(sock, from, args, msg) {
        try {
            if (!args[0]) {
                return await sock.sendMessage(from, { 
                    text: '❌ Veuillez fournir un film/série\nExemple: .yts Inception\n\n_Signature: by PRECIEUX OKITAKOY_' 
                }, { quoted: msg });
            }
            
            const query = encodeURIComponent(args.join(' '));
            
            await sock.sendMessage(from, { 
                text: `🎬 Recherche YTS: ${args.join(' ')}...\n\n_Signature: by PRECIEUX OKITAKOY_` 
            }, { quoted: msg });
            
            // Utiliser l'API YTS ou web scraping
            await sock.sendMessage(from, { 
                text: `🍿 Films trouvés pour: ${args.join(' ')}\n\nVisitez: yts.mx\n\n_Signature: by PRECIEUX OKITAKOY_` 
            }, { quoted: msg });
            
        } catch (error) {
            await sock.sendMessage(from, { 
                text: `❌ Erreur: ${error.message}\n\n_Signature: by PRECIEUX OKITAKOY_` 
            }, { quoted: msg });
        }
    }
};