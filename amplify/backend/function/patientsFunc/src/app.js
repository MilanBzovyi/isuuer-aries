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

const fetch = require("fetch");
app.put("/patients/*", async function (req, res) {
  // TODO 3つの処理を非同期にする。
  // リクエスト受付 -> DBリードからACA-PY叩く -> メール送信 -> DB更新(issueState)

  const params = {
    ExpressionAttributeValues: {
      ":patientId": parseInt(req.params[0], 10),
    },
    KeyConditionExpression: "patientId = :patientId",
    TableName: process.env.STORAGE_PATIENT_NAME,
  };

  const checkupResult = await docClient.query(params).promise().Items[0];

  const issueCrdentialBody = {
    auto_remove: true,
    comment: `健康診断書VCの発行 / 受診者ID: ${checkupResult.patientId}`,
    credential_proposal: {
      "@type": "issue-credential/1.0/credential-preview",
      attributes: [
        // TODO ここどうにかしていく。めんどいから直書きでいいか。
        {
          name: "favourite_drink",
          value: "martini",
        },
      ],
    },
    issuer_did: `${process.env.ISSUER_DID}`,
    schema_id: `${process.env.SCHEMA_ID}`,
    cred_def_id: `${process.env.CRED_DEF_ID}`,
    trace: true,
  };

  try {
    const response = await fetch(
      `${process.env.ISSUER_ENDPOINT}/issue-credential/create`,
      {
        cache: "no-cache",
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(issueCrdentialBody),
      }
    );
    const res = await response.json();
    console.log(res.message);
  } catch (error) {
    console.log(`error on calling aca-py's issue-credential/create: ${error}`);
    return res.status(500).json({ error: error });
  }

  // TODO2 LambdaのなかでSMSをよぶ（最後）

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
    await docClient.update(paramsforUpdate).promise();
  } catch (err) {
    console.log(`db updating issueState error: ${err}`);
    return res.status(500).json({ error: err });
  }

  return res.status(200);
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
