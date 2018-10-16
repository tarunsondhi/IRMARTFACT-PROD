import { config } from '../config';
import ConditionReportController from './ConditionReportController';

export = (app) => {
    const endpoint = config.API_BASE;

    // GET requests
    app.get(endpoint + 'ConditionReportRequest', ConditionReportController.getArtworkWithCRRequest);
    app.get(endpoint + 'ConditionReport/:crRefId', ConditionReportController.getConditionReport);

    // POST requests
    app.post(endpoint + 'ConditionReportRequest', ConditionReportController.requestConditionReport);
    app.post(endpoint + 'ConditionReportSubmit', ConditionReportController.submitConditionReport);
    app.post(endpoint + 'ConditionReportCrossCheck', ConditionReportController.crossCheckConditionReport);
};