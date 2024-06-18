const axios = require("axios");
const { URLSCAN_API_KEY } = require("../config");
const { log } = require("./logger");

const submitUrlForScan = async (url) => {
  try {
    const response = await axios.post(
      "https://urlscan.io/api/v1/scan/",
      {
        url: url,
      },
      {
        headers: {
          "API-Key": URLSCAN_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
    log(`[LOGS] Scan submitted. UUID: ${response.data.uuid}`);
    return response.data.uuid;
  } catch (error) {
    log("Erreur lors de la soumission du lien:", error);
    throw error;
  }
};

const checkScanResult = async (resultUrl) => {
  try {
    const resultResponse = await axios.get(resultUrl, {
      headers: {
        "API-Key": URLSCAN_API_KEY,
      },
    });
    return resultResponse.data;
  } catch (error) {
    throw error;
  }
};

module.exports = { submitUrlForScan, checkScanResult };
