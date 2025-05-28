// src/utils/constants.js
export const DEFAULT_COUNTER = 0;
export const PROTOTYPE_SALT_FOR_MASTER_KEY = "default_prototype_salt_for_all_users_MAKE_ME_UNIQUE_PER_USER";

// Karakter setleri
export const CHAR_SETS = {
    'v': "aeiou",
    'V': "AEIOU",
    'c': "bcdfghjklmnpqrstvwxyz",
    'C': "BCDFGHJKLMNPQRSTVWXYZ",
    'n': "0123456789",
    'o': "@&%?,=[]:-+$#!'.;()/",
    'x': "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@&%?,=[]:-+$#!'.;()/",
    'a': "abcdefghijklmnopqrstuvwxyz0123456789"
};

export const SITES_STORAGE_KEY = 'SecurePasswordMobile_Sites_V2';
export const SESSION_ACTIVE_KEY = 'SecurePasswordMobile_SessionActive';
export const LAST_URL_KEY = 'SecurePasswordMobile_LastUrl';