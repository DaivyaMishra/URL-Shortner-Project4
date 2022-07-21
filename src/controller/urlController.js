const urlModel = require("../model/urlModel")
const shortid = require("shortid")
const redis = require("redis")
const validUrl = require('valid-url');
const { findOne } = require("../model/urlModel");
const { promisify } = require("util");


//Connect to redis
const redisClient = redis.createClient(
  10842,
  "redis-10842.c301.ap-south-1-1.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("2uSDoorSkYSoGf4MLMcIl6YkTzkSh9oT", function (err) {
  if (err) throw err;
});

redisClient.on('connect', function(){
  console.log('Connected to Redis');
});

redisClient.on('error', function(err) {
   console.log('Redis error: ' + err);
});

// --------------------------validation functions------------------------------------------------

const isValid= function(value) {
  if(typeof value == undefined || value == null||value.length==0) return false
  if(typeof value==='string'&& value.trim().length===0) return false
   return true
}


const isValiedRequestBody= function(requestBody){
  return Object.keys(requestBody).length >0
}

// -------------------------------------create short url------------------------------------------

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);


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
    if(!isValid(longUrl)) {
      return res.status(400).send({status: false, msg:"Please Provide longUrl"})
    }
  
  if (!validUrl.isUri(longUrl)){
    return res.status(400).send({status: false, msg:"Please Provide  valid longUrl"})
  }

  // ===========================redis====================

// --------------------------------------------already shortern validation------------------------
let cachesUrlData = await GET_ASYNC(`${req.body.longUrl}`);
  if (cachesUrlData) {
      return res.status(200).send({ status: true,  data: JSON.parse(cachesUrlData) })

  } else {  

          let dbUrlData = await urlModel.findOne({ longUrl:longUrl}).select({urlCode:1,_id:0})
  
          if (dbUrlData ) {
          return res.status(400).send({ status: false, message: "This url is already shorten" , msg:dbUrlData})

      } 
      // else {
      //   // To create shorturl from adding the baseurl and urlcode
      //     const shortUrl = baseUrl + '/' + urlCode.toLowerCase()
      // }

      // -----------------------------------creating short url-------------------------------------

    let urlCreate= await urlModel.create(urlData);
    console.log(urlCreate)
    await SET_ASYNC(`${url}`, JSON.stringify(urlCreate));
    
    res.status(201).send({ status:true, data:urlData})
  }
    
      }
    catch (err) {

        return res.status(500).send(' Server Error invalid url')
    }

}
    








    //=========================== Get URL APi========================================================
       

const getUrlCode = async function(req,res) {
     try{
    const urlParams =req.params.urlCode
    
 
    // --------------------urlCode validations--------------------------------------------------------

  if(!isValid(urlParams)) {
    return res.status(400).send({status: false, msg: "Please provide urlCode"})
}

let cachesUrlData = await GET_ASYNC(`${urlParams}`);

const urlData = JSON.parse(cachesUrlData);
if (cachesUrlData) {
    return res.redirect(302,urlData.longUrl);
}
else{
// ------------------------validating uniqueness------------------------------------------------------
const dbUrlData = await urlModel.findOne({urlCode: urlParams}).select({longUrl:1,_id:0})
console.log(dbUrlData)
if(!dbUrlData){
  res.status(400).send({status:false, msg:" urlCode not found"})
}

//convert to object

  //  =====================================redirecting to longurl=====================================
  // dbUrl= dbUrlData.longUrl
  console.log(dbUrlData,"146")
     const url2 = JSON.stringify(dbUrlData.longUrl)
     console.log(url2)
   const replacedUrl= url2.replaceAll('"', '');
   console.log(replacedUrl)
   const redirectUrl= replacedUrl
    // res.redirect(302,replacedUrl)
    await SET_ASYNC(`${urlParams}`, JSON.stringify(dbUrlData));
    res.redirect(302,redirectUrl);

    
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
    
// //         let urlParams = req.params.urlCode;

        
        
// //             let findUrlCode = await urlModel.findOne({ urlCode:urlParams }).select({  longUrl: 1,_id:0});
// //             res.send(findUrlCode)
// //             // if (!findUrlCode) {
// //             //     return res.status(404).send({ status: false, message: "Not found this url code." });
// //             // }
// //             // const url= JSON. stringify(findUrlCode.longUrl)
// //             // console.log(url)
// //             // res.redirect(url,200)
            
            
// //         };
    
       
// const getUrlCode = async function(req,res) {
  
//         const urlParams =req.params.urlCode
//       console.log(urlParams)
        
//       // If we have don't set any data in cache ,then it will fetch the data from mongo db
//         const url = await urlModel.findOne({urlCode: urlParams}).select({longUrl:1,_id:0})
//        const url2 = JSON. stringify(url.longUrl)
//        const replacedUrl= url2.replaceAll('"', '');
//        console.log(replacedUrl)
//         res.redirect(302,replacedUrl)
        
   
// }

// module.exports.urlShortner= urlShortner
// module.exports.getUrlCode= getUrlCode





