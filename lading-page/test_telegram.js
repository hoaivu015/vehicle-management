
const TELEGRAM_TOKEN = '8354150269:AAF2da1-GZAXNgDVplWot053UDETG7CX5ss';
const TELEGRAM_CHAT_ID = '2117317097';

async function testTelegram() {
    console.log("Testing Telegram Bot...");
    try {
        // Test Token first
        const meRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/getMe`);
        const meData = await meRes.json();
        console.log("Bot Info:", JSON.stringify(meData, null, 2));

        if (!meData.ok) {
            console.error("Token is invalid!");
            return;
        }

        // Test sending message
        const sendRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: "Test message from server script. If you see this, the bot works!"
            })
        });
        const sendData = await sendRes.json();
        console.log("Send Message Result:", JSON.stringify(sendData, null, 2));

    } catch (err) {
        console.error("Fetch Error:", err);
    }
}

testTelegram();
