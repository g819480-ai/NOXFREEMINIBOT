
const mongoose = require('mongoose');
const config = require('../config');
const { BufferJSON, proto } = require('@whiskeysockets/baileys');

// ====================================
// SCANTY MD BOT - DATABASE CONNECTION
// ====================================

const connectdb = async () => {
    try {
        mongoose.set('strictQuery', false);

        await mongoose.connect(config.MONGODB_URI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });

        console.log('✅ SCANTY MD BOT: MongoDB connected successfully');
        return true;
    } catch (error) {
        console.error(
            '❌ SCANTY MD BOT: MongoDB connection failed:',
            error.message
        );

        throw error;
    }
};

// ====================================
// BAILEYS DATA SERIALIZATION
// ====================================

function serializeBaileys(data) {
    return JSON.stringify(data, BufferJSON.replacer);
}

function deserializeBaileys(data) {
    if (data === null || data === undefined) return data;

    if (typeof data === 'string') {
        return JSON.parse(data, BufferJSON.reviver);
    }

    return JSON.parse(
        JSON.stringify(data),
        BufferJSON.reviver
    );
}

function cleanNumber(number) {
    return String(number || '').replace(/[^0-9]/g, '');
}

// ====================================
// DEFAULT USER CONFIGURATION
// ====================================

const DEFAULT_CONFIG = {
    AUTO_RECORDING: 'false',
    AUTO_TYPING: 'false',
    ALWAYS_ONLINE: 'true',
    ANTI_CALL: 'false',

    REJECT_MSG:
        '*🔕 ʏᴏᴜʀ ᴄᴀʟʟ ᴡᴀs ᴀᴜᴛᴏᴍᴀᴛɪᴄᴀʟʟʏ ʀᴇᴊᴇᴄᴛᴇᴅ..!',

    READ_MESSAGE: 'false',
    AUTO_VIEW_STATUS: 'true',
    AUTO_LIKE_STATUS: 'true',
    AUTO_STATUS_REPLY: 'false',
    AUTO_STATUS_MSG: 'ohhhh. 🤭',

    AUTO_LIKE_EMOJI: ['❤️', '👍', '😮', '😎'],

    AUTO_REACT: 'false',

    AUTO_REACT_EMOJI: [
        '👀', '🫀', '🧡', '❤️‍🩹', '❣️', '💖',
        '💝', '🦋', '😘', '🤍', '🥰', '🌝',
        '💨', '🌟', '✨', '🫦', '💐', '🌺',
        '🪷', '🍄', '🍁', '🪴', '🥀', '🌈',
        '🌒', '🌓', '🌔', '🌕', '🌖', '🌗',
        '🌘', '🌑', '🪽', '🍒', '🍇', '🥖',
        '🥢', '🛟', '🎀', '🎗️', '🎈', '🎱',
        '🪀', '🪄', '🪡', '🧷', '🧣', '💍',
        '🧸', '🔗', '🖇️', '🗞️', '📅', '🔮',
        '♏', '🇰🇼', '🏳️'
    ],

    PRIVATE_MODE: 'false'
};

// ====================================
// MONGOOSE MODELS
// ====================================

// Original session collection.
// credentialsData is added without removing
// the original credentials field.

const sessionSchema = new mongoose.Schema({
    number: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    credentials: {
        type: Object,
        required: true
    },

    credentialsData: {
        type: String,
        default: null
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Separate persistent Baileys Signal-key collection.

const sessionKeySchema = new mongoose.Schema({
    number: {
        type: String,
        required: true
    },

    type: {
        type: String,
        required: true
    },

    id: {
        type: String,
        required: true
    },

    data: {
        type: String,
        required: true
    },

    updatedAt: {
        type: Date,
        default: Date.now
    }
});

sessionKeySchema.index(
    { number: 1, type: 1, id: 1 },
    { unique: true }
);

// Original user configuration collection.

const userConfigSchema = new mongoose.Schema({
    number: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    config: {
        AUTO_RECORDING: {
            type: String,
            default: 'false'
        },

        AUTO_TYPING: {
            type: String,
            default: 'false'
        },
       ALWAYS_ONLINE: {
    type: String,
    default: 'true'
},

        ANTI_CALL: {
            type: String,
            default: 'false'
        },

        REJECT_MSG: {
            type: String,
            default: DEFAULT_CONFIG.REJECT_MSG
        },

        READ_MESSAGE: {
            type: String,
            default: 'false'
        },

        AUTO_VIEW_STATUS: {
            type: String,
            default: 'true'
        },

        AUTO_LIKE_STATUS: {
            type: String,
            default: 'true'
        },

        AUTO_STATUS_REPLY: {
            type: String,
            default: 'false'
        },

        AUTO_STATUS_MSG: {
            type: String,
            default: 'ohhhh. 🤭'
        },

        AUTO_LIKE_EMOJI: {
            type: Array,
            default: () => [...DEFAULT_CONFIG.AUTO_LIKE_EMOJI]
        },

        AUTO_REACT: {
            type: String,
            default: 'false'
        },

        AUTO_REACT_EMOJI: {
            type: Array,
            default: () => [...DEFAULT_CONFIG.AUTO_REACT_EMOJI]
        },

        PRIVATE_MODE: {
            type: String,
            default: 'false'
        }
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Original OTP collection.

const otpSchema = new mongoose.Schema({
    number: {
        type: String,
        required: true,
        index: true
    },

    otp: {
        type: String,
        required: true
    },

    config: {
        type: Object,
        required: true
    },

    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 5 * 60000),
        index: { expires: '5m' }
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Original active-number collection.

const activeNumberSchema = new mongoose.Schema({
    number: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    lastConnected: {
        type: Date,
        default: Date.now
    },

    isActive: {
        type: Boolean,
        default: true
    },

    connectionInfo: {
        ip: String,
        userAgent: String,
        timestamp: Date
    }
});

// Original statistics collection.

const statsSchema = new mongoose.Schema({
    number: {
        type: String,
        required: true
    },

    date: {
        type: String,
        required: true
    },

    commandsUsed: {
        type: Number,
        default: 0
    },

    messagesReceived: {
        type: Number,
        default: 0
    },

    messagesSent: {
        type: Number,
        default: 0
    },

    groupsInteracted: {
        type: Number,
        default: 0
    }
});

// ====================================
// MODEL REGISTRATION
// ====================================

const Session =
    mongoose.models.Session ||
    mongoose.model('Session', sessionSchema);

const SessionKey =
    mongoose.models.SessionKey ||
    mongoose.model('SessionKey', sessionKeySchema);

const UserConfig =
    mongoose.models.UserConfig ||
    mongoose.model('UserConfig', userConfigSchema);

const OTP =
    mongoose.models.OTP ||
    mongoose.model('OTP', otpSchema);

const ActiveNumber =
    mongoose.models.ActiveNumber ||
    mongoose.model('ActiveNumber', activeNumberSchema);

const Stats =
    mongoose.models.Stats ||
    mongoose.model('Stats', statsSchema);

// ====================================
// MONGODB BAILEYS AUTHENTICATION
// ====================================

// Save WhatsApp credentials.

async function saveSessionToMongoDB(number, credentials) {
    try {
        const clean = cleanNumber(number);
        if (!clean) throw new Error('Invalid phone number');

        const encoded = serializeBaileys(credentials);
        const plain = JSON.parse(encoded);

        await Session.findOneAndUpdate(
            { number: clean },
            {
                $set: {
                    credentials: plain,
                    credentialsData: encoded,
                    updatedAt: new Date()
                }
            },
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true
            }
        );

        console.log(`💾 SCANTY MD BOT: Credentials saved for ${clean}`);
        return true;

    } catch (error) {
        console.error('❌ Credential save error:', error.message);
        return false;
    }
}

// Retrieve WhatsApp credentials.

async function getSessionFromMongoDB(number) {
    try {
        const clean = cleanNumber(number);
        if (!clean) return null;

        const session = await Session.findOne({
            number: clean
        }).lean();

        if (!session) return null;

        if (session.credentialsData) {
            return deserializeBaileys(session.credentialsData);
        }

        // Backward compatibility with original saved records.
        return deserializeBaileys(session.credentials);

    } catch (error) {
        console.error('❌ Credential retrieval error:', error.message);
        return null;
    }
}

// Persistent Signal-key store.
// Compatible with Baileys keys.get() and keys.set().

function createMongoKeyStore(number) {
    const clean = cleanNumber(number);

    return {
        async get(type, ids) {
            if (!clean || !Array.isArray(ids) || !ids.length) {
                return {};
            }

            const documents = await SessionKey.find({
                number: clean,
                type,
                id: { $in: ids.map(String) }
            }).lean();

            const result = {};

            for (const document of documents) {
                let value = deserializeBaileys(document.data);

                if (type === 'app-state-sync-key' && value) {
                    value = proto.Message.AppStateSyncKeyData.fromObject(value);
                }

                result[document.id] = value;
            }

            return result;
        },

        async set(data) {
            if (!clean || !data || typeof data !== 'object') {
                return;
            }

            const operations = [];

            for (const [type, entries] of Object.entries(data)) {
                if (!entries || typeof entries !== 'object') continue;

                for (const [id, value] of Object.entries(entries)) {
                    if (value === null || value === undefined) {
                        operations.push(
                            SessionKey.deleteOne({
                                number: clean,
                                type,
                                id: String(id)
                            })
                        );
                    } else {
                        const encoded = serializeBaileys(value);

                        operations.push(
                            SessionKey.findOneAndUpdate(
                                {
                                    number: clean,
                                    type,
                                    id: String(id)
                                },
                                {
                                    $set: {
                                        data: encoded,
                                        updatedAt: new Date()
                                    }
                                },
                                {
                                    upsert: true,
                                    new: true
                                }
                            )
                        );
                    }
                }
            }

            await Promise.all(operations);
        }
    };
}

// Get complete MongoDB authentication state.

async function getMongoAuthState(number) {
    const clean = cleanNumber(number);

    return {
        creds: await getSessionFromMongoDB(clean),
        keys: createMongoKeyStore(clean)
    };
}

// Delete session and its Signal keys.

async function deleteSessionFromMongoDB(number) {
    try {
        const clean = cleanNumber(number);
        if (!clean) return false;

        await Promise.all([
            Session.deleteOne({ number: clean }),
            SessionKey.deleteMany({ number: clean }),
            ActiveNumber.deleteOne({ number: clean })
        ]);

        console.log(`🗑️ SCANTY MD BOT: Session deleted for ${clean}`);
        return true;

    } catch (error) {
        console.error('❌ Session deletion error:', error.message);
        return false;
    }
}

// ====================================
// USER CONFIGURATION
// ====================================

async function getUserConfigFromMongoDB(number) {
    try {
        const clean = cleanNumber(number);
        if (!clean) return {};

        let user = await UserConfig.findOne({
            number: clean
        });

        if (user) {
            return {
                ...DEFAULT_CONFIG,
                ...user.config
            };
        }

        user = await UserConfig.create({
            number: clean,
            config: { ...DEFAULT_CONFIG }
        });

        return {
            ...DEFAULT_CONFIG,
            ...user.config
        };

    } catch (error) {
        console.error('❌ User config retrieval error:', error.message);
        return {};
    }
}

async function updateUserConfigInMongoDB(number, newConfig) {
    try {
        const clean = cleanNumber(number);
        if (!clean || !newConfig || typeof newConfig !== 'object') {
            return false;
        }

        await UserConfig.findOneAndUpdate(
            { number: clean },
            {
                $set: {
                    config: newConfig,
                    updatedAt: new Date()
                }
            },
            {
                upsert: true,
                new: true
            }
        );

        console.log(`⚙️ SCANTY MD BOT: Config updated for ${clean}`);
        return true;

    } catch (error) {
        console.error('❌ Config update error:', error.message);
        return false;
    }
}

// ====================================
// OTP MANAGEMENT
// ====================================

async function saveOTPToMongoDB(number, otp, userConfig) {
    try {
        const clean = cleanNumber(number);
        if (!clean) return false;

        await OTP.create({
            number: clean,
            otp: String(otp),
            config: userConfig
        });

        console.log(`🔐 SCANTY MD BOT: OTP saved for ${clean}`);
        return true;

    } catch (error) {
        console.error('❌ OTP save error:', error.message);
        return false;
    }
}

async function verifyOTPFromMongoDB(number, otp) {
    try {
        const clean = cleanNumber(number);

        const record = await OTP.findOne({
            number: clean,
            otp: String(otp),
            expiresAt: { $gt: new Date() }
        });

        if (!record) {
            return {
                valid: false,
                error: 'Invalid or expired OTP'
            };
        }

        await OTP.deleteOne({ _id: record._id });

        return {
            valid: true,
            config: record.config
        };

    } catch (error) {
        console.error('❌ OTP verification error:', error.message);

        return {
            valid: false,
            error: 'Verification error'
        };
    }
}

// ====================================
// ACTIVE NUMBER MANAGEMENT
// ====================================

async function addNumberToMongoDB(number) {
    try {
        const clean = cleanNumber(number);
        if (!clean) return false;

        await ActiveNumber.findOneAndUpdate(
            { number: clean },
            {
                $set: {
                    lastConnected: new Date(),
                    isActive: true
                }
            },
            {
                upsert: true,
                new: true
            }
        );

        return true;

    } catch (error) {
        console.error('❌ Active number save error:', error.message);
        return false;
    }
}

async function removeNumberFromMongoDB(number) {
    try {
        const clean = cleanNumber(number);
        if (!clean) return false;

        await ActiveNumber.deleteOne({ number: clean });
        return true;

    } catch (error) {
        console.error('❌ Active number removal error:', error.message);
        return false;
    }
}

async function getAllNumbersFromMongoDB() {
    try {
        const numbers = await ActiveNumber.find({
            isActive: true
        }).lean();

        return numbers.map(item => item.number);

    } catch (error) {
        console.error('❌ Active number retrieval error:', error.message);
        return [];
    }
}

// ====================================
// STATISTICS
// ====================================

const ALLOWED_STATS = [
    'commandsUsed',
    'messagesReceived',
    'messagesSent',
    'groupsInteracted'
];

async function incrementStats(number, field) {
    try {
        const clean = cleanNumber(number);

        if (!clean || !ALLOWED_STATS.includes(field)) {
            return false;
        }

        const today = new Date().toISOString().split('T')[0];

        await Stats.findOneAndUpdate(
            {
                number: clean,
                date: today
            },
            {
                $inc: { [field]: 1 }
            },
            {
                upsert: true,
                new: true
            }
        );

        return true;

    } catch (error) {
        console.error('❌ Statistics update error:', error.message);
        return false;
    }
}

async function getStatsForNumber(number) {
    try {
        const clean = cleanNumber(number);

        return await Stats.find({
            number: clean
        })
            .sort({ date: -1 })
            .limit(30);

    } catch (error) {
        console.error('❌ Statistics retrieval error:', error.message);
        return [];
    }
}
   
// ====================================
// ADMIN: PERMANENTLY DELETE USER DATA
// ====================================

async function adminDeleteUserData(number) {
    try {
        const clean = cleanNumber(number);

        if (!clean) {
            throw new Error('Invalid phone number');
        }

        await Promise.all([
            Session.deleteOne({ number: clean }),
            SessionKey.deleteMany({ number: clean }),
            ActiveNumber.deleteOne({ number: clean }),
            UserConfig.deleteOne({ number: clean }),
            OTP.deleteMany({ number: clean }),
            Stats.deleteMany({ number: clean })
        ]);

        console.log(`🗑️ ADMIN: All data deleted for ${clean}`);

        return true;

    } catch (error) {
        console.error('❌ Admin deletion failed:', error.message);
        return false;
    }
}

// ====================================
// EXPORTS
// ====================================

module.exports = {
    connectdb,

    Session,
    SessionKey,
    UserConfig,
    OTP,
    ActiveNumber,
    Stats,

    // Original session functions
    saveSessionToMongoDB,
    getSessionFromMongoDB,
    deleteSessionFromMongoDB,
    adminDeleteUserData,
    // New persistent Baileys authentication
    createMongoKeyStore,
    getMongoAuthState,

    // Configuration
    getUserConfigFromMongoDB,
    updateUserConfigInMongoDB,

    // OTP
    saveOTPToMongoDB,
    verifyOTPFromMongoDB,

    // Active numbers
    addNumberToMongoDB,
    removeNumberFromMongoDB,
    getAllNumbersFromMongoDB,

    // Statistics
    incrementStats,
    getStatsForNumber,

    // Compatibility exports
    getUserConfig: async (number) => {
        const result = await getUserConfigFromMongoDB(number);
        return result || {};
    },

    updateUserConfig: updateUserConfigInMongoDB
};
