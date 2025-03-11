//
//
// //Submit a new registration request
// exports.createRequest = async (req , res) => {
//     try{
//         const {fullName ,email,role , additionalDetails} = req.body;
//
//         //Check if request already exists
//         const existingRequest = await Request.findOne({email});
//         if(existingRequest){
//             return res.status(400).json({message: 'Request already submitted.'});
//         }
//
//
//         //Create a new request
//         const newRequest = new request({fullName , email, role , additionalDetails});
//         await newRequest.save();
//
//         res.status(201).json({message: 'Request submitted successfully.',request: newRequest});
//
//
//
//
//
//     }catch(error){
//
//         res.status(500).json({message: 'Server error' , error});
//
//     }
//
// };
//
// //Admin view all pending requests
// exports.getPendingRequests = async (req,res) => {
//     try{
//         const requests = await Request.find({ status: 'Pending' });
//         res.status(200).json(requests);
//     }catch{
//         res.status(500).json({ message: 'Server error', error });
//     }
//
// //Admin approves or rejects a request
// exports.updateRequestStatus = async(req,res)=>{
//         try{
//             const {requestId , status} = req.body;
//
//             //Validate status
//             if(!['Approved','Rejected'].includes(status)){
//                 return res.status(400).json({message: 'Invalid status'});
//             }
//
//             res.status(200).json({message: `Request ${status} successfully.`,request});
//
//         }catch (error){
//             res.status(500).json({message: 'Server error',error});
//         }
// }
//
// };
//
