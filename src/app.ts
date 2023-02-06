import express, {Request, Response, NextFunction} from "express"

import { PORT } from "./lib/constant";

const app = express()

app.get('/', (req: Request, res: Response, next: NextFunction) => {
    res.send('welcome!');
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});