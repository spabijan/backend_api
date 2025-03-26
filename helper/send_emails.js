const {SESClient, SendEmailCommand} = require('@aws-sdk/client-ses');

require('dotenv').config();

const client = new SESClient({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey:  process.env.AWS_SECRET_ACCESS_KEY_ID,
    },
    region: process.env.AWS_REGION,
});


const generateOtpEmail = (otp) => {
    return `
    <html lang="en">
        <body>
            <h1>Welcome to ${process.env.APP_NAME}</h1>
            <p>Your One-Time password for email verification is: </p>
            <p>${otp}</p>
            <p>please endter this TOP to verify your email address. This code is valid for the next 10 minutes</p>
            <p>if you did not request this, please ignore this email</p>
        </body>
    </html>
    `
}

const sendOtpEmail = async (email, otp) => {
    const params = {
        Source: process.env.EMAIL_FROM,
        ReplyToAddress: [process.env.EMAIL_TO],
        Destination: {
            ToAddresses: [email],
        },
        Message: {
            Body: {
                Html: {
                    Charset: 'utf-8',
                    Data: generateOtpEmail(otp),
                }
            },
            Subject: {
                Charset: 'utf-8',
                Data: `Kitku-store email verification`,
            }
        }
    }
    const command = new SendEmailCommand(params);

    try {
        return await client.send(command);
    } catch (e) {
        console.log()
        throw e;
    }
}

module.exports = sendOtpEmail;
