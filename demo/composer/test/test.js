/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const AdminConnection = require('composer-admin').AdminConnection;
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const { BusinessNetworkDefinition, CertificateUtil, IdCard } = require('composer-common');
const path = require('path');

const chai = require('chai');
chai.should();
chai.use(require('chai-as-promised'));

const namespace = 'com.stokes.network';

describe('Project Stokes Crozier Artwork Network', () => {
    const cardStore = require('composer-common').NetworkCardStoreManager.getCardStore({ type: 'composer-wallet-inmemory' });
    let adminConnection;
    let businessNetworkConnection;
    let factory;

    let artStudio1;
    let artStudio1Relationship;
    let artwork;
    let artworkRegistry;

    before(async () => {
        // Embedded connection used for local testing
        const connectionProfile = {
            name: 'embedded',
            'x-type': 'embedded'
        };
        // Generate certificates for use with the embedded connection
        const credentials = CertificateUtil.generate({ commonName: 'admin' });

        // PeerAdmin identity used with the admin connection to deploy business networks
        const deployerMetadata = {
            version: 1,
            userName: 'PeerAdmin',
            roles: ['PeerAdmin', 'ChannelAdmin']
        };

        const deployerCard = new IdCard(deployerMetadata, connectionProfile);
        deployerCard.setCredentials(credentials);

        const deployerCardName = 'PeerAdmin';
        adminConnection = new AdminConnection({ cardStore: cardStore });

        await adminConnection.importCard(deployerCardName, deployerCard);
        await adminConnection.connect(deployerCardName);
    });

    beforeEach(async () => {
        businessNetworkConnection = new BusinessNetworkConnection({ cardStore: cardStore });

        const adminUserName = 'admin';
        let adminCardName;
        const businessNetworkDefinition = await BusinessNetworkDefinition.fromDirectory(path.resolve(__dirname, '..'));

        // Install the Composer runtime for the new business network
        await adminConnection.install(businessNetworkDefinition);

        // Start the business network and configure a network admin identity
        const startOptions = {
            networkAdmins: [
                {
                    userName: adminUserName,
                    enrollmentSecret: 'adminpw'
                }
            ]
        };
        const adminCards = await adminConnection.start(businessNetworkDefinition.getName(), businessNetworkDefinition.getVersion(), startOptions);

        // Import the network admin identity for us to use
        adminCardName = `${adminUserName}@${businessNetworkDefinition.getName()}`;

        await adminConnection.importCard(adminCardName, adminCards.get(adminUserName));

        // Connect to the business network using the network admin identity
        await businessNetworkConnection.connect(adminCardName);

        factory = businessNetworkConnection.getBusinessNetwork().getFactory();

        // create bank participants
        artStudio1 = factory.newResource(namespace, 'ArtStudio', 'as1');
        artStudio1.name = 'Art Studio Uno';

        const studioRegistry = await businessNetworkConnection.getParticipantRegistry(namespace + '.ArtStudio');
        await studioRegistry.add(artStudio1);

        artStudio1Relationship = factory.newRelationship(namespace, 'ArtStudio', artStudio1.getIdentifier());

        const artwork = factory.newResource(namespace, 'Artwork', "1000100010");
        artwork.assetID = '1';
        artwork.artistRefID = 'artist-1';
        artwork.title = "Beautiful Art";
        artwork.year = "2017";
        artwork.dimensions = "3M by 3M by 50cm";
        artwork.medium = "Oil on Canvas";
        artwork.weight = "20lbs";
        artwork.imageRefID = "image-1000";
        artwork.noOfPieces = 1;
        artwork.edition = "v1";
        artwork.creator = artStudio1Relationship;
        artwork.artistNameHash = "Hash";
        artwork.imageHash = "Hash";
        artwork.artworkEvents = [];

        const artwork2 = factory.newResource(namespace, 'Artwork', "1000100011");
        artwork.assetID = '1';
        artwork2.artistRefID = 'artist-2';
        artwork2.title = "Groovy Art";
        artwork2.year = "2016";
        artwork2.dimensions = "4M by 1M by 25cm";
        artwork2.medium = "Oil on Canvas";
        artwork2.weight = "10lbs";
        artwork2.imageRefID = "image-1001";
        artwork2.noOfPieces = 1;
        artwork2.edition = "v1";
        artwork2.creator = artStudio1Relationship;
        artwork2.artistNameHash = "Hash";
        artwork2.imageHash = "Hash";
        artwork2.artworkEvents = [];

        artworkRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.Artwork');
        await artworkRegistry.add(artwork);
        await artworkRegistry.add(artwork2);
    });

    describe('CreateArtwork Transaction', () => {
        it('should be able to create artwork', async () => {
            // create and submit the CreateArtwork transaction
            const createArtworkTx = factory.newTransaction(namespace, 'CreateArtwork');
            createArtworkTx.artworkID = '9999999999';
            createArtworkTx.assetID = '1';
            createArtworkTx.artistRefID = 'artist-1';
            createArtworkTx.title = "Pretty Art";
            createArtworkTx.year = "2018";
            createArtworkTx.dimensions = "3M by 2M by 50cm";
            createArtworkTx.medium = "Oil on Canvas";
            createArtworkTx.weight = "30lbs";
            createArtworkTx.imageRefID = "image-1001";
            createArtworkTx.noOfPieces = 1;
            createArtworkTx.edition = "v1";
            createArtworkTx.creator = artStudio1Relationship;
            createArtworkTx.artistNameHash = "Hash";
            createArtworkTx.imageHash = "Hash";

            await businessNetworkConnection.submitTransaction(createArtworkTx);

            const artworkRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.Artwork');
            const artwork = await artworkRegistry.get('9999999999');

            artwork.artworkID.should.deep.equal('9999999999');
            artwork.artistRefID.should.deep.equal('artist-1');
            artwork.title.should.deep.equal('Pretty Art');
            artwork.year.should.deep.equal('2018');
            artwork.noOfPieces.should.deep.equal(1);
            artwork.ownershipStatus.should.deep.equal("ARTIST");
        });
    });

    describe('getAllArtwork Query', () => {
        it('should be able query for all artwork', async () => {
            const queryAssets = await businessNetworkConnection.query("getAllArtwork");

            // Initially only 2 artwork assets in the system
            queryAssets.length.should.equal(2);
        });
    });

    describe('getArtworkByID Query', () => {
        it('should be able query artwork with specific Id', async () => {
            const queryAssets = await businessNetworkConnection.query("getArtworkByID", { artworkID: '1000100010' });

            queryAssets.length.should.equal(1);
            queryAssets[0].title.should.equal("Beautiful Art");
        });
    });

    describe('findArtwork Query', () => {
        it('should be able filter artwork by year', async () => {
            const queryAssets = await businessNetworkConnection.query("findArtworkByYear", { year: '2016' });

            queryAssets[0].artworkID.should.equal("1000100011");
        });
    });

    describe('findArtworkByTitle Query', () => {
        it('should be able filter artwork by title', async () => {
            const queryAssets = await businessNetworkConnection.query("findArtworkByTitle", { title: 'Groovy Art' });

            queryAssets[0].artworkID.should.equal("1000100011");
        });
    });

    describe('findArtworkByYearTitle Query', () => {
        it('should be able filter artwork by year and title', async () => {
            const queryAssets = await businessNetworkConnection.query("findArtworkByYearTitle", { title: 'Groovy Art', year: '2016' });

            queryAssets[0].artworkID.should.equal("1000100011");
        });
    });

    describe('RequestConditionReport Transaction', () => {
        it('should create a condition report for given Artwork', async () => {
            const requestCRTx = factory.newTransaction(namespace, 'RequestConditionReport');
            requestCRTx.artworkID = '1000100011';
            await businessNetworkConnection.submitTransaction(requestCRTx);

            const artworkRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.Artwork');
            const artwork = await artworkRegistry.get('1000100011');

            artwork.conditionReport.should.deep.not.equal(null);
        });
        it('should have crReasonCode POTENTIAL_BUY and crStatus REQUEST', async () => {
            const requestCRTx = factory.newTransaction(namespace, 'RequestConditionReport');
            requestCRTx.artworkID = '1000100011';
            await businessNetworkConnection.submitTransaction(requestCRTx);

            const artworkRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.Artwork');
            const artwork = await artworkRegistry.get('1000100011');

            artwork.conditionReport.crReasonCode.should.deep.equal('POTENTIAL_BUY');
            artwork.conditionReport.crStatus.should.deep.equal('REQUEST');
        });
    });

    describe('getArtworkWithCRRequest Query', () => {
        it('should retreive only Artwork with crStatus `REQUEST`', async () => {

            // First Request Condition Report
            const requestCRTx = factory.newTransaction(namespace, 'RequestConditionReport');
            requestCRTx.artworkID = '1000100011';
            await businessNetworkConnection.submitTransaction(requestCRTx);

            const queryAssets = await businessNetworkConnection.query("getArtworkWithCRRequest");

            queryAssets.length.should.equal(1);
            for (let artwork of queryAssets) {
                artwork.conditionReport.crStatus.should.deep.equal("REQUEST");
            }
        });
    });

    describe('SubmitConditionReport Transaction', () => {
        it('should have crReasonCode BEFORE_LOAD and crStatus SUBMITTED when txn submitted', async () => {

            // First Request Condition Report
            const requestCRTx = factory.newTransaction(namespace, 'RequestConditionReport');
            requestCRTx.artworkID = '1000100011';
            await businessNetworkConnection.submitTransaction(requestCRTx);

            // Now submit Conition Report
            const submitCRTx = factory.newTransaction(namespace, 'SubmitConditionReport');
            submitCRTx.artworkID = '1000100011';
            submitCRTx.crRefID = '1111';
            submitCRTx.crHash = 'Hash';
            submitCRTx.crArtHandlerRefID = '1111';
            submitCRTx.crArtHandlerNameHash = 'Hash';
            submitCRTx.crArtHandlerCertCred = '1111';

            await businessNetworkConnection.submitTransaction(submitCRTx);

            const artworkRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.Artwork');
            const artwork = await artworkRegistry.get('1000100011');

            artwork.conditionReport.crReasonCode.should.deep.equal('BEFORE_LOAD');
            artwork.conditionReport.crStatus.should.deep.equal('SUBMITTED');
        });
    });

    describe('CrossCheckConditionReport Transaction', () => {
        it('should have crStatus REVIEWED when txn submitted', async () => {

            // First Request Condition Report
            const requestCRTx = factory.newTransaction(namespace, 'RequestConditionReport');
            requestCRTx.artworkID = '1000100011';
            await businessNetworkConnection.submitTransaction(requestCRTx);

            // Then Submit Condition Report
            const submitCRTx = factory.newTransaction(namespace, 'SubmitConditionReport');
            submitCRTx.artworkID = '1000100011';
            submitCRTx.crRefID = '1111';
            submitCRTx.crHash = 'Hash';
            submitCRTx.crArtHandlerRefID = '1111';
            submitCRTx.crArtHandlerNameHash = 'Hash';
            submitCRTx.crArtHandlerCertCred = '1111';
            await businessNetworkConnection.submitTransaction(submitCRTx);


            // Now Cross Check Condition Report
            const crossCRTx = factory.newTransaction(namespace, 'CrossCheckConditionReport');
            crossCRTx.artworkID = '1000100011';
            crossCRTx.crReviewArtHandlerRefID = '2222';
            crossCRTx.crReviewArtHandlerCertCred = '2222';
            crossCRTx.crReviewArtHandlerNameHash = 'Hash';
            await businessNetworkConnection.submitTransaction(crossCRTx);

            const artworkRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.Artwork');
            const artwork = await artworkRegistry.get('1000100011');

            artwork.conditionReport.crStatus.should.deep.equal('REVIEWED');
        });
    });

    describe('CreateDemoParticipants Transaction', () => {
        it('should create two ArtHandlers when txn submitted', async () => {

            const demoParticipantsTx = factory.newTransaction(namespace, 'CreateDemoParticipants');
            await businessNetworkConnection.submitTransaction(demoParticipantsTx);

            const handlerRegistery = await businessNetworkConnection.getParticipantRegistry(namespace + '.ArtHandler');
            const handlers = await handlerRegistery.getAll();

            handlers.length.should.deep.equal(2);
        });
        it('should create one more ArtStudio when txn submitted (2 total)', async () => {

            const demoParticipantsTx = factory.newTransaction(namespace, 'CreateDemoParticipants');
            await businessNetworkConnection.submitTransaction(demoParticipantsTx);

            const studioRegistery = await businessNetworkConnection.getParticipantRegistry(namespace + '.ArtStudio');
            const studios = await studioRegistery.getAll();

            studios.length.should.deep.equal(2);
        });
        it('should create one Collector when txn submitted', async () => {

            const demoParticipantsTx = factory.newTransaction(namespace, 'CreateDemoParticipants');
            await businessNetworkConnection.submitTransaction(demoParticipantsTx);

            const collectorRegistery = await businessNetworkConnection.getParticipantRegistry(namespace + '.Collector');
            const collectors = await collectorRegistery.getAll();

            collectors.length.should.deep.equal(1);
        });
        it('should create one CollectionManager when txn submitted', async () => {

            const demoParticipantsTx = factory.newTransaction(namespace, 'CreateDemoParticipants');
            await businessNetworkConnection.submitTransaction(demoParticipantsTx);

            const managerRegistery = await businessNetworkConnection.getParticipantRegistry(namespace + '.CollectionManager');
            const managers = await managerRegistery.getAll();

            managers.length.should.deep.equal(1);
        });
    });

    describe('RequestOwnership Transaction', () => {
        it('should have ownershipStatus REQUEST when txn completed', async () => {

            // First Submit OwnershipRequest
            const requestOwnershipTx = factory.newTransaction(namespace, 'RequestOwnership');
            requestOwnershipTx.artworkID = '1000100011';
            requestOwnershipTx.ownerRefID = 'owner-1001';
            await businessNetworkConnection.submitTransaction(requestOwnershipTx);

            const artworkRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.Artwork');
            const artwork = await artworkRegistry.get('1000100011');

            artwork.ownershipStatus.should.deep.equal('REQUEST');
        });
        it('should have ownerRefID equal to request ownerRefID', async () => {

            // First Submit OwnershipRequest
            const requestOwnershipTx = factory.newTransaction(namespace, 'RequestOwnership');
            requestOwnershipTx.artworkID = '1000100011';
            requestOwnershipTx.ownerRefID = 'owner-1001';
            await businessNetworkConnection.submitTransaction(requestOwnershipTx);

            const artworkRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.Artwork');
            const artwork = await artworkRegistry.get('1000100011');

            artwork.ownerRefID.should.deep.equal('owner-1001');
        });
    });

    describe('getArtworkWithOwnershipRequest Query', () => {
        it('should have retrieve artwork with ownershipStatus REQUEST', async () => {

            // First Submit OwnershipRequest
            const requestOwnershipTx = factory.newTransaction(namespace, 'RequestOwnership');
            requestOwnershipTx.artworkID = '1000100011';
            requestOwnershipTx.ownerRefID = 'owner-1001';
            await businessNetworkConnection.submitTransaction(requestOwnershipTx);

            // Now query
            const queryAssets = await businessNetworkConnection.query("getArtworkWithOwnershipRequest");

            queryAssets[0].ownershipStatus.should.deep.equal('REQUEST');
        });
    });

    describe('ActionOnOwnershipRequest Transaction', () => {
        // it('should fail if ownershipStatus is not REQUEST', async () => {

        //     // First Submit OwnershipRequest
        //     const requestOwnershipTx = factory.newTransaction(namespace, 'RequestOwnership');
        //     requestOwnershipTx.artworkID = '1000100011';
        //     requestOwnershipTx.ownerRefID = 'owner-1001';
        //     await businessNetworkConnection.submitTransaction(requestOwnershipTx);

        //     // Now query
        //     const artworkRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.Artwork');
        //     const artwork = await artworkRegistry.get('1000100011');

        //     artwork.ownerRefID.should.deep.equal('owner-1001');
        // });
        it('should set artwork ownershipStatus to ACCEPTED if accepted', async () => {

            // First Submit OwnershipRequest
            const requestOwnershipTx = factory.newTransaction(namespace, 'RequestOwnership');
            requestOwnershipTx.artworkID = '1000100011';
            requestOwnershipTx.ownerRefID = 'owner-1001';
            await businessNetworkConnection.submitTransaction(requestOwnershipTx);

            // Then Submit ActionOnOwnershipRequest: ACCEPT
            const actionOwnershipTx = factory.newTransaction(namespace, 'ActionOnOwnershipRequest');
            actionOwnershipTx.artworkID = '1000100011';
            actionOwnershipTx.action = 'ACCEPTED';
            await businessNetworkConnection.submitTransaction(actionOwnershipTx);

            // Now query
            const artworkRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.Artwork');
            const artwork = await artworkRegistry.get('1000100011');

            artwork.ownershipStatus.should.deep.equal('ACCEPTED');
        });
        it('should set artwork ownershipStatus to DECLINED if accepted', async () => {

            // First Submit OwnershipRequest
            const requestOwnershipTx = factory.newTransaction(namespace, 'RequestOwnership');
            requestOwnershipTx.artworkID = '1000100011';
            requestOwnershipTx.ownerRefID = 'owner-1001';
            await businessNetworkConnection.submitTransaction(requestOwnershipTx);

            // Then Submit ActionOnOwnershipRequest: DECLINED
            const actionOwnershipTx = factory.newTransaction(namespace, 'ActionOnOwnershipRequest');
            actionOwnershipTx.artworkID = '1000100011';
            actionOwnershipTx.action = 'DECLINED';
            await businessNetworkConnection.submitTransaction(actionOwnershipTx);

            // Now query
            const artworkRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.Artwork');
            const artwork = await artworkRegistry.get('1000100011');

            artwork.ownershipStatus.should.deep.equal('DECLINED');
        });
    });

    describe('getArtworkWithOwnershipAccepted Query', () => {
        it('should have retrieve artwork with ownershipStatus ACCEPTED and DELIVERED', async () => {

            // First Submit OwnershipRequest
            const requestOwnershipTx = factory.newTransaction(namespace, 'RequestOwnership');
            requestOwnershipTx.artworkID = '1000100011';
            requestOwnershipTx.ownerRefID = 'owner-1001';
            await businessNetworkConnection.submitTransaction(requestOwnershipTx);

            // Then Submit ActionOnOwnershipRequest: ACCEPT
            const actionOwnershipTx = factory.newTransaction(namespace, 'ActionOnOwnershipRequest');
            actionOwnershipTx.artworkID = '1000100011';
            actionOwnershipTx.action = 'ACCEPTED';
            await businessNetworkConnection.submitTransaction(actionOwnershipTx);

            const receiveArtworkTxn = factory.newTransaction(namespace, 'ReceiveArtwork');
            receiveArtworkTxn.artworkID = '1000100011';
            receiveArtworkTxn.ownerHash = 'HASH';
            await businessNetworkConnection.submitTransaction(receiveArtworkTxn);

            // Now query
            const queryAssets = await businessNetworkConnection.query("getArtworkWithOwnershipTransferred");

            queryAssets[0].ownershipStatus.should.deep.equal('TRANSFERRED');
        });
    });

    describe('requestTransportation Transaction', () => {
        it('should have transportationStatus REQUEST when txn completed', async () => {

            // First Submit OwnershipRequest
            const requestTransportationTxn = factory.newTransaction(namespace, 'RequestTransportation');
            requestTransportationTxn.artworkID = '1000100011';
            await businessNetworkConnection.submitTransaction(requestTransportationTxn);

            const artworkRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.Artwork');
            const artwork = await artworkRegistry.get('1000100011');

            artwork.transportationStatus.should.deep.equal('REQUEST');
        });
    });

    describe('UpdateTransportation Transaction', () => {
        it('should have status LOADED when txn completed', async () => {

            // First Submit OwnershipRequest
            const updateTransportationTxn = factory.newTransaction(namespace, 'UpdateTransportation');
            updateTransportationTxn.artworkID = '1000100011';
            updateTransportationTxn.currentLocation = 'Here';
            updateTransportationTxn.destLocation = 'There';
            updateTransportationTxn.transportationStatus = 'LOADED';
            await businessNetworkConnection.submitTransaction(updateTransportationTxn);

            const artworkRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.Artwork');
            const artwork = await artworkRegistry.get('1000100011');

            artwork.transportationStatus.should.deep.equal('LOADED');
            artwork.currentLocation.should.deep.equal('Here');
            artwork.destLocation.should.deep.equal('There');
        });
        it('should have status IN_TRANSIT when txn completed', async () => {

            // First Submit OwnershipRequest
            const updateTransportationTxn = factory.newTransaction(namespace, 'UpdateTransportation');
            updateTransportationTxn.artworkID = '1000100011';
            updateTransportationTxn.transportationStatus = 'IN_TRANSIT';
            await businessNetworkConnection.submitTransaction(updateTransportationTxn);

            const artworkRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.Artwork');
            const artwork = await artworkRegistry.get('1000100011');

            artwork.transportationStatus.should.deep.equal('IN_TRANSIT');
        });
        it('should have status UNLOADED when txn completed', async () => {

            // First Submit OwnershipRequest
            const updateTransportationTxn = factory.newTransaction(namespace, 'UpdateTransportation');
            updateTransportationTxn.artworkID = '1000100011';
            updateTransportationTxn.transportationStatus = 'UNLOADED';
            await businessNetworkConnection.submitTransaction(updateTransportationTxn);

            const artworkRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.Artwork');
            const artwork = await artworkRegistry.get('1000100011');

            artwork.transportationStatus.should.deep.equal('UNLOADED');
            const numEvents = artwork.artworkEvents.length;
            artwork.artworkEvents[numEvents - 1].description.should.deep.equal('Transportation Updated: Unloaded');
        });
    });

    describe('DeliverArtwork Transaction', () => {
        it('should have status Delivered when txn completed', async () => {

            // First Request Condition Report
            const requestCRTx = factory.newTransaction(namespace, 'RequestConditionReport');
            requestCRTx.artworkID = '1000100011';
            await businessNetworkConnection.submitTransaction(requestCRTx);

            // Now submit first Condition Report
            const submitCRTx = factory.newTransaction(namespace, 'SubmitConditionReport');
            submitCRTx.artworkID = '1000100011';
            submitCRTx.crRefID = '1111';
            submitCRTx.crHash = 'Hash';
            submitCRTx.crArtHandlerRefID = '1111';
            submitCRTx.crArtHandlerNameHash = 'Hash';
            submitCRTx.crArtHandlerCertCred = '1111';

            await businessNetworkConnection.submitTransaction(submitCRTx);

            // Now Update transportation to Unloaded
            const updateTransportationTxn = factory.newTransaction(namespace, 'UpdateTransportation');
            updateTransportationTxn.artworkID = '1000100011';
            updateTransportationTxn.currentLocation = 'Here';
            updateTransportationTxn.destLocation = 'There';
            updateTransportationTxn.transportationStatus = 'UNLOADED';
            await businessNetworkConnection.submitTransaction(updateTransportationTxn);

            // Finally submit DeliverArtwork TXN
            const deliverArtworkTxn = factory.newTransaction(namespace, 'DeliverArtwork');
            deliverArtworkTxn.artworkID = '1000100011';
            deliverArtworkTxn.crRefID = '1112';
            deliverArtworkTxn.crHash = 'Hash2';
            deliverArtworkTxn.crArtHandlerRefID = '1112';
            deliverArtworkTxn.crArtHandlerNameHash = 'Hash2';
            deliverArtworkTxn.crArtHandlerCertCred = '1112';
            await businessNetworkConnection.submitTransaction(deliverArtworkTxn);

            const artworkRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.Artwork');
            const artwork = await artworkRegistry.get('1000100011');

            artwork.transportationStatus.should.deep.equal('DELIVERED');
        });
        it('should have new condition report when txn completed', async () => {

            // First Request Condition Report
            const requestCRTx = factory.newTransaction(namespace, 'RequestConditionReport');
            requestCRTx.artworkID = '1000100011';
            await businessNetworkConnection.submitTransaction(requestCRTx);

            // Now submit first Condition Report
            const submitCRTx = factory.newTransaction(namespace, 'SubmitConditionReport');
            submitCRTx.artworkID = '1000100011';
            submitCRTx.crRefID = '1111';
            submitCRTx.crHash = 'Hash';
            submitCRTx.crArtHandlerRefID = '1111';
            submitCRTx.crArtHandlerNameHash = 'Hash';
            submitCRTx.crArtHandlerCertCred = '1111';

            await businessNetworkConnection.submitTransaction(submitCRTx);

            // Now Update transportation to Unloaded
            const updateTransportationTxn = factory.newTransaction(namespace, 'UpdateTransportation');
            updateTransportationTxn.artworkID = '1000100011';
            updateTransportationTxn.currentLocation = 'Here';
            updateTransportationTxn.destLocation = 'There';
            updateTransportationTxn.transportationStatus = 'UNLOADED';
            await businessNetworkConnection.submitTransaction(updateTransportationTxn);

            // Finally submit DeliverArtwork TXN
            const deliverArtworkTxn = factory.newTransaction(namespace, 'DeliverArtwork');
            deliverArtworkTxn.artworkID = '1000100011';
            deliverArtworkTxn.crRefID = '1112';
            deliverArtworkTxn.crHash = 'Hash2';
            deliverArtworkTxn.crArtHandlerRefID = '1112';
            deliverArtworkTxn.crArtHandlerNameHash = 'Hash2';
            deliverArtworkTxn.crArtHandlerCertCred = '1112';
            await businessNetworkConnection.submitTransaction(deliverArtworkTxn);

            const artworkRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.Artwork');
            const artwork = await artworkRegistry.get('1000100011');

            artwork.conditionReport.crRefID.should.deep.equal('1112');
            artwork.conditionReport.crHash.should.deep.equal('Hash2');
        });
    });

    describe('ReceiveArtwork Transaction', () => {
        it('should have ownershipStatus TRANSFERRED when txn completed', async () => {

            // First Submit OwnershipRequest
            const receiveArtworkTxn = factory.newTransaction(namespace, 'ReceiveArtwork');
            receiveArtworkTxn.artworkID = '1000100011';
            receiveArtworkTxn.ownerHash = 'HASH';
            await businessNetworkConnection.submitTransaction(receiveArtworkTxn);

            const artworkRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.Artwork');
            const artwork = await artworkRegistry.get('1000100011');

            artwork.ownershipStatus.should.deep.equal('TRANSFERRED');
        });
    });
});
