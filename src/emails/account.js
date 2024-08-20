const sgMail = require('@sendgrid/mail')
require('dotenv').config({ path: '/home/juhi/Techs/node/task-manager/config/dev.env' })

const apiKey = process.env.SENDGRIDAPIKEY

sgMail.setApiKey(apiKey)


// sgMail.send({
//     to: 'bhojanijuhi03@gmail.com', // Change to your recipient
//     from: 'juhi.bhojani@argusoft.in', // Change to your verified sender
//     subject: 'Sending with SendGrid is Fun',
//     text: 'and easy to do anywhere, even with Node.js',
//     html: '<strong>and easy to do anywhere, even with Node.js</strong>',
// })
// .then((data)=>{
//     console.log("done")
// })


const sendWelcomeEmail = async (email,name) =>{
    const post = {
        to:email,
        from:"juhi.bhojani@argusoft.in",
        subject:"Thanks for joining in!",
        text:`Welcome to the app ${name}. Feel free to let me know how you get along with the app`
    }
    await sgMail.send(post)
}


const sendCancellationEmail = async (email,name) =>{
    const post = {
        to:email,
        from:"juhi.bhojani@argusoft.in",
        subject:"Sorry to see you go!",
        text:`Hey ${name}. Please let us know why you left us`
    }
    await sgMail.send(post)
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}