import Config from "../../config/Config";
import { Axios } from "axios";
import https from "https";

const axios = new Axios({
  baseURL: Config.HEMIS_API_URL,
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
    keepAlive: true,
    keepAliveMsecs: 30000,
  }),
  headers: {
    Authorization: "Bearer " + Config.BEARER_TOKEN_FOR_HEMIS,
  },
  responseType: "json",
  transformResponse: (data) => {
    return JSON.parse(data);
  },
});

export default axios as Axios;
