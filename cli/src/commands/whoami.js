const api = require("../services/api");

module.exports = async () => {
  const res = await api.get("/protected/me");
  console.log(res.data.user);
};
