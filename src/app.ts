import express from 'express';
import assistantRoutes from './routes/assistant.routes';

const app = express();
const PORT = 3000;

app.use(express.json());

// Routes
app.use('/assistants', assistantRoutes);
// app.use('/memories', memoryRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
