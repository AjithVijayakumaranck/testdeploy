const CATEGORY = require("../Models/categoryModel")
const PRODUCT = require("../Models/productModal")
const SUBCAT = require("../Models/subCategoryModel");
const { cloudUpload } = require("../utilities/cloudinary");

module.exports = {

    //CATEGORY CONTROLLERS

    //getting Categories

    getCategories: async (req,res)=>{
        try {
            console.log("get categories");
            const categories = await CATEGORY.find({deleted:false})
            console.log(categories);
            if(!categories){
                res.status(400).json({message:"Category not found"})
            }else{
                res.status(200).json(categories)
            }
        } catch (error) {
            console.log(error.message);
            res.status(500).json({message:"something went wrong"})
        }
    },

    //get single category 
    getSingleCategory: async (req,res)=>{
        {
            try {
                const categoryId = req.query.categoryId
                console.log(categoryId,"category");
                const category = await CATEGORY.findOne({_id: categoryId}).populate("subcategory")
                console.log(category);
                if(category){
                    res.status(200).json(category)
                }else{
                    res.status(400).json({message:"Category not found"})
                }
                
            } catch (error) {
                res.status(500).json({message:"Something went wrong"})
            }
        }
    },

    //add new category
    addCategory: async (req, res) => {
        try {
            const { category = "Automobile" } = req.body
            const categoryInfo = await CATEGORY.findOne({ categoryName: category })
            if (categoryInfo) {
                res.status(400).json({ message: "Category already exists" })
            } else {
                console.log(req.file,"filesss");
                const File = req.file.path;
                cloudUpload(File,"Category") .then((result)=>{
                    const categoryTemplate = new CATEGORY({
                        categoryName: category,
                        icon : result
                    })
                    categoryTemplate.save().then(() => {
                        res.status(200).json({ message: "Category successfully added" })
                    }).catch((err) => {
                        console.log(err,"err");
                        res.status(400).json({ message: "Category failed to be added" })
                    })
                }).catch((error)=>{
                    console.log(error);
                    res.status(400).json({message:"cloud upload failed"})
                })

            }
        } catch (error) {
            res.status(500).json({ message: "something went wrong" })
        }
    },

    //deleteCategory
    deleteCategory: async (req, res) => {
        try {
            const { categoryid } = req.query
            const categoryInfo = await CATEGORY.findOne({ _id: categoryid })
            if (categoryInfo) {
                CATEGORY.updateOne({ _id: categoryId }, { deleted: true }).then(() => {
                    PRODUCT.updateMany({ category: categoryId }, { deleted: true }, { upsert: true }).then(() => {
                        res.status(200).json({ message: "successfully deleted" })
                    }).catch((err) => {
                        res.status(500).json({ message: "Something went wrong" })
                    })
                })
            } else {
                res.status(404).json({ message: "category not found" })
            }
        } catch (error) {
            res.status(500).json({ message: "Something went wrong" })
        }
    },

    //updatecategory
    updateCategory: async (req, res) => {
        try {
            const { categoryId, CategoryDet } = req.query
            const categoryInfo = await CATEGORY.findOne({ _id: categoryId })
            if (categoryInfo) {
                const File = req.file.path
                cloudUpload(File,"Catagory").then((result)=>{
                    CATEGORY.updateOne({ _id: categoryId }, { categoryName: CategoryDet ,icon : result}).then(() => {
                        res.status(200).json({ message: "Successfully updated category" })
                    }).catch(() => {
                        res.status(500).json({ message: "something went wrong" })
                    })
                }).catch((err)=>{
                    res.status(400).json({ message: "Image upload failed" })
                })
            } else {
                res.status(404).json({ message: "category not found" })
            }
        } catch (error) {
            res.status(500).json({ message: "something went wrong" })
        }
    },




    //Subcategory Management

    getSubCategories: async (req,res)=>{
        try {
            const subcategories = await SUBCAT.find({deleted:false})
            if(subcategories){
                res.status(200).json(subcategories)
            }else{
                res.status(404).json({messasge:"Empty subcategory"})
            }
        } catch (error) {
            res.status(500).json({messasge:"something went wrong"})
        }
    },

    //add subcategory
     addSubcategory: async (req, res) => {
        try {
            const { categoryId, subCategory, formInputs } = req.body
            const subCatinfo = await SUBCAT.findOne({ subcategory: subCategory })
            if (subCatinfo) {
                res.status(400).json({ message: "Subcategory already exists" })
            } else {
                const subCatTemplate = new SUBCAT({
                    subcategory: subCategory,
                    formInputs: [...formInputs]
                })
                subCatTemplate.save().then((response) => {
                    CATEGORY.updateOne({ _id: categoryId }, { $push: { subcategory: response._id } })
                    .then((response) => {
                        if (response.nMatched === 0) {
                            res.status(400).json({ message: "Category does not exist" })
                        } else {
                            res.status(200).json({ message: "Successfully added" })
                        }
                    }).catch((err) => {
                        console.log(err);
                        res.status(500).json({ message: "Something went wrong" })
                    })
                })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Something went wrong" })
        }

    },

    getSingleSubcategory: async (req,res)=>{
        {
            try {
                console.log(req.query,"sub cat");
                const subCategoryId = req.query.subCategoryId
                console.log(subCategoryId,"idd");
                const subCategory = await SUBCAT.findOne({_id: subCategoryId})
                console.log(subCategory);
                if(subCategory){
                    res.status(200).json(subCategory)
                }else{
                    console.log("sub cat n");
                    res.status(400).json({message:"subcategory not found"})
                }
                
            } catch (error) {
                console.log(error);
                res.status(500).json({message:"Something went wrong"})
            }
        }
    },

    //delete Subcategory
    deleteSubCategory :async (req,res)=>{
        try {
            const {categoryId,subcategoryId}= req.query
            const subCategoryInfo = await SUBCAT.findOne({_id:subcategoryId})
            if(subCategoryInfo){
                SUBCAT.updateOne({_id:subcategoryId},{deleted:true}).then(()=>{
                   CATEGORY.updateOne({_id:categoryId},{$pull:{subcategory:subcategoryId }}).then(()=>{
                    res.status(200).json({message:"successfylly deleted"})
                   }).catch((err)=>{
                    res.status(500).json({message:err.message});
                   })
                }).catch((err)=>{
                    res.status(500).json({message:err.message});
                   })
            }else{
                res.status(500).json({message:"Subcategory does not exist"});
            }
            
        } catch (err) {
            res.status(500).json({message:err.message});
        }
    },


    //update subcategory
    updateSubcategory: async (req,res)=>{
        try {
            const {subcategoryId,newInfo,formInputs}=req.query 
            const subCategoryInfo = await SUBCAT.findOne({_id:subcategoryId}) 
            if(subCategoryInfo){
              SUBCAT.updateOne({_id:subcategoryId},{subCategory:newInfo,formInputs:formInputs}).then(()=>{
                res.status(200).json({message:"Successfully updated"})
              }).catch((err)=>{
                res.status(500).json({message:"Error updating"})
              })
            }  else{
                res.status(404).json({message:"subcategory not found"})
            }
        } catch (error) {
            res.status(500).json({message:"Something went wrong"})

        }
    },



}