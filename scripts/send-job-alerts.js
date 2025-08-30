#!/usr/bin/env node

/**
 * Job Alerts Cron Script
 * This script can be run as a cron job to send job alerts
 * Usage: node scripts/send-job-alerts.js
 */

const https = require("https");
const http = require("http");

// Configuration
const API_URL = process.env.API_URL || "http://localhost:3000";
const API_ENDPOINT = "/api/send-job-alerts";

/**
 * Send job alerts via API
 */
async function sendJobAlerts() {
  return new Promise((resolve, reject) => {
    const url = new URL(API_ENDPOINT, API_URL);
    const isHttps = url.protocol === "https:";
    const client = isHttps ? https : http;

    const postData = JSON.stringify({
      testMode: false,
    });

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 3000),
      path: url.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    console.log(`🚀 Sending job alerts to: ${API_URL}${API_ENDPOINT}`);
    console.log(`⏰ Time: ${new Date().toISOString()}`);

    const req = client.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const result = JSON.parse(data);
          console.log("✅ Job alerts sent successfully!");
          console.log("📊 Results:", result);
          resolve(result);
        } catch (error) {
          console.error("❌ Error parsing response:", error);
          reject(error);
        }
      });
    });

    req.on("error", (error) => {
      console.error("❌ Request failed:", error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Main function
 */
async function main() {
  try {
    console.log("🎯 Starting job alerts cron job...");
    const result = await sendJobAlerts();
    console.log("🎉 Job alerts cron job completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("💥 Job alerts cron job failed:", error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { sendJobAlerts };
