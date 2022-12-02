const fetch = require("node-fetch");

const AWS = require("aws-sdk");
const sqs = new AWS.SQS();
exports.handler = async (event) => {
  console.log(`event: ${JSON.stringify(event)}`);
  const checkupResult = JSON.parse(event.Records[0].body);
  console.log(checkupResult);

  // Credential Exchange Record生成のEndpoint呼び出し
  const issueCrdentialBody = {
    auto_remove: true,
    comment: `健康診断書VCの発行 / 受診者ID: ${checkupResult.patientId}`,
    credential_proposal: {
      "@type": "issue-credential/1.0/credential-preview",
      attributes: [
        {
          name: "patient_id",
          value: checkupResult.patientId.toString(),
        },
        {
          name: "bmi",
          value: checkupResult.bmi.toString(),
        },
        {
          name: "eyesight",
          value: checkupResult.eyesight.toString(),
        },
        {
          name: "hearing",
          value: checkupResult.hearing.toString(),
        },
        {
          name: "waist",
          value: checkupResult.waist.toString(),
        },
        {
          name: "blood_pressure",
          value: checkupResult.bloodPressure,
        },
        {
          name: "vital_capacity",
          value: checkupResult.vitalCapacity.toString(),
        },
        {
          name: "ua",
          value: checkupResult.ua.toString(),
        },
        {
          name: "tc",
          value: checkupResult.tc.toString(),
        },
        {
          name: "tg",
          value: checkupResult.tg.toString(),
        },
        {
          name: "fpg",
          value: checkupResult.fpg.toString(),
        },
        {
          name: "rbc",
          value: checkupResult.rbc.toString(),
        },
        {
          name: "wbc",
          value: checkupResult.wbc.toString(),
        },
        {
          name: "plt",
          value: checkupResult.plt.toString(),
        },
      ],
    },
    issuer_did: `${process.env.ISSUER_DID}`,
    schema_id: `${process.env.SCHEMA_ID}`,
    cred_def_id: `${process.env.CRED_DEF_ID}`,
    trace: true,
  };

  const issueCredentialResponse = await fetch(
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

  let issueCredentialResJson = null;
  if (issueCredentialResponse.ok) {
    issueCredentialResJson = await issueCredentialResponse.json();
    console.log(JSON.stringify(issueCredentialResJson));
  } else {
    const message = "Error on calling aca-py's issue-credential/create";
    console.error(`${message}: ${issueCredentialResponse.statusText}`);
    throw Error({
      matter: message,
      reason: issueCredentialResponse.statusText,
    });
  }
  const credentialExchangeId = issueCredentialResJson.credential_exchange_id;
  console.log("Credential Exchange ID", credentialExchangeId);

  // Invitation生成のEndpoint呼び出し
  const createInvitationReqBody = {
    attachments: [
      {
        id: credentialExchangeId,
        type: "credential-offer",
      },
    ],
    my_label: `${checkupResult.name}さんへのVC発行オファー`,
  };
  const createInvitationResponse = await fetch(
    `${process.env.ISSUER_ENDPOINT}/out-of-band/create-invitation`,
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
    const message = "Error on calling aca-py's out-of-band/create-invitation";
    console.error(`${message}: ${createInvitationResponse.statusText}`);
    throw new Error({
      matter: message,
      reason: createInvitationResponse.statusText,
    });
  }

  const invitationURL = createInvitationResponseJson.invitation_url;
  console.log("invitationURL", invitationURL);

  const deepLinkInvitation =
    process.env.INV_FORWARD_URL + invitationURL.split("oob=")[1];
  console.log("deepLinkInvitationURL", deepLinkInvitation);

  try {
    const sqsParams = {
      MessageBody: JSON.stringify({
        patientId: checkupResult.patientId,
        patientName: checkupResult.name,
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
