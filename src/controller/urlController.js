const shortid = require('shortid')
const validUrl = require('valid-url')
const urlModel = require('../model/urlModel')

const redis = require("redis");
const { promisify } = require("util");

//================================================ CONNECT TO REDIS =======================================================================

//Connect to redis
const redisClient = redis.createClient(
  10842,
  "redis-10842.c301.ap-south-1-1.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("2uSDoorSkYSoGf4MLMcIl6YkTzkSh9oT", function (err) {
  if (err) throw err;
});


redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
});

//CONNECTION SETUP FOR RADIS
                                                                 
const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);


// 1. API ========================================== CREATE URL ===========================================================================

const createShortenUrl = async function (req, res) {
    try {
        const data = req.body
        const { longUrl } = data

        const baseUrl = "http://localhost:3000"

        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, message: "Please enter request data to be created" })
        }

        if (!longUrl) {
            return res.status(400).send({ status: false, message: "Please enter longUrl" })
        }

        if (!validUrl.isWebUri(longUrl)) {
            return res.status(400).send({ status: false, message: "Please enter valid longUrl" })
        }

        let urlCode = shortid.generate().toLowerCase()
        let shortUrl = baseUrl + '/' + urlCode

        const cachedUrl = await GET_ASYNC(`${longUrl}`)

        let url = JSON.parse(cachedUrl)                 //  CONVERT STRING TO OBJECT

        if (url) {
            return res.status(200).send({ status: true, message: "This shortenUrl is return from get cache", data: url })
        }

        const urlfind = await urlModel.findOne({ longUrl: longUrl }).select({ shortUrl: 1, urlCode: 1, _id: 0 })
       
        await SET_ASYNC(`${longUrl}`, JSON.stringify(urlfind))

        if (urlfind) {
            return res.status(200).send({ status: true, message: "This url is already shorten", data: urlfind })
        }

        let saveData = { longUrl, shortUrl, urlCode }

        await urlModel.create(saveData)
        res.status(201).send({ status: true, message: "Success ", data: saveData })

    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }

}

// API ========================================== GET URL ===========================================================================

const getUrl = async function (req, res) {
    try {
        const urlCode = req.params.urlCode;

        let cachedUrl = await GET_ASYNC(`${urlCode}`)

        let url = JSON.parse(cachedUrl)   //  CONVERTING OBJECT FORMAT 
        if (url) {

            return res.redirect(302, url.longUrl)
        }

        const findUrlCode = await urlModel.findOne({ urlCode: urlCode })

        if (!findUrlCode) {
            return res.status(404).send({ status: false, message: "This shortUrl and urlCode is Not found" })
        } else {

            await SET_ASYNC(`${urlCode}`, JSON.stringify(findUrlCode))   // CONVERTING STRING

            return res.redirect(302, findUrlCode.longUrl)
        }

    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
};




module.exports = { createShortenUrl, getUrl }
























































































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





