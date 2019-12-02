import express from 'express';
import router from './routes';
import bodyParser from 'body-parser';
import db from '../database/models/index';

const app = express();

db.sequelize.authenticate()
.then(() => console.log("Database connected..."))
.catch((err) => console.log('Error: ' + err));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000 ;

app.use('/api', router);

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

export default app;
