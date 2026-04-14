import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Set up Nodemailer with Ethereal (Fake SMTP)
let transporter: nodemailer.Transporter;
nodemailer.createTestAccount((err, account) => {
    if (err) {
        console.error('Failed to create a testing account. ' + err.message);
        return process.exit(1);
    }
    transporter = nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: {
            user: account.user,
            pass: account.pass
        }
    });
    console.log(`Nodemailer Ethereal Account Ready: ${account.user}`);
});

const sendBookingEmail = async (meeting: any, eventType: any, isReschedule = false) => {
    if(!transporter) return;
    
    // Generate rescheduling link
    const rescheduleLink = `http://localhost:5173/reschedule/${meeting.id}`;

    let message = {
        from: 'Calendly Clone <noreply@calendlyclone.com>',
        to: meeting.inviteeEmail,
        subject: isReschedule ? `Re: Updated Invitation: ${eventType.name}` : `Invitation: ${eventType.name}`,
        html: `
            <h2>${isReschedule ? 'Meeting Rescheduled' : 'Meeting Confirmed'}</h2>
            <p>Hi ${meeting.inviteeName},</p>
            <p>Your meeting <b>${eventType.name}</b> has been successfully scheduled.</p>
            <p><b>Time:</b> ${new Date(meeting.startTime).toLocaleString()} - ${new Date(meeting.endTime).toLocaleString()}</p>
            <br/>
            <p>Need to make changes? <a href="${rescheduleLink}">Reschedule Event</a></p>
        `
    };

    const info = await transporter.sendMail(message);
    console.log(`\n\x1b[36m========== EMAIL SENT ==========\x1b[0m`);
    console.log(`Preview Email URL: \x1b[34m${nodemailer.getTestMessageUrl(info)}\x1b[0m`);
    console.log(`\x1b[36m================================\x1b[0m\n`);
};


// Event Types Endpoints
app.get('/api/event-types', async (req, res) => {
  try {
    const eventTypes = await prisma.eventType.findMany();
    res.json(eventTypes);
  } catch (err: any) { res.status(500).json({error: err.message}); }
});

app.post('/api/event-types', async (req, res) => {
  try {
    const { name, duration, slug, description, bufferTime } = req.body;
    const eventType = await prisma.eventType.create({
        data: { name, duration, slug, description, bufferTime: bufferTime || 0 }
    });
    res.json(eventType);
  } catch (err: any) { res.status(400).json({error: err.message}); }
});

app.put('/api/event-types/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, duration, slug, description, bufferTime } = req.body;
    const eventType = await prisma.eventType.update({
        where: { id },
        data: { name, duration, slug, description, bufferTime: bufferTime || 0 }
    });
    res.json(eventType);
  } catch (err: any) { res.status(400).json({error: err.message}); }
});

app.delete('/api/event-types/:id', async (req, res) => {
  try {
    await prisma.eventType.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err: any) { res.status(400).json({error: err.message}); }
});

// Availability Endpoints
app.get('/api/availability', async (req, res) => {
  try {
    const availability = await prisma.availability.findMany({
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
    });
    res.json(availability);
  } catch (err: any) { res.status(500).json({error: err.message}); }
});

app.post('/api/availability', async (req, res) => {
  try {
    const { availabilities } = req.body; // Array of {dayOfWeek, startTime, endTime}
    await prisma.$transaction([
      prisma.availability.deleteMany({}),
      prisma.availability.createMany({ data: availabilities })
    ]);
    res.json({ success: true });
  } catch (err: any) { res.status(400).json({error: err.message}); }
});

// Meetings Endpoints
app.get('/api/meetings', async (req, res) => {
  try {
    const meetings = await prisma.meeting.findMany({
        include: { eventType: true },
        orderBy: { startTime: 'desc' }
    });
    res.json(meetings);
  } catch (err: any) { res.status(400).json({error: err.message}); }
});

app.get('/api/meetings/:id', async (req, res) => {
    try {
      const meeting = await prisma.meeting.findUnique({
          where: { id: req.params.id },
          include: { eventType: true }
      });
      res.json(meeting);
    } catch (err: any) { res.status(400).json({error: err.message}); }
});

app.post('/api/meetings', async (req, res) => {
  try {
    const { eventTypeId, inviteeName, inviteeEmail, startTime, endTime } = req.body;
    
    // Check overlap with buffer
    const eventType = await prisma.eventType.findUnique({ where: { id: eventTypeId }});
    if(!eventType) return res.status(404).json({error: 'Event type not found'});
    
    // Compute buffer padding
    const buffer = eventType.bufferTime || 0;
    const requestedStart = new Date(new Date(startTime).getTime() - buffer * 60000);
    const requestedEnd = new Date(new Date(endTime).getTime() + buffer * 60000);

    const overlapping = await prisma.meeting.findFirst({
        where: {
            status: 'booked',
            OR: [
                { startTime: { lt: requestedEnd, gte: requestedStart } },
                { endTime: { gt: requestedStart, lte: requestedEnd } },
                { startTime: { lte: requestedStart }, endTime: { gte: requestedEnd } }
            ]
        }
    });

    if (overlapping) {
        return res.status(400).json({ error: 'Time slot already booked or restricted by buffer overrides' });
    }

    const meeting = await prisma.meeting.create({
        data: { 
            eventTypeId, 
            inviteeName, 
            inviteeEmail, 
            startTime: new Date(startTime), 
            endTime: new Date(endTime) 
        }
    });

    // Send email notification non-blocking
    sendBookingEmail(meeting, eventType).catch(console.error);

    res.json(meeting);
  } catch (err: any) { res.status(400).json({error: err.message}); }
});

app.post('/api/meetings/:id/reschedule', async (req, res) => {
    try {
        const { startTime, endTime } = req.body;
        const oldMeeting = await prisma.meeting.findUnique({
            where: { id: req.params.id },
            include: { eventType: true }
        });
        
        if(!oldMeeting) return res.status(404).json({error: "Meeting not found"});
        
        const buffer = oldMeeting.eventType.bufferTime || 0;
        const requestedStart = new Date(new Date(startTime).getTime() - buffer * 60000);
        const requestedEnd = new Date(new Date(endTime).getTime() + buffer * 60000);
  
        // We ensure overlap ignores the CURRENT meeting ID being rescheduled
        const overlapping = await prisma.meeting.findFirst({
            where: {
                id: { not: oldMeeting.id },
                status: 'booked',
                OR: [
                    { startTime: { lt: requestedEnd, gte: requestedStart } },
                    { endTime: { gt: requestedStart, lte: requestedEnd } },
                    { startTime: { lte: requestedStart }, endTime: { gte: requestedEnd } }
                ]
            }
        });
  
        if (overlapping) {
            return res.status(400).json({ error: 'Time slot already booked' });
        }
  
        const updatedMeeting = await prisma.meeting.update({
            where: { id: oldMeeting.id },
            data: { startTime: new Date(startTime), endTime: new Date(endTime) }
        });

        sendBookingEmail(updatedMeeting, oldMeeting.eventType, true).catch(console.error);

        res.json(updatedMeeting);
    } catch(err: any) { res.status(400).json({error: err.message}); }
});

app.post('/api/meetings/:id/cancel', async (req, res) => {
  try {
    const meeting = await prisma.meeting.update({
        where: { id: req.params.id },
        data: { status: 'canceled' }
    });
    res.json(meeting);
  } catch (err: any) { res.status(400).json({error: err.message}); }
});

// Seed data route for testing
app.post('/api/seed', async (req, res) => {
    try {
        await prisma.eventType.deleteMany({});
        await prisma.availability.deleteMany({});
        await prisma.meeting.deleteMany({});
        
        await prisma.eventType.create({
            data: { name: '15 Minute Meeting', duration: 15, slug: '15min', bufferTime: 5, description: "Quick sync call." }
        });
        await prisma.eventType.create({
            data: { name: '30 Minute Meeting', duration: 30, slug: '30min', bufferTime: 10, description: "Standard meeting." }
        });
        
        const availabilityData = [1,2,3,4,5].map(day => ({
            dayOfWeek: day,
            startTime: '09:00',
            endTime: '17:00'
        }));
        await prisma.availability.createMany({ data: availabilityData });
        
        res.json({ success: true });
    } catch(err: any) { res.status(400).json({error: err.message}); }
});

app.listen(3001, () => {
  console.log('Backend server running on http://localhost:3001');
});
