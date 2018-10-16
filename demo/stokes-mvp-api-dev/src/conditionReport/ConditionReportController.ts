import { ComposerGateway } from '../gateways/ComposerGateway'
import { ConditionReportDb } from '../offchain/crDb'
import { ArtHandlerDb } from '../offchain/ArtHandlerDb'
import { logger } from '../config/logger';
import generator from '../config/generator'
import { TransactionDetailDb } from '../offchain/TransactionDetailDb'
var SHA256 = require("crypto-js/sha256");

class ConditionReportController {

    // Get artwork for given CCR Request
    public getArtworkWithCRRequest = async (req, res) => {
        let org = this.setOrg(req.headers);

        // Validate request (TODO)

        try {
            // Retrieve on chain data from composer API
            const composerGateway = new ComposerGateway();
            const allArtwork = await composerGateway.getArtworkWithCRRequest(org);

            // For each artwork, get the artist name and potentially owner name
            let artworkResponse = [];
            for (let artwork of allArtwork) {
                artworkResponse.push(await this.loadFromOffChain(artwork));
            }

            // Return reponse
            res.status(200).send(artworkResponse);
        }
        catch (err) {
            res.status(500).send(err);
        }
    }

    // Get a single condition report from the offchain data store
    public getConditionReport = async (req, res) => {

        const crRefId = String(req.params.crRefId);

        try {
            res.status(200).send(await new ConditionReportDb().findByCRRefID(crRefId));
        }
        catch (err) {
            res.status(500).send(err);
        }
    }

    // Requests CR
    public requestConditionReport = async (req, res) => {
        let org = this.setOrg(req.headers);

        // Validate request
        const artworkID = req.body;

        try {
            // Submit to composer gateway RequestConditionReport
            const composerGateway = new ComposerGateway();
            const crResponse = await composerGateway.requestConditionReport(artworkID, org);

            const allHistorianResponce = await composerGateway.getHistorian( org);
            const historianResponse = await composerGateway.getHistorianByTransactionId(crResponse.transactionId, org);
            console.log("historianResponse : "+historianResponse); 
            var transactionTypeStrArr = historianResponse.transactionType.split(".");
            
            // Create TransactionDetail on cloudant DB
             const transactionDetailDB = {
                artID: crResponse.artworkID,
                transactionId: crResponse.transactionId,
                transactionTimestamp: historianResponse.transactionTimestamp,
                blockNo: allHistorianResponce.length-2,
                transactionType: transactionTypeStrArr[transactionTypeStrArr.length-1],
                user: req.headers.username
            }
            
            await new TransactionDetailDb().create(transactionDetailDB);

            // Return reponse
            res.status(200).send(crResponse);
        }
        catch (err) {
            res.status(500).send(err);
        }
    }

    // Submits CR
    public submitConditionReport = async (req, res) => {
        let org = this.setOrg(req.headers);

        // Validate request
        const crSubmit = req.body;

        // Generate crRefID
        crSubmit.crRefID = "cr-" + generator.generateRandomString();

        // Store condition report offchain for art_condition_report with crRefID
        crSubmit.crHash = SHA256(crSubmit.conditionReport).toString();
        const crDB = {
            crRefID: crSubmit.crRefID,
            artID: crSubmit.artworkID,
            conditionReport: crSubmit.conditionReport,
            crHash: crSubmit.crHash
        };
        await new ConditionReportDb().create(crDB);

        // Generate crArtHandlerRefID
        crSubmit.crArtHandlerRefID = "handler-" + generator.generateRandomString();

        // Store condition report offchain for art_handler_name with crArtHandlerRefID
        crSubmit.crArtHandlerNameHash = SHA256(crSubmit.artHandlerName).toString();
        const handlerDB = {
            crArtHandlerRefID: crSubmit.crArtHandlerRefID,
            artID: crSubmit.artworkID,
            artHandlerName: crSubmit.artHandlerName,
            artHandlerNameHash: crSubmit.crArtHandlerNameHash
        }
        await new ArtHandlerDb().create(handlerDB);

        // Now remove data that is only kept off chain
        delete crSubmit.conditionReport;
        delete crSubmit.artHandlerName;

        // Submit request to composer gateway SubmitConditionReport
        const composerGateway = new ComposerGateway();
        const artworkResponse = await composerGateway.submitConditionReport(crSubmit, org);

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

        // Return reponse
        res.status(200).send(artworkResponse);
    }

    // Cross Check CR
    public crossCheckConditionReport = async (req, res) => {
        let org = this.setOrg(req.headers);

        // Validate request
        const crCrossCheck = req.body;

        // Generate crReviewArtHandlerRefID
        crCrossCheck.crReviewArtHandlerRefID = "crReview-" + generator.generateRandomString();

        // Store condition report offchain for art_handler_name with crReviewArtHandlerRefID
        crCrossCheck.artHandlerNameHash = SHA256(crCrossCheck.artHandlerName).toString();
        const handlerDB = {
            crArtHandlerRefID: crCrossCheck.crReviewArtHandlerRefID,
            artID: crCrossCheck.artworkID,
            artHandlerName: crCrossCheck.artHandlerName,
            artHandlerNameHash: crCrossCheck.artHandlerNameHash
        }
        await new ArtHandlerDb().create(handlerDB);

        // Now remove data that is only kept off chain
        delete crCrossCheck.artHandlerName;

        // Submit request to composer gateway crossCheckConditionReport
        const composerGateway = new ComposerGateway();
        const artworkResponse = await composerGateway.crossCheckConditionReport(crCrossCheck, org);

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

        // Return reponse
        res.status(200).send(artworkResponse);
    }

    // Helper function for loading off chain data
    private async loadFromOffChain(artwork) {
        // let artistDoc = await new ArtistNameDb().findByArtistRefID(artwork.artistRefID);

        // if (artistDoc == null) {
        //     artwork = `artistRefID ${artwork.artistRefID} does not exist in database`;
        // }
        // else {
        //     artwork.artistName = artistDoc.artistName;
        // }

        // // Artwork may have owner property
        // if (artwork.hasOwnProperty("ownerRefID")) {
        //     let ownerDoc = await new ArtOwnerDb().findByOwnerRefID(artwork.ownerRefID);

        //     if (ownerDoc == null) {
        //         artwork.owner = `ownerRefId ${artwork.ownerRefID} does not exist in database`;
        //     }
        //     else {
        //         artwork.owner = ownerDoc.owner;
        //     }
        // }

        // if (artwork.hasOwnProperty("conditionReport")) {
        //     if (artwork.conditionReport.hasOwnProperty("crArtHandlerRefID")) {
        //         let handlerDoc = await new ArtHandlerDb().findByHandlerRefID(artwork.conditionReport.crArtHandlerRefID);

        //         if (handlerDoc == null) {
        //             artwork.conditionReport.crArtHandler = `crArtHandlerRefId ${artwork.conditionReport.crArtHandlerRefID} does not exist in database`;
        //         }
        //         else {
        //             artwork.conditionReport.crArtHandler = handlerDoc.artHandlerName;
        //         }
        //     }
        // }

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
}

export default new ConditionReportController();
