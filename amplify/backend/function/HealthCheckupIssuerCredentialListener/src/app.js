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
 * Webhookとして、ACA-PyからのVC発行に関するイベントを受け取るListener
 *
 * @author @t_kanuma
 */
const express = require("express");
const bodyParser = require("body-parser");
const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");

const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();

app.post("/topic/issue_credential", async function (req, res) {
  const body = req.body;
  const state = body.state;
  console.log(`state: ${state}`);
  const credentialExchangeId = body.credential_exchange_id;

  if (state !== "credential_issued") {
    return res
      .status(200)
      .json(`vc has not been issued yet: ${credentialExchangeId}`);
  }

  console.log(`vc has been issued: ${credentialExchangeId}`);

  try {
    const queryParams = {
      TableName: process.env.STORAGE_PATIENT_NAME,
      IndexName: "connectionId-index",
      ExpressionAttributeValues: {
        ":connectionId": body.connection_id,
      },
      KeyConditionExpression: "connectionId = :connectionId",
      ProjectionExpression: "patientId",
    };

    const checkupResult = await docClient.query(queryParams).promise();
    const patientId = checkupResult.Items[0].patientId;

    // TODO DBにupdatedTimestampカラムを追加する。
    const updateParams = {
      TableName: process.env.STORAGE_PATIENT_NAME,
      Key: {
        patientId: patientId,
      },
      UpdateExpression: "set issueState = :s, issuedDate = :d",
      ExpressionAttributeValues: {
        // 3: 発行済み
        ":s": 3,
        ":d": new Date().getTime(),
      },
    };

    await docClient.update(updateParams).promise();
  } catch (err) {
    console.error(`db update error: ${JSON.stringify(err)}`);
    return res.status(500).json({ error: err });
  }

  return res.status(200).json("Credential listener succeeded.");
});

module.exports = app;
