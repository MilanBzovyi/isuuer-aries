/**
 * Patientリソースに責務を持つモジュール
 */

/**
 * 全ての受診者情報を取得する。
 *
 * @param {*} queryParams クエリパラメータ
 * @returns 受診者情報
 */
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

    if (response.ok) {
      const patients = await response.json();
      return patients;
    } else {
      throw new Error(response.statusText);
    }
  } catch (error) {
    console.error(JSON.stringify(error));
    throw new Error(error);
  }
};

/**
 * ある受診者の健康診断結果を取得する。
 *
 * @param {*} patientId 受診者ID
 * @returns 健康診断結果
 */
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

    if (response.ok) {
      const patient = await response.json();
      if (patient) {
        return patient;
      } else {
        throw new Error(`employee id:${patient} was not found.`);
      }
    } else {
      throw new Error(response.statusText);
    }
  } catch (error) {
    console.error(JSON.stringify(error));
    throw new Error(error);
  }
};

/**
 * HolderにVC発行をオファーする。
 *
 * @param {*} patient 受診者情報
 */
export const offerVCIssueing = async (patient) => {
  try {
    const response = await fetch(
      `${process.env.VUE_APP_API_BASE_URL}/patients/${patient.patientId}`,
      {
        cache: "no-cache",
        method: "PUT",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patient),
      }
    );
    if (!response.ok) {
      throw new Error(response.statusText);
    }
  } catch (error) {
    console.error(JSON.stringify(error));
    throw new Error(error);
  }
};

/**
 * 画面表示用に健康診断結果を調整する。
 *
 * @param {*} checkupResultRaw 健康診断結果情報
 * @returns 調整された健康診断結果情報
 */
export const arrangeCheckupResult = (checkupResultRaw) => {
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
    checkupResultRaw.checkedupDate
  ).toLocaleDateString();
  delete checkupResultRaw.checkedupDate;

  // TODO 後でswitch文に変える
  const issueState = checkupResultRaw.issueState;
  if (issueState === 0) {
    checkupResultRaw["証明書発行状態"] = "未発行";
  } else if (issueState === 1) {
    checkupResultRaw["証明書発行状態"] = "発行オファー受付済み";
  } else if (issueState === 2) {
    checkupResultRaw["証明書発行状態"] = "発行オファーメール送信済み";
  } else if (issueState === 3) {
    checkupResultRaw["証明書発行状態"] = "発行済み";
  } else {
    // noop
  }
  delete checkupResultRaw.issueState;

  // TODO 後でdynamodbの数値型列にnull入らない問題調査
  const issuedDate = checkupResultRaw.issuedDate;
  if (issuedDate === 0) {
    checkupResultRaw["証明書発行日"] = null;
  } else {
    checkupResultRaw["証明書発行日"] = new Date(
      checkupResultRaw.issuedDate
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
