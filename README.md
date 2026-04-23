# AI Voice Receptionist: Emergency HVAC Triage

A production-ready Voice AI solution built for service-based businesses (HVAC, Plumbing, Electrical) to capture and triage emergency leads after hours.

## 🛠 Features
- **Real-Time Intent Classification:** Uses Claude 4.5 Sonnet to distinguish between general inquiries and service emergencies (e.g., furnace failure).
- **Automated SMS Dispatch:** Triggers an instant SMS alert to technicians via Twilio when an emergency is identified.
- **Latency Optimization:** Implements SSML (Speech Synthesis Markup Language) and the Twilio Telephony model for natural, low-latency conversation.
- **Smart Guardrailing:** Programmed to maintain business persona and resist "jailbreak" attempts or off-topic queries.
- **Persistent Logging:** Automatically generates `leads.txt` for a permanent audit trail of customer transcripts and callback numbers.

## 🧰 Tech Stack
- **Language:** Node.js (JavaScript)
- **Brain:** Anthropic Claude 4.5 Sonnet API
- **Voice/Telecom:** Twilio Programmable Voice (Polly.Amy)
- **Infrastructure:** Express.js, ngrok, dotenv

## 🚀 Setup Instructions
1. Clone the repository and run `npm install`.
2. Configure the `.env` file using the provided `.env.example` as a template.
3. **Interchangeable Brain:** To change the AI model (e.g., to upgrade to a newer version of Claude), simply update the `CLAUDE_MODEL` variable in your `.env` file. The system will automatically use the new model on the next restart without requiring code changes.
4. Start the server using `node server.js`.
5. Connect your Twilio Webhook to your public URL (via ngrok or permanent hosting).

