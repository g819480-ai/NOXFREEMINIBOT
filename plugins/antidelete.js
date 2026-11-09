const { cmd } = require('../nox');
const { setAntideleteStatus } = require('../data/Antidelete');
const style = require('../lib/style');

cmd({
    pattern: 'antidelete',
    alias: ['antidel'],
    react: '🛡️',
    desc: 'Enable or disable deleted message recovery',
    category: 'settings',
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        const accountId = conn.user?.id
            ?.split(':')[0]
            ?.split('@')[0];

        if (!accountId) {
            return reply('Unable to identify this bot account.');
        }

        const action = (args?.[0] || '').toLowerCase();

        if (!['on', 'off'].includes(action)) {
            return reply(
                'ANTIDELETE\n\nUse:\n.antidelete on\n.antidelete off'
            );
        }

        const accountChatKey = `${accountId}:${from}`;
        const enabled = action === 'on';

        const saved = await setAntideleteStatus(
            accountChatKey,
            enabled
        );

        if (!saved) {
            return reply('Could not save antidelete settings.');
        }

        return reply(
            enabled
                ? '✅ ANTIDELETE ENABLED. Deleted messages will be sent to this bot account inbox.'
                : '❌ ANTIDELETE DISABLED.'
        );

    } catch (error) {
        console.error('ANTIDELETE COMMAND ERROR:', error);
        return reply('Antidelete error: ' + error.message);
    }
});
