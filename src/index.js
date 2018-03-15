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
    }
  }
})

const client = new Client(cli.flags.host + ':' + cli.flags.port)
client.on('connect', () => {
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
        process.exit(0)
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
