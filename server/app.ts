import * as bodyParser from "body-parser";
import express from "express"
import * as http from "http";
import { MiddleWare } from "../core";
import Routes from '../core/router';
import config from '../config/config';
import { db } from "../database/db";

export default class Server {
    private routes: Routes = new Routes();
    private middleWare: MiddleWare = new MiddleWare();
    private app: any;
    public server: http.Server;

    // public static bootstrap(): Server {
    //     return new Server();
    // }

    public constructor() {
        global['config'] = config;
        this.app = express();
        this.config();
    }

    public async run(port: number, callback?: () => void): Promise<http.Server> {
        if(await db){
            console.log('DB connected')
        }
        if (callback) {
            return this.app.listen(port, callback);
        }
        return this.app.listen(port);
    }

    private async config() {
        /** Register lib middlewares */
        this.app.use(bodyParser.json({limit: '10mb'}));
        this.app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
        this.app.use('/files', express.static('files'));
        await this.routes.setRoutes();

        /** Register application router */
        this.app.use(this.middleWare.crossHeaders);
        this.app.use(this.routes.publicRoutes);
        this.app.use(this.middleWare.tokenValidator);
        this.app.use(this.routes.privateRoutes);
    }
}