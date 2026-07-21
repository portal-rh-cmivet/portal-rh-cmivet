const CONFIG = {
    APP_NAME: "Portal RH CMIVET",
    VERSION: "6.0",

    API_URL:
        "https://script.google.com/macros/s/AKfycbwDhEHF1V-pXeV6KLH-3EoYDx1IEyHS-MtFsmgp1IbkFeoRr2hdTzbe-r4oStxdnNhK/exec",

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
