const POLICY = require("../../Models/terms&ConditionsModel")

module.exports = {

    // terms add
    addTerms : (req,res)=>{
        try {
            const {policies} = req.body
            if(policies){
                POLICY.updateMany({active:true},{active:false}).then(()=>{
                    POLICY.create({
                        policy:policies
                    }).then(()=>{
                        res.status(200).json({message:"new policy is active"})
                    }).catch(()=>{
                        res.status(400).json({message:"new policy is not active"})
                    })
                }).catch((error)=>{
                    res.status(400).json(error.message)
                })
             }
        } catch (error) {
            res.status(500).json(error.message)
        }
    },

    //getTerms 
    getTerms:(req,res)=>{
        try {
            POLICY.find().then((response)=>{
                res.status(200).json(response)
            }).catch((error)=>{
                res.status(400).json(error.message)
            })
        } catch (error) {
            res.status(500).json(error.message)
        }
    },


    //get active term

    getTerm:(req,res)=>{
        try {
           POLICY.findOne({active:true}).then((response)=>{
            res.status(200).json(response)
           }).catch((error)=>{
            res.status(400).json({message:"No active term found"})
           })
        } catch (error) {
            res.status(500).json(error.message)
        }
    }

}