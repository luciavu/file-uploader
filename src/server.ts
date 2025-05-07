import dotenv from 'dotenv';
dotenv.config();
import app from './app';

//Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}.`);
});
