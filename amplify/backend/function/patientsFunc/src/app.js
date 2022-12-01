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
const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();

// declare a new express app
const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
app.use(function (req, res, next) {
  // res.header("Access-Control-Allow-Origin", process.env.FRONTEND_ORIGIN);
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

app.get("/patients", async function (req, res) {
  const params = {
    TableName: process.env.STORAGE_PATIENT_NAME,
  };

  try {
    const patients = await docClient.scan(params).promise();
    return res.status(200).json(patients.Items);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

app.get("/patients/*", async function (req, res) {
  const params = {
    ExpressionAttributeValues: {
      ":patientId": parseInt(req.params[0], 10),
    },
    KeyConditionExpression: "patientId = :patientId",
    TableName: process.env.STORAGE_PATIENT_NAME,
  };

  try {
    const checkupResult = await docClient.query(params).promise();
    return res.status(200).json(checkupResult.Items[0]);
  } catch (err) {
    res.status(500).json({ error: err });
  }

  // res.json({ success: "get call succeed!", url: req.url });
});

/****************************
 * Example post method *
 ****************************/

// app.post("/patients", function (req, res) {
//   // Add your code here
//   res.json({ success: "post call succeed!", url: req.url, body: req.body });
// });

// app.post("/patients/*", function (req, res) {
//   // Add your code here
//   res.json({ success: "post call succeed!", url: req.url, body: req.body });
// });

// app.put("/patients", function (req, res) {
//   res.json({ success: "put call succeed!", url: req.url, body: req.body });
// });

const sqs = new AWS.SQS();
app.put("/patients/*", async function (req, res) {
  console.log(req.body);
  const checkupResult = req.body;

  const paramsforUpdate = {
    TableName: process.env.STORAGE_PATIENT_NAME,
    Key: {
      patientId: checkupResult.patientId,
    },
    UpdateExpression: "set issueState = :s",
    ExpressionAttributeValues: {
      ":s": 1,
    },
  };
  try {
    const docResp = await docClient.update(paramsforUpdate).promise();
    console.log(JSON.stringify(docResp));
  } catch (err) {
    console.log(`db updating issueState error: ${err}`);
    return res.status(500).json({ message: "server error" });
  }

  try {
    const sqsParams = {
      MessageBody: JSON.stringify(checkupResult),
      QueueUrl: process.env.QUEUE_URL,
    };

    const sqsResp = await sqs.sendMessage(sqsParams).promise();
    console.log(JSON.stringify(sqsResp));
  } catch (err) {
    console.log(`error on sending message to sqs: ${err}`);
    return res.status(500).json({ message: "server error" });
  }

  return res.status(200).json({ message: "success" });
});

/****************************
 * Example delete method *
 ****************************/

// app.delete("/patients", function (req, res) {
//   // Add your code here
//   res.json({ success: "delete call succeed!", url: req.url });
// });

// app.delete("/patients/*", function (req, res) {
//   // Add your code here
//   res.json({ success: "delete call succeed!", url: req.url });
// });

// app.listen(3000, function () {
//   console.log("App started");
// });

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app;
