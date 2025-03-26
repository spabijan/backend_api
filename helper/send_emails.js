const {SESClient, SendEmailCommand} = require('@aws-sdk/client-ses');

require('dotenv').config();

const client = new SESClient({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey:  process.env.AWS_SECRET_ACCESS_KEY_ID,
    },
    region: process.env.AWS_REGION,
});


const generateWelcomeEmailHTML = () => {
    return `
    <html lang="en">
        <body>
            <h1>Welcome to ${process.env.APP_NAME}</h1>
        </body>
    </html>
    `
}

const sendWelcomeEmail = async (email) => {
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
                    Data: generateWelcomeEmailHTML(),
                }
            },
            Subject: {
                Charset: 'utf-8',
                Data: `Welcome to ${process.env.APP_NAME}`,
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

module.exports = sendWelcomeEmail;
