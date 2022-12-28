/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	STORAGE_PATIENT_ARN
	STORAGE_PATIENT_NAME
	STORAGE_PATIENT_STREAMARN
Amplify Params - DO NOT EDIT */

const express = require("express");
const bodyParser = require("body-parser");
const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");

// declare a new express app
const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());
const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

/**
 * Connectionを作ったら、発行オファーを送る。
 */
app.post("/topic/connections", async function (req, res) {
  const body = req.body;
  const connectionId = body.connection_id;
  console.log(body.status);
  if (body.status === "active") {
    console.log(`connection is now active: ${connectionId}`);
  } else {
    return res
      .status(200)
      .json(`connection is not active yet: ${connectionId}`);
  }

  // DBからClaimの取得
  const params = {
    ExpressionAttributeValues: {
      ":connectionId": connectionId,
    },
    KeyConditionExpression: "connectionId = :connectionId",
    TableName: process.env.STORAGE_PATIENT_NAME,
  };

  let checkupResult = null;
  try {
    checkupResult = await docClient.query(params).promise();
  } catch (err) {
    console.log("error on retrieving patient data.", err);
    res.status(500).json({ error: err });
  }

  const offerReqBody = {
    auto_remove: false,
    auto_issue: true,
    comment: `vc issue offer to a patient: ${checkupResult.name}`,
    connection_id: connectionId,
    cred_def_id: process.env.CRED_DEF_ID,
    credential_preview: {
      "@type":
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/issue-credential/1.0/credential-preview",
      attributes: [
        {
          name: "patient_id",
          value: checkupResult.patientId,
        },
        {
          name: "bmi",
          value: checkupResult.bmi,
        },
        {
          name: "eyesight",
          value: checkupResult.eyesight,
        },
        {
          name: "hearing",
          value: checkupResult.hearing,
        },
        {
          name: "waist",
          value: checkupResult.waist,
        },
        {
          name: "blood_pressure",
          value: checkupResult.bloodPressure,
        },
        {
          name: "vital_capacity",
          value: checkupResult.vitalCapacity,
        },
        {
          name: "ua",
          value: checkupResult.ua,
        },
        {
          name: "tc",
          value: checkupResult.tc,
        },
        {
          name: "tg",
          value: checkupResult.tg,
        },
        {
          name: "fpg",
          value: checkupResult.fpg,
        },
        {
          name: "rbc",
          value: checkupResult.rbc,
        },
        {
          name: "wbc",
          value: checkupResult.wbc,
        },
        {
          name: "plt",
          value: checkupResult.plt,
        },
      ],
    },
    trace: true,
  };

  const offerResponse = await fetch(
    `${process.env.ISSUER_ENDPOINT}/issue_crednetial/send-offer`,
    {
      cache: "no-cache",
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(offerReqBody),
    }
  );

  let offerResponseJson = null;
  if (offerResponse.ok) {
    offerResponseJson = await offerResponse.json();
    console.log("offerResponse:", JSON.stringify(offerResponseJson));
  } else {
    const message = "Error on calling aca-py's connections/create-invitation";
    console.error(`${message}: ${offerResponse.statusText}`);
    throw new Error({
      matter: message,
      reason: offerResponse.statusText,
    });
  }

  return res.status(200).json("Connection listener succeeded.");
});

module.exports = app;
