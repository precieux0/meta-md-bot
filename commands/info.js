const axios = require('axios');

module.exports = {
    name: 'info',
    
    async weather(sock, from, args, msg) {
        try {
            if (!args[0]) {
                return await sock.sendMessage(from, { 
                    text: '❌ Veuillez fournir une ville\nExemple: .weather Paris\n\n_Signature: by PRECIEUX OKITAKOY_' 
                }, { quoted: msg });
            }
            
            const city = encodeURIComponent(args.join(' '));
            
            await sock.sendMessage(from, { 
                text: `⛅ Recherche météo pour ${args.join(' ')}...\n\n_Signature: by PRECIEUX OKITAKOY_` 
            }, { quoted: msg });
            
            // Utiliser OpenWeather API (vous aurez besoin d'une clé API)
            // Pour l'instant, réponse de démonstration
            const weather = `🌤️ *Météo: ${args.join(' ')}*
            
*Température:* 22°C
*Ressenti:* 24°C
*Description:* Partiellement nuageux
*Humidité:* 65%
*Vent:* 15 km/h
*Pression:* 1013 hPa

*Prévisions:*
🌡️ Min: 18°C | Max: 26°C
🌅 Lever: 06:45
🌇 Coucher: 20:30

_Signature: by PRECIEUX OKITAKOY_`;
            
            await sock.sendMessage(from, { text: weather }, { quoted: msg });
            
        } catch (error) {
            await sock.sendMessage(from, { 
                text: `❌ Erreur: ${error.message}\n\n_Signature: by PRECIEUX OKITAKOY_` 
            }, { quoted: msg });
        }
    },
    
    async lyrics(sock, from, args, msg) {
        try {
            if (!args[0]) {
                return await sock.sendMessage(from, { 
                    text: '❌ Veuillez fournir un titre de chanson\nExemple: . lyrics Shape of You\n\n_Signature: by PRECIEUX OKITAKOY_' 
                }, { quoted: msg });
            }
            
            const song = encodeURIComponent(args.join(' '));
            
            await sock.sendMessage(from, { 
                text: `🎵 Recherche des paroles: ${args.join(' ')}...\n\n_Signature: by PRECIEUX OKITAKOY_` 
            }, { quoted: msg });
            
            // Utiliser une API de paroles (comme lyrics.ovh)
            const response = await axios.get(`https://api.lyrics.ovh/v1/${song}`);
            const data = response.data;
            
            if (data.lyrics) {
                let lyrics = data.lyrics.substring(0, 2000);
                if (data.lyrics.length > 2000) {
                    lyrics += '\n\n... (paroles tronquées)';
                }
                
                await sock.sendMessage(from, { 
                    text: `🎤 *Paroles: ${args.join(' ')}*\n\n${lyrics}\n\n_Signature: by PRECIEUX OKITAKOY_` 
                }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { 
                    text: `❌ Paroles non trouvées pour: ${args.join(' ')}\n\n_Signature: by PRECIEUX OKITAKOY_` 
                }, { quoted: msg });
            }
            
        } catch (error) {
            await sock.sendMessage(from, { 
                text: `❌ Paroles non trouvées\n\n_Signature: by PRECIEUX OKITAKOY_` 
            }, { quoted: msg });
        }
    },
    
    async anime(sock, from, args, msg) {
        try {
            if (!args[0]) {
                return await sock.sendMessage(from, { 
                    text: '❌ Veuillez fournir un titre d\'anime\nExemple: .anime Naruto\n\n_Signature: by PRECIEUX OKITAKOY_' 
                }, { quoted: msg });
            }
            
            const title = encodeURIComponent(args.join(' '));
            
            await sock.sendMessage(from, { 
                text: `📺 Recherche anime: ${args.join(' ')}...\n\n_Signature: by PRECIEUX OKITAKOY_` 
            }, { quoted: msg });
            
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

_Signature: by PRECIEUX OKITAKOY_`;
                
                await sock.sendMessage(from, { text: info }, { quoted: msg });
                
                // Envoyer l'image si disponible
                if (anime.images?.jpg?.image_url) {
                    await sock.sendMessage(from, { 
                        image: { url: anime.images.jpg.image_url },
                        caption: `🖼️ ${anime.title}\n\n_Signature: by PRECIEUX OKITAKOY_`
                    }, { quoted: msg });
                }
                
            } else {
                await sock.sendMessage(from, { 
                    text: `❌ Anime non trouvé: ${args.join(' ')}\n\n_Signature: by PRECIEUX OKITAKOY_` 
                }, { quoted: msg });
            }
            
        } catch (error) {
            await sock.sendMessage(from, { 
                text: `❌ Erreur: ${error.message}\n\n_Signature: by PRECIEUX OKITAKOY_` 
            }, { quoted: msg });
        }
    },
    
    async manga(sock, from, args, msg) {
        try {
            if (!args[0]) {
                return await sock.sendMessage(from, { 
                    text: '❌ Veuillez fournir un titre de manga\nExemple: .manga One Piece\n\n_Signature: by PRECIEUX OKITAKOY_' 
                }, { quoted: msg });
            }
            
            const title = encodeURIComponent(args.join(' '));
            
            await sock.sendMessage(from, { 
                text: `📖 Recherche manga: ${args.join(' ')}...\n\n_Signature: by PRECIEUX OKITAKOY_` 
            }, { quoted: msg });
            
            // Réponse de démonstration
            const manga = `📚 *Manga: ${args.join(' ')}*
            
*Type:* Shonen
*Statut:* En cours
*Chapitres:* 1000+
*Volumes:* 100+
*Auteur:* Eiichiro Oda
*Genre:* Action, Aventure, Comédie

*Synopsis:* L'histoire suit les aventures de Monkey D. Luffy, un garçon dont le corps a acquis les propriétés du caoutchouc après avoir mangé par inadvertance un Fruit du Démon...

*Évaluation:* ⭐ 9.0/10

_Signature: by PRECIEUX OKITAKOY_`;
            
            await sock.sendMessage(from, { text: manga }, { quoted: msg });
            
        } catch (error) {
            await sock.sendMessage(from, { 
                text: `❌ Erreur: ${error.message}\n\n_Signature: by PRECIEUX OKITAKOY_` 
            }, { quoted: msg });
        }
    },
    
    async character(sock, from, args, msg) {
        try {
            if (!args[0]) {
                return await sock.sendMessage(from, { 
                    text: '❌ Veuillez fournir un nom de personnage\nExemple: .character Naruto Uzumaki\n\n_Signature: by PRECIEUX OKITAKOY_' 
                }, { quoted: msg });
            }
            
            const name = encodeURIComponent(args.join(' '));
            
            await sock.sendMessage(from, { 
                text: `👤 Recherche personnage: ${args.join(' ')}...\n\n_Signature: by PRECIEUX OKITAKOY_` 
            }, { quoted: msg });
            
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

_Signature: by PRECIEUX OKITAKOY_`;
                
                await sock.sendMessage(from, { text: info }, { quoted: msg });
                
                // Envoyer l'image si disponible
                if (character.images?.jpg?.image_url) {
                    await sock.sendMessage(from, { 
                        image: { url: character.images.jpg.image_url },
                        caption: `🖼️ ${character.name}\n\n_Signature: by PRECIEUX OKITAKOY_`
                    }, { quoted: msg });
                }
                
            } else {
                await sock.sendMessage(from, { 
                    text: `❌ Personnage non trouvé: ${args.join(' ')}\n\n_Signature: by PRECIEUX OKITAKOY_` 
                }, { quoted: msg });
            }
            
        } catch (error) {
            await sock.sendMessage(from, { 
                text: `❌ Erreur: ${error.message}\n\n_Signature: by PRECIEUX OKITAKOY_` 
            }, { quoted: msg });
        }
    }
};