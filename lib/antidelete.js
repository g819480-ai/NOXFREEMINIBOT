
const { getAntideleteStatus } = require('../data/Antidelete');
const config = require('../config');

const handleAntidelete = async (conn, updates, store) => {
    try {
        const accountId = conn.user?.id
            ?.split(':')[0]
            ?.split('@')[0];

        if (!accountId) return;

        const inboxJid = `${accountId}@s.whatsapp.net`;

        for (const update of updates) {
            try {
                if (!update?.key || update.key.fromMe) continue;

                const messageUpdate = update.update || {};

                const isRevoke =
                    messageUpdate.messageStubType === 68 ||
                    messageUpdate.message?.protocolMessage?.type === 0 ||
                    messageUpdate.message === null;

                if (!isRevoke) continue;

                const chatId = update.key.remoteJid;
                const messageId = update.key.id;

                if (!chatId || !messageId) continue;

                // Each connected account has independent settings.
                const settingKey = `${accountId}:${chatId}`;
                const isEnabled = await getAntideleteStatus(settingKey);

                if (!isEnabled) continue;

                if (!store || !store.messages?.[chatId]) continue;

                const deletedMessage = await store.loadMessage(
                    chatId,
                    messageId
                );

                if (!deletedMessage) {
                    console.log('ANTIDELETE: Original message not found in cache.');
                    continue;
                }

                const participant =
                    update.key.participant || chatId;

                const alertText = [
                    '🚫 *ANTI-DELETE DETECTED* 🚫',
                    '',
                    `👤 *Sender:* @${participant.split('@')[0]}`,
                    `💬 *Chat:* ${chatId}`,
                    `🆔 *Message ID:* ${messageId}`,
                    `📅 *Date:* ${new Date().toLocaleString()}`,
                    '',
                    config.BOT_FOOTER || 'SCANTY MD BOT'
                ].join('\n');

                await conn.sendMessage(inboxJid, {
                    text: alertText,
                    mentions: [participant]
                });

                await conn.sendMessage(inboxJid, {
                    forward: deletedMessage
                });

                console.log(
                    `ANTIDELETE: Recovered message ${messageId} for account ${accountId}`
                );

            } catch (itemError) {
                console.error('ANTIDELETE ITEM ERROR:', itemError);
            }
        }
    } catch (error) {
        console.error('ANTIDELETE ERROR:', error);
    }
};

module.exports = { handleAntidelete };
