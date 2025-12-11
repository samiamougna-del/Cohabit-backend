import { v2 as cloudinary } from 'cloudinary';
import uniqid from 'uniqid';
import fs from 'fs';


export const upload = async (req, res) => {
  const photoPath = `./tmp/${uniqid()}.jpg`; //fichier save dans le temp 
  const resultMove = await req.files.photoFromFront.mv(photoPath); //

  if (!resultMove) {
    const resultCloudinary = await cloudinary.uploader.upload(photoPath); // Upload du fichier temporaire vers Cloudinary
    res.json({ result: true, url: resultCloudinary.secure_url });  // Envoi d'une réponse JSON avec succès et l'URL sécurisée de l'image sur Cloudinary
  } else {
    res.json({ result: false, error: resultMove }); // En cas d'erreur lors du déplacement, envoi d'une réponse avec l'erreur result move contient l'objet erreur
  }

  fs.unlinkSync(photoPath); // Suppression du fichier temporaire du serveur pour libérer l'espace
};