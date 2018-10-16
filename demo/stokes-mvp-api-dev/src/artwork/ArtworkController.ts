import { ComposerGateway } from '../gateways/ComposerGateway'
import { ArtistNameDb } from '../offchain/ArtistNameDb'
import { ArtImageDb } from '../offchain/ArtImageDb'
import { ArtOwnerDb } from '../offchain/ArtOwnerDb'
import { ArtHandlerDb } from '../offchain/ArtHandlerDb'
import { TransactionDetailDb } from '../offchain/TransactionDetailDb'
import { logger } from '../config/logger';
import generator from '../config/generator'

var SHA256 = require("crypto-js/sha256");
var multer = require('multer');
var path = require('path');
var fs = require("fs");
var crypto = require("crypto");

var root = path.dirname(require.main.filename)

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/images/uploads')
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now()+path.extname(file.originalname))
    }
});


var upload = multer({storage: storage}).single('image')
var base64Img = require('base64-img');
var thumb = require('node-thumbnail').thumb;
var sha256 = crypto.createHash('sha256');

class ArtworkController {

    /******************************************************
     * Queries
     ******************************************************/

    // Call composer API and offchain data to get Artwork
    public getArtwork = async (req, res) => {
        let org = this.setOrg(req.headers);

        try {
            // Retrieve on chain data from composer API
            const composerGateway = new ComposerGateway();
            const allArtwork = await composerGateway.getAllArtwork(org);

            // For each artwork, get the artist name and potentially owner name
            let artworkResponse = [];
            for (let artwork of allArtwork) {
                artworkResponse.push(await this.loadFromOffChain(artwork));
            }

            // Return the response to the client
            res.status(200).send(artworkResponse);
        }
        catch (err) {
            res.status(500).send(err);
        }
    }

    // Call composer API and offchain data to get Artwork
    public getArtworkByID = async (req, res) => {
        let org = this.setOrg(req.headers);

        try {
            const composerGateway = new ComposerGateway();
            const artworkResponses = await composerGateway.getArtworkByID(req.params.artworkID, org);

            if (artworkResponses.length < 1) {
                res.status(200).send("");
                return;
            }

            const artworkResponse = artworkResponses[0];

            // for Artwork get the artist name and image
            let artistDB = await new ArtistNameDb().findByArtistRefID(artworkResponse.artistRefID);
            if (artistDB == null) {
                artworkResponse.artistName = `artistRefID ${artworkResponse.artistRefID} does not exist in database`;
            }
            else {
                artworkResponse.artistName = artistDB.artistName;
            }

            let imageDB = await new ArtImageDb().findByImageRefID(artworkResponse.imageRefID);
            if (imageDB == null) {
                artworkResponse.image = `imageDB ${artworkResponse.imageRefID} does not exist in database`;
            }
            else {
                artworkResponse.image = imageDB.image;
                artworkResponse.orginialImagePath = imageDB.orginialImagePath;
            }

            // Return the response to the client
            res.status(200).send(artworkResponse);
        }
        catch (err) {
            res.status(500).send(err);
        }
    }

    // Call composer API and offchain data to find Artwork
    public findArtwork = async (req, res) => {
        let org = this.setOrg(req.headers);

        try {
            const composerGateway = new ComposerGateway();

            if (req.query.hasOwnProperty("title") && req.query.hasOwnProperty("year")) {
                // call find by title and year
                const artworkResponses = await composerGateway.findArtworkByYearTitle(req.query.year, req.query.title, org);
                res.status(200).send(artworkResponses);
            }
            else if (req.query.hasOwnProperty("year")) {
                // call find by year
                const artworkResponses = await composerGateway.findArtworkByYear(req.query.year, org);
                res.status(200).send(artworkResponses);
            }
            else if (req.query.hasOwnProperty("title")) {
                // call find by title
                const artworkResponses = await composerGateway.findArtworkByTitle(req.query.title, org);
                res.status(200).send(artworkResponses);
            }
            else if (req.query.hasOwnProperty("name")) {
                res.status(200).send(await new ArtistNameDb().findByArtistName(req.query.name));
            }
            else {
                res.status(400).send("Incorrect query fields");
            }
        }
        catch (err) {
            res.status(500).send(err);
        }
    }

    // Call offchain data store for Image
    public getImage = async (req, res) => {
        const imageRefID = String(req.params.imageRefID);

        try {
            let imageDB = await new ArtImageDb().findByImageRefID(imageRefID);

            res.status(200).send(imageDB);
        }
        catch (err) {
            res.status(500).send(err);
        }
    }

    // Call composer API and offchain data to get Artwork
    public getArtRepDashboard = async (req, res) => {
        let org = this.setOrg(req.headers);

        let dashboard = {
            myCollection: [],
            negotiating: [],
            sold: []
        }

        try {
            // Retrieve on chain data from composer API
            const composerGateway = new ComposerGateway();
            dashboard.myCollection = await composerGateway.getArtworkWithOwnershipArtist(org);
            dashboard.negotiating = await composerGateway.getArtworkWithOwnershipRequest(org);
            dashboard.sold = await composerGateway.getArtworkWithOwnershipTransferred(org);

            // Return the response to the client
            res.status(200).send(dashboard);
        }
        catch (err) {
            res.status(500).send(err);
        }
    }

    // Call composer API and offchain data to get Artwork
    public getManagerDashboard = async (req, res) => {
        let org = this.setOrg(req.headers);

        let dashboard = {
            myCollection: [],
            considering: [],
            available: []
        }

        try {
            // Retrieve on chain data from composer API
            const composerGateway = new ComposerGateway();
            dashboard.myCollection = await composerGateway.getArtworkWithOwnershipTransferred(org);
            dashboard.considering = await composerGateway.getArtworkWithOwnershipRequest(org);
            dashboard.available = await composerGateway.getArtworkWithOwnershipArtist(org);

            // Return the response to the client
            res.status(200).send(dashboard);
        }
        catch (err) {
            res.status(500).send(err);
        }
    }

    // Call composer API and offchain data to get Artwork
    public getHandlerDashboard = async (req, res) => {
        let org = this.setOrg(req.headers);

        let dashboard = {
            new: [],
            inProgress: [],
            complete: []
        }

        try {
            // Retrieve on chain data from composer API
            const composerGateway = new ComposerGateway();
            dashboard.new = await composerGateway.getArtworkWithCRRequest(org);
            dashboard.inProgress = await composerGateway.getArtworkWithTransitInProgress(org);
            dashboard.complete = await composerGateway.getArtworkWithTransitCompleted(org);

            // Return the response to the client
            res.status(200).send(dashboard);
        }
        catch (err) {
            res.status(500).send(err);
        }
    }


    /******************************************************
     * Txns
     ******************************************************/

    // Call offchain data and composer API to create Artwork
    
    public createArtwork = async (req, res) => {
        let org = this.setOrg(req.headers);

     upload(req, res, async function (err) {
            if (err) {
                logger.error("Error in loading"+err);
              return
            }

            logger.debug("Image uploaded successfully");
            
            var absolutePath = path.join(root ,'public/images/uploads',req.file.filename);
            var relativePath = path.join('public/images/uploads',req.file.filename);
            var originalImageHash = null;
             //Hashing of Original Image from DIsk Storage
             //var imageBuffer = fs.readFileSync(relativePath);
             //var originalImageHash = sha256.update(imageBuffer).digest('hex');
             //var originalImageHash = crypto.createHash('sha256').update(imageBuffer).digest('hex');
             //imageBuffer=null;
             logger.debug("Image Path : "+relativePath);
             var readStream = fs.createReadStream(relativePath);
             var hash = crypto.createHash('sha256');
             await readStream
               .on('data', function (chunk) {
                 hash.update(chunk);
               })
               .on('end', function () {
                originalImageHash=hash.digest('hex');
                readStream.destroy();
               });
        try{ 
            thumb({
                source: relativePath, // could be a filename: dest/path/image.jpg
                destination: 'public/images/uploads',
                width: 100,
                concurrency: 2
              },async function(files, err, stdout, stderr) {
                if(files){
                 var base64Resp = await base64Img.base64(files[0].dstPath, async function(err, data) {
                        if(!err){
                            try {
                                // Validate body (Need to do)
                                
                                // Now store as defined
                                let artworkRequest = req.body;
                                logger.debug("File Uploaded:"+req.file.filename);
                                // Create unique identifier for ArtWork, Artist, Image
                                artworkRequest.artworkID = "artwork-" + generator.generateRandomString();
                                artworkRequest.artistRefID = "artist-" + generator.generateRandomString();
                                artworkRequest.imageRefID = "image-" + generator.generateRandomString();
                    
                                artworkRequest.artistNameHash = SHA256(artworkRequest.artistName).toString();
                                // Create ArtistName on cloudant DB
                                const artistNameDB = {
                                    artistRefID: artworkRequest.artistRefID,
                                    artID: artworkRequest.artworkID,
                                    artistName: artworkRequest.artistName,
                                    artistNameHash: artworkRequest.artistNameHash
                                }
                                await new ArtistNameDb().create(artistNameDB);
                    
                               
                    
                                //artworkRequest.imageHash = SHA256(artworkRequest.image).toString(); Old Code Change for Large Files Issue
                                artworkRequest.image = data;
                                artworkRequest.imageHash = SHA256(data).toString(); // Creating Hash of Thumbnail Image to store off Chain
                                console.log("Thumbnail Hash :"+artworkRequest.imageHash);
                                // Create Image on cloudant DB
                                const artImage = {
                                    imageRefID: artworkRequest.imageRefID,
                                    artID: artworkRequest.artworkID,
                                    image: artworkRequest.image,
                                    imageHash: artworkRequest.imageHash,
                                    orginialImagePath: absolutePath
                                }
                                await new ArtImageDb().create(artImage);

                                if(originalImageHash==null){
                                    await new Promise(done => setTimeout(done, 5000));
                                }
                                 console.log("Image Hash : "+originalImageHash);
                                 artworkRequest.imageHash=originalImageHash;
                                // Now remove data that is only kept off chain
                                delete artworkRequest.image;
                                delete artworkRequest.artistName;
                                // Now put data on chain
                                const composerGateway = new ComposerGateway();
                                const artworkResponse =  await composerGateway.createArtwork(artworkRequest, org);

                                const allHistorianResponce = await composerGateway.getHistorian( org);
                                const historianResponse = await composerGateway.getHistorianByTransactionId(artworkResponse.transactionId, org);
                                console.log("historianResponse : "+historianResponse); 
                                var transactionTypeStrArr = historianResponse.transactionType.split(".");
                                
                                // Create TransactionDetail on cloudant DB
                                 const transactionDetailDB = {
                                    artID: artworkResponse.artworkID,
                                    transactionId: artworkResponse.transactionId,
                                    transactionTimestamp: historianResponse.transactionTimestamp,
                                    blockNo: allHistorianResponce.length-2,
                                    transactionType: transactionTypeStrArr[transactionTypeStrArr.length-1],
                                    user: req.headers.username
                                }
                                
                                await new TransactionDetailDb().create(transactionDetailDB);
                                // Return the response
                                res.status(201).send(artworkResponse);
                                //res.status(201).send({"Success":"true"});
                            }
                            catch (err) {
                                console.log("err : "+err);
                                res.status(500).send(err);
                            }
                        }else
                        logger.error("Error in Base 64 Generation : "+err);
                    });
                    if(base64Resp){
                    fs.unlinkSync(files[0].dstPath);
                }
                }
                else if(err)
                logger.error(err);
            });
        }catch(err){
            logger.error("Image Upload failed caused by : "+err);
        }
    });
    }

    // Call offchain data and composer API to request ownership
    public requestOwnership = async (req, res) => {
        let org = this.setOrg(req.headers);

        try {
            // Validate body (Need to do), has fields artworkID and proposedOwner

            // Now store as defined
            let ownershipRequest = req.body;

            // First retrieve artwork details from composer API
            const composerGateway = new ComposerGateway();
            let artworks = await composerGateway.getArtworkByID(ownershipRequest.artworkID, org);

            let artwork;
            if (artworks.length == 0) {
                res.status(400).send("artworkID is invalid, artwork does not exist");
                return;
            }
            else {
                artwork = artworks[0];
            }

            // If has ownerRefId, set proposed owner off chain
            if (artwork.hasOwnProperty("ownerRefId")) {
                let ownerDoc = await new ArtOwnerDb().findByOwnerRefID(ownershipRequest.ownerRefID)

                ownerDoc.proposedOwner = ownershipRequest.proposedOwner;

                await new ArtOwnerDb().update(ownerDoc)
            }
            // If does not have ownerRefId, create the ownerRefID and set a proposed owner
            else {
                artwork.ownerRefID = "owner-" + generator.generateRandomString();

                artwork.ownerHash = SHA256("No Owner (Still in Artist Posession)").toString();
                const artOwner = {
                    ownerRefID: artwork.ownerRefID,
                    artID: artwork.artworkID,
                    owner: "No Owner (Still in Artist Posession)",
                    proposedOwner: ownershipRequest.proposedOwner,
                    ownerHash: artwork.ownerHash
                }

                await new ArtOwnerDb().create(artOwner)
            }

            // Now submit ownershipRequest to composer
            let composerRequest = {
                artworkID: artwork.artworkID,
                ownerRefID: artwork.ownerRefID
            }

            const artworkResponse = await composerGateway.requestOwnership(composerRequest, org);

            const allHistorianResponce = await composerGateway.getHistorian( org);
            const historianResponse = await composerGateway.getHistorianByTransactionId(artworkResponse.transactionId, org);
            console.log("historianResponse : "+historianResponse); 
            var transactionTypeStrArr = historianResponse.transactionType.split(".");
            
            // Create TransactionDetail on cloudant DB
             const transactionDetailDB = {
                artID: artworkResponse.artworkID,
                transactionId: artworkResponse.transactionId,
                transactionTimestamp: historianResponse.transactionTimestamp,
                blockNo: allHistorianResponce.length-2,
                transactionType: transactionTypeStrArr[transactionTypeStrArr.length-1],
                user: req.headers.username
            }
            
            await new TransactionDetailDb().create(transactionDetailDB);
            res.status(200).send(artworkResponse);
        }
        catch (err) {
            logger.debug(err);
            res.status(500).send(err);
        }
    }

    // Call offchain data and composer API to take ownership Action
    public ownershipAction = async (req, res) => {
        let org = this.setOrg(req.headers);

        try {
            // Validate body (Need to do)
            let ownershipAction = req.body;
            if (!(ownershipAction.action == "ACCEPTED" || ownershipAction.action == "DECLINED")) {
                res.status(400).send("Invalid action. Must be ACCEPTED or DECLINED");
                return;
            }

            // Now ownershipAction to composer
            const composerGateway = new ComposerGateway();
            const artworkResponse = await composerGateway.ownershipAction(ownershipAction, org);

            const allHistorianResponce = await composerGateway.getHistorian( org);
            const historianResponse = await composerGateway.getHistorianByTransactionId(artworkResponse.transactionId, org);
            console.log("historianResponse : "+historianResponse); 
            var transactionTypeStrArr = historianResponse.transactionType.split(".");
            
            // Create TransactionDetail on cloudant DB
             const transactionDetailDB = {
                artID: artworkResponse.artworkID,
                transactionId: artworkResponse.transactionId,
                transactionTimestamp: historianResponse.transactionTimestamp,
                blockNo: allHistorianResponce.length-2,
                transactionType: transactionTypeStrArr[transactionTypeStrArr.length-1],
                user: req.headers.username
            }
            
            await new TransactionDetailDb().create(transactionDetailDB);

            res.status(200).send(artworkResponse);
        }
        catch (err) {
            res.status(500).send(err);
        }
    }

    // Call composer API and offchain data to get Artwork with ownership request
    public getArtworkOwnershipRequest = async (req, res) => {
        let org = this.setOrg(req.headers);

        try {
            // First retrieve on chain data from composer API
            const composerGateway = new ComposerGateway();
            const allArtwork = await composerGateway.getArtworkWithOwnershipRequest(org);

            // for each artwork, get the artist name
            // NOTE: May not want to retrieve images immediately, so not doing that for now
            let artworkResponse = [];
            for (let artwork of allArtwork) {
                artworkResponse.push(await this.loadFromOffChain(artwork));
            }
            // Return the response to the client
            res.status(200).send(artworkResponse);
        }
        catch (err) {
            res.status(500).send(err);
        }
    }

    // Call composer API and offchain data to get Artwork with ownership accepted
    public getArtworkOwnershipAccepted = async (req, res) => {
        let org = this.setOrg(req.headers);

        try {
            // First retrieve on chain data from composer API
            const composerGateway = new ComposerGateway();
            const allArtwork = await composerGateway.getArtworkWithOwnershipTransferred(org);

            let artworkResponse = [];
            for (let artwork of allArtwork) {
                artworkResponse.push(await this.loadFromOffChain(artwork));
            }

            // Return the response to the client
            res.status(200).send(artworkResponse);
        }
        catch (err) {
            res.status(500).send(err);
        }
    }

    // Get artistname, owner, and handler
    public getOffChainData = async (req, res) => {
        let org = this.setOrg(req.headers);

        // Get the right artwork from onChain
        let artworkID = req.body.artworkID;
        const composerGateway = new ComposerGateway();
        let artworks = await composerGateway.getArtworkByID(artworkID, org);
        let artwork;
        if (artworks.length == 0) {
            res.status(400).send("artworkID is invalid, artwork does not exist");
            return;
        }
        else {
            artwork = artworks[0];
        }

        let artistDoc = await new ArtistNameDb().findByArtistRefID(artwork.artistRefID);

        if (artistDoc == null) {
            artwork = `artistRefID ${artwork.artistRefID} does not exist in database`;
        }
        else {
            artwork.artistName = artistDoc.artistName;
        }

        // Artwork may have owner property
        if (artwork.hasOwnProperty("ownerRefID")) {
            let ownerDoc = await new ArtOwnerDb().findByOwnerRefID(artwork.ownerRefID);

            if (ownerDoc == null) {
                artwork.owner = `ownerRefId ${artwork.ownerRefID} does not exist in database`;
            }
            else {
                artwork.owner = ownerDoc.owner;
            }
        }

        if (artwork.hasOwnProperty("conditionReport")) {
            if (artwork.conditionReport.hasOwnProperty("crArtHandlerRefID")) {
                let handlerDoc = await new ArtHandlerDb().findByHandlerRefID(artwork.conditionReport.crArtHandlerRefID);

                if (handlerDoc == null) {
                    artwork.conditionReport.crArtHandler = `crArtHandlerRefId ${artwork.conditionReport.crArtHandlerRefID} does not exist in database`;
                }
                else {
                    artwork.conditionReport.crArtHandler = handlerDoc.artHandlerName;
                }
            }
        }

        res.status(200).send(artwork);
    }

    // Helper function for loading off chain data
    private async loadFromOffChain(artwork) {
         let artistDoc = await new ArtistNameDb().findByArtistRefID(artwork.artistRefID);

         if (artistDoc == null) {
             artwork = `artistRefID ${artwork.artistRefID} does not exist in database`;
         }
         else {
             artwork.artistName = artistDoc.artistName;
         }

         // Artwork may have owner property
         if (artwork.hasOwnProperty("ownerRefID")) {
             let ownerDoc = await new ArtOwnerDb().findByOwnerRefID(artwork.ownerRefID);

             if (ownerDoc == null) {
                 artwork.owner = `ownerRefId ${artwork.ownerRefID} does not exist in database`;
             }
             else {
                 artwork.owner = ownerDoc.owner;
             }
         }

         if (artwork.hasOwnProperty("conditionReport")){
             if(artwork.conditionReport.hasOwnProperty("crArtHandlerRefID")) {
                 let handlerDoc = await new ArtHandlerDb().findByHandlerRefID(artwork.conditionReport.crArtHandlerRefID);

                 if (handlerDoc == null) {
                     artwork.conditionReport.crArtHandler = `crArtHandlerRefId ${artwork.conditionReport.crArtHandlerRefID} does not exist in database`;
                 }
                 else {
                     artwork.conditionReport.crArtHandler = handlerDoc.artHandlerName;
                 }
             }
         }

        return artwork;
    }

    // Helper function for setting the interacting org
    // Crozier(handler, rep) = 0, Museum(collector) = 1, ARCs(mngr) = 2
    private setOrg(headers) {

        let currentOrg = 1;

        let orgMap = {
            "Art Handler": 0,
            "Artist Representative": 0,
            "Collector": 1,
            "Collection Manager": 2
        }

        let user;

        // Must be an org. If no match, default to org2 for now
        if (headers.user == undefined) {
            logger.debug("user header not set, setting org to Crozier");
            currentOrg = 0;
        }
        else {
            user = headers.user;
            if (orgMap[user] != undefined) {
                logger.debug("Request from " + user + ". Org set to org" + orgMap[user])
                currentOrg = orgMap[user];
            }
            else {
                logger.debug(user + " not an accepted user, org set to Crozier");
                currentOrg = 0;
            }
        }

        return currentOrg;
    }

    public downloadArtwork = async (req, res) => {
   
        var file = req.body.artPath;
        var fileName = function (file) {
            return file.split('\\').pop().split('/').pop();
        }
        logger.debug("Downloading Start:::"+fileName(file));
        res.download('public/images/uploads/'  + fileName(file));

    }

     // Call offchain data store for Transaction Details
     public getTransactionsByArtID = async (req, res) => {
        const artID = String(req.params.artworkID);

        try {
            let transactionsDB = await new TransactionDetailDb().findByArtID(artID);

            res.status(200).send(transactionsDB);
        }
        catch (err) {
            res.status(500).send(err);
        }
    }
}

export default new ArtworkController();
