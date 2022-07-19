const urlModel = require("../model/urlModel")
const shortid = require("shortid")
const redis = require("redis")
const validUrl = require('valid-url');
const { findOne } = require("../model/urlModel");

// --------------------------validation functions------------------------------------------------

const isValied= function(value) {
  if(typeof value == undefined || value == null||value.length==0) return false
  if(typeof value==='string'&& value.trim().length===0) return false
   return true
}


const isValiedRequestBody= function(requestBody){
  return Object.keys(requestBody).length >0
}

// -------------------------------------create short url------------------------------------------


const urlShortner= async function(req, res){
     try{
    let url = req.body;
    let urlCode = shortid.generate()
    let baseUrl = "http://localhost:3000";
    let shortUrl= baseUrl + "/"+ urlCode;
    let longUrl = url.longUrl
    
    // -------------------------------------url validations---------------------------------------
    let urlData = {longUrl, shortUrl,urlCode};
    if (!isValiedRequestBody(url)){
      return res.status(400).send({status: false, msg:"Please Enter some LOngUrl url"})
    }
    if(!isValied(longUrl)) {
      return res.status(400).send({status: false, msg:"Please Provide longUrl"})
    }
  
  if (!validUrl.isUri(longUrl)){
    return res.status(400).send({status: false, msg:"Please Provide  valid longUrl"})
  }


// --------------------------------------------already shortern validation------------------------
  let url1 = await urlModel.findOne({ longUrl:longUrl}).select({urlCode:1,_id:0})
  
  if (url1 ) {
          return res.status(400).send({ status: false, message: "This url is already shorten" , msg:url1})

      } 
      // else {
      //   // To create shorturl from adding the baseurl and urlcode
      //     const shortUrl = baseUrl + '/' + urlCode.toLowerCase()
      // }

      // -----------------------------------creating short url-------------------------------------

    let urlCreate= await urlModel.create(urlData);
    console.log(urlCreate)
    res.status(201).send({ status:true, data:urlData})
    
    
      }
    catch (err) {

        return res.status(500).send(' Server Error invalid url')
    }

}
    








    //=========================== Get URL APi========================================================
       

const getUrlCode = async function(req,res) {
     try{
    const urlCode1 =req.params.urlCode
 
    // --------------------urlCode validations--------------------------------------------------------

  if(!isValied(urlCode1)) {
    return res.status(400).send({status: false, msg: "Please provide urlCode"})
}

// ------------------------validating uniqueness------------------------------------------------------
const url = await urlModel.findOne({urlCode: urlCode1}).select({longUrl:1,_id:0})
if(!url){
  res.status(400).send({status:false, msg:" urlCode not found"})
}


  //  =====================================redirecting to longurl=====================================
else{
     const url2 = JSON.stringify(url.longUrl)
   const logoUrl2= url2.replaceAll('"', '');
   console.log(logoUrl2)
    res.redirect(302,logoUrl2)

    
    // console.log(url,"97")
   
}
   
} 
catch (err) {
    console.log("This is the error :", err.message)
    return res.status(500).send({status: false, msg:err.message })
}
}



// -----------------------exporting models-----------------------------------------------------------

module.exports.urlShortner= urlShortner
module.exports.getUrlCode= getUrlCode












































// const urlModel = require("../model/urlModel")
// const shortid = require("shortid")
// const redis = require("redis")
  


// const urlShortner= async function(req, res){

// let url = req.body;
// let urlCode = shortid.generate()
// let baseUrl = "http://localhost:3000";
// let shortUrl= baseUrl + "/"+ urlCode;
// let longUrl = url.longUrl

// let urlData = {longUrl, shortUrl,urlCode};
// let urlCreate= await urlModel.create(urlData);
// console.log(urlCreate)
// res.status(201).send({ status:true, data:urlData})

// }

// // let getUrlCode = async function (req, res) {
    
// //         let urlCode1 = req.params.urlCode;

        
        
// //             let findUrlCode = await urlModel.findOne({ urlCode:urlCode1 }).select({  longUrl: 1,_id:0});
// //             res.send(findUrlCode)
// //             // if (!findUrlCode) {
// //             //     return res.status(404).send({ status: false, message: "Not found this url code." });
// //             // }
// //             // const url= JSON. stringify(findUrlCode.longUrl)
// //             // console.log(url)
// //             // res.redirect(url,200)
            
            
// //         };
    
       
// const getUrlCode = async function(req,res) {
  
//         const urlCode1 =req.params.urlCode
//       console.log(urlCode1)
        
//       // If we have don't set any data in cache ,then it will fetch the data from mongo db
//         const url = await urlModel.findOne({urlCode: urlCode1}).select({longUrl:1,_id:0})
//        const url2 = JSON. stringify(url.longUrl)
//        const logoUrl2= url2.replaceAll('"', '');
//        console.log(logoUrl2)
//         res.redirect(302,logoUrl2)
        
   
// }

// module.exports.urlShortner= urlShortner
// module.exports.getUrlCode= getUrlCode





