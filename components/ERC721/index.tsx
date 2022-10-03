import {Box, Button, Flex, Heading, Input} from "@chakra-ui/react";
import {useState} from "react";
import Web3 from "web3";
import {Contract} from "web3-eth-contract";
import {Erc721Abi} from "../../abis/erc721Abi";

const MINTER_ROLE_HASH = '0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6'

declare var window: any

export const ERC721 = () => {

  const [web3, setWeb3] = useState<Web3|null>(null)
  const [myAddress, setMyAddress] = useState("")

  const [contractAddress, setContractAddress] = useState('0xD8A99a4251B04CBa6d306240E930F231BE94141E')

  const [contract, setContract] = useState<Contract|null>(null)
  const [totalSupply, setTotalSupply] = useState<number>(-1)
  const [tokenURI, setTokenURI] = useState<string>('')

  const [grantTargetAddress, setGrantTargetAddress] = useState('')
  const [approveForAllTargetAddress, setApproveForAllTargetAddress] = useState('')


  const enableWeb3Provider = async () => {
    // console.log("enable", address)
    const provider = window.ethereum
    console.log("effect", provider)
    try {
      // Request account access
      await provider.enable();
    } catch (error) {
      console.error("User denied account access")
    }
    // const web = new Web3(provider)
    const _web3 = new Web3(provider)
    setWeb3(new Web3(provider))


    const accounts = await _web3.eth.getAccounts()
    setMyAddress(accounts[0])

    // const _contract = new _web3.eth.Contract(HEXA_ABI, address)
    // setContract(_contract)
    // const totalSupply = await _contract.methods.totalSupply().call()
    // const tokenURI = await _contract.methods.tokenURI(0).call()
    // console.log(tokenURI)
    // setTotalSupply(totalSupply)

  }

  const getContract = async () => {
    const _contract = new web3.eth.Contract(Erc721Abi, contractAddress)
    console.log("contract", _contract)
    setContract(_contract)
    const totalSupply = await _contract.methods.totalSupply().call()
    const tokenURI = await _contract.methods.tokenURI(0).call()
    console.log(tokenURI)
    setTotalSupply(totalSupply)
    setTokenURI(tokenURI)
  }

  const execMint = async () => {
    const balanceOf = contract?.methods?.balanceOf(myAddress)
    // console.log("balance", balanceOf)
    const res = await balanceOf.call()
    console.log("balance", res)

    const gasPrice : number = parseInt(await web3?.eth?.getGasPrice())
    const mint = contract?.methods?.mint(myAddress)
    mint.send({from: myAddress, gasPrice: gasPrice * 20}).then( async (res : any) => {
      // 番号をUpdate
      const totalSupply = await contract?.methods.totalSupply().call()
      setTotalSupply(totalSupply)
    })
  }

  const execGrantRole = () => {
    contract?.methods.getRoleMemberCount(MINTER_ROLE_HASH).call().then( res => {
      console.log("Minter Count", res)
    })

    const grantRole = contract?.methods?.grantRole(MINTER_ROLE_HASH, grantTargetAddress)
    grantRole.send({from: myAddress}).then(res => {
      console.log("Grant success", res)
    }).catch(e => {
      console.log("Grant error", e)
    })
  }
  const execApproveForAll = async () => {
    console.log("target", approveForAllTargetAddress)

    // contract?.methods.isApprovedForAll(contract_owner, approveForAllTargetAddress).call().then( res => {
    //   console.log("is ApprovedForAll", res)
    // })
    const approvedForAll = contract?.methods?.setApprovalForAll(approveForAllTargetAddress, true)
    approvedForAll.send({from: myAddress}).then(res => {
      console.log("success", res)
    }).catch(e => {
      console.log("error", e)
    })
  }

  return (
    <Box>
      <Heading size="xl">ERC721 コントラクト操作用ユーティリティページ</Heading>
      <Box>
        {
          myAddress ?
            <Button disabled>Wallet Connected</Button>
            :
            <Button colorScheme="red" onClick={enableWeb3Provider}>Wallet Connect</Button>
        }
      </Box>
      <Box>
        {
          myAddress && <Box>
              <Box>Contract Address</Box>
              <Input w="500px" value={contractAddress} onChange={ (e) => {setContractAddress(e.target.value)}}></Input>
              <Button onClick={getContract}>コントラクト情報取得</Button>
            { contract && <Box m={2}>
                <Box m={2}>
                    <Box>コントラクト情報</Box>
                    <Box>発行総数: {totalSupply} 次に採番されるNFT ID: {totalSupply}</Box>
                    <Box>TokenURI: {tokenURI} </Box>
                </Box>
                <Box m={2}>
                    <Box>操作</Box>
                    <Button onClick={execMint}>Mint</Button>
                    <Flex>
                      <Input w="500px" value={grantTargetAddress} onChange={ (e) => {setGrantTargetAddress(e.target.value)}}></Input>
                      <Button onClick={execGrantRole}>Minter Roleを付与</Button>
                    </Flex>

                    <Flex>
                        <Input w="500px" value={approveForAllTargetAddress} onChange={ (e) => {setApproveForAllTargetAddress(e.target.value)}}></Input>
                        <Button onClick={execApproveForAll}>ApproveForAll(送付権限を付与)</Button>
                    </Flex>

                    {/*<Button onClick={setApproveForAll}>setApprovedForAll</Button>*/}
                    {/*<Button onClick={sendTransaction}>sendTransaction</Button>*/}
                </Box>

            </Box>

            }

          </Box>
        }


      </Box>
    </Box>
  )

}

export default ERC721