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
console.log(urlCreate)
res.status(201).send({ status:true, data:urlData})

}

// let getUrlCode = async function (req, res) {
    
//         let urlCode1 = req.params.urlCode;

        
        
//             let findUrlCode = await urlModel.findOne({ urlCode:urlCode1 }).select({  longUrl: 1,_id:0});
//             res.send(findUrlCode)
//             // if (!findUrlCode) {
//             //     return res.status(404).send({ status: false, message: "Not found this url code." });
//             // }
//             // const url= JSON. stringify(findUrlCode.longUrl)
//             // console.log(url)
//             // res.redirect(url,200)
            
            
//         };
    
       
const getUrlCode = async function(req,res) {
  
        const urlCode1 =req.params.urlCode
      console.log(urlCode1)
        
      // If we have don't set any data in cache ,then it will fetch the data from mongo db
        const url = await urlModel.findOne({urlCode: urlCode1}).select({longUrl:1,_id:0})
       const url2 = JSON. stringify(url.longUrl)
       const logoUrl2= url2.replaceAll('"', '');
       console.log(logoUrl2)
        res.redirect(200,logoUrl2)
        
   
}

module.exports.urlShortner= urlShortner
module.exports.getUrlCode= getUrlCode





