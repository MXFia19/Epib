const express = require('express');
const multer = require('multer'); // Pour gérer l'upload de fichiers
const { exec } = require('child_process'); // Pour lancer la commande de conversion
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' }); // Dossier temporaire

// Servir la page HTML statique
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route de conversion
app.post('/convert', upload.single('epubFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('Aucun fichier envoyé.');
    }

    const inputPath = req.file.path;
    const outputPath = path.join('uploads', `${req.file.filename}.pdf`);

    // COMMANDE DE CONVERSION
    // Nous utilisons 'ebook-convert' qui est l'outil CLI de Calibre.
    // Assure-toi que Calibre est installé et ajouté à ton PATH système.
    const command = `ebook-convert "${inputPath}" "${outputPath}"`;

    console.log("Conversion en cours...");

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Erreur: ${error.message}`);
            return res.status(500).send('Erreur lors de la conversion. Calibre est-il installé ?');
        }

        console.log("Conversion terminée !");

        // Envoyer le fichier PDF au navigateur
        res.download(outputPath, 'mon_livre.pdf', (err) => {
            // Nettoyage des fichiers temporaires après téléchargement
            fs.unlinkSync(inputPath);
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        });
    });
});

app.listen(3000, () => {
    console.log('Serveur lancé sur http://localhost:3000');
});
