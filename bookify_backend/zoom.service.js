const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const base64 = require("base-64");
const nodemailer = require('nodemailer');
const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");
const dotenv = require("dotenv");

dotenv.config();

const zoomAccountId = process.env.ZOOM_ACCOUNT_ID;
const zoomClientId = process.env.ZOOM_CLIENT_ID;    
const zoomClientSecret = process.env.ZOOM_CLIENT_SECRET;

const getAuthHeaders = () => {
    return {
        Authorization: `Basic ${base64.encode(
            `${zoomClientId}:${zoomClientSecret}`
        )}`,
        "Content-Type": "application/json",
    };
};

const generateZoomAccessToken = async () => {
    console.log("generateZoomAccessToken --> ", zoomAccountId, zoomClientId, zoomClientSecret);
    try {
        const response = await fetch(
            `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${zoomAccountId}`,
            {
                method: "POST",
                headers: getAuthHeaders(),
            }
        );

        const jsonResponse = await response.json();

        return jsonResponse?.access_token;
    } catch (error) {
        console.log("generateZoomAccessToken Error --> ", error);
        throw error;
    }
};

const generateZoomMeeting = async (booking,businessDetails) => {

    console.log("generateZoomMeeting RUNNING!!!");
    const { firstName, lastName, email, service, date, timeSlot,status } = booking;
    const {businessName,email:businessEmail} = businessDetails;

    if(status === "confirmed"){
        try {
            const zoomAccessToken = await generateZoomAccessToken();
            
            const response = await fetch(
                `https://api.zoom.us/v2/users/me/meetings`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${zoomAccessToken}`,
                    },
                    body: JSON.stringify({
                        agenda: `Zoom Meeting for ${service}`,
                        default_password: false,
                        duration: 60,
                        password: "12345",
                        settings: {
                            allow_multiple_devices: true,
                            breakout_room: {
                                enable: true,
                                rooms: [
                                    {
                                        name: `${businessName}`,
                                        participants: [
                                            `${email}`,
                                            `${businessEmail}`,
                                        ],
                                    },
                                ],
                            },
                            calendar_type: 1,
                            contact_email: `${businessEmail}`,
                            contact_name: `${businessName}`,
                            email_notification: true,
                            encryption_type: "enhanced_encryption",
                            focus_mode: true,
                            // global_dial_in_countries: ["US"],
                            host_video: true,
                            join_before_host: true,
                            meeting_authentication: true,
                            meeting_invitees: [
                                {
                                    email: `${email}`,
                                    name: `${firstName} ${lastName}`,
                                    role: 1,
                                },
                                {
                                    email: `${businessEmail}`,
                                    name: `${businessName}`,
                                    role: 2,
                                },
                            ],
                            mute_upon_entry: true,
                            participant_video: true,
                            private_meeting: true,
                            waiting_room: false,
                            watermark: false,
                            continuous_meeting_chat: {
                                enable: true,
                            },
                        },
                        start_time: new Date().toLocaleDateString(),
                        timezone: "Asia/Kathmandu",
                        topic: `Zoom Meeting for ${service}`,
                        type: 2, // 1 -> Instant Meeting, 2 -> Scheduled Meeting
                    }),
                }
            );
            
            const jsonResponse = await response.json();
            const meetingLink = jsonResponse.join_url;
            const meetingId = jsonResponse.id;
            const passcode = jsonResponse.password;

            const zoomMeetingTemplate1 = fs.readFileSync(path.join(__dirname, './utils/zoomMeetingTemplate.html'), 'utf8');
            const template1 = handlebars.compile(zoomMeetingTemplate1);

            const zoomMeetingTemplate2 = fs.readFileSync(path.join(__dirname, './utils/zoomMeetingBusinessEmail.html'), 'utf8');
            const template2 = handlebars.compile(zoomMeetingTemplate2);


            const simplifiedDate = new Date(booking.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            const replacements1 = {
                firstName: firstName,
                lastName: lastName,
                date: simplifiedDate,
                time: timeSlot,
                service: service,
                businessName: businessName,
                phone: businessDetails.phone,
                email: businessEmail,
                zoomLink: meetingLink,
                meetingId: meetingId,
                passcode: passcode,
            };  

            const replacements2 = {
                firstName: firstName,
                lastName: lastName,
                date: simplifiedDate,
                time: timeSlot,
                service: service,
                businessName: businessName,
                phone: booking.phone,
                email:email,
                zoomLink: meetingLink,
                meetingId: meetingId,
                passcode: passcode,
            };  

            await sendEmail({
                to: `${email}`,
                subject: `Zoom Meeting for ${service}`,
                html: template1(replacements1),
            });

            await sendEmail({
                to: `${businessEmail}`,
                subject: `Zoom Meeting for ${service}`,
                html: template2(replacements2),
            });
            
            console.log("generateZoomMeeting JsonResponse --> ", jsonResponse);
        } catch (error) {
            console.log("generateZoomMeeting Error --> ", error);
            throw error;
        }
    }else{
        console.error("Booking is not confirmed. Please check the booking status.");
    }
};


const sendEmail = async ({ to, subject, html }) => {
  // Setup the transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.NODE_SENDER_EMAIL,
      pass: process.env.NODE_SENDER_PASS,
    },
  });

  // Email options
  const mailOptions = {
    from: process.env.NODE_SENDER_EMAIL,
    to,
    subject,
    html,
  };

  // Send email
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = {
    generateZoomMeeting,
};