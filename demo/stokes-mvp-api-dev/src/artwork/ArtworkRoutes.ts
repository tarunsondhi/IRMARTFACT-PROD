import { config } from '../config';
import ArtworkController from './ArtworkController';

export = (app) => {
    const endpoint = config.API_BASE;

    // GET requests
    app.get(endpoint + 'artwork', ArtworkController.getArtwork);
    app.get(endpoint + 'artwork/:artworkID', ArtworkController.getArtworkByID);
    app.get(endpoint + 'FindArtwork', ArtworkController.findArtwork);
    app.get(endpoint + 'Image/:imageRefID', ArtworkController.getImage);
    app.get(endpoint + 'OwnershipRequest', ArtworkController.getArtworkOwnershipRequest);
    app.get(endpoint + 'OwnershipAccepted', ArtworkController.getArtworkOwnershipAccepted);
   
    app.get(endpoint + 'ArtRepDashboard', ArtworkController.getArtRepDashboard);
    app.get(endpoint + 'ManagerDashboard', ArtworkController.getManagerDashboard);
    app.get(endpoint + 'HandlerDashboard', ArtworkController.getHandlerDashboard);
    
    app.get(endpoint + 'transactions/:artworkID', ArtworkController.getTransactionsByArtID);
    // POST requests
    app.post(endpoint + 'artwork', ArtworkController.createArtwork);
    app.post(endpoint + 'OwnershipRequest', ArtworkController.requestOwnership);
    app.post(endpoint + 'OwnershipAction', ArtworkController.ownershipAction);

    app.post(endpoint + 'OffChainData', ArtworkController.getOffChainData);
    app.post(endpoint + 'downloadArtwork', ArtworkController.downloadArtwork);
};