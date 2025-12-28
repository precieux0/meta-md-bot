const fs = require('fs');
const path = require('path');

class SimpleDB {
    constructor(filename) {
        this.filepath = path.join(__dirname, '..', 'database', filename);
        this.data = this.load();
    }
    
    load() {
        try {
            if (fs.existsSync(this.filepath)) {
                const content = fs.readFileSync(this.filepath, 'utf8');
                return JSON.parse(content);
            }
        } catch (error) {
            console.error('Erreur chargement DB:', error);
        }
        return {};
    }
    
    save() {
        try {
            const dir = path.dirname(this.filepath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(this.filepath, JSON.stringify(this.data, null, 2));
            return true;
        } catch (error) {
            console.error('Erreur sauvegarde DB:', error);
            return false;
        }
    }
    
    get(key) {
        return this.data[key];
    }
    
    set(key, value) {
        this.data[key] = value;
        return this.save();
    }
    
    delete(key) {
        delete this.data[key];
        return this.save();
    }
    
    has(key) {
        return key in this.data;
    }
    
    keys() {
        return Object.keys(this.data);
    }
    
    values() {
        return Object.values(this.data);
    }
    
    clear() {
        this.data = {};
        return this.save();
    }
}

// Bases de données spécifiques
const usersDB = new SimpleDB('users.json');
const groupsDB = new SimpleDB('groups.json');
const settingsDB = new SimpleDB('settings.json');

module.exports = {
    usersDB,
    groupsDB,
    settingsDB,
    SimpleDB
};