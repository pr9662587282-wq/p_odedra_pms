const axios = require("axios");

(async () => {
  try {
    const res = await axios.post(
      "http://localhost:5000/register",
      {
        email: "node-test@example.com",
        password: "P@ssw0rd1",
      },
      { timeout: 5000 },
    );

    console.log("STATUS", res.status);
    console.log(res.data);
  } catch (err) {
    if (err.response) {
      console.error("RESPONSE STATUS", err.response.status);
      console.error(err.response.data);
    } else {
      console.error(err.message);
    }
  }
})();
