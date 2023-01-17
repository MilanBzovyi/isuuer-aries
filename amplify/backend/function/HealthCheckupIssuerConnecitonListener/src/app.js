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

/**
 * Webhookとして、ACA-PyからのConnectionに関するイベントを受け取るListener
 *
 * @author @t_kanuma
 */
const express = require("express");
const bodyParser = require("body-parser");
const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");

const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

const fetch = require("node-fetch");
const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();

app.post("/topic/connections", async function (req, res) {
  const body = req.body;
  const connectionId = body.connection_id;
  const state = body.state;
  console.log(`state: ${state}`);

  if (state !== "active") {
    return res
      .status(200)
      .json(`connection is not active yet: ${connectionId}`);
  }

  console.log(`connection is now active: ${connectionId}`);
  let checkupResult = null;
  try {
    // DBからClaimの取得
    const params = {
      ExpressionAttributeValues: {
        ":connectionId": connectionId,
      },
      FilterExpression: "connectionId = :connectionId",
      TableName: process.env.STORAGE_PATIENT_NAME,
    };

    const scanResp = await docClient.scan(params).promise();
    if (scanResp.Items.length === 1) {
      checkupResult = scanResp.Items[0];
      console.log(`checkup result: ${JSON.stringify(checkupResult)}`);
    } else {
      throw new Error(
        `patient with connection id: ${connectionId} was not found.`
      );
    }
  } catch (err) {
    console.error(
      "error on retrieving patient data from db",
      JSON.stringify(err)
    );
    return res.status(500).json({ error: err });
  }

  try {
    // オファー準備
    const offerReqBody = {
      auto_remove: false,
      auto_issue: true,
      comment: `offering vc issue to a patient: ${checkupResult.name}`,
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

    // オファー送信
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
      throw new Error(`${offerResponse.statusText}`);
    }
  } catch (err) {
    console.error(
      `Error on calling aca-py's issue-credential/send-offer":
      ${JSON.stringify(err)}`
    );
    return res.status(500).json({ error: err });
  }

  return res.status(200).json("Connection listener succeeded.");
});

module.exports = app;
