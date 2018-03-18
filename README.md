# UpSub

Listen or send messages to the [Dispatcher](https://github.com/upsub/dispatcher)
from the terminal.

### Install
```sh
npm install -g upsub
```

### Usage
```sh
# Send a message
upsub <channel> <payload>

# Listen for messages
upsub <channel>

# Set host and port
upsub -h wss://dispatcher.service.com -p 443
```
