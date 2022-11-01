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