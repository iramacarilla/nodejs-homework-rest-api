const fs = require('fs');

const jimp = require('jimp');
const { nanoid } = require('nanoid');
const User = require('../schemas/userSchema')
const sgMail = require('@sendgrid/mail')
const Mailgen = require('mailgen')

//const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY

const findById = async id => {
  const user = await User.findById(id)/*{_id: id}*/
  return user

}
const findByEmail = async email => {
    const user = await User.findOne({email})
    return user
  }

  /*const createNewUser = async ({email, password, subscription, token}) => {
    const verificationToken = nanoid()
      const user = await new User({email, password, subscription, token, verificationToken }).save()
      return user
  }*/
  const updateToken = async (id, token) => {
     const user = await User.updateOne({_id: id}, {token})
    return user
  }
  const updateUser = async (id, subscription) => {
    const user = await User.findByIdAndUpdate({ _id: id}, {subscription}, { new: true })
    return user
  }
  const updateAvatar = async (id, avatarURL) => {
    const user = await User.findByIdAndUpdate({ _id: id}, {avatarURL},  { new: true })
    return user
  }
  const verifyUser = async ({verificationToken}) => {
    console.log(verificationToken);
    const user = await User.findOne({verifyToken: verificationToken})
    if(user) {
      await user.updateOne({verifyToken: null, verify: true})
      return true
    }
    return false
  }
  
  const createTemplate = async ({verifyToken, username}) => {
    const mailGenerator = await new Mailgen({
      theme: 'default',
      product: {
          name: 'ContactsSystem',
          link: 'http://localhost:3000/'
      }
  });
  
  const email =  {
    body: {
        name: username,
        intro: 'Welcome to ContactsSystem! We\'re very excited to have you on board.',
        action: {
            instructions: 'To get started with ContactsSystem, please click here:',
            button: {
                color: '#22BC66', 
                text: 'Confirm your account',
                link: `http://localhost:3000/api/users/verify/${verifyToken}`
            }
        },
        outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
    }
  
};
console.log(`http://localhost:3000/api/users/verify/${verifyToken}`)
const emailBody = await mailGenerator.generate(email);
return emailBody
  }

const sendEmail = async ({verifyToken, username, email}) => {
  const emailBody = await createTemplate({verifyToken, email, username})
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const msg =  {
  to: email,
  from: 'ikosynienko@gmail.com', // Use the email address or domain you verified above
  subject: 'Sending with Twilio SendGrid is Fun',
  html: emailBody ,
};
console.log(email);
//ES6
await sgMail
  .send(msg)
  .then(() => {}, error => {
    console.error(error);

    if (error.response) {
      console.error(error.response.body)
    }
  });
//ES8

} 

  module.exports = {
    findById,
    findByEmail,
    //createNewUser,
    updateToken,
    updateUser,
    updateAvatar,
    verifyUser,
    sendEmail
 
  }