const { cmd } = require('../nox');
const {
    getUserConfigFromMongoDB,
    updateUserConfigInMongoDB
} = require('../lib/database');

cmd({
    pattern: 'autoviewstatus',
    alias: ['avstatus'],
    react: '👀',
    desc: 'Automatically view WhatsApp statuses',
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
                '*AUTO VIEW STATUS*\n\n' +
                'Use:\n' +
                '.autoviewstatus on\n' +
                '.autoviewstatus off'
            );
        }

        const enabled = action === 'on';
        const userConfig = await getUserConfigFromMongoDB(accountNumber);

        userConfig.AUTO_VIEW_STATUS = enabled ? 'true' : 'false';

        const saved = await updateUserConfigInMongoDB(
            accountNumber,
            userConfig
        );

        if (!saved) {
            return reply('Could not save your status-viewing setting.');
        }

        return reply(
            enabled
                ? '✅ Automatic status viewing enabled.'
                : '❌ Automatic status viewing disabled.'
        );

    } catch (error) {
        console.error('AUTOVIEWSTATUS ERROR:', error);
        return reply('Error: ' + error.message);
    }
});
