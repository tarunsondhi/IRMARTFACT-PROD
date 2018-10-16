import { config } from '../config';
import TransportationController from './TransportationController';

export = (app) => {
    const endpoint = config.API_BASE;

    app.get(endpoint + 'TransportationInProgress', TransportationController.transportationInProgress);
    app.get(endpoint + 'TransportationDelivered', TransportationController.transportationCompleted);

    app.post(endpoint + 'TransportationRequest', TransportationController.requestTransportation);
    app.post(endpoint + 'TransportationUpdate', TransportationController.updateTransportation);
    app.post(endpoint + 'DeliverArtwork', TransportationController.deliverArtwork);
    app.post(endpoint + 'ReceiveArtwork', TransportationController.receiveArtwork);
};