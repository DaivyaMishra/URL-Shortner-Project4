const urlModel = require("../model/urlModel")
const shortid = require("shortid")
const redis = require("redis")
  


const urlShortner= async function(req, res){

let url = req.body;
let urlCode = shortid.generate()
let baseUrl = "http://localhost:3000";
let shortUrl= baseUrl + "/"+ urlCode;
let longUrl = url.longUrl

let urlData = {longUrl, shortUrl,urlCode};
let urlCreate= await urlModel.create(urlData);
res.status(201).send({ status:true, data:urlData})

}
module.exports.urlShortner= urlShortner




