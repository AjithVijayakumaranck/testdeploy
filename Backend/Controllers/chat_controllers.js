const { CONVERSATION } = require("../Models/conversationModel");
const { MESSAGE } = require("../Models/messageModel");

module.exports = {

    //create a conversation between two specific users
    createConversation : async (req,res)=>{
        try{
            const {senderId,recieverId,productId} = req.body
            console.log(req.body,"eeee");

            const existingConversation = await CONVERSATION.findOne({
                member: { $all: [senderId, recieverId] },
                product: productId,
              });
          
              if (existingConversation) {
                console.log("existtingggg");
                return res
                  .status(200)
                  .json({ savedConversation:existingConversation, message: "Conversation already exists with the same productId" });
              }else{
                  let newConversation =await new CONVERSATION({
                      member:[senderId,recieverId],
                      product:productId
                  })
                  const savedConversation = await newConversation.save()
                  res.status(200).json({savedConversation})
              }

    
        }catch(err){
            res.status(500).json(err)
        }
    },
    

    //get conversations of a specific user
    getConversation: async (req,res)=>{
        try{
            const  {userId} = req.params
            console.log(userId);
            const  conversation = await CONVERSATION.find({member:{
                $in:[userId]
            }}).populate('product')
            res.status(200).json(conversation)
        }catch(err){
            res.status(500).json(err)
        }
    },

    //get specific conversations of a specific user
    getSpecificConversation: async (req,res)=>{
        try{
            const  {conversationId} = req.params
            const  conversation = await CONVERSATION.findById(conversationId).populate('product')
            console.log(conversation);
            res.status(200).json(conversation)
        }catch(err){
            console.log(err);
            res.status(500).json(err)
        }
    },

   //add  a new record to chat collecton
    addMessage: async (req,res)=>{
        try{
            const {sender,text,conversationId,offerMade} = req.body
            const newMessage =await new MESSAGE(
              {
               conversationId:conversationId,
               sender:sender,
               text:text,
               offerMade:offerMade
              }
            )
          const savedMessage = await newMessage.save()
          res.status(200).json(savedMessage)
        }catch(err){
            res.status(500).json(err)
        }
    },


    //get all the messasges of a specific converstion
    getMessage : async (req,res)=>{
        console.log(req.params.conversationId,"hello");
        try{
            const {conversationId} = req.params
            const  allMessagges = await MESSAGE.find({conversationId:conversationId})
            res.status(200).json({allMessagges})
        }catch(err){
            console.log(err);
            res.status(500).json(err)
        }
    }
}