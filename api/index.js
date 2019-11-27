import express from 'express';
import router from './routes';

const app = express();

app.use('/api', router);

app.listen(3000, ()=>{
    console.log('Running app')
});

export default app
