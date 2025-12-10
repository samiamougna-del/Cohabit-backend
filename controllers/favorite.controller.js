import db from "../models/index.js";
import Housing from "../models/housing.js";

const User = db.User;

    // ->Toggle un logement aux favoris - POST/favoris/:housingID

    export const toggleFavorite = async (req, res) => {
    try {
        const { housingId } = req.params;
        const userId = req.userId;

        // Vérifier que le logement existe
        const housing = await Housing.findById(housingId);
        if (!housing) {
            return res.status(404).json({ 
                result: false, 
                message: "Logement non trouvé" 
            });
        }

        // Chercher si l'utilisateur a déjà liké ce logement
        const user = await User.findOne({ 
            _id: userId, 
            favorites: housingId 
        });

        if (user) {
            // L'utilisateur a déjà liké, on retire ($pull)
            await User.updateOne(
                { _id: userId },
                { $pull: { favorites: housingId } }
            );
            
            return res.json({ 
                result: true, 
                action: 'unlike',
                message: 'Logement retiré des favoris' 
            });
        } else {
            // L'utilisateur n'a pas liké, on ajoute ($push ou $addToSet)
            await User.updateOne(
                { _id: userId },
                { $addToSet: { favorites: housingId } } // $addToSet évite les doublons
            );
            
            return res.json({ 
                result: true, 
                action: 'like',
                message: 'Logement ajouté aux favoris' 
            });
        }

    } catch (error) {
        res.status(500).json({ 
            result: false, 
            error: error.message 
        });
    }
};


    // -> Récupérer tous les logements favoris de l'utilisateur - GET /favorites

export const getFavorites = async (req, res) => {
    try {
        const userId = req.userId;

        // Récupérer l'utilisateur avec les détails des logements favoris
        const user = await User.findById(userId)
            .populate({
                path: 'favorites',
                match: { isAvailable: true }, // Optionnel : ne montrer que les logements disponibles
                select: '-__v' //
            });

        if (!user) {
            return res.status(404).json({ 
                result: false, 
                message: "Utilisateur non trouvé" 
            });
        }

        res.status(200).json({ 
            result: true, 
            favorites: user.favorites 
        });

    } catch (err) {
        res.status(500).json({ 
            result: false, 
            message: err.message 
        });
    }
};


    // ->Vérifier si un logement est dans les favoris + GET /favorites/check/:housingId

export const checkFavorite = async (req, res) => {
    try {
        const { housingId } = req.params;
        const userId = req.userId;

        const user = await User.findById(userId);
        const isFavorite = user.favorites.includes(housingId);

        res.status(200).json({ 
            result: true, 
            isFavorite 
        });

    } catch (err) {
        res.status(500).json({ 
            result: false, 
            message: err.message 
        });
    }
};