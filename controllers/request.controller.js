import Request from "../models/request.js";
import Housing from "../models/housing.js";
import User from "../models/user.js"; // nécéssaire pour le populate 

// EVNOYER DEMANDE 
export const sendRequest = async (req, res) => {

    
    try {
     
        const { housingId } = req.body;
        
        // on verifie si il existe, par ex si erreur côté front 
        if (!housingId) {
            return res.json({result: false, error:'Missing housingId'});
        }
    
        // on verfie si logement existe, par ex si logement louer dans l'intervalle de temps ou l'utilisateur voulait envoyer sa demande
        const housing = await Housing.findById(housingId);
        
        if (!housing) {
            return res.json({result: false, error:'Housing not found'})
        }

        const studentId = req.userId;
        const seniorId = housing.userId;

        const existingRequest = await Request.findOne({
            student: studentId, 
            housing: housingId, 
            //status: 'pending' mais permettra à l'utilisiteur de renvoyer demande quand même si accepté/refusé, bloque uniquement le pending
            //soluce: on cherche simplement la demande peu importe le status 
        }); 

        if (existingRequest) {
            //return res.json ({ result: false, error: 'Request already sent'})
            //je renvoie la réponse côté front et vous adaptez l'alert par rapport au status 
            return res.json ({ result: false, error: 'Request already exists', status: existingRequest.status})
        }

        const newRequest = new Request ({
            student: studentId,
            senior: seniorId, 
            housing: housingId
        }); 

        const savedRequest = await newRequest.save();

        res.json({result: true, request: savedRequest});
    } catch (err) {
        res.status(500).json({message: err.message})
    }
    
}


// RECUPERER DEMANDE COTE SENIOR 

export const seniorRequests = async (req, res) => {

    try {
        const seniorId = req.userId;

        const requests = await Request.find({ senior: seniorId })
        .populate('student', 'firstName lastName photo bio') // a adapté selon ce qu'on decide de renvoyer
        .populate('housing', 'title location price pictures')// a adapté selon ce qu'on decide de renvoyer
        .sort({createdAt: -1}) // trié du plus récent au moins récent 

        res.json({ result: true, requests})
    } catch (err){
        res.status(500).json({message: err.message})

    }
}

// RECUPERER DEMANDE ENVOYEE COTE STUDENT
export const studentRequests = async (req, res) =>{

    try {
        const studentId = req.userId; 
        const requests = await Request.find({student: studentId})
        .populate('senior', 'lastName firstName photo bio')// a adapté selon ce qu'on decide de renvoyer
        .populate('housing', 'title location price pictures')// a adapté selon ce qu'on decide de renvoyer
        .sort({createdAt: -1}) // trié du plus récent au moins récent 

    res.json({result: true, requests})
    } catch(err){
    res.status(500).json({message: err.message})
    }

}


//UPDATE LA DEMANDE 

export const updateRequestStatus = async (req, res) => {

    try {
        const { requestId } = req.params
        const { status } = req.body
        const seniorId  = req.userId

        console.log('=== DEBUG ===');
        console.log('seniorId connecté:', seniorId);
        console.log('Type:', typeof seniorId);
        console.log('status:', status)
        console.log('RequestId:', requestId)

        // on verifie que le status existe
        if (!status) {
            return res.json({result: false, error: 'Missing status'})
        }
        // on verifie le status
        if (status !== 'accepted' && status !== 'refused') {
            return res.json({ result: false, error: 'Invalid status' });
        }

        const request = await Request.findById(requestId)
        // si pas de request nono
        if(!request) {
            return res.json({result: false, error: 'Request not found'})
  
        }
        console.log('request.senior:', request.senior);
        console.log('Type:', typeof request.senior);
        console.log('toString:', request.senior.toString());
        console.log('Match?:', request.senior.toString() === seniorId);
        console.log('=============');
           
        // si pas de seniorId nono
        if (request.senior.toString() !== seniorId) {
            return res.json({ result: false, error: 'Unauthorized' });
        }

    // Vérifier que la demande est bien en pending, sinon OOOH c'est déjà répondu là 
        if (request.status !== 'pending') {
            return res.json({ result: false, error: 'Request already processed' });
         }

    // on updatre enfin le statut damn 
        request.status = status;
        const updatedRequest = await request.save();
        res.json({ result: true, request: updatedRequest });

         } catch (err) {
             res.status(500).json({ message: err.message });

         }

}
