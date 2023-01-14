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
 * Patientリソースに責務を持つApp
 *
 * @author @t_kanuma
 */
const express = require("express");
const bodyParser = require("body-parser");
const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");

const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();

/**
 * 受診者リストを取得する。
 */
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

/**
 * 受診者の健康診断結果を取得する。
 */
app.get("/patients/*", async function (req, res) {
  // TODO 現状、/*のパターンは1つしかないが、今後複数になる場合は修正する。

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
});

const sqs = new AWS.SQS();
/**
 * Holderへの発行オファーの送信を受け付ける。
 */
app.put("/patients/*", async function (req, res) {
  // TODO 現状、/*のパターンは1つしかないが、今後複数になる場合は修正する。

  // TODO クライアントからのデータを使わずに、patient idを元にDBから引っ張ってくる。
  // （今後このプロトタイプが進展するようであれば直す。）
  const checkupResult = req.body;
  console.log(`checkupResult: ${checkupResult}`);

  const paramsforUpdate = {
    TableName: process.env.STORAGE_PATIENT_NAME,
    Key: {
      patientId: checkupResult.patientId,
    },
    UpdateExpression: "set issueState = :s",
    ExpressionAttributeValues: {
      // 1: 受付済み
      ":s": 1,
    },
  };
  try {
    const docResp = await docClient.update(paramsforUpdate).promise();
    checkupResult.issueState = 1;
    console.log(`issue state update resp: ${JSON.stringify(docResp)}`);
  } catch (err) {
    console.log(`error on updaing issue state on db: ${JSON.stringify(err)}`);
    return res.status(500).json({ message: "server error" });
  }

  try {
    const sqsParams = {
      MessageBody: JSON.stringify(checkupResult),
      QueueUrl: process.env.QUEUE_URL,
    };

    const sqsResp = await sqs.sendMessage(sqsParams).promise();
    console.log(`sqs resp: ${JSON.stringify(sqsResp)}`);
  } catch (err) {
    console.log(`error on sending message to sqs: ${JSON.stringify(err)}`);
    return res.status(500).json({ message: "server error" });
  }

  return res.status(200).json({ message: "success" });
});

module.exports = app;
