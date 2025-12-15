import mongoose from "mongoose";
 

const housingSchema = new mongoose.Schema({ //place peut être pas pertinant comme nom, claude propose Housing 
  title: {
    type: String,
    required: true,
    trim: true,  
    maxlength: 100
  },
  
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  
  pictures: {
  type: [String],  // array pour plusieurs photos (en url, voir pour implémenter cloudify si nécéssaire )
  required:true 
  //     //ajouter msg photo obligatoire dans la route 
  },
  
  
  location: { 
    
    address: {
    type: String,
    required: true,
    trim: true
    }, 

    latitude: { 
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    
  },
  
  //coordonnée pour la map voir si le mettre dans coordinate, mais pratique du cours nous disait un lat et un lon hors coordinate, à voir 
    
  
  surface: {
    superficie: {
      type: Number,
      required: true,
      min: 0 //ajouter msg d'erreur dans la route type (valeur min obligatoire ou valeur negative nono)
    },
    nbRoom: {
      type: Number,
      required: true,
      min: 1, //ajouter msg d'erreur dans la route (same) 
      default: 1
    },
    nbBathroom: {
      type: Number,
      min: 0, //ajouter msg d'erreur dans la route  (same)
      default: 1
    }
  },
  
  // utile pour référencé le user et lui permettre de delete ou modify uniquement ses logements (mais techniquement il est pas censé voir d'autres logement que les siens, secure secure)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
 
  price: {
    type: Number,
    min: 0,
    required:true
  },
  
  //Si available visible sinon pas visible à préciser dans la route of course
  isAvailable: {  
    type: Boolean,
    default: true
  }
  
}, { 
  timestamps: true  //date de publication/modif peut-être voir plutôt pour ajouter un "publié/disponible depuis X nb/jour". (Pourquoi pas notif si logement non louer au bout d'un mois "Votre annonce ne semble pas atteindre les utilisateurs, peut être qu'elle pas assez pertinante? MET DES PLUS BELLE PHOTO PAPY" mais pour Sabrina du futur)
});

const Housing = mongoose.model('housing', housingSchema);

export default Housing;