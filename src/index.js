#!/usr/bin/env node

import Client from '@upsub/client'
import Message from '@upsub/client/lib/Message'
import { highlight } from 'cli-highlight'
import chalk from 'chalk'
import meow from 'meow'

const cli = meow(`
  Usage
    $ upsub <channel> <data>

  Options
    --host, -h  host
    --port, -p  port
    --raw,  -r  send a raw message to the dispatcher
`, {
  flags: {
    host: {
      type: 'string',
      default: process.env.UPSUB_HOST || 'ws://localhost',
      alias: 'h'
    },
    port: {
      type: 'string',
      default: process.env.UPSUB_PORT || '4400',
      alias: 'p'
    },
    raw: {
      type: 'boolean',
      default: false,
      alias: 'r'
    }
  }
})

if (
  cli.flags.host.includes('wss://') &&
  (cli.flags.port === '4400' || cli.flags.port === '80')
) {
  cli.flags.port = 443
}

const client = new Client(cli.flags.host + ':' + cli.flags.port)

client.on('connect', () => {
  if (cli.flags.raw) {
    let msg = null
    try {
      msg = Message.decode(cli.input[0])
    } catch (err) {
      console.log(chalk.red(`Invalid Message`))
      process.exit(1)
    }
    client._sendMessage(msg)
    process.exit(0)
  }

  if (cli.input.length > 1) {
    const [channel, ...text] = cli.input
    let payload = text.join(' ')

    if (
      payload.includes('{') ||
      payload.includes('}') ||
      payload.includes('[') ||
      payload.includes(']')
    ) {
      try {
        payload = JSON.parse(payload)
      } catch (err) {
        console.log(chalk.red(`Invalid JSON: ${payload}`))
        process.exit(1)
      }
    }

    client.send(channel, payload)
    process.exit(0)
  } else {
    client.on(cli.input[0] || '>', (payload, msg) => {
      if (msg.type === Message.JSON) {
        payload = highlight(JSON.stringify(payload), { language: 'json' })
      } else {
        payload = highlight(payload, { language: 'js' })
      }

      console.log(
        chalk.grey(msg.channel), chalk.grey(':'),
        payload
      )
    })
  }
})
