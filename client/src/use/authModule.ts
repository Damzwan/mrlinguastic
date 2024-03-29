import {ref} from "@vue/composition-api";

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
import {correctMessage} from "@/use/general";

export class AuthModule {
    private msal: PublicClientApplication;
    private oid = ref<string>(null);
    private user = ref<string>(null);

    constructor() {
        this.msal = new PublicClientApplication(msalConfig);
        const accounts = this.msal.getAllAccounts();
        if (accounts.length > 0) {
            this.oid.value = AuthModule.computeOid(accounts[0])
            this.user.value = accounts[0].username;
        }
    }

    async loadAuthModule() {
        const resp = await this.msal.handleRedirectPromise();
        if (resp) {
            this.oid.value = AuthModule.computeOid(resp.account)
            this.user.value = resp.account.username;
            correctMessage("logged in!");
        }
    }

    async login() {
        await this.msal.loginRedirect();
    }

    async logout() {
        await this.msal.logout();
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