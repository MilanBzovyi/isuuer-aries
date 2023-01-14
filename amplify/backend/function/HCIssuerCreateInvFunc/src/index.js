/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	STORAGE_PATIENT_ARN
	STORAGE_PATIENT_NAME
	STORAGE_PATIENT_STREAMARN
Amplify Params - DO NOT EDIT */

/**
 * Holderに対しConnectionを張るために、Invitationを作成する。
 *
 * @author @t_kanuma
 */
const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();
const fetch = require("node-fetch");

exports.handler = async (event) => {
  console.log(`event: ${JSON.stringify(event)}`);
  const payload = JSON.parse(event.Records[0].body);
  console.log(`payload: ${JSON.stringify(payload)}`);

  // Invitation生成のEndpoint呼び出し
  const createInvitationReqBody = {
    my_label: `${payload.name}さんへのInvitation`,
  };

  const createInvitationResponse = await fetch(
    `${process.env.ISSUER_ENDPOINT}/connections/create-invitation`,
    {
      method: "POST",
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
    throw new Error(message);
  }

  const invitationURL = createInvitationResponseJson.invitation_url;
  console.log("invitationURL", invitationURL);

  // patient idを元にconnection idをDBに保管する。
  const patientId = payload.patientId;
  const connectionId = createInvitationResponseJson.connection_id;

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
    console.log(`db update resp: ${JSON.stringify(docResp)}`);
  } catch (err) {
    console.log(`error on updating connection id: ${JSON.stringify(err)}`);
    throw Error(err);
  }

  // DEEP LINKを作り、QueueにInvitationを投げる。
  const deepLinkInvitation =
    process.env.INV_FORWARD_URL + invitationURL.split("c_i=")[1];
  console.log("deepLinkInvitationURL", deepLinkInvitation);

  try {
    const sqsParams = {
      MessageBody: JSON.stringify({
        patientId: payload.patientId,
        patientName: payload.name,
        invitation: deepLinkInvitation,
      }),
      QueueUrl: process.env.QUEUE_URL,
    };

    const sqsResp = await sqs.sendMessage(sqsParams).promise();
    console.log(`sqs send resp: ${JSON.stringify(sqsResp)}`);
  } catch (err) {
    console.log(`error on sending message to sqs: ${JSON.stringify(err)}`);
    throw Error(err);
  }
};
