export const getPatients = async (queryParams) => {
  let url = null;
  if (queryParams === null || queryParams === undefined) {
    url = `${process.env.VUE_APP_API_BASE_URL}/patients`;
  } else {
    url = `${process.env.VUE_APP_API_BASE_URL}/patients?${queryParams}`;
  }
  try {
    const response = await fetch(url, {
      cache: "no-cache",
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": process.env.VUE_APP_API_KEY,
      },
    });

    const patients = await response.json();
    return patients;
  } catch (error) {
    console.log(error);
  }
};

export const getCheckupResult = async (patientId) => {
  try {
    const response = await fetch(
      `${process.env.VUE_APP_API_BASE_URL}/patients/${patientId}`,
      {
        cache: "no-cache",
        method: "GET",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": process.env.VUE_APP_API_KEY,
        },
      }
    );

    const patient = await response.json();
    if (patient) {
      return patient;
    } else {
      throw new Error(`employee id:${patient} was not found.`);
    }
  } catch (error) {
    console.log(error);
  }
};

export const changeCheckupResultLabel = (checkupResultRaw) => {
  console.log(checkupResultRaw);

  checkupResultRaw["受診者ID"] = checkupResultRaw.patientId;
  delete checkupResultRaw.patientId;

  checkupResultRaw["名前"] = checkupResultRaw.name;
  delete checkupResultRaw.name;

  checkupResultRaw["年齢"] = checkupResultRaw.age;
  delete checkupResultRaw.age;

  checkupResultRaw["メールアドレス"] = checkupResultRaw.mailAddress;
  delete checkupResultRaw.mailAddress;

  checkupResultRaw["受診日"] = new Date(
    checkupResultRaw.checkedupDate * 1000
  ).toLocaleDateString();
  delete checkupResultRaw.checkedupDate;

  const issueState = checkupResultRaw.issueState;
  if (issueState === 0) {
    checkupResultRaw["証明書発行状態"] = "未発行";
  } else if (issueState === 1) {
    checkupResultRaw["証明書発行状態"] = "発行QRコード送信済み";
  } else if (issueState === 2) {
    checkupResultRaw["証明書発行状態"] = "発行済み";
  }
  delete checkupResultRaw.issueState;

  const issuedDate = checkupResultRaw.issuedDate;
  if (issuedDate === 0) {
    checkupResultRaw["証明書発行日"] = null;
  } else {
    checkupResultRaw["証明書発行日"] = new Date(
      checkupResultRaw.checkedupDate * 1000
    ).toLocaleDateString();
  }
  delete checkupResultRaw.issuedDate;

  checkupResultRaw["BMI"] = checkupResultRaw.bmi;
  delete checkupResultRaw.bmi;

  checkupResultRaw["視力"] = checkupResultRaw.eyesight;
  delete checkupResultRaw.eyesight;

  checkupResultRaw["聴力"] = checkupResultRaw.hearing;
  delete checkupResultRaw.hearing;

  checkupResultRaw["腹囲"] = checkupResultRaw.waist;
  delete checkupResultRaw.waist;

  checkupResultRaw["血圧"] = checkupResultRaw.bloodPressure;
  delete checkupResultRaw.bloodPressure;

  checkupResultRaw["肺活量"] = checkupResultRaw.vitalCapacity;
  delete checkupResultRaw.vitalCapacity;

  checkupResultRaw["尿酸値"] = checkupResultRaw.ua;
  delete checkupResultRaw.ua;

  checkupResultRaw["総コレステロール"] = checkupResultRaw.tc;
  delete checkupResultRaw.tc;

  checkupResultRaw["中性脂肪"] = checkupResultRaw.tg;
  delete checkupResultRaw.tg;

  checkupResultRaw["血糖値"] = checkupResultRaw.fpg;
  delete checkupResultRaw.fpg;

  checkupResultRaw["赤血球"] = checkupResultRaw.rbc;
  delete checkupResultRaw.rbc;

  checkupResultRaw["白血球"] = checkupResultRaw.wbc;
  delete checkupResultRaw.wbc;

  checkupResultRaw["血小板数"] = checkupResultRaw.plt;
  delete checkupResultRaw.plt;

  return checkupResultRaw;
};
