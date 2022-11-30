/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	STORAGE_PATIENT_ARN
	STORAGE_PATIENT_NAME
	STORAGE_PATIENT_STREAMARN
Amplify Params - DO NOT EDIT */

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  console.log(`event: ${JSON.stringify(event)}`);
  const payload = event.responsePayload;

  const paramsforUpdate = {
    TableName: process.env.STORAGE_PATIENT_NAME,
    Key: {
      patientId: payload.patientId,
    },
    UpdateExpression: "set issueState = :s",
    ExpressionAttributeValues: {
      ":s": 2,
    },
  };
  try {
    await docClient.update(paramsforUpdate).promise();
  } catch (err) {
    console.log(`db updating issueState error: ${err}`);
    throw Error(err);
  }
};
