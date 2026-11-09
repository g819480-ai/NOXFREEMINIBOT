const { cmd } = require('../nox');
const {
    getUserConfigFromMongoDB,
    updateUserConfigInMongoDB
} = require('../lib/database');

cmd({
    pattern: 'statusreact',
    alias: ['autoreactstatus'],
    react: '🤡',
    desc: 'Automatically react to WhatsApp statuses',
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
                '*STATUS REACTION*\n\n' +
                'Use:\n' +
                '.statusreact on\n' +
                '.statusreact off'
            );
        }

        const enabled = action === 'on';
        const userConfig = await getUserConfigFromMongoDB(accountNumber);

        userConfig.AUTO_LIKE_STATUS = enabled ? 'true' : 'false';

        const saved = await updateUserConfigInMongoDB(
            accountNumber,
            userConfig
        );

        if (!saved) {
            return reply('Could not save your status reaction setting.');
        }

        return reply(
            enabled
                ? '✅ Automatic status reactions enabled.'
                : '❌ Automatic status reactions disabled.'
        );

    } catch (error) {
        console.error('STATUSREACT ERROR:', error);
        return reply('Status reaction error: ' + error.message);
    }
});
