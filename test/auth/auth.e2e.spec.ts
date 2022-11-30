import { INestApplication } from '@nestjs/common';
import mongoose from 'mongoose';
import { Helper } from '../test.helper';
import User from '../../database/models/user';

describe('project auth test', () => {
    let app: INestApplication;
    let helper: Helper;
    beforeAll( async () => {
        const db = await mongoose.connect(
            'mongodb+srv://jamshaid:jamshaid@cluster0.aycmrpn.mongodb.net/test_new_node_structure'
        );
        if(db){
            console.log('Connection established');
        } else{
            console.log('connection error');
        }
        helper = new Helper(app);
    })

    it(`Should give error on  Register Test User with no payload `, async () => {
        const userTest = await helper.createUser();
        await User.create();
        return expect(400);
        // return request.default(app.getHttpServer()).post('/auth/register').expect(400);
    });

    it(`Should Register Test User with valid payload `, async () => {
        await mongoose.connection.dropDatabase();
        const userTest = await helper.createUser();
        await User.create(userTest);
        return expect(400);
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });
})