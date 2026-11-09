const { cmd } = require('../nox');
const {
    getUserConfigFromMongoDB,
    updateUserConfigInMongoDB
} = require('../lib/database');

cmd({
    pattern: 'autoreact',
    alias: ['areact'],
    react: '🤡',
    desc: 'Automatically react to private messages',
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
                '*PRIVATE AUTO REACT*\n\n' +
                'Use:\n' +
                '.autoreact on\n' +
                '.autoreact off'
            );
        }

        const userConfig = await getUserConfigFromMongoDB(accountNumber);
        userConfig.AUTO_REACT = action === 'on' ? 'true' : 'false';

        const saved = await updateUserConfigInMongoDB(
            accountNumber,
            userConfig
        );

        if (!saved) {
            return reply('Could not save your auto-reaction setting.');
        }

        return reply(
            action === 'on'
                ? '✅ Private auto-reactions enabled.'
                : '❌ Private auto-reactions disabled.'
        );

    } catch (error) {
        console.error('AUTOREACT ERROR:', error);
        return reply('Auto-react error: ' + error.message);
    }
});
