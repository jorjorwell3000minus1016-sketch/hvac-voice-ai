require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const fs = require('fs');
const { Anthropic } = require('@anthropic-ai/sdk');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const processedCalls = new Set();

async function getAIResponse(userInput) {
    const msg = await anthropic.messages.create({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 1024,
        messages: [{ 
            role: "user", 
            content: `You are the voice receptionist for Arctic & Alpine HVAC. 
            TONE: Extremely brief and professional.
            RULES:
            1. If they have an emergency (no heat/AC), tell them a tech will call them back at this number within 60 minutes. 
            2. Do NOT ask for their address or name unless they insist.
            3. Once you've offered the callback, you MUST end the reply with: [DISPATCH]
            Customer Input: "${userInput}"` 
        }],
    });
    return msg.content[0].text; 
}

app.post('/voice', async (req, res) => {
    const twiml = new twilio.twiml.VoiceResponse();
    const customerSpeech = req.body.SpeechResult || "Hello";
    const callerId = req.body.From || "Unknown Number";
    const callSid = req.body.CallSid;

    console.log(`\n[CUSTOMER]: ${customerSpeech}`);

    try {
        const aiResponse = String(await getAIResponse(customerSpeech));
        console.log(`[CODA]: ${aiResponse}`);

        const logEntry = `\n[${new Date().toLocaleString()}] Caller: ${callerId}\nCUST: ${customerSpeech}\nCODA: ${aiResponse}\n---`;
        fs.appendFileSync('leads.txt', logEntry);

        const spokenResponse = aiResponse.replace(/\[DISPATCH\]/g, '').replace(/&/g, '&amp;');
        
        twiml.say({ voice: 'Polly.Amy' }, `<speak><prosody rate="105%">${spokenResponse}</prosody></speak>`);
        
        if (aiResponse.includes('[DISPATCH]') && !processedCalls.has(callSid)) {
            await client.messages.create({
                body: `🚨 EMERGENCY LEAD\nIssue: ${customerSpeech}\nCallback: ${callerId}`,
                from: process.env.TWILIO_NUMBER,
                to: process.env.MY_CELL_NUMBER
            });
            console.log("--- SUCCESS: SMS Dispatch Sent! ---");
            processedCalls.add(callSid);
        }

        twiml.gather({ 
            input: 'speech', 
            action: '/voice', 
            speechTimeout: 1.2,
            speechModel: 'telephony',
            enhanced: true 
        });

    } catch (error) {
        console.error("Error:", error.message);
        twiml.say("I'm having a connection issue. One moment.");
    }

    res.type('text/xml');
    res.send(twiml.toString());
});

app.listen(8080, () => console.log('Coda Switchboard is LIVE on Port 8080'));
