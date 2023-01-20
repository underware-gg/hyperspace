import { Network, EnvironmentType } from '@verida/client-ts';
import { VaultAccount, hasSession } from '@verida/account-web-vault';
import EventEmitter from 'events';

// (optional) Import WalletConnect if required
//import WalletConnect from "@walletconnect/client";

const VERIDA_ENVIRONMENT = EnvironmentType.TESTNET;
const CONTEXT_NAME = 'funDAOmental: Hyperbox';

const VeridaEvents = new EventEmitter()

export class VeridaApi {

    static context
    static account
    static profile
    static did

    static _connecting
    static _profile

    static async isConnected() {
        if (VeridaApi.did) {
            return true
        }

        if (hasSession(CONTEXT_NAME)) {
            await VeridaApi.connect()
            return true
        }

        return false
    }

    static async getContext() {
        if (!VeridaApi.isConnected()) {
            throw new Error('Not connected!')
        }

        return VeridaApi.context
    }

    static async getAccount() {
        if (!VeridaApi.isConnected()) {
            throw new Error('Not connected!')
        }

        return VeridaApi.account
    }

    static async getDid() {
        if (!VeridaApi.isConnected()) {
            throw new Error('Not connected!')
        }

        return VeridaApi.did
    }

    static async getPublicProfile(force) {
        if (!VeridaApi.did) {
            throw new Error('Not connected!')
        }

        if (!force && VeridaApi.profile) {
            // return cached profile
            return VeridaApi.profile
        }

        // fetch connection to verida profile on the verida network
        if (!VeridaApi._profile) {
            VeridaApi._profile = await VeridaApi.context.getClient().openPublicProfile(VeridaApi.did, 'Verida: Vault')

            // bind an event listener to find changes
            VeridaApi._profile.listen(async () => {
                const profile = await VeridaApi.getPublicProfile(true)
                VeridaEvents.emit('profileChanged', profile)
            })

            VeridaApi._profile
        }
        const profile = VeridaApi._profile

        // load avatar
        const avatar = await profile.get('avatar')

        // build a cached profile
        VeridaApi.profile = {
            avatarUri: avatar ? avatar.uri : undefined,
            name: await profile.get('name')
        }

        return VeridaApi.profile
    }

    static async connect() {
        if (VeridaApi._connecting) {
            // Have an existing promise (that may or may not be resolved)
            // Return it so if it's pending, the requestor will wait
            return VeridaApi._connecting
        }

        // Create a promise that will connect to the network and resolve once complete
        // Also pre-populates the users public profile
        VeridaApi._connecting = new Promise(async (resolve, reject) => {
            // (optional) WalletConnect configuration
            // See the WalletConnect section of the documentation for details
            /*const DEFAULT_CHAIN_ID = "eip155:5"
            connector = new WalletConnect({
                bridge: 'https://bridge.walletconnect.org',
            });*/

            // Logo for your application
            // The LOGO_URL should be a 170x170 PNG file
            const LOGO_URL = "https://assets.verida.io/verida_login_request_logo_170x170.png";

            const account = new VaultAccount({
                request: {
                    logoUrl: LOGO_URL,
                },
                /*walletConnect: {
                    version: connector.version,
                    uri: connector.uri,
                    chainId: DEFAULT_CHAIN_ID,
                },*/
            });

            const context = await Network.connect({
                client: {
                    environment: VERIDA_ENVIRONMENT,
                },
                account: account,
                context: {
                    name: CONTEXT_NAME,
                },
            });
            if (!context) {
                console.log(
                    'User cancelled login attempt by closing the QR code modal or an unexpected error occurred'
                );
            }

            const did = await account.did()
            console.log(`Account connected with did: ${did}`)

            VeridaApi.account = account
            VeridaApi.context = context
            VeridaApi.did = did

            const profile = await VeridaApi.getPublicProfile()

            VeridaEvents.emit('connected', profile)
            resolve()
        })

        return VeridaApi._connecting
    }

    static on(eventName, cb) {
        VeridaEvents.on(eventName, cb)
    }

    static async requestData(did, ) {}

    static async requestSocials() {
        const messaging = await VeridaApi.context.getMessaging()
        const message = 'Please share your social media posts'
        const messageType = 'inbox/type/dataRequest'

        // Note: You could apply a filter `{sourceApplication: 'https://twitter.com/'}` to only include twitter results
        const data = {
            requestSchema: 
                'https://common.schemas.verida.io/social/post/v0.1.0/schema.json',
            filter: {},
            userSelect: false
        }
        const config = {
            recipientContextName: 'Verida: Vault'
        }

        messaging.onMessage(function(message) {
            console.log('Socials returned:')
            console.log(message.data.data[0])
        })

        await messaging.send(VeridaApi.did, messageType, data, message, config)
    }

    /**
     * Send a message to a user's Verida Wallet
     * 
     * @param {*} did 
     * @param {*} subject 
     * @param {*} message 
     * @param {*} linkUrl 
     * @param {*} linkText 
     */
    static async sendMessage(did, subject, message, linkUrl, linkText) {
        const messaging = await VeridaApi.context.getMessaging()

        // The data message we are sending
        const link = {}
        if (linkUrl) {
            link.url = linkUrl
            link.text = linkText
        }

        const data = {
            data: [{
                subject,
                message,
                link
            }]
        }

        // set the subject
        // we need to set it to the correct message type
        const messageType = "inbox/type/message"

        const config = {
            recipientContextName: "Verida: Vault"
        }

        // Now send the message
        await messaging.send(did, messageType, data, subject, config)
    }
}