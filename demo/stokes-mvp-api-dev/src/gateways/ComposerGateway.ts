import axios from 'axios';
import { config } from '../config';
import { logger } from '../config/logger';

export class ComposerGateway {

    /************************************************************** 
     * General Artwork + Ownership Composer Calls
    ***************************************************************/

    // Calls composer REST API CreateArtwork endpoint
    public async createArtwork(payload, port): Promise<any> {
        logger.info('CreateArtwork Invoked');
        var response = {};
        try{
            response = await axios.post(`${config.COMPOSER_ADDRESS}:${config.COMPOSER_PORT}/api/CreateArtwork`, payload)
            return response.data;
        }catch(err){
            logger.info('ComposerGateway - createArtwork - Error: ',err);
            return response;
        }
        
        
    }

    // Calls composer REST API getAllArtwork endpoint
    public async getAllArtwork(port): Promise<any> {
        const response = await axios.get(`${config.COMPOSER_ADDRESS}:${config.COMPOSER_PORT}/api/queries/getAllArtwork`);
        return response.data;
    }

    // Calls composer REST API getArtworkByID endpoint
    public async getArtworkByID(id, port): Promise<any> {
        const response = await axios.get(`${config.COMPOSER_ADDRESS}:${config.COMPOSER_PORT}/api/queries/getArtworkByID?artworkID=` + id);
        return response.data;
    }
        
    // Calls composer REST API crossCheckConditionReport endpoint
    public async getArtworkWithOwnershipRequest(port): Promise<any> {
        const response = await axios.get(`${config.COMPOSER_ADDRESS}:${config.COMPOSER_PORT}/api/queries/getArtworkWithOwnershipRequest`);
        return response.data;
    }    
    
    // Calls composer REST API crossCheckConditionReport endpoint
    public async getArtworkWithOwnershipArtist(port): Promise<any> {
        const response = await axios.get(`${config.COMPOSER_ADDRESS}:${config.COMPOSER_PORT}/api/queries/getArtworkWithOwnershipArtist`);
        return response.data;
    }

    // Calls composer REST API crossCheckConditionReport endpoint
    public async getArtworkWithOwnershipTransferred(port): Promise<any> {
        const response = await axios.get(`${config.COMPOSER_ADDRESS}:${config.COMPOSER_PORT}/api/queries/getArtworkWithOwnershipTransferred`);
        return response.data;
    }

    public async requestOwnership(payload, port): Promise<any> {
        const response = await axios.post(`${config.COMPOSER_ADDRESS}:${config.COMPOSER_PORT}/api/RequestOwnership`, payload);
        return response.data;
    }

    public async ownershipAction(payload, port): Promise<any> {
        const response = await axios.post(`${config.COMPOSER_ADDRESS}:${config.COMPOSER_PORT}/api/ActionOnOwnershipRequest`, payload);
        return response.data;
    }

    // These next three calls are for the Artwork/find endpoint
    // Note that composer cannot have optional fields in queries, so must make all combinations

    // Calls composer REST API findArtworkByTitle endpoint
    public async findArtworkByTitle(title, port): Promise<any> {
        const response = await axios.get(`${config.COMPOSER_ADDRESS}:${config.COMPOSER_PORT}/api/queries/findArtworkByTitle?title=` + title);
        return response.data;
    }

    // Calls composer REST API getArtworkByID endpoint
    public async findArtworkByYear(year, port): Promise<any> {
        const response = await axios.get(`${config.COMPOSER_ADDRESS}:${config.COMPOSER_PORT}/api/queries/findArtworkByYear?year=` + year);
        return response.data;
    }
    // Calls composer REST API findArtworkByYearTitle endpoint
    public async findArtworkByYearTitle(year, title, port): Promise<any> {
        const response = await axios.get(`${config.COMPOSER_ADDRESS}:${config.COMPOSER_PORT}/api/queries/findArtworkByYearTitle?year=${year}&title=${title}`);
        return response.data;
    }

    /************************************************************** 
     * Condition Report API calls
    ***************************************************************/

    // Calls composer REST API getArtworkWithCRRequest endpoint
    public async getArtworkWithCRRequest(port): Promise<any> {
        const response = await axios.get(`${config.COMPOSER_ADDRESS}:${config.COMPOSER_PORT}/api/queries/getArtworkWithCRRequest`);
        return response.data;
    }

    // Calls composer REST API requestConditionReport endpoint
    public async requestConditionReport(payload, port): Promise<any> {
        const response = await axios.post(`${config.COMPOSER_ADDRESS}:${config.COMPOSER_PORT}/api/RequestConditionReport`, payload);
        return response.data;
    }
    
    // Calls composer REST API submitConditionReport endpoint
    public async submitConditionReport(payload, port): Promise<any> {
        const response = await axios.post(`${config.COMPOSER_ADDRESS}:${config.COMPOSER_PORT}/api/SubmitConditionReport`, payload);
        return response.data;
    }

    // Calls composer REST API crossCheckConditionReport endpoint
    public async crossCheckConditionReport(payload, port): Promise<any> {
        const response = await axios.post(`${config.COMPOSER_ADDRESS}:${config.COMPOSER_PORT}/api/CrossCheckConditionReport`, payload);
        return response.data;
    }

    /************************************************************** 
     * Transportation API calls
    ***************************************************************/

    // Calls composer REST API requestTransportation endpoint
    public async requestTransportation(payload, port): Promise<any> {
        const response = await axios.post(`${config.COMPOSER_ADDRESS}:${config.COMPOSER_PORT}/api/RequestTransportation`, payload);
        return response.data;
    }

    // Calls composer REST API updateTransportation endpoint
    public async updateTransportation(payload, port): Promise<any> {
        const response = await axios.post(`${config.COMPOSER_ADDRESS}:${config.COMPOSER_PORT}/api/UpdateTransportation`, payload);
        return response.data;
    }

    // Calls composer REST API deliverArtwork endpoint
    public async deliverArtwork(payload, port): Promise<any> {
        const response = await axios.post(`${config.COMPOSER_ADDRESS}:${config.COMPOSER_PORT}/api/DeliverArtwork`, payload);
        return response.data;
    }

    // Calls composer REST API updateTransportation endpoint
    public async receiveArtwork(payload, port): Promise<any> {
        const response = await axios.post(`${config.COMPOSER_ADDRESS}:${config.COMPOSER_PORT}/api/ReceiveArtwork`, payload);
        return response.data;
    }

    // Calls composer REST API getArtworkWithTransitCompleted endpoint
    public async getArtworkWithTransitCompleted(port): Promise<any> {
        const response = await axios.get(`${config.COMPOSER_ADDRESS}:${config.COMPOSER_PORT}/api/queries/getArtworkWithTransitCompleted`);
        return response.data;
    }

    // Calls composer REST API getArtworkWithTransitInProgress endpoint
    public async getArtworkWithTransitInProgress(port): Promise<any> {
        const response = await axios.get(`${config.COMPOSER_ADDRESS}:${config.COMPOSER_PORT}/api/queries/getArtworkWithTransitInProgress`);
        return response.data;
    }

    // Calls composer REST API getHistorianById endpoint
    public async getHistorianByTransactionId(transactionId, port): Promise<any> {
        const response = await axios.get(`${config.COMPOSER_ADDRESS}:${config.COMPOSER_PORT}/api/system/historian/`+transactionId);
        return response.data;
    }

    // Calls composer REST API getHistorian endpoint
    public async getHistorian(port): Promise<any> {
        const response = await axios.get(`${config.COMPOSER_ADDRESS}:${config.COMPOSER_PORT}/api/system/historian`);
        return response.data;
    }
}