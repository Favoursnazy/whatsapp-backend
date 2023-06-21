import dotenv from "dotenv";
import app from "./app.js";

//dotenv config
dotenv.config();

//env variables
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
