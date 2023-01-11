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
const fetch = require("node-fetch");
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
  console.log(body);

  const connectionId = body.connection_id;
  console.log(body.state);
  if (body.state === "active") {
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
    FilterExpression: "connectionId = :connectionId",
    TableName: process.env.STORAGE_PATIENT_NAME,
  };

  let checkupResult = null;
  try {
    checkupResult = await docClient.scan(params).promise();
  } catch (err) {
    console.log("error on retrieving patient data.", err);
    return res.status(500).json({ error: err });
  }

  console.log(`checkup result: ${checkupResult}`);
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
          value: checkupResult.patientId.toString(),
        },
        {
          name: "bmi",
          value: checkupResult.bmi.toString(),
        },
        {
          name: "eyesight",
          value: checkupResult.eyesight.toString(),
        },
        {
          name: "hearing",
          value: checkupResult.hearing.toString(),
        },
        {
          name: "waist",
          value: checkupResult.waist.toString(),
        },
        {
          name: "blood_pressure",
          value: checkupResult.bloodPressure.toString(),
        },
        {
          name: "vital_capacity",
          value: checkupResult.vitalCapacity.toString(),
        },
        {
          name: "ua",
          value: checkupResult.ua.toString(),
        },
        {
          name: "tc",
          value: checkupResult.tc.toString(),
        },
        {
          name: "tg",
          value: checkupResult.tg.toString(),
        },
        {
          name: "fpg",
          value: checkupResult.fpg.toString(),
        },
        {
          name: "rbc",
          value: checkupResult.rbc.toString(),
        },
        {
          name: "wbc",
          value: checkupResult.wbc.toString(),
        },
        {
          name: "plt",
          value: checkupResult.plt.toString(),
        },
      ],
    },
    trace: true,
  };

  console.log(`Offer Request Body: ${JSON.stringify(offerReqBody)}`);
  const offerResponse = await fetch(
    `${process.env.ISSUER_ENDPOINT}/issue-credential/send-offer`,
    {
      method: "POST",
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
    const message = "Error on calling aca-py's issue_crednetial/send-offer";
    console.error(`${message}: ${offerResponse.statusText}`);
    throw new Error(message);
  }

  return res.status(200).json("Connection listener succeeded.");
});

module.exports = app;
