import {createHmac, randomBytes} from 'node:crypto'
import jwt from 'jsonwebtoken'
import { prismaClient } from "../lib/db";
import { create } from 'node:domain';

export interface createUserPayload{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface getUserTokenPayload{
    email: string;
    password: string;
}

class UserService{
    private static  generateHash(salt:string, password:string){
        const hashedPassword = createHmac('sha256', salt).update(password).digest('hex');
        return hashedPassword;
    }

    public static createUser(payload:createUserPayload){
        const {firstName, lastName, email, password} = payload;
        const salt = randomBytes(16).toString('hex');
        // const hashedPassword = createHmac('sha256', salt).update(password).digest('hex')
        const hashedPassword = UserService.generateHash(salt, password);

        return prismaClient.user.create({
            data:{
                firstName,
                lastName,
                email,
                salt,
                password: hashedPassword
            }
        })
    }

    private static getUserByEmail(email:string){
        return prismaClient.user.findUnique({
            where:{
                email
            }
        })
    }

    public static async getUserToken(payload:getUserTokenPayload){
        const {email, password} = payload;
        const user = await  UserService.getUserByEmail(email);
        
        if(!user) throw new Error('User not found');

        const userSalt = user.salt;
        const userHashPassword = UserService.generateHash(userSalt, password);

        if(userHashPassword !== user.password) throw new Error('Invalid password');

        //generate jwt token
        const secret = process.env.JWT_SECRET
        if(!secret) throw new Error('JWT secret not found')
            
        const token = jwt.sign({id:user.id, email:user.email}, secret, {expiresIn: '1h'})
        return token;
    }
}

export default UserService;