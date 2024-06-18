const { Client, GatewayIntentBits } = require("discord.js");
const { DISCORD_TOKEN } = require("./config");
const { log } = require("./utils/logger");
const { submitUrlForScan, checkScanResult } = require("./utils/scanner");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  log("[LOGS] Starting bot and all message links checks.");
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = message.content.match(urlRegex);

  if (urls) {
    for (let url of urls) {
      url = url.replace(/[()]+$/, "");
      try {
        log(`[LOGS] Checking URL : ${url}...`);
        const uuid = await submitUrlForScan(url);
        const resultUrl = `https://urlscan.io/api/v1/result/${uuid}/`;

        let scanComplete = false;
        let attempts = 0;
        const maxAttempts = 12;
        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

        while (!scanComplete && attempts < maxAttempts) {
          await delay(10000);

          try {
            log(
              `[LOGS - RETRY] Attempting to retrieve results... (${
                attempts + 1
              }/${maxAttempts})`
            );
            const resultData = await checkScanResult(resultUrl);

            log(`[LOGS] Received scan result for URL: ${url}`);

            if (resultData.verdicts && resultData.verdicts.overall.malicious) {
              log(`[LOGS] Malicious URL detected: ${url}`);
              await message.delete();
              log(
                `[⚠️ LOGS - MALICIOUS URL DETECTED ⚠️] Le lien envoyé par ${message.author.username} (${message.author.id}) dans le channel #${message.channel.name} (${message.channel.id}) a été supprimé car il pourrait contenir un virus.`
              );
              await msg.delete({ timeout: 5000 });
              scanComplete = true;
            } else {
              log(`[LOGS - SAFE URL] URL is safe: ${url}`);
              scanComplete = true;
            }
          } catch (error) {
            if (error.response && error.response.status === 404) {
              log(
                `[LOGS] Scan not finished yet, retrying... (${
                  attempts + 1
                }/${maxAttempts})`
              );
              attempts++;
            } else {
              log(
                "[LOGS] Erreur lors de la récupération du résultat de l'analyse:",
                error
              );
              scanComplete = true;
            }
          }
        }

        if (attempts >= maxAttempts) {
          log("[LOGS - TIMES UP] Le scan a pris trop de temps.");
        }
      } catch (error) {
        log("[LOGS - ERROR] Erreur lors de la soumission du lien:", error);
      }
    }
  }
});

client.login(DISCORD_TOKEN);