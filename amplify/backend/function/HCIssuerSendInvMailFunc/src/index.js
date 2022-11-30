const AWS = require("aws-sdk");
const ses = new AWS.SES({ region: process.env.REGION });

exports.handler = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);
  const payload = event.responsePayload;

  const sesParams = {
    Source: process.env.ISSUER_EMAIL_TEST_ADDRESS,
    Destination: {
      ToAddresses: [process.env.HOLDER_EMAIL_TEST_ADDRESS],
    },
    Message: {
      Subject: { Data: "健康診断結果証明書発行オファー(仮)" },
      Body: {
        Html: {
          Data: `${payload.patientName}さん</br> <a href='${payload.deepLinkInvitation}'>ここ</a>をクリックして健康診断書証明書を発行してください。(仮)`,
        },
      },
    },
  };
  await ses.sendEmail(sesParams).promise();
  return {
    patientId: payload.patientId,
  };
};
