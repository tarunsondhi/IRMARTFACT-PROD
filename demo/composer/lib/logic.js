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

/* global getFactory getAssetRegistry getParticipantRegistry emit */

/**
 * Create Artwork asset
 * @param {com.stokes.network.CreateArtwork} createArtwork - the CreateArtwork transaction
 * @transaction
 */
async function createArtwork(artwork) { // eslint-disable-line no-unused-vars
    let factory = getFactory();
    const namespace = 'com.stokes.network';

    // Create artwork and relationship to studio
    const newArtwork = factory.newResource(namespace, 'Artwork', artwork.artworkID);
    newArtwork.creator = factory.newRelationship(namespace, 'ArtStudio', artwork.creator.getIdentifier());

    // These are the fields we will add to the newArtwork
    const addFields = ["artistRefID", "title", "year", "dimensions", "medium", "weight", "imageRefID",
        "noOfPieces", "edition", "artistNameHash", "imageHash", "assetID"];
    for (let field of addFields) {
        newArtwork[field] = artwork[field];
    }
    newArtwork.ownershipStatus = "ARTIST";

    newArtwork.changedByUser = "USER";
    newArtwork.changedByOrg = "ORG"
    newArtwork.changedByDateTime = artwork.timestamp;
    newArtwork.artworkEvents = [];

    let artworkEvent = factory.newConcept(namespace, 'ArtworkEvent');
    artworkEvent.description = `Artwork Identity Created`;
    artworkEvent.timestamp = artwork.timestamp;
    newArtwork.artworkEvents.push(artworkEvent);

    // Save the new artwork
    let assetRegistry = await getAssetRegistry(newArtwork.getFullyQualifiedType());
    await assetRegistry.add(newArtwork);
}

/**
 * Request CR asset
 * @param {com.stokes.network.RequestConditionReport} requestConditionReport - the Request CR transaction
 * @transaction
 */
async function requestConditionReport(request) { // eslint-disable-line no-unused-vars
    const factory = getFactory();
    const namespace = 'com.stokes.network';

    const assetRegistry = await getAssetRegistry(namespace + '.Artwork');
    const artwork = await assetRegistry.get(request.artworkID);

    let cr;
    if (!artwork.hasOwnProperty("conditionReport")) {
        cr = factory.newConcept(namespace, 'ConditionReport');
    }
    else {
        cr = artwork.conditionReport;
    }

    cr.crReasonCode = "POTENTIAL_BUY";
    cr.crStatus = "REQUEST";
    cr.crStatusTimestamp = request.timestamp;

    artwork.conditionReport = cr;

    artwork.changedByUser = "USER";
    artwork.changedByOrg = "ORG"
    artwork.changedByDateTime = request.timestamp;

    let artworkEvent = factory.newConcept(namespace, 'ArtworkEvent');
    artworkEvent.description = `Condition Report Requested`;
    artworkEvent.timestamp = request.timestamp;
    artwork.artworkEvents.push(artworkEvent);

    // Save the new artwork
    await assetRegistry.update(artwork);
}

/**
 * Submit CR asset
 * @param {com.stokes.network.SubmitConditionReport} submitConditionReport - the Submit CR transaction
 * @transaction
 */
async function submitConditionReport(request) { // eslint-disable-line no-unused-vars
    const factory = getFactory();
    const namespace = 'com.stokes.network';

    const assetRegistry = await getAssetRegistry(namespace + '.Artwork');
    const artwork = await assetRegistry.get(request.artworkID);

    let cr;
    if (!artwork.hasOwnProperty("conditionReport")) {
        throw new Error("Must have initialized condition report");
    }
    else if (artwork.conditionReport.crStatus != "REQUEST") {
        throw new Error("Must have crStatus REQUEST");
    }
    else {
        cr = artwork.conditionReport;
    }

    cr.crRefID = request.crRefID;
    cr.crArtHandlerRefID = request.crArtHandlerRefID;
    cr.crArtHandlerCertCred = request.crArtHandlerCertCred;
    cr.crHash = request.crHash;
    cr.crArtHandlerNameHash = request.crArtHandlerNameHash;
    cr.crReasonCode = "BEFORE_LOAD";
    cr.crStatus = "SUBMITTED";
    cr.crStatusTimestamp = request.timestamp;

    artwork.conditionReport = cr;

    artwork.changedByUser = "USER";
    artwork.changedByOrg = "ORG"
    artwork.changedByDateTime = request.timestamp;

    let artworkEvent = factory.newConcept(namespace, 'ArtworkEvent');
    artworkEvent.description = `Condition Report Submitted`;
    artworkEvent.timestamp = request.timestamp;
    artwork.artworkEvents.push(artworkEvent);

    // Save the new artwork
    await assetRegistry.update(artwork);
}

/**
 * Cross Check
 * @param {com.stokes.network.CrossCheckConditionReport} crossCheckConditionReport - the Cross Check transaction
 * @transaction
 */
async function crossCheckConditionReport(check) { // eslint-disable-line no-unused-vars
    const factory = getFactory();
    const namespace = 'com.stokes.network';

    const assetRegistry = await getAssetRegistry(namespace + '.Artwork');
    const artwork = await assetRegistry.get(check.artworkID);

    let cr;
    if (!artwork.hasOwnProperty("conditionReport")) {
        throw new Error("Must have initialized condition report");
    }
    else if (artwork.conditionReport.crStatus != "SUBMITTED") {
        throw new Error("Must have crStatus SUBMITTED");
    }
    else {
        cr = artwork.conditionReport;
    }

    cr.crArtHandlerRefID = check.crReviewArtHandlerRefID;
    cr.crArtHandlerCertCred = check.crReviewArtHandlerCertCred;
    cr.crStatus = "REVIEWED";
    cr.crStatusTimestamp = check.timestamp;

    artwork.conditionReport = cr;

    artwork.changedByUser = "USER";
    artwork.changedByOrg = "ORG"
    artwork.changedByDateTime = request.timestamp;

    let artworkEvent = factory.newConcept(namespace, 'ArtworkEvent');
    artworkEvent.description = `Cross Check Report Submitted`;
    artworkEvent.timestamp = check.timestamp;
    artwork.artworkEvents.push(artworkEvent);

    // Save the new artwork
    await assetRegistry.update(artwork);
}

/**
 * Request Ownership
 * @param {com.stokes.network.RequestOwnership} requestOwnership - the Request Ownership txn
 * @transaction
 */
async function requestOwnership(request) { // eslint-disable-line no-unused-vars
    const factory = getFactory();
    const namespace = 'com.stokes.network';

    const assetRegistry = await getAssetRegistry(namespace + '.Artwork');
    const artwork = await assetRegistry.get(request.artworkID);

    artwork.ownerRefID = request.ownerRefID
    artwork.ownershipStatus = "REQUEST"
    artwork.ownershipStatusTimestamp = request.timestamp;

    artwork.changedByUser = "USER";
    artwork.changedByOrg = "ORG"
    artwork.changedByDateTime = request.timestamp;

    let artworkEvent = factory.newConcept(namespace, 'ArtworkEvent');
    artworkEvent.description = `Custody Request Submitted`;
    artworkEvent.timestamp = request.timestamp;
    artwork.artworkEvents.push(artworkEvent);

    // Save the new artwork
    await assetRegistry.update(artwork);
}

/**
 * Take action on transaction
 * @param {com.stokes.network.ActionOnOwnershipRequest} actionOnOwnershipRequest - the the Action txn
 * @transaction
 */
async function actionOnOwnershipRequest(request) { // eslint-disable-line no-unused-vars
    const factory = getFactory();
    const namespace = 'com.stokes.network';

    const assetRegistry = await getAssetRegistry(namespace + '.Artwork');
    const artwork = await assetRegistry.get(request.artworkID);

    artwork.ownershipStatus = request.action
    artwork.ownershipStatusTimestamp = request.timestamp;

    artwork.changedByUser = "USER";
    artwork.changedByOrg = "ORG"
    artwork.changedByDateTime = request.timestamp;

    // For renaming of statuses
    let eventMap = {
        "ACCEPTED": "Accepted",
        "DECLINED": "Declined"
    }

    let artworkEvent = factory.newConcept(namespace, 'ArtworkEvent');
    artworkEvent.description = `Custody Request ${eventMap[request.action]}`;
    artworkEvent.timestamp = request.timestamp;
    artwork.artworkEvents.push(artworkEvent);

    // Save the new artwork
    await assetRegistry.update(artwork);
}

/**
 * Take action on transaction
 * @param {com.stokes.network.RequestTransportation} requestTransportation - the the Action txn
 * @transaction
 */
async function requestTransportation(request) { // eslint-disable-line no-unused-vars
    const factory = getFactory();
    const namespace = 'com.stokes.network';

    const assetRegistry = await getAssetRegistry(namespace + '.Artwork');
    const artwork = await assetRegistry.get(request.artworkID);

    artwork.transportationStatus = "REQUEST";
    artwork.transportationStatusTimestamp = request.timestamp;

    artwork.changedByUser = "USER";
    artwork.changedByOrg = "ORG"
    artwork.changedByDateTime = request.timestamp;

    let artworkEvent = factory.newConcept(namespace, 'ArtworkEvent');
    artworkEvent.description = `Transportation Request Submitted`;
    artworkEvent.timestamp = request.timestamp;
    artwork.artworkEvents.push(artworkEvent);

    // Save the new artwork
    await assetRegistry.update(artwork);
}

/**
 * Take action on transaction
 * @param {com.stokes.network.UpdateTransportation} updateTransportation - the the Action txn
 * @transaction
 */
async function updateTransportation(update) { // eslint-disable-line no-unused-vars
    const factory = getFactory();
    const namespace = 'com.stokes.network';

    const assetRegistry = await getAssetRegistry(namespace + '.Artwork');
    const artwork = await assetRegistry.get(update.artworkID);

    const updateFields = ["currentLocation", "destLocation", "transportationStatus"];
    for (field of updateFields) {
        if (update.hasOwnProperty(field)) {
            artwork[field] = update[field];
        }
    }
    artwork.transportationStatusTimestamp = update.timestamp;

    artwork.changedByUser = "USER";
    artwork.changedByOrg = "ORG"
    artwork.changedByDateTime = update.timestamp;

    let eventMap = {
        "LOADED": "Loaded",
        "UNLOADED": "Unloaded",
        "IN_TRANSIT": "In Transit"
    }

    let artworkEvent = factory.newConcept(namespace, 'ArtworkEvent');
    artworkEvent.description = `Transportation Updated: ${eventMap[update.transportationStatus]}`;
    artworkEvent.timestamp = update.timestamp;
    artwork.artworkEvents.push(artworkEvent);

    // Save the new artwork
    await assetRegistry.update(artwork);
}

/**
 * Take action on transaction
 * @param {com.stokes.network.DeliverArtwork} deliverArtwork - the the Action txn
 * @transaction
 */
async function deliverArtwork(deliver) { // eslint-disable-line no-unused-vars
    const factory = getFactory();
    const namespace = 'com.stokes.network';

    const assetRegistry = await getAssetRegistry(namespace + '.Artwork');
    const artwork = await assetRegistry.get(deliver.artworkID);

    artwork.transportationStatus = "DELIVERED"
    artwork.transportationStatusTimestamp = deliver.timestamp;

    let cr;
    if (!artwork.hasOwnProperty("conditionReport")) {
        cr = factory.newConcept(namespace, 'ConditionReport');
    }
    else {
        cr = artwork.conditionReport;
    }

    cr.crRefID = deliver.crRefID;
    cr.crArtHandlerRefID = deliver.crArtHandlerRefID;
    cr.crArtHandlerCertCred = deliver.crArtHandlerCertCred;
    cr.crHash = deliver.crHash;
    cr.crArtHandlerNameHash = deliver.crArtHandlerNameHash;
    cr.crReasonCode = "AFTER_UNLOAD";
    cr.crStatus = "SUBMITTED";
    cr.crStatusTimestamp = deliver.timestamp;

    artwork.conditionReport = cr;

    artwork.changedByUser = "USER";
    artwork.changedByOrg = "ORG";
    artwork.changedByDateTime = deliver.timestamp;

    // Update as two events, cr submission and delivery
    let artworkEvent1 = factory.newConcept(namespace, 'ArtworkEvent');
    artworkEvent1.description = `Delivery Condition Report Uploaded`;
    artworkEvent1.timestamp = deliver.timestamp;
    artwork.artworkEvents.push(artworkEvent1);

    let artworkEvent2 = factory.newConcept(namespace, 'ArtworkEvent');
    artworkEvent2.description = `Transportation Updated: Delivered`;
    artworkEvent2.timestamp = deliver.timestamp;
    artwork.artworkEvents.push(artworkEvent2);

    // Save the new artwork
    await assetRegistry.update(artwork);
}

/**
 * Take receive artwork
 * @param {com.stokes.network.ReceiveArtwork} receiveArtwork - the the Receive txn
 * @transaction
 */
async function receiveArtwork(receive) { // eslint-disable-line no-unused-vars
    const factory = getFactory();
    const namespace = 'com.stokes.network';

    const assetRegistry = await getAssetRegistry(namespace + '.Artwork');
    const artwork = await assetRegistry.get(receive.artworkID);

    artwork.ownershipStatus = "TRANSFERRED";
    artwork.ownerHash = receive.ownerHash;
    artwork.ownershipStatusTimestamp = receive.timestamp;

    artwork.changedByUser = "USER";
    artwork.changedByOrg = "ORG";
    artwork.changedByDateTime = receive.timestamp;

    // Emit an artwork event
    let artworkEvent = factory.newConcept(namespace, 'ArtworkEvent');
    artworkEvent.description = `Artwork Received`;
    artworkEvent.timestamp = receive.timestamp;
    artwork.artworkEvents.push(artworkEvent);

    // Udpdate the artwork
    await assetRegistry.update(artwork);
}

/**
 * Create Demo Participants
 * @param {com.stokes.network.CreateDemoParticipants} createDemoParticipants - the create Demo Participants transaction
 * @transaction
 */
async function createDemoParticipants(createDemo) { // eslint-disable-line no-unused-vars
    const factory = getFactory();
    const namespace = 'com.stokes.network';

    // create the Art Handlers
    const handlerRegistery = await getParticipantRegistry(namespace + '.ArtHandler');
    const handler = factory.newResource(namespace, 'ArtHandler', '1001');
    handler.name = 'Handler 1';
    await handlerRegistery.add(handler);

    const handler2 = factory.newResource(namespace, 'ArtHandler', '2002');
    handler2.name = 'Handler 2';
    await handlerRegistery.add(handler2);

    // create the Art Studios
    const studioRegistery = await getParticipantRegistry(namespace + '.ArtStudio');
    const studio = factory.newResource(namespace, 'ArtStudio', '1001');
    studio.name = 'Art Studio 1';
    await studioRegistery.add(studio);

    // create the Collection Mangers
    const collectorRegistery = await getParticipantRegistry(namespace + '.Collector');
    const collector = factory.newResource(namespace, 'Collector', '1001');
    collector.name = 'Collector 1';
    await collectorRegistery.add(collector);

    // create the Collectors
    const managerRegistery = await getParticipantRegistry(namespace + '.CollectionManager');
    const manager = factory.newResource(namespace, 'CollectionManager', '1001');
    manager.name = 'Collection Manager 1';
    await managerRegistery.add(manager);
}
