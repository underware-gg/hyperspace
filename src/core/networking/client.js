import EventEmitter from 'events'
import { encode, decode } from 'messagepack'
import { createMessage } from '@/core/merge/messages'
import { throttle } from '@/core/utils'
import KernalChanges from '@/core/merge/kernal-changes'

const isBrowser = typeof window !== 'undefined'

const RECONNECT_TIMEOUT = 10000
const PING_PERIOD = 4000
const PONG_TIMEOUT = 7000
const SEND_RATE = 33.333

class Client extends EventEmitter {
	constructor(options, kernal) {
		super()
    this.options = options
		this.kernal = kernal
		this.changes = new KernalChanges()
    this.messages = []
		this.connection = isBrowser ? this.createConnection() : null

		this.sendMessagesThrottled = throttle(() => {
			this.sendMessages()
		}, SEND_RATE)

		this.heartbeat()
	}

	handleMessage = (event) => {
		const message = decode(event.data)

		// Does not need to be a pong.
		this.lastPong = Date.now()

		this.emit('message', message)
	}

	handleOpen = (event) => {
		this.emit('open', event)
	}

	// This should trigger the need to call sendMessages.
	// Part of send messages is to grab the changes data and turn them into a message.
	addOps(ops) {
		this.changes.addOps(ops)
		this.sendMessagesThrottled()
	}

	heartbeat = () => {
		this.addMessage(createMessage.ping())
		if (this.connection?.readyState === WebSocket.OPEN) {
			if (this.lastPong + PONG_TIMEOUT < Date.now()) {
				this.connection = this.createConnection()
			}
		}

		setTimeout(() => {
			this.heartbeat()
		}, PING_PERIOD)
	}

	handleClose = (event) => {
		this.emit('close', event)
		setTimeout(() => {
			this.connection = this.createConnection()
		}, RECONNECT_TIMEOUT)
	}

	handleError = (event) => {
		this.emit('error', event)
		setTimeout(() => {
			this.connection = this.createConnection()
		}, RECONNECT_TIMEOUT)
	}

	createConnection = () => {
		const connection = new WebSocket(this.options.uri)
		connection.binaryType = 'arraybuffer'
		connection.addEventListener('message', this.handleMessage)
		connection.addEventListener('open', this.handleOpen)
		connection.addEventListener('close', this.handleClose)
		connection.addEventListener('error', this.handleError)
		this.messages = []
		return connection
	}

	addMessage(message) {
		this.messages.push(message)
		this.sendMessagesThrottled()
	}

	sendMessages() {
		const connection = this.connection
		if (connection?.readyState === WebSocket.OPEN) {
			this.messages.forEach((message) => {
				connection.send(encode(message))
			})

			const changes = this.changes.getChanges()
			const ops = this.kernal.getOpsFromChanges(changes)
			// Splitting out the ops from the messages causes things to be
			// out of order which isn't ideal... this should only be an issue
			// if those two things are dependent on each other.
			// I'll need to think about it more deeply.
			if (ops.length > 0) {
				const message = createMessage.patch(ops)
				connection.send(encode(message))
			}
		}
		this.messages = []
		this.changes.clearChanges()
	}
}

export default Client
