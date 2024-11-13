import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
    email:string,
    username:string,
    verifyCode:string
) : Promise<ApiResponse> {
    try {
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: [email],
            subject: 'Mystry Messages | Verification Mail',
            react: VerificationEmail({username, otp : verifyCode}),
          });

        if (error)  {
            throw new Error("Error in Resend Email : " + error);
        }

        return {
            success : true,
            message :'Verification email sent Successfully.',
        }
    } catch (emailError) {
        console.log("Error in sending verification email: ", emailError);
        return {
            success : false,
            message :'Failed to send verification email.',
        }
    }
}