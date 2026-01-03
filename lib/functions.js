const axios = require('axios');
const fs = require('fs');
const path = require('path');
const config = require('./config');

// Fonctions utilitaires pour le bot
module.exports = {
    // Générer un menu interactif avec image manga
    async generateMenuWithImage(category) {
        const mangaImage = config.getRandomMangaImage();
        
        return {
            text: config.menus.main,
            image: mangaImage
        };
    },

    // Construire l'entête du menu affiché sous l'image
    buildMenuHeader(startTime = Date.now(), pushName = 'Utilisateur') {
        const uptime = Date.now() - startTime;
        const hours = Math.floor(uptime / (1000 * 60 * 60)).toString().padStart(2, '0');
        const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
        const seconds = Math.floor((uptime % (1000 * 60)) / 1000).toString().padStart(2, '0');

        // RAM réel si possible, sinon simulation légère
        let ram = 'N/A';
        try {
            const mem = process.memoryUsage();
            ram = `${(mem.rss / 1024 / 1024).toFixed(2)} MB`;
        } catch (e) {
            ram = '128 MB';
        }

        const now = new Date();
        const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        const mode = config.botMode || 'public';
        const owner = config.ownerName || config.owner || 'Owner';

        return `RUN : ${hours}h ${minutes}m ${seconds}s  |  MODE : ${mode}  |  RAM : ${ram}  |  TIME : ${timeStr}  |  USER : ${owner}`;
    },
    
    // Obtenir une image manga aléatoire
    async getRandomMangaImage(mangaType = null) {
        try {
            let imageUrl;
            
            if (mangaType && config.mangaImages[mangaType]) {
                // Image spécifique au manga
                const images = config.mangaImages[mangaType];
                imageUrl = images[Math.floor(Math.random() * images.length)];
            } else {
                // Image manga générique
                imageUrl = config.getRandomMangaImage();
            }
            
            // Tester si l'URL est accessible
            const response = await axios.head(imageUrl);
            if (response.status === 200) {
                return imageUrl;
            }
        } catch (error) {
            console.log('Image manga non accessible, utilisation de fallback:', error.message);
        }
        
        // Fallback vers Unsplash
        const fallbackImages = [
            'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=800&q=80',
            'https://images.unsplash.com/photo-1639322537501-1d4b6d4f3e8f?w=800&q=80',
            'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80'
        ];
        
        return fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
    },
    
    // Envoyer un message avec image manga
    async sendMangaMessage(sock, from, text, msg = null, options = {}) {
        try {
            const mangaImage = await this.getRandomMangaImage(options.mangaType);
            
            // Ajouter la signature au texte
            const fullText = text + '\n\n' + config.footer;
            
            const messageOptions = {
                image: { url: mangaImage },
                caption: fullText
            };
            
            if (msg) {
                messageOptions.quoted = msg;
            }
            
            await sock.sendMessage(from, messageOptions);
            
        } catch (error) {
            console.error('Erreur envoi message manga:', error);
            // Fallback: envoyer seulement le texte
            await sock.sendMessage(from, { 
                text: text + '\n\n' + config.footer 
            }, msg ? { quoted: msg } : {});
        }
    },
    
    // Télécharger une image depuis URL
    async downloadImageFromUrl(url) {
        try {
            const response = await axios({
                method: 'GET',
                url: url,
                responseType: 'arraybuffer'
            });
            
            return Buffer.from(response.data, 'binary');
        } catch (error) {
            throw new Error(`Erreur téléchargement image: ${error.message}`);
        }
    },
    
    // Générer un embed manga pour les commandes
    generateMangaEmbed(title, description, fields = []) {
        const mangaThemes = ['dandadan', 'tokyoGhoul', 'jujutsuKaisen', 'chainsawMan', 'onePiece'];
        const randomTheme = mangaThemes[Math.floor(Math.random() * mangaThemes.length)];
        
        return {
            title: `🎌 ${title}`,
            description: description,
            image: config.getRandomMangaImage(randomTheme),
            fields: fields,
            timestamp: new Date(),
            footer: {
                text: config.footer
            }
        };
    },
    
    // Télécharger un fichier depuis une URL
    async downloadFile(url, filepath) {
        try {
            const response = await axios({
                method: 'GET',
                url: url,
                responseType: 'stream'
            });
            
            const writer = fs.createWriteStream(filepath);
            response.data.pipe(writer);
            
            return new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });
        } catch (error) {
            throw new Error(`Erreur de téléchargement: ${error.message}`);
        }
    },
    
    // Obtenir l'extension d'un fichier
    getFileExtension(filename) {
        return path.extname(filename).toLowerCase();
    },
    
    // Formater la taille du fichier
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    // Générer un ID unique
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    // Vérifier si l'URL est valide
    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    },
    
    // Nettoyer le texte pour les commandes
    cleanText(text) {
        return text
            .replace(/[^\w\s.,!?\-]/g, '')
            .trim()
            .substring(0, 2000);
    },
    
    // Obtenir l'heure actuelle formatée
    getCurrentTime() {
        return new Date().toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    },
    
    // Obtenir la date formatée
    getCurrentDate() {
        return new Date().toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },
    
    // Obtenir une couleur aléatoire pour les embeds
    getRandomColor() {
        const colors = [
            0x7289DA, 0x43B581, 0xFAA61A, 0xF57731, 
            0xE74C3C, 0x9B59B6, 0x3498DB, 0x1ABC9C
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
};