import Housing from "../models/housing.js";



export const newHousing = async (req, res) => {
    try {
        // Create a new location
          console.log("🔍 === DEBUG NEW HOUSING ===");
  console.log("req.userId:", req.userId);
  console.log("Type de req.userId:", typeof req.userId);
  console.log("req.userId est undefined?", req.userId === undefined);
  
  if (!req.userId) {
    console.log("❌ PAS DE USER ID !");
    return res.status(400).json({ message: "User ID manquant!" });
  }

        const housing = new Housing ({
            title: req.body.title,
            description: req.body.description,
            address: req.body.address,
            userId: req.userId,
            location: {
                address: req.body.address, 
                latitude: req.body.latitude,
                longitude: req.body.longitude
            },

            surface : {
                superficie : req.body.superficie, 
                nbRoom: req.body.nbRoom,
                nbBathroom: req.body.nbBathroom
            }, 
            price : req.body.price     


        });

 
        // Save location to the database
        await housing.save();
        res.status(201).json({ message: "Logement bien ajouté à la base de donnée ! " });
        console.log ("data saved");
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updateHousing = (req, res) => {
  // Vérifie si l'appart existe 
  Housing.findById(req.params.id)
    .then(housing => {
      if (!housing) {
        return res.json({ result: false, error: 'Not found' });
      }
      
      // Vérifie que c'est bien l'appart du proprio
      if (housing.userId.toString() !== req.userId) {
        return res.json({ result: false, error: 'Not your housing' });
      }

      //Construit updateData avec SEULEMENT les champs envoyés
      const allowedFields = ['title', 'description', 'address', 'price', 'pictures', 'isAvailable'];
      const updateData = {};
      
      // Champs simples
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });

      // Location (notation pointée pour objets imbriqués)
      if (req.body.latitude !== undefined) updateData['location.latitude'] = req.body.latitude;
      if (req.body.longitude !== undefined) updateData['location.longitude'] = req.body.longitude;
      if (req.body.address !== undefined) updateData['location.address'] = req.body.address;

      // Surface
      if (req.body.superficie !== undefined) updateData['surface.superficie'] = req.body.superficie;
      if (req.body.nbRoom !== undefined) updateData['surface.nbRoom'] = req.body.nbRoom;
      if (req.body.nbBathroom !== undefined) updateData['surface.nbBathroom'] = req.body.nbBathroom;

      return Housing.findByIdAndUpdate(
        req.params.id,
        updateData,  // ✅ Seulement les champs modifiés
        { new: true }
      );
    })
    .then(updated => {
      if (!updated) {
        return res.json({ result: false, error: 'Not found' });
      }
      res.json({ result: true, data: updated });
    })
    .catch(error => {
      res.json({ result: false, error: error.message });
    });
};

export const allHousing = (req, res) => {
  Housing.find()
    .populate('userId', 'firstName lastName age bio photo preferences.lifestyle preferences.expectations createdAt')   
    .then(data => {
      res.json({ result: true, data: data });
    })
    .catch(error => {
      res.json({ result: false, error: error.message });
    });
};


export const myHouse = (req, res) => {

  Housing.findById(req.params.id)
    .populate('userId', 'firstName lastName age bio photo preferences.lifestyle preferences.expectations createdAt')
    .then(data => {
      if (!data) {
        return res.json({ result: false, error: 'Not found' });
      }
      res.json({ result: true, data: data });
    })
    .catch(error => {
      res.json({ result: false, error: error.message });
    });

};


export const deleteHousing = (req, res) => {
  Housing.deleteOne({ _id: req.params.id })
    .then(result => {
      if (result.deletedCount === 0) {
        return res.json({ result: false, error: 'Not found' });
      }
      res.json({ result: true, message: 'Deleted successfully' });
    })
    .catch(error => {
      res.json({ result: false, error: error.message });
    });
};

export const mySeniorHousing = (req, res) => {
  Housing.findOne({ userId: req.userId })
    .populate('userId', 'firstName lastName age bio photo preferences.lifestyle preferences.expectations createdAt')
    .then(data => {
      if (!data) {
        return res.json({ result: false, error: 'No housing found' });
      }
      res.json({ result: true, data: data });
    })
    .catch(error => {
      res.json({ result: false, error: error.message });
    });
};
