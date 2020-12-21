import { newKitFromWeb3, ContractKit, newKit } from '@celo/contractkit'
import { Address, AbiItem, ReadOnlyWallet, TransactionResult, CeloTxReceipt } from '@celo/connect'
import Web3 from 'web3'
import detectEthereumProvider from '@metamask/detect-provider'
import TransportWebUSB from '@ledgerhq/hw-transport-webusb'
// import { detect } from  'detect-browser'
import { ERC20ABI as erc20 } from './erc20.abi'
import { newLedgerWalletWithSetup } from './wallet/ledgerWallet'
import { newMetaMaskWalletWithSetup } from './wallet/metamask'
import { newDAppBrowserWalletWithSetup } from './wallet/dappbrowser'

interface Network {
  provider: string
  blockscout?: string
}

export const NETWORKS: object = {
  Mainnet: { provider: 'https://rc1-forno.celo-testnet.org', blockscout: 'https://explorer.celo.org' },
  Alfajores: { provider: 'https://alfajores-forno.celo-testnet.org', blockscout: 'https://alfajores-blockscout.celo-testnet.org' },
  Baklava: { provider: 'https://baklava-forno.celo-testnet.org', blockscout: 'https://baklava-blockscout.celo-testnet.org' }
}

export const ERC20ABI: AbiItem[] = erc20

export class Celo {
  protected kit: ContractKit|null = null
  protected isConnected: boolean = false

  private isDesktop: boolean = false
  private wallet: ReadOnlyWallet|null = null

  protected contracts: any = {
    erc20: null,
    goldToken: null,
    stableToken: null,
    exchange: null
  }

  async connect (network: Network, onChainChanged: (network: object) => any, onAccountsChanged: (accounts: Address[]) => any) {
    if ((window as { [key: string]: any })['celo']) {
      const provider: any = (window as { [key: string]: any })['celo']
      if (provider.isDesktop) {
        this.kit = newKit(network.provider)
        provider.on('accountsChanged', (accounts:Array<Address>) => {
          if (onAccountsChanged) {
            onAccountsChanged(accounts)
          }
        })
        provider.on('chainChanged', async (chainId: string) => {
          const INDEX: any = {
            '42220': { name: 'Mainnet' },
            '44787': { name: 'Alfajores' },
            '62320': { name: 'Baklava' }
          }          
          if (onChainChanged) {
            onChainChanged(INDEX[chainId].name)
          }
        })
      } else if (provider.isMobile) {
        const web3 = new Web3(network.provider)
        this.wallet = await newDAppBrowserWalletWithSetup(web3, provider)
        this.kit = newKitFromWeb3(web3, this.wallet)
        await this.updateContracts()
        this.isConnected = true
      } else {
        throw new Error('other celo wallet did not support.')
      }
    } else if ((window as { [key: string]: any })['ethereum']) {
      if ((window as { [key: string]: any })['ethereum'].isMetaMask) {
        await (window as { [key: string]: any })['ethereum'].enable()
      }
      const provider: any = await detectEthereumProvider({mustBeMetaMask: true})
      if (provider && provider.isMetaMask) {
        const web3 = new Web3(network.provider)
        this.wallet = await newMetaMaskWalletWithSetup(provider, onAccountsChanged)
        this.kit = newKitFromWeb3(web3, this.wallet)
        await this.updateContracts()
        if (onAccountsChanged) {
          const accounts = this.wallet.getAccounts()
          onAccountsChanged(accounts)
        }
        this.isConnected = true
      } else {
        throw new Error('other ethereum wallet did not support.')
      }
    }
  }

  async connectLedger (network: Network, onAccountsChanged: (accounts: Address[]) => any) {
    if (!(window as { [key: string]: any })['celo'] || !(window as { [key: string]: any })['celo'].isMobile) {
      // const browser = detect()
      if ((await TransportWebUSB.isSupported())) {
        if ((await TransportWebUSB.list()).length === 0) {
          try {
            await (window as { [key: string]: any })['navigator'].usb.requestDevice({filters: [{ vendorId: '0x2c97' }]})          
          } catch (error) {
            console.log(new Error(error))
          }
        }
        if ((await TransportWebUSB.list()).length > 0) {
          const transport = await TransportWebUSB.create()
          await this.ledgerSetup(network, transport, onAccountsChanged)
        }
      }
    }
  }

  private async ledgerSetup (network: Network, transport: any, onAccountsChanged: (accounts: Address[]) => any) {
    this.wallet = await newLedgerWalletWithSetup(transport)
    const address = this.wallet.getAccounts()
    if (address.length>0) {
      const web3 = new Web3(network.provider)
      this.kit = newKitFromWeb3(web3, this.wallet)
      await this.updateContracts()
      if (onAccountsChanged) {
        onAccountsChanged(address)
      }
      this.isConnected = true 
    }
  }

  async changeNetwork (network: Network) {
    if (!this.isDesktop && this.kit && this.wallet) {
      const web3 = new Web3(network.provider)
      this.kit = newKitFromWeb3(web3, this.wallet)
      await this.updateContracts()
    } 
  }

  private async updateContracts () {
    for(const key in this.contracts) {
      this.contracts[key] = null    
    }
    if (this.kit) {
      this.contracts.erc20 = new this.kit.web3.eth.Contract(ERC20ABI)
      this.contracts.goldToken = await this.kit._web3Contracts.getGoldToken()
      this.contracts.stableToken = await this.kit._web3Contracts.getStableToken()
      this.contracts.exchange = await this.kit._web3Contracts.getExchange()
    }
  }

  async getAccounts (): Promise<Address[]> {
    if (this.isDesktop) {
      return this.kit ? (await this.kit.web3.eth.getAccounts()) : []
    }
    return this.wallet ? this.wallet.getAccounts() : []
  }

  async sendTransaction (web3Tx: any): Promise<CeloTxReceipt|null> {
    if (this.kit) {
      const txResult: TransactionResult = await this.kit.sendTransaction(web3Tx)
      return txResult.waitReceipt()
    }
    return null
  }

  async sign (message: string, account: Address): Promise<string|null> {
    if (this.kit && this.wallet) {
      return (await this.wallet.signPersonalMessage(account, this.kit.web3.utils.toHex(message)))
    }
    return null
  }

  recover (message: string, signature: string): Address|null {
    if (this.kit) {
      const result = this.kit.web3.eth.accounts.recover(this.kit.web3.utils.toHex(message), signature)
      return result
    }
    return null
  }
}
