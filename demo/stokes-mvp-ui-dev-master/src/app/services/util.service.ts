import {Injectable} from "@angular/core";
import {config} from "../../config/config.js";

@Injectable()
export class UtilService {

  getBaseUrl() {
    return window.location.href.indexOf('localhost') > 0 ? config.LOCAL_BASE_URL : config.API_BASE_URL;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
