/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	STORAGE_PATIENT_ARN
	STORAGE_PATIENT_NAME
	STORAGE_PATIENT_STREAMARN
Amplify Params - DO NOT EDIT */

const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();

const fetch = require("node-fetch");

exports.handler = async (event) => {
  console.log(`event: ${JSON.stringify(event)}`);
  const data = JSON.parse(event.Records[0].body);
  console.log(data);

  // Invitation生成のEndpoint呼び出し
  const createInvitationReqBody = {
    my_label: `${data.name}さんへのInvitation`,
  };

  const createInvitationResponse = await fetch(
    `${process.env.ISSUER_ENDPOINT}/connections/create-invitation`,
    {
      cache: "no-cache",
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(createInvitationReqBody),
    }
  );

  let createInvitationResponseJson = null;
  if (createInvitationResponse.ok) {
    createInvitationResponseJson = await createInvitationResponse.json();
  } else {
    const message = "Error on calling aca-py's connections/create-invitation";
    console.error(`${message}: ${createInvitationResponse.statusText}`);
    throw new Error({
      matter: message,
      reason: createInvitationResponse.statusText,
    });
  }

  const invitationURL = createInvitationResponseJson.invitation_url;
  console.log("invitationURL", invitationURL);

  // applicant idを元にconnection idをDBに保管する。
  const patientId = data.patientId;
  const connectionId = createInvitationResponseJson.connectionId;

  const paramsforUpdate = {
    TableName: process.env.STORAGE_PATIENT_NAME,
    Key: {
      patientId: patientId,
    },
    UpdateExpression: "set connectionId = :s",
    ExpressionAttributeValues: {
      ":s": connectionId,
    },
  };

  try {
    const docResp = await docClient.update(paramsforUpdate).promise();
    console.log(JSON.stringify(docResp));
  } catch (err) {
    console.log(`db updating issueState error: ${err}`);
    // TODO throw Errorするとメッセージがキュー上から消費されず、永遠と同じことを繰り返してしまう。
    // TODO return {}するとそれは起きないけど、正常にメッセージが消費されて消える。
    // throw Error(err);
    return {
      statusCode: 500,
      //  Uncomment below to enable CORS requests
      //  headers: {
      //      "Access-Control-Allow-Origin": "*",
      //      "Access-Control-Allow-Headers": "*"
      //  },
      body: JSON.stringify("foobarbaz"),
    };
  }

  // DEEP LINKを作り、QueueにInvitationを投げる。
  const deepLinkInvitation =
    process.env.INV_FORWARD_URL + invitationURL.split("c_i=")[1];
  console.log("deepLinkInvitationURL", deepLinkInvitation);

  try {
    const sqsParams = {
      MessageBody: JSON.stringify({
        patientId: data.patientId,
        patientName: data.name,
        invitation: deepLinkInvitation,
      }),
      QueueUrl: process.env.QUEUE_URL,
    };

    const sqsResp = await sqs.sendMessage(sqsParams).promise();
    console.log(JSON.stringify(sqsResp));
  } catch (err) {
    // TODO throw Errorするとメッセージがキュー上から消費されず、永遠と同じことを繰り返してしまう。
    // TODO return {}するとそれは起きないけど、正常にメッセージが消費されて消える。
    console.log(`error on sending message to sqs: ${err}`);
    throw Error(err);
  }
};
