const axios = require('axios');
const config = require('../lib/config');
const functions = require('../lib/functions');

module.exports = {
    name: 'info',
    
    async weather(sock, from, args, msg) {
        try {
            if (!args[0]) {
                return await functions.sendMangaMessage(sock, from, '❌ Veuillez fournir une ville\nExemple: .weather Paris', msg, { mangaType: 'otaku' });
            }
            
            const city = encodeURIComponent(args.join(' '));
            
            await functions.sendMangaMessage(sock, from, `⛅ Recherche météo pour ${args.join(' ')}...`, msg, { mangaType: 'kawaii' });
            
            // Utiliser OpenWeather API (vous aurez besoin d'une clé API)
            // Pour l'instant, réponse de démonstration
            const weather = `🌤️ *Météo: ${args.join(' ')}*\n\n*Température:* 22°C\n*Ressenti:* 24°C\n*Description:* Partiellement nuageux\n*Humidité:* 65%\n*Vent:* 15 km/h\n*Pression:* 1013 hPa\n\n*Prévisions:*\n🌡️ Min: 18°C | Max: 26°C\n🌅 Lever: 06:45\n🌇 Coucher: 20:30`;
            
            await functions.sendMangaMessage(sock, from, weather, msg, { mangaType: 'otaku' });
            
        } catch (error) {
            await sock.sendMessage(from, { 
                text: `❌ Erreur: ${error.message}\n\n` 
            }, { quoted: msg });
        }
    },
    
    async lyrics(sock, from, args, msg) {
        try {
            if (!args[0]) {
                return await functions.sendMangaMessage(sock, from, '❌ Veuillez fournir un titre de chanson\nExemple: .lyrics Shape of You', msg, { mangaType: 'kawaii' });
            }
            
            const song = encodeURIComponent(args.join(' '));
            
            await functions.sendMangaMessage(sock, from, `🎵 Recherche des paroles: ${args.join(' ')}...`, msg, { mangaType: 'otaku' });
            
            // Utiliser une API de paroles (comme lyrics.ovh)
            const response = await axios.get(`https://api.lyrics.ovh/v1/${song}`);
            const data = response.data;
            
            if (data.lyrics) {
                let lyrics = data.lyrics.substring(0, 2000);
                if (data.lyrics.length > 2000) {
                    lyrics += '\n\n... (paroles tronquées)';
                }
                
                await functions.sendMangaMessage(sock, from, `🎤 *Paroles: ${args.join(' ')}*\n\n${lyrics}`, msg, { mangaType: 'kawaii' });
            } else {
                await functions.sendMangaMessage(sock, from, `❌ Paroles non trouvées pour: ${args.join(' ')}`, msg, { mangaType: 'otaku' });
            }
            
        } catch (error) {
            await functions.sendMangaMessage(sock, from, `❌ Paroles non trouvées`, msg, { mangaType: 'otaku' });
        }
    },
    
    async anime(sock, from, args, msg) {
        try {
            if (!args[0]) {
                return await functions.sendMangaMessage(sock, from, '❌ Veuillez fournir un titre d\'anime\nExemple: .anime Naruto', msg, { mangaType: 'otaku' });
            }
            
            const title = encodeURIComponent(args.join(' '));
            
            await functions.sendMangaMessage(sock, from, `📺 Recherche anime: ${args.join(' ')}...`, msg, { mangaType: 'kawaii' });
            
            // Utiliser MyAnimeList API ou Jikan
            const response = await axios.get(`https://api.jikan.moe/v4/anime?q=${title}&limit=1`);
            const data = response.data;
            
            if (data.data && data.data.length > 0) {
                const anime = data.data[0];
                
                const info = `🎌 *Anime: ${anime.title}*
                
*Titre original:* ${anime.title_japanese || 'N/A'}
*Score:* ${anime.score || 'N/A'} ⭐
*Épisodes:* ${anime.episodes || 'N/A'}
*Statut:* ${anime.status}
*Diffusion:* ${anime.aired?.string || 'N/A'}
*Studio:* ${anime.studios?.[0]?.name || 'N/A'}

*Genres:* ${anime.genres?.map(g => g.name).join(', ') || 'N/A'}
*Synopsis:* ${anime.synopsis?.substring(0, 500) || 'N/A'}...

*Liens:*
- MyAnimeList: ${anime.url}
${anime.trailer?.url ? `- Trailer: ${anime.trailer.url}` : ''}

`;
                
                await functions.sendMangaMessage(sock, from, info, msg, { mangaType: 'otaku' });
                
                // Envoyer l'image si disponible (utiliser la couverture)
                if (anime.images?.jpg?.image_url) {
                    await sock.sendMessage(from, { 
                        image: { url: anime.images.jpg.image_url },
                        caption: `🖼️ ${anime.title}\n\n` + config.footer
                    }, { quoted: msg });
                }
                
            } else {
                await functions.sendMangaMessage(sock, from, `❌ Anime non trouvé: ${args.join(' ')}`, msg, { mangaType: 'otaku' });
            }
            
        } catch (error) {
            await functions.sendMangaMessage(sock, from, `❌ Erreur: ${error.message}`, msg, { mangaType: 'otaku' });
        }
    },
    
    async manga(sock, from, args, msg) {
        try {
            if (!args[0]) {
                return await functions.sendMangaMessage(sock, from, '❌ Veuillez fournir un titre de manga\nExemple: .manga One Piece', msg, { mangaType: 'otaku' });
            }
            
            const title = encodeURIComponent(args.join(' '));
            
            await functions.sendMangaMessage(sock, from, `📖 Recherche manga: ${args.join(' ')}...`, msg, { mangaType: 'kawaii' });
            
            // Réponse de démonstration
            const manga = `📚 *Manga: ${args.join(' ')}*\n\n*Type:* Shonen\n*Statut:* En cours\n*Chapitres:* 1000+\n*Volumes:* 100+\n*Auteur:* Eiichiro Oda\n*Genre:* Action, Aventure, Comédie\n\n*Synopsis:* L'histoire suit les aventures de Monkey D. Luffy, un garçon dont le corps a acquis les propriétés du caoutchouc après avoir mangé par inadvertance un Fruit du Démon...\n\n*Évaluation:* ⭐ 9.0/10`;
            
            await functions.sendMangaMessage(sock, from, manga, msg, { mangaType: 'otaku' });
            
        } catch (error) {
            await sock.sendMessage(from, { 
                text: `❌ Erreur: ${error.message}\n\n` 
            }, { quoted: msg });
        }
    },
    
    async character(sock, from, args, msg) {
        try {
            if (!args[0]) {
                return await functions.sendMangaMessage(sock, from, '❌ Veuillez fournir un nom de personnage\nExemple: .character Naruto Uzumaki', msg, { mangaType: 'otaku' });
            }
            
            const name = encodeURIComponent(args.join(' '));
            
            await functions.sendMangaMessage(sock, from, `👤 Recherche personnage: ${args.join(' ')}...`, msg, { mangaType: 'kawaii' });
            
            // Utiliser Jikan API pour les personnages
            const response = await axios.get(`https://api.jikan.moe/v4/characters?q=${name}&limit=1`);
            const data = response.data;
            
            if (data.data && data.data.length > 0) {
                const character = data.data[0];
                
                const info = `🎭 *Personnage: ${character.name}*
                
*Nom alternatif:* ${character.name_kanji || 'N/A'}
*Popularité:* #${character.popularity || 'N/A'}
*Favoris:* ${character.favorites?.toLocaleString() || '0'}
*Anime:* ${character.anime?.[0]?.anime?.title || 'N/A'}
*Manga:* ${character.manga?.[0]?.manga?.title || 'N/A'}

*Description:* ${character.about?.substring(0, 500) || 'N/A'}...

*Liens:*
- MyAnimeList: ${character.url}

`;
                
                await functions.sendMangaMessage(sock, from, info, msg, { mangaType: 'otaku' });
                
                // Envoyer l'image si disponible
                if (character.images?.jpg?.image_url) {
                    await sock.sendMessage(from, { 
                        image: { url: character.images.jpg.image_url },
                        caption: `🖼️ ${character.name}\n\n` + config.footer
                    }, { quoted: msg });
                }
                
            } else {
                await functions.sendMangaMessage(sock, from, `❌ Personnage non trouvé: ${args.join(' ')}`, msg, { mangaType: 'otaku' });
            }
            
        } catch (error) {
            await functions.sendMangaMessage(sock, from, `❌ Erreur: ${error.message}`, msg, { mangaType: 'otaku' });
        }
    }
};
