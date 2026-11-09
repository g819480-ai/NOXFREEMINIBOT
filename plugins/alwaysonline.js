
const { cmd } = require('../nox');
const {
    getUserConfigFromMongoDB,
    updateUserConfigInMongoDB
} = require('../lib/database');

cmd({
    pattern: 'alwaysonline',
    alias: ['online'],
    react: '🟢',
    desc: 'Keep your WhatsApp account online',
    category: 'settings',
    filename: __filename
}, async (conn, mek, m, { args, reply }) => {
    try {
        const accountNumber = conn.user?.id
            ?.split(':')[0]
            ?.split('@')[0];

        if (!accountNumber) {
            return reply('Unable to identify this WhatsApp account.');
        }

        const action = (args?.[0] || '').toLowerCase();

        if (!['on', 'off'].includes(action)) {
            return reply(
                'ALWAYS ONLINE\n\n' +
                'Use:\n' +
                '.alwaysonline on\n' +
                '.alwaysonline off'
            );
        }

        const enabled = action === 'on';

        const userConfig = await getUserConfigFromMongoDB(accountNumber);

        userConfig.ALWAYS_ONLINE = enabled ? 'true' : 'false';

        const saved = await updateUserConfigInMongoDB(
            accountNumber,
            userConfig
        );

        if (!saved) {
            return reply('Could not save your online status setting.');
        }

        await conn.sendPresenceUpdate(
            enabled ? 'available' : 'unavailable'
        );

        return reply(
            enabled
                ? '✅ ALWAYS ONLINE ENABLED.'
                : '❌ ALWAYS ONLINE DISABLED.'
        );

    } catch (error) {
        console.error('ALWAYS ONLINE ERROR:', error);
        return reply('Always online error: ' + error.message);
    }
});
