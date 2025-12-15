import { v2 as cloudinary } from 'cloudinary';
import uniqid from 'uniqid';
import fs from 'fs';

export const upload = async (req, res) => {
  try {
    // 🔍 DEBUG 1 : Vérifier que la requête arrive
    console.log('🎯 Upload endpoint atteint !');
    
    // 🔍 DEBUG 2 : Vérifier les headers
    console.log('📋 Headers:', req.headers);
    
    // 🔍 DEBUG 3 : Vérifier req.files
    console.log('📁 req.files:', req.files);
    console.log('📁 req.files existe ?', !!req.files);
    
    // 🔍 DEBUG 4 : Vérifier photoFromFront
    if (req.files) {
      console.log('📸 photoFromFront:', req.files.photoFromFront);
      console.log('📸 Clés disponibles:', Object.keys(req.files));
    }

    // ⚠️ Vérification : est-ce que req.files.photoFromFront existe ?
    if (!req.files || !req.files.photoFromFront) {
      console.error('❌ Aucun fichier reçu !');
      return res.status(400).json({ 
        result: false, 
        error: 'Aucun fichier reçu',
        debug: {
          hasFiles: !!req.files,
          filesKeys: req.files ? Object.keys(req.files) : []
        }
      });
    }

    const photoPath = `./tmp/${uniqid()}.jpg`;
    console.log('💾 Chemin temporaire:', photoPath);

    // 🔍 DEBUG 5 : Vérifier le déplacement
    console.log('🚚 Déplacement du fichier...');
    const resultMove = await req.files.photoFromFront.mv(photoPath);
    
    console.log('✅ resultMove:', resultMove);
    console.log('📂 Fichier existe ?', fs.existsSync(photoPath));

    if (!resultMove) { // mv() retourne undefined en cas de succès
      console.log('☁️ Upload vers Cloudinary...');
      
      const resultCloudinary = await cloudinary.uploader.upload(photoPath);
      
      console.log('✅ Upload Cloudinary réussi:', resultCloudinary.secure_url);
      
      // Supprimer le fichier temporaire
      fs.unlinkSync(photoPath);
      console.log('🗑️ Fichier temporaire supprimé');
      
      return res.json({ 
        result: true, 
        url: resultCloudinary.secure_url 
      });
      
    } else {
      // En cas d'erreur de déplacement
      console.error('❌ Erreur déplacement:', resultMove);
      
      return res.status(500).json({ 
        result: false, 
        error: 'Erreur lors du déplacement du fichier',
        details: resultMove 
      });
    }
    
  } catch (error) {
    console.error('💥 ERREUR GLOBALE:', error);
    console.error('📚 Stack:', error.stack);
    
    return res.status(500).json({ 
      result: false, 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};