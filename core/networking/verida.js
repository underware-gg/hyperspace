import { EnvironmentType } from '@verida/types'
import { WebUser } from '@verida/account-web-vault';

import { getRemoteStore } from '../../core/singleton'

// (optional) Import WalletConnect if required
//import WalletConnect from "@walletconnect/client";

const VERIDA_ENVIRONMENT = EnvironmentType.TESTNET
const CONTEXT_NAME = 'funDAOmental: Hyperbox'
const SNAPSPHOT_DB_NAME = 'room_snapshots'

const LOGO_URL = "https://fundaomental.com/oathring/512x512.png";

class HyperboxWebUser extends WebUser {

    // @todo: Create a proper schema
    async saveRoom(roomId, snapshot) {
        console.log(`saveRoom(${roomId})`)
        const roomSnapshotsDb = await VeridaUser._getSnapshotDb()
        let roomItem = {
            _id: roomId
        }

        try {
            roomItem = await roomSnapshotsDb.get(roomId)
        } catch (err) {
            if (err.name != 'not_found') {
                throw err
            }
        }

        roomItem.snapshot = JSON.stringify(snapshot)
        const result = await roomSnapshotsDb.save(roomItem)
        console.log('Room saved!')
        console.log(result)

        if (!result) {
            console.log('Save room error')
            console.log(roomSnapshotsDb.errors)
            return false
        }

        return true
    }

    async getRoom(roomId) {
        console.log(`getRoom(${roomId})`)
        const roomSnapshotsDb = await VeridaUser._getSnapshotDb()
        try {
            const roomItem = await roomSnapshotsDb.get(roomId)
            console.log(roomItem)
            return roomItem.snapshot
        } catch (err) {
            // If the room isn't found, return empty
            // Otherwise re-raise the error
            if (err.error != 'not_found') {
                throw err
            }
        }
    }

    async _getSnapshotDb() {
        const context = await VeridaUser.getContext()
        const roomSnapshotsDb = await context.openDatabase(SNAPSPHOT_DB_NAME, {
            permissions: {
                read: 'public',
                write: 'users'
            }
        })

        return roomSnapshotsDb
    }

    async setDocumentToLastTweet() {
        await VeridaUser.requireConnection()
        const messaging = await VeridaUser.context.getMessaging()
        const message = 'Please share your social media posts with hyperbox'
        const messageType = 'inbox/type/dataRequest'

        // Note: You could apply a filter `{sourceApplication: 'https://twitter.com/'}` to only include twitter results
        const data = {
            requestSchema: 
                'https://common.schemas.verida.io/social/post/v0.1.0/schema.json',
            filter: {
                sourceApplication: 'https://twitter.com/'
            },
            userSelect: false
        }
        const config = {
            recipientContextName: 'Verida: Vault'
        }

        messaging.onMessage(function(message) {
            const recentPosts = message.data.data[0]
            const lastPost = recentPosts[0]
            console.log('Most recent twitter post:')
            console.log(lastPost)
            const content = `<img src="${lastPost.sourceData.user.avatar}" /><strong>@${lastPost.sourceData.user.screen_name}</strong>: ${lastPost.content}`

            const store = getRemoteStore()
            store.setDocument('document', 'world', { content })
        })

        console.log("Requesting tweet data from user's mobile")
        await messaging.send(VeridaUser.did, messageType, data, message, config)
    }
}

export const VeridaUser = new HyperboxWebUser({
    accountConfig: {
        request: {
            logoUrl: LOGO_URL
        }
    },
    clientConfig: {
        environment: VERIDA_ENVIRONMENT
    },
    contextConfig: {
        name: CONTEXT_NAME
    },
    debug: true
})