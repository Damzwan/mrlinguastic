export const msalConfig = {
    auth: {
        clientId: "d47d0a57-2f29-43b1-b653-1472567408d2",
        knownAuthorities: ["mrlinguastic.b2clogin.com"],
        authority: "https://mrlinguastic.b2clogin.com/mrlinguastic.onmicrosoft.com/B2C_1_signinmrlinguastic",
        validateAuthority: false,
    },
    cache: {
        cacheLocation: "localStorage", // This configures where your cache will be stored
        storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
    },
    request: {
        scopes: ["user.read"]
    },
};

/**
 * AuthModule for application - handles authentication in app.
 */
import {PublicClientApplication, AccountInfo} from "@azure/msal-browser";

export class AuthModule {
    private msal: PublicClientApplication;
    private oid: string;
    private user: string;

    constructor() {
        this.msal = new PublicClientApplication(msalConfig);
        const accounts = this.msal.getAllAccounts();
        if (accounts.length > 0) {
            this.oid = AuthModule.computeOid(accounts[0])
            this.user = accounts[0].username;
        }
    }

    async loadAuthModule() {
        const resp = await this.msal.handleRedirectPromise();
        if (resp) {
            this.oid = AuthModule.computeOid(resp.account)
            this.user = resp.account.username;
        }
    }

    async login() {
        await this.msal.loginRedirect();
    }

    private static computeOid(account: AccountInfo) {
        return account.homeAccountId.substring(0, account.homeAccountId.search("-b2c"));
    }

    getOid() {
        return this.oid;
    }

    getUser() {
        return this.user;
    }
}