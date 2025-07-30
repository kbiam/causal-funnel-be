const app = require("./app")
const routes = require('./routes')
const PORT = process.env.PORT || 5000;

app.use("/api",routes)


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });