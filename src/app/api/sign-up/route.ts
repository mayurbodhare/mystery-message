import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import bcrypt from "bcryptjs";

import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request :Request) {
    await dbConnect();
    try {
        const {username, email, password} = await request.json();
        const existingUserVerifiedByUserName = await UserModel.findOne({
            username,
            isVerified:true
        })

        if (existingUserVerifiedByUserName) {
            return Response.json({
                    success : false,
                    message : "Username is already taken."
                }, 
                {
                    status : 400
                }
            )
        }

        const existingUserByEmail = await UserModel.findOne({
            email
        });

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

        if(existingUserByEmail){
            const hashedPassword = await bcrypt.hash(password, 10);
            existingUserByEmail.password = hashedPassword;
            existingUserByEmail.verifyCode = verifyCode;
            existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
            const savedUser = await existingUserByEmail.save();
        }else{
            const hashedPassword :string  = await bcrypt.hash(password, 10);
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);
            
            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified : false,
                isAcceptingMessage: true,
                messages: []
            })

            const savedUser = await newUser.save();
        }

        // send verification email
        const emailResponse = await sendVerificationEmail(
            email,
            username,
            verifyCode
        )

        if(!emailResponse.success){
            return Response.json({
                success : false,
                message : emailResponse.message
            }, {status:500})
        }

        return Response.json({
            success : true,
            message : "User registered successfully. please verify your email."
        }, {status:200})

    } catch (error) {
        console.error('Error while registering user : \n', error);
        return Response.json(
            {
                success : false,
                message : "Error registering user"
            },
            {
                status : 500
            }
        )
    }
}