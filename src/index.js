import express from 'express';

const app = express();
const port = 8000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Real-Time Sport Engine API!' });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
