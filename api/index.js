import server from './server';

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
}).setTimeout(1000 * 60 * 2); // 2 minutes
