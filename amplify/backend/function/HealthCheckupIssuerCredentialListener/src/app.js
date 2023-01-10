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

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();
app.post("/topic/issue_credential", async function (req, res) {
  const state = req.body.state;
  console.log(`state: ${state}`);

  if (state === "done") {
    const params = {
      TableName: process.env.STORAGE_PATIENT_NAME,
      Key: {
        patientId: req.body.patientId,
      },
      UpdateExpression: "set issueState = :s and issuedDate = :d",
      ExpressionAttributeValues: {
        ":s": 3,
        ":d": new Date().getTime(),
      },
    };

    try {
      await docClient.update(params).promise();
      return res.status(200).json("success");
    } catch (err) {
      console.log(`db update error: ${err}`);
      return res.status(500).json({ error: err });
    }
  }
});

module.exports = app;
