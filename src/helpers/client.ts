import * as dsteem from 'dsteem'

let internalClient: dsteem.Client | null = null

export function initClient(
  endpoint: string = 'https://api.steemit.com',
  options?: dsteem.ClientOptions
) {
  if (!internalClient) {
    console.log('initClient', endpoint, options)
    internalClient = new dsteem.Client(endpoint, options)
  }
}

// Create the proxy and tell TS it **is a dsteem.Client**
const clientProxy = new Proxy(
  {},
  {
    get(_, prop) {
      if (!internalClient) {
        internalClient = new dsteem.Client('https://api.steemit.com')
      }
      // @ts-ignore
      return internalClient[prop]
    }
  }
) as dsteem.Client

export default clientProxy