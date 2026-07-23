const CONFIG = {
    APP_NAME: "Portal RH CMIVET",
    VERSION: "6.0",

    API_URL:
"https://script.google.com/macros/s/AKfycbz7dmmQpgyCucCbCFlsXmzp3gf_A_eBUdlkrgx5Ysik5729_U9vsswW3gSfQtGDaFuj/exec",

    STORAGE: {
        TOKEN: "cmivet_token",
        USER: "cmivet_user",
        EMAIL: "cmivet_email"
    },

    REQUEST_TIMEOUT: 30000,

    DEBUG: true
};

// Evita alterações acidentais na configuração
Object.freeze(CONFIG);
