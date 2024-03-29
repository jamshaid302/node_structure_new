import { NextFunction, Request, Response } from 'express';
import {SessionUser} from './sessionUser';
import { Document } from 'mongodb';

export interface Request extends Request {
    req: {} & object;
    files: { [key: string]: MulterFile [] };
    file: MulterFiles;
    user: SessionUser;
    dbPagination: Document[];
    aggregations: Document[];
    session: [any];
    global: [any];
}

export interface MulterFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    destination: string;
    filename: string;
    path: string;
    size: number
}
export interface NextFunction extends NextFunction { }
export interface Response extends Response { }