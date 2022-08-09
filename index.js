const { Requester, Validator } = require('@chainlink/external-adapter')
const qs = require('qs')

const customParams = {
  url: ['url'],
  selector: ['selector'],
  challenge: ['challenge'],
  recipient:  ['recipient'],
  walletID:  ['walletID'],
  endpoint: false
}

const createRequest = (input, callback) => {
  const validator = new Validator(callback, input, customParams)
  const jobRunID = validator.validated.id
  const id = validator.validated.data.walletID
  const walletID = `${id.substring(0, 8)}-${id.substring(8, 12)}-${id.substring(12, 16)}-${id.substring(16, 20)}-${id.substring(20)}`

  const recipient = validator.validated.data.recipient
  const serviceURL = `${process.env.BROWSERLESS_URL}/scrape?stealth`
  const loginURL = `${process.env.VUE_APP_VENLY_LOGIN_URL}/auth/realms/Arkane/protocol/openid-connect/token`
  const venlyWalletURL = `${process.env.VUE_APP_VENLY_API_URL}/api/wallets/${walletID}`
  const venlyTransferServiceURL = `${process.env.VUE_APP_VENLY_API_URL}/api/transactions/execute`
  const pincode = '1234'
  const url = validator.validated.data.url
  const challenge = validator.validated.data.challenge
  const elements = [{ selector: validator.validated.data.selector }]

  const params = {
    url,
    elements
  }

  const venlyConfig = {
    method: 'get',
    url: venlyWalletURL,
    data: {},
    timeout: 20000
  }

  const config = {
    method: 'post',
    url: serviceURL,
    data: params,
    timeout: 20000
  }

  const login_config = {
    method: 'post',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    url: loginURL,
    data: qs.stringify({
      'grant_type': 'client_credentials',
      'client_id': process.env.VUE_APP_VENLY_CLIENT_ID,
      'client_secret': process.env.VUE_APP_SECRET_ID
    }),
    timeout: 20000
  }
  Requester.request(config)
    .then(response => {
      let match = false
      if (response.data && response.data.data[0] && response.data.data[0].results[0]) {
        match = response.data.data[0].results[0].html.includes(challenge)
        if (match) {
          Requester.request(login_config)
              .then(response => {
                const token = response.data.access_token
                const config2 = {
                  method: 'get',
                  headers: {'content-type': 'application/json', 'Authorization': `Bearer ${token}`},
                  url: venlyWalletURL,
                  data: {},
                  timeout: 20000
                }
                Requester.request(config2)
                    .then(response => {
                      const balance = response.data.result.balance.balance - 0.1

                      const params =
                          {pincode,
                          "transactionRequest": {
                        "type" : "TRANSFER",
                            "secretType" : "MATIC",
                            "walletId" : walletID,
                            "to" : recipient,
                            "value": balance
                      }
                    }
                      const config3 = {
                        method: 'post',
                        headers: {'content-type': 'application/json', 'Authorization': `Bearer ${token}`},
                        url: venlyTransferServiceURL,
                        data: params
                          ,
                        timeout: 20000
                      }
                      Requester.request(config3)
                          .then(response => {
                           const hash = response.data.result.transactionHash
                            callback(response.status, Requester.success(jobRunID, {data: {result: hash}}))
                          })
                          .catch(error => {
                            callback(200, Requester.success(jobRunID, {data: {result: false}}))
                          })
                    })
                    .catch(error => {
                      callback(200, Requester.success(jobRunID, {data: {result: false}}))
                    })
              }).catch(error => {
            callback(200, Requester.success(jobRunID, {data: {result: false}}))
          })
        }
      }
    }).catch(error => {
    callback(200, Requester.success(jobRunID, {data: {result: false}}))
  })
}

module.exports.createRequest = createRequest
