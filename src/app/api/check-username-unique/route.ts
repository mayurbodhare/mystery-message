import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import { usernameValidation } from "@/schemas/signUpSchema";
import { z } from "zod";


const UsernameQuerySchema = z.object({
    username: usernameValidation
})

export async function GET(request: Request) {
    
    await dbConnect();
    try {
        const { searchParams } = new URL(request.url);
        const queryParam = {
            username: searchParams.get('username')
        }
        // validate with zod
        const result = UsernameQuerySchema.safeParse(queryParam);

        console.log("Result : ", result);
        if (!result.success) {
            const usernmaeErrors = result.error.format().username?._errors || [];

            return Response.json({
                success: false,
                message: usernmaeErrors?.length > 0 ? usernmaeErrors.join(', ') : 'Invalid query parameters',
            },
                {
                    status: 400
                }
            )
        }

        const { username } = result.data;

        const existingVerifiedUser = await UserModel.findOne({ username, isVerified: true })

        if (existingVerifiedUser) {
            return Response.json({
                success: false,
                message: 'Username is already taken.',
            },
                {
                    status: 400
                }
            )
        }

        return Response.json({
            success: true,
            message: 'Username is unique.',
        },
            {
                status: 200
            }
        )

    } catch (error) {
        console.error("Error checking username: ", error);
        return Response.json({
            success: false,
            message: "Error checking username:"
        },
            {
                status: 500
            }
        )
    }
}