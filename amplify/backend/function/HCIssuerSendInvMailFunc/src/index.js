/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	STORAGE_PATIENT_ARN
	STORAGE_PATIENT_NAME
	STORAGE_PATIENT_STREAMARN
Amplify Params - DO NOT EDIT */
const AWS = require("aws-sdk");
const ses = new AWS.SES({ region: process.env.REGION });
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);
  const payload = JSON.parse(event.Records[0].body);
  console.log(payload);

  try {
    const sesParams = {
      Source: process.env.ISSUER_EMAIL_TEST_ADDRESS,
      Destination: {
        ToAddresses: [process.env.HOLDER_EMAIL_TEST_ADDRESS],
      },
      Message: {
        Subject: { Data: "健康診断結果証明書発行オファー(仮)" },
        Body: {
          Html: {
            Data: `${payload.patientName}さん<br> <a href='${payload.invitation}'>ここ</a>をクリックして健康診断書証明書を発行してください。(仮)`,
          },
        },
      },
    };
    const sesResp = await ses.sendEmail(sesParams).promise();
    console.log(JSON.stringify(sesResp));
  } catch (err) {
    console.log(`error on sending invitation email to holder: ${err}`);
    throw Error(err);
  }

  // DBのissueState更新
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
    const docResp = await docClient.update(paramsforUpdate).promise();
    console.log(JSON.stringify(docResp));
  } catch (err) {
    console.log(`db updating issueState error: ${err}`);
    throw Error(err);
  }
};
