import { ComposerGateway } from '../gateways/ComposerGateway'
import { ConditionReportDb } from '../offchain/crDb'
import { ArtOwnerDb } from '../offchain/ArtOwnerDb'
import { ArtHandlerDb } from '../offchain/ArtHandlerDb'
import { logger } from '../config/logger';
import generator from '../config/generator'

import { TransactionDetailDb } from '../offchain/TransactionDetailDb'
var SHA256 = require("crypto-js/sha256");

class TransportationController {

    // Query for artwork in transit
    public transportationInProgress = async (req, res) => {
        let org = this.setOrg(req.headers);

        try {
            // query composer
            const composerGateway = new ComposerGateway();
            const allArtwork = await composerGateway.getArtworkWithTransitInProgress(org);

            let artworkResponse = [];
            for (let artwork of allArtwork) {
                artworkResponse.push(await this.loadFromOffChain(artwork));
            }

            res.status(200).send(artworkResponse);
        }
        catch (err) {
            res.status(500).send(err);
        }
    }

    // Query for artwork transit completed
    public transportationCompleted = async (req, res) => {
        let org = this.setOrg(req.headers);

        try {
            // query composer
            const composerGateway = new ComposerGateway();
            const allArtwork = await composerGateway.getArtworkWithTransitCompleted(org);
            let artworkResponse = [];
            for (let artwork of allArtwork) {
                artworkResponse.push(await this.loadFromOffChain(artwork));
            }

            res.status(200).send(artworkResponse);
        }
        catch (err) {
            res.status(500).send(err);
        }
    }

    // Request Art Transit
    public requestTransportation = async (req, res) => {
        let org = this.setOrg(req.headers);

        // Validate input
        const transportationRequest = req.body;

        try {
            // Submit to composer
            const composerGateway = new ComposerGateway();
            const composerResponse = await composerGateway.requestTransportation(transportationRequest, org);

            const allHistorianResponce = await composerGateway.getHistorian( org);
            const historianResponse = await composerGateway.getHistorianByTransactionId(composerResponse.transactionId, org);
            console.log("historianResponse : "+historianResponse); 
            var transactionTypeStrArr = historianResponse.transactionType.split(".");
            
            // Create TransactionDetail on cloudant DB
             const transactionDetailDB = {
                artID: composerResponse.artworkID,
                transactionId: composerResponse.transactionId,
                transactionTimestamp: historianResponse.transactionTimestamp,
                blockNo: allHistorianResponce.length-2,
                transactionType: transactionTypeStrArr[transactionTypeStrArr.length-1],
                user: req.headers.username
            }
            
            await new TransactionDetailDb().create(transactionDetailDB);


            res.status(200).send(composerResponse);
        }
        catch (err) {
            res.status(500).send(err);
        }
    }

    // Update Transportation Status
    public updateTransportation = async (req, res) => {
        let org = this.setOrg(req.headers);

        // Validate input
        const transportationUpdate = req.body;

        try {
            // Submit to composer
            const composerGateway = new ComposerGateway();
            const composerResponse = await composerGateway.updateTransportation(transportationUpdate, org);

            const allHistorianResponce = await composerGateway.getHistorian( org);
            const historianResponse = await composerGateway.getHistorianByTransactionId(composerResponse.transactionId, org);
            console.log("historianResponse : "+historianResponse); 
            var transactionTypeStrArr = historianResponse.transactionType.split(".");
            
            // Create TransactionDetail on cloudant DB
             const transactionDetailDB = {
                artID: composerResponse.artworkID,
                transactionId: composerResponse.transactionId,
                transactionTimestamp: historianResponse.transactionTimestamp,
                blockNo: allHistorianResponce.length-2,
                transactionType: transactionTypeStrArr[transactionTypeStrArr.length-1],
                user: req.headers.username
            }

            await new TransactionDetailDb().create(transactionDetailDB);

            res.status(200).send(composerResponse);
        }
        catch (err) {
            res.status(500).send(err);
        }
    }

    // Deliver the Artwork Status
    public deliverArtwork = async (req, res) => {
        let org = this.setOrg(req.headers);

        // Validate request
        const deliverArtworkRequest = req.body;

        // Generate crRefID
        deliverArtworkRequest.crRefID = "cr-" + generator.generateRandomString();

        // Store condition report offchain for art_condition_report with crRefID
        deliverArtworkRequest.crHash = SHA256(deliverArtworkRequest.conditionReport).toString();
        const crDB = {
            crRefID: deliverArtworkRequest.crRefID,
            artID: deliverArtworkRequest.artworkID,
            conditionReport: deliverArtworkRequest.conditionReport,
            crHash: deliverArtworkRequest.crHash
        };
        await new ConditionReportDb().create(crDB);

        // Generate crArtHandlerRefID
        deliverArtworkRequest.crArtHandlerRefID = "handler-" + generator.generateRandomString();

        // Store condition report offchain for art_handler_name with crArtHandlerRefID
        deliverArtworkRequest.crArtHandlerNameHash = SHA256(deliverArtworkRequest.artHandlerName).toString();
        const handlerDB = {
            crArtHandlerRefID: deliverArtworkRequest.crArtHandlerRefID,
            artID: deliverArtworkRequest.artworkID,
            artHandlerName: deliverArtworkRequest.artHandlerName,
            artHandlerNameHash: deliverArtworkRequest.crArtHandlerNameHash
        }
        await new ArtHandlerDb().create(handlerDB);

        // Now remove data that is only kept off chain
        delete deliverArtworkRequest.conditionReport;
        delete deliverArtworkRequest.artHandlerName;

        try {
            // Now submit txn to composer
            const composerGateway = new ComposerGateway();
            const composerResponse = await composerGateway.deliverArtwork(deliverArtworkRequest, org);

            const allHistorianResponce = await composerGateway.getHistorian( org);
            const historianResponse = await composerGateway.getHistorianByTransactionId(composerResponse.transactionId, org);
            console.log("historianResponse : "+historianResponse); 
            var transactionTypeStrArr = historianResponse.transactionType.split(".");
            
            // Create TransactionDetail on cloudant DB
             const transactionDetailDB = {
                artID: composerResponse.artworkID,
                transactionId: composerResponse.transactionId,
                transactionTimestamp: historianResponse.transactionTimestamp,
                blockNo: allHistorianResponce.length-2,
                transactionType: transactionTypeStrArr[transactionTypeStrArr.length-1],
                user: req.headers.username
            }

            await new TransactionDetailDb().create(transactionDetailDB);
            res.status(200).send(composerResponse);
        }
        catch (err) {
            res.status(500).send(err);
        }
    }

    // Call offchain data and composer API to take ownership Action
    public receiveArtwork = async (req, res) => {
        let org = this.setOrg(req.headers);
        
        // Validate body (Need to do)
        let receiveArtwork = req.body;

        // Now retrieve artwork from composer API
        const composerGateway = new ComposerGateway();
        let artworks = await composerGateway.getArtworkByID(receiveArtwork.artworkID, org);

        let artwork;
        if (artworks.length == 0) {
            res.status(400).send("artworkID is invalid, artwork does not exist");
            return;
        }
        else {
            artwork = artworks[0];
        }

        // Communicate with offchain cloudant to switch proposed owner to owner
        const ownershipDoc = await new ArtOwnerDb().findByOwnerRefID(artwork.ownerRefID);
        if (ownershipDoc.proposedOwner != null) {
            ownershipDoc.owner = ownershipDoc.proposedOwner;
            ownershipDoc.ownerHash = SHA256(ownershipDoc.owner).toString();
            ownershipDoc.proposedOwner = null;
        }
        await new ArtOwnerDb().update(ownershipDoc);

        receiveArtwork.ownerHash = ownershipDoc.ownerHash; // Will store new ownerHash on blockchain

        // Now to composer
        const artworkResponse = await composerGateway.receiveArtwork(receiveArtwork, org);

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

export default new TransportationController();
