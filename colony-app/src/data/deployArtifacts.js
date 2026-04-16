// AUTO-GENERATED from Hardhat artifacts — do not edit manually.
// Run: node scripts/extract-bytecodes.js to regenerate.

export const ARTIFACTS = {
  "GToken": {
    "abi": [
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "_colonyName",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "_ticker",
            "type": "string"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "sender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "ERC721IncorrectOwner",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "operator",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "ERC721InsufficientApproval",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "approver",
            "type": "address"
          }
        ],
        "name": "ERC721InvalidApprover",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "operator",
            "type": "address"
          }
        ],
        "name": "ERC721InvalidOperator",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "ERC721InvalidOwner",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "receiver",
            "type": "address"
          }
        ],
        "name": "ERC721InvalidReceiver",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "sender",
            "type": "address"
          }
        ],
        "name": "ERC721InvalidSender",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "ERC721NonexistentToken",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "OwnableInvalidOwner",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "OwnableUnauthorizedAccount",
        "type": "error"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "approved",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "Approval",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "operator",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "bool",
            "name": "approved",
            "type": "bool"
          }
        ],
        "name": "ApprovalForAll",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "previousOwner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "Transfer",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "approve",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "balanceOf",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "colonyName",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "getApproved",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "operator",
            "type": "address"
          }
        ],
        "name": "isApprovedForAll",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "issuedAt",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          }
        ],
        "name": "mint",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "name",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "nextTokenId",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "owner",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "ownerOf",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "safeTransferFrom",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          }
        ],
        "name": "safeTransferFrom",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "operator",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "approved",
            "type": "bool"
          }
        ],
        "name": "setApprovalForAll",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes4",
            "name": "interfaceId",
            "type": "bytes4"
          }
        ],
        "name": "supportsInterface",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "symbol",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "citizen",
            "type": "address"
          }
        ],
        "name": "tokenOf",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "tokenURI",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "transferFrom",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ],
    "bytecode": "0x60806040526001600755348015610014575f80fd5b50604051611f9d380380611f9d833981016040819052610033916101c8565b3381604051602001610045919061023e565b604051602081830303815290604052826040516020016100659190610264565b60408051601f198184030181529190525f6100808382610305565b50600161008d8282610305565b5050506001600160a01b0381166100bd57604051631e4fbdf760e01b81525f600482015260240160405180910390fd5b6100c6816100db565b5060086100d38382610305565b5050506103c4565b600680546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0905f90a35050565b634e487b7160e01b5f52604160045260245ffd5b5f82601f83011261014f575f80fd5b81516001600160401b03808211156101695761016961012c565b604051601f8301601f19908116603f011681019082821181831017156101915761019161012c565b816040528381528660208588010111156101a9575f80fd5b8360208701602083015e5f602085830101528094505050505092915050565b5f80604083850312156101d9575f80fd5b82516001600160401b03808211156101ef575f80fd5b6101fb86838701610140565b93506020850151915080821115610210575f80fd5b5061021d85828601610140565b9150509250929050565b5f81518060208401855e5f93019283525090919050565b5f6102498284610227565b6a20476f7665726e616e636560a81b8152600b019392505050565b61472d60f01b81525f61027a6002830184610227565b9392505050565b600181811c9082168061029557607f821691505b6020821081036102b357634e487b7160e01b5f52602260045260245ffd5b50919050565b601f82111561030057805f5260205f20601f840160051c810160208510156102de5750805b601f840160051c820191505b818110156102fd575f81556001016102ea565b50505b505050565b81516001600160401b0381111561031e5761031e61012c565b6103328161032c8454610281565b846102b9565b602080601f831160018114610365575f841561034e5750858301515b5f19600386901b1c1916600185901b1785556103bc565b5f85815260208120601f198616915b8281101561039357888601518255948401946001909101908401610374565b50858210156103b057878501515f19600388901b60f8161c191681555b505060018460011b0185555b505050505050565b611bcc806103d15f395ff3fe608060405234801561000f575f80fd5b5060043610610132575f3560e01c806370a08231116100b45780639f37e2fd116100795780639f37e2fd14610265578063a22cb46514610284578063b88d4fde14610297578063c87b56dd146102aa578063e985e9c5146102bd578063f2fde38b146102d0575f80fd5b806370a0823114610228578063715018a61461023b57806375794a3c146102435780638da5cb5b1461024c57806395d89b411461025d575f80fd5b806342842e0e116100fa57806342842e0e146101c657806342ec38e2146101d957806353b1a411146101fa5780636352211e146102025780636a62784214610215575f80fd5b806301ffc9a71461013657806306fdde031461015e578063081812fc14610173578063095ea7b31461019e57806323b872dd146101b3575b5f80fd5b6101496101443660046111a2565b6102e3565b60405190151581526020015b60405180910390f35b610166610334565b60405161015591906111f2565b610186610181366004611204565b6103c3565b6040516001600160a01b039091168152602001610155565b6101b16101ac366004611231565b6103ea565b005b6101b16101c1366004611259565b6103f9565b6101b16101d4366004611259565b610487565b6101ec6101e7366004611292565b6104a6565b604051908152602001610155565b6101666104ea565b610186610210366004611204565b610576565b6101ec610223366004611292565b610580565b6101ec610236366004611292565b6105bd565b6101b1610602565b6101ec60075481565b6006546001600160a01b0316610186565b610166610615565b6101ec610273366004611204565b60096020525f908152604090205481565b6101b16102923660046112ab565b610624565b6101b16102a53660046112f8565b61062f565b6101666102b8366004611204565b610647565b6101496102cb3660046113cd565b610760565b6101b16102de366004611292565b61078d565b5f6001600160e01b031982166380ac58cd60e01b148061031357506001600160e01b03198216635b5e139f60e01b145b8061032e57506301ffc9a760e01b6001600160e01b03198316145b92915050565b60605f8054610342906113fe565b80601f016020809104026020016040519081016040528092919081815260200182805461036e906113fe565b80156103b95780601f10610390576101008083540402835291602001916103b9565b820191905f5260205f20905b81548152906001019060200180831161039c57829003601f168201915b5050505050905090565b5f6103cd826107ca565b505f828152600460205260409020546001600160a01b031661032e565b6103f5828233610802565b5050565b6001600160a01b03821661042757604051633250574960e11b81525f60048201526024015b60405180910390fd5b5f61043383833361080f565b9050836001600160a01b0316816001600160a01b031614610481576040516364283d7b60e01b81526001600160a01b038086166004830152602482018490528216604482015260640161041e565b50505050565b6104a183838360405180602001604052805f81525061062f565b505050565b5f60015b6007548110156104e2575f818152600260205260409020546001600160a01b038481169116036104da5792915050565b6001016104aa565b505f92915050565b600880546104f7906113fe565b80601f0160208091040260200160405190810160405280929190818152602001828054610523906113fe565b801561056e5780601f106105455761010080835404028352916020019161056e565b820191905f5260205f20905b81548152906001019060200180831161055157829003601f168201915b505050505081565b5f61032e826107ca565b5f610589610894565b60078054905f6105988361144a565b909155505f81815260096020526040902042905590506105b882826108c1565b919050565b5f6001600160a01b0382166105e7576040516322718ad960e21b81525f600482015260240161041e565b506001600160a01b03165f9081526003602052604090205490565b61060a610894565b6106135f610922565b565b606060018054610342906113fe565b6103f5338383610973565b61063a8484846103f9565b6104813385858585610a3a565b5f818152600260205260409020546060906001600160a01b03166106ad5760405162461bcd60e51b815260206004820152601960248201527f47546f6b656e3a206e6f6e6578697374656e7420746f6b656e00000000000000604482015260640161041e565b5f6106b783610b62565b6040516020016106c79190611479565b60405160208183030381529060405290505f6008826040516020016106ed929190611526565b60405160208183030381529060405290505f82600861070b84610bdd565b60405160200161071d9392919061199d565b604051602081830303815290604052905061073781610bdd565b6040516020016107479190611a83565b6040516020818303038152906040529350505050919050565b6001600160a01b039182165f90815260056020908152604080832093909416825291909152205460ff1690565b610795610894565b6001600160a01b0381166107be57604051631e4fbdf760e01b81525f600482015260240161041e565b6107c781610922565b50565b5f818152600260205260408120546001600160a01b03168061032e57604051637e27328960e01b81526004810184905260240161041e565b6104a18383836001610be9565b5f828152600260205260408120546001600160a01b031680156108805760405162461bcd60e51b815260206004820152602360248201527f47546f6b656e3a20736f756c626f756e642c206e6f6e2d7472616e7366657261604482015262626c6560e81b606482015260840161041e565b61088b858585610ced565b95945050505050565b6006546001600160a01b031633146106135760405163118cdaa760e01b815233600482015260240161041e565b6001600160a01b0382166108ea57604051633250574960e11b81525f600482015260240161041e565b5f6108f683835f61080f565b90506001600160a01b038116156104a1576040516339e3563760e11b81525f600482015260240161041e565b600680546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0905f90a35050565b6001600160a01b03831661099c5760405163a9fbf51f60e01b81525f600482015260240161041e565b6001600160a01b0382166109ce57604051630b61174360e31b81526001600160a01b038316600482015260240161041e565b6001600160a01b038381165f81815260056020908152604080832094871680845294825291829020805460ff191686151590811790915591519182527f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31910160405180910390a3505050565b6001600160a01b0383163b15610b5b57604051630a85bd0160e11b81526001600160a01b0384169063150b7a0290610a7c908890889087908790600401611ab4565b6020604051808303815f875af1925050508015610ab6575060408051601f3d908101601f19168201909252610ab391810190611af0565b60015b610b1d573d808015610ae3576040519150601f19603f3d011682016040523d82523d5f602084013e610ae8565b606091505b5080515f03610b1557604051633250574960e11b81526001600160a01b038516600482015260240161041e565b805160208201fd5b6001600160e01b03198116630a85bd0160e11b14610b5957604051633250574960e11b81526001600160a01b038516600482015260240161041e565b505b5050505050565b60605f610b6e83610ddf565b805190915060048110610b82575092915050565b80600303610bb35781604051602001610b9b9190611b0b565b60405160208183030381529060405292505050919050565b80600203610bcc5781604051602001610b9b9190611b20565b81604051602001610b9b9190611b36565b606061032e825f610e6f565b8080610bfd57506001600160a01b03821615155b15610cbe575f610c0c846107ca565b90506001600160a01b03831615801590610c385750826001600160a01b0316816001600160a01b031614155b8015610c4b5750610c498184610760565b155b15610c745760405163a9fbf51f60e01b81526001600160a01b038416600482015260240161041e565b8115610cbc5783856001600160a01b0316826001600160a01b03167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92560405160405180910390a45b505b50505f90815260046020526040902080546001600160a01b0319166001600160a01b0392909216919091179055565b5f828152600260205260408120546001600160a01b0390811690831615610d1957610d19818486610fee565b6001600160a01b03811615610d5357610d345f855f80610be9565b6001600160a01b0381165f90815260036020526040902080545f190190555b6001600160a01b03851615610d81576001600160a01b0385165f908152600360205260409020805460010190555b5f8481526002602052604080822080546001600160a01b0319166001600160a01b0389811691821790925591518793918516917fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef91a4949350505050565b60605f610deb83611052565b60010190505f8167ffffffffffffffff811115610e0a57610e0a6112e4565b6040519080825280601f01601f191660200182016040528015610e34576020820181803683370190505b5090508181016020015b5f19016f181899199a1a9b1b9c1cb0b131b232b360811b600a86061a8153600a8504945084610e3e57509392505050565b606082515f03610e8d575060408051602081019091525f815261032e565b5f82610ebd57600384516002610ea39190611b4d565b610ead9190611b60565b610eb8906004611b7f565b610ee2565b600384516004610ecd9190611b7f565b610ed8906002611b4d565b610ee29190611b60565b905060405191507f4142434445464748494a4b4c4d4e4f505152535455565758595a616263646566601f5261067083027f6768696a6b6c6d6e6f707172737475767778797a303132333435363738392b2f18603f526020820181810185865187016020810180515f82525b82841015610fa0576003840193508351603f8160121c16518753600187019650603f81600c1c16518753600187019650603f8160061c16518753600187019650603f811651875350600186019550610f4d565b905250859050610fe157600386510660018114610fc45760028114610fd757610fdf565b603d6001840353603d6002840353610fdf565b603d60018403535b505b9183525060405292915050565b610ff9838383611129565b6104a1576001600160a01b03831661102757604051637e27328960e01b81526004810182905260240161041e565b60405163177e802f60e01b81526001600160a01b03831660048201526024810182905260440161041e565b5f8072184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b83106110905772184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b830492506040015b6d04ee2d6d415b85acef810000000083106110bc576d04ee2d6d415b85acef8100000000830492506020015b662386f26fc1000083106110da57662386f26fc10000830492506010015b6305f5e10083106110f2576305f5e100830492506008015b612710831061110657612710830492506004015b60648310611118576064830492506002015b600a831061032e5760010192915050565b5f6001600160a01b038316158015906111855750826001600160a01b0316846001600160a01b0316148061116257506111628484610760565b8061118557505f828152600460205260409020546001600160a01b038481169116145b949350505050565b6001600160e01b0319811681146107c7575f80fd5b5f602082840312156111b2575f80fd5b81356111bd8161118d565b9392505050565b5f81518084528060208401602086015e5f602082860101526020601f19601f83011685010191505092915050565b602081525f6111bd60208301846111c4565b5f60208284031215611214575f80fd5b5035919050565b80356001600160a01b03811681146105b8575f80fd5b5f8060408385031215611242575f80fd5b61124b8361121b565b946020939093013593505050565b5f805f6060848603121561126b575f80fd5b6112748461121b565b92506112826020850161121b565b9150604084013590509250925092565b5f602082840312156112a2575f80fd5b6111bd8261121b565b5f80604083850312156112bc575f80fd5b6112c58361121b565b9150602083013580151581146112d9575f80fd5b809150509250929050565b634e487b7160e01b5f52604160045260245ffd5b5f805f806080858703121561130b575f80fd5b6113148561121b565b93506113226020860161121b565b925060408501359150606085013567ffffffffffffffff80821115611345575f80fd5b818701915087601f830112611358575f80fd5b81358181111561136a5761136a6112e4565b604051601f8201601f19908116603f01168101908382118183101715611392576113926112e4565b816040528281528a60208487010111156113aa575f80fd5b826020860160208301375f60208483010152809550505050505092959194509250565b5f80604083850312156113de575f80fd5b6113e78361121b565b91506113f56020840161121b565b90509250929050565b600181811c9082168061141257607f821691505b60208210810361143057634e487b7160e01b5f52602260045260245ffd5b50919050565b634e487b7160e01b5f52601160045260245ffd5b5f6001820161145b5761145b611436565b5060010190565b5f81518060208401855e5f93019283525090919050565b602360f81b81525f6111bd6001830184611462565b80545f90600181811c90808316806114a757607f831692505b602080841082036114c657634e487b7160e01b5f52602260045260245ffd5b8180156114da57600181146114ef5761151a565b60ff198616895284151585028901965061151a565b5f888152602090205f5b868110156115125781548b8201529085019083016114f9565b505084890196505b50505050505092915050565b7f3c73766720786d6c6e733d22687474703a2f2f7777772e77332e6f72672f323081527f30302f737667222077696474683d2234303022206865696768743d223430302260208201527f2076696577426f783d223020302034303020343030223e00000000000000000060408201527f3c726563742077696474683d2234303022206865696768743d2234303022206660578201526e34b6361e911198309830983091179f60891b60778201527f3c7265637420783d2232302220793d223230222077696474683d22333630222060868201527f6865696768743d22333630222066696c6c3d226e6f6e6522207374726f6b653d60a68201527f222342383836304222207374726f6b652d77696474683d2231222072783d223860c68201526211179f60e91b60e68201527f3c7465787420783d223230302220793d2237362220666f6e742d66616d696c7960e98201527f3d226d6f6e6f73706163652220666f6e742d73697a653d223133222066696c6c6101098201527f3d22234238383630422220746578742d616e63686f723d226d6964646c652220610129820152723632ba3a32b916b9b830b1b4b7339e911a111f60691b6101498201525f6116f161015c83018561148e565b661e17ba32bc3a1f60c91b81527f3c7465787420783d223230302220793d223233322220666f6e742d66616d696c60078201527f793d226d6f6e6f73706163652220666f6e742d73697a653d223134302220666960278201527f6c6c3d22234238383630422220746578742d616e63686f723d226d6964646c6560478201527f22206f7061636974793d22302e3038223e473c2f746578743e0000000000000060678201527f3c7465787420783d223230302220793d223236382220666f6e742d66616d696c60808201527f793d226d6f6e6f73706163652220666f6e742d73697a653d223131222066696c60a08201527f6c3d22233535352220746578742d616e63686f723d226d6964646c6522206c6560c08201527f747465722d73706163696e673d2233223e474f5645524e414e434520544f4b4560e082015267271e17ba32bc3a1f60c11b6101008201527f3c7465787420783d223230302220793d223331382220666f6e742d66616d696c6101088201527f793d226d6f6e6f73706163652220666f6e742d73697a653d223338222066696c6101288201527f6c3d22236666666666662220746578742d616e63686f723d226d6964646c6522610148820152601f60f91b6101688201526118ce610169820185611462565b661e17ba32bc3a1f60c91b81527f3c7465787420783d223230302220793d223336382220666f6e742d66616d696c60078201527f793d226d6f6e6f73706163652220666f6e742d73697a653d223130222066696c60278201527f6c3d22233333332220746578742d616e63686f723d226d6964646c6522206c6560478201527f747465722d73706163696e673d2235223e53504943452050524f544f434f4c3c60678201526517ba32bc3a1f60d11b6087820152651e17b9bb339f60d11b608d82015260930195945050505050565b7003d913730b6b2911d112396aa37b5b2b71607d1b81525f6119c26011830186611462565b61088b60f21b81527f226465736372697074696f6e223a22476f7665726e616e636520746f6b656e2060028201526303337b9160e51b6022820152611a0a602682018661148e565b90507f2e20536f756c626f756e642c206e6f6e2d7472616e7366657261626c652e222c81527f22696d616765223a22646174613a696d6167652f7376672b786d6c3b626173656020820152620d8d0b60ea1b6040820152611a6e6043820185611462565b61227d60f01b81526002019695505050505050565b7f646174613a6170706c69636174696f6e2f6a736f6e3b6261736536342c00000081525f6111bd601d830184611462565b6001600160a01b03858116825284166020820152604081018390526080606082018190525f90611ae6908301846111c4565b9695505050505050565b5f60208284031215611b00575f80fd5b81516111bd8161118d565b600360fc1b81525f6111bd6001830184611462565b61030360f41b81525f6111bd6002830184611462565b6203030360ec1b81525f6111bd6003830184611462565b8082018082111561032e5761032e611436565b5f82611b7a57634e487b7160e01b5f52601260045260245ffd5b500490565b808202811582820484141761032e5761032e61143656fea2646970667358221220b19a01262c1b5949790a4dbe7bb072cf20d2e2670d0887a19174ce5c0f6bdcc764736f6c63430008190033"
  },
  "SToken": {
    "abi": [
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "_ticker",
            "type": "string"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "allowance",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "needed",
            "type": "uint256"
          }
        ],
        "name": "ERC20InsufficientAllowance",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "sender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "balance",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "needed",
            "type": "uint256"
          }
        ],
        "name": "ERC20InsufficientBalance",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "approver",
            "type": "address"
          }
        ],
        "name": "ERC20InvalidApprover",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "receiver",
            "type": "address"
          }
        ],
        "name": "ERC20InvalidReceiver",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "sender",
            "type": "address"
          }
        ],
        "name": "ERC20InvalidSender",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          }
        ],
        "name": "ERC20InvalidSpender",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "OwnableInvalidOwner",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "OwnableUnauthorizedAccount",
        "type": "error"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "Approval",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "previousOwner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "Transfer",
        "type": "event"
      },
      {
        "inputs": [],
        "name": "UBI_AMOUNT",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "advanceEpoch",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          }
        ],
        "name": "allowance",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "approve",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "balanceOf",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "burn",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "colonyTransfer",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "currentEpoch",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "decimals",
        "outputs": [
          {
            "internalType": "uint8",
            "name": "",
            "type": "uint8"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "citizen",
            "type": "address"
          }
        ],
        "name": "issueUbi",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "citizen",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "issueUbiRaw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "name": "lastUbiEpoch",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "name",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "owner",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "symbol",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "transfer",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "transferFrom",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ],
    "bytecode": "0x60806040526001600755348015610014575f80fd5b50604051610e1d380380610e1d83398101604081905261003391610133565b338160405160200161004591906101f4565b604051602081830303815290604052826040516020016100659190610217565b60408051601f19818403018152919052600361008183826102b8565b50600461008e82826102b8565b5050506001600160a01b0381166100be57604051631e4fbdf760e01b81525f600482015260240160405180910390fd5b6100c7816100ce565b5050610377565b600580546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0905f90a35050565b634e487b7160e01b5f52604160045260245ffd5b5f60208284031215610143575f80fd5b81516001600160401b0380821115610159575f80fd5b818401915084601f83011261016c575f80fd5b81518181111561017e5761017e61011f565b604051601f8201601f19908116603f011681019083821181831017156101a6576101a661011f565b816040528281528760208487010111156101be575f80fd5b8260208601602083015e5f928101602001929092525095945050505050565b5f81518060208401855e5f93019283525090919050565b5f6101ff82846101dd565b67102996aa37b5b2b760c11b81526008019392505050565b61532d60f01b81525f61022d60028301846101dd565b9392505050565b600181811c9082168061024857607f821691505b60208210810361026657634e487b7160e01b5f52602260045260245ffd5b50919050565b601f8211156102b357805f5260205f20601f840160051c810160208510156102915750805b601f840160051c820191505b818110156102b0575f815560010161029d565b50505b505050565b81516001600160401b038111156102d1576102d161011f565b6102e5816102df8454610234565b8461026c565b602080601f831160018114610318575f84156103015750858301515b5f19600386901b1c1916600185901b17855561036f565b5f85815260208120601f198616915b8281101561034657888601518255948401946001909101908401610327565b508582101561036357878501515f19600388901b60f8161c191681555b505060018460011b0185555b505050505050565b610a99806103845f395ff3fe608060405234801561000f575f80fd5b5060043610610127575f3560e01c806370a08231116100a957806395d89b411161006e57806395d89b41146102665780639dc29fac1461026e578063a9059cbb14610281578063dd62ed3e14610294578063f2fde38b146102cc575f80fd5b806370a08231146101f3578063715018a61461021b578063766718081461022357806379bf70d31461022c5780638da5cb5b1461024b575f80fd5b8063313ce567116100ef578063313ce567146101a657806334332a4f146101b55780633cf80e6c146101c8578063470f2842146101d057806352d0643f146101e3575f80fd5b806306fdde031461012b578063095ea7b31461014957806318160ddd1461016c57806323b872dd1461017e5780632e379d4c14610191575b5f80fd5b6101336102df565b60405161014091906108ea565b60405180910390f35b61015c61015736600461093a565b61036f565b6040519015158152602001610140565b6002545b604051908152602001610140565b61015c61018c366004610962565b610388565b6101a461019f366004610962565b6103ab565b005b60405160128152602001610140565b6101a46101c336600461093a565b6103c3565b6101a46103d9565b6101a46101de36600461099b565b6103f7565b610170683635c9adc5dea0000081565b61017061020136600461099b565b6001600160a01b03165f9081526020819052604090205490565b6101a46104ab565b61017060075481565b61017061023a36600461099b565b60066020525f908152604090205481565b6005546040516001600160a01b039091168152602001610140565b6101336104be565b6101a461027c36600461093a565b6104cd565b61015c61028f36600461093a565b6104df565b6101706102a23660046109bb565b6001600160a01b039182165f90815260016020908152604080832093909416825291909152205490565b6101a46102da36600461099b565b6104ec565b6060600380546102ee906109ec565b80601f016020809104026020016040519081016040528092919081815260200182805461031a906109ec565b80156103655780601f1061033c57610100808354040283529160200191610365565b820191905f5260205f20905b81548152906001019060200180831161034857829003601f168201915b5050505050905090565b5f3361037c818585610526565b60019150505b92915050565b5f33610395858285610533565b6103a08585856105af565b506001949350505050565b6103b361060c565b6103be8383836105af565b505050565b6103cb61060c565b6103d58282610639565b5050565b6103e161060c565b60078054905f6103f083610a38565b9190505550565b6103ff61060c565b6007546001600160a01b0382165f908152600660205260409020541061047a5760405162461bcd60e51b815260206004820152602560248201527f53546f6b656e3a2055424920616c7265616479206973737565642074686973206044820152640dadedce8d60db1b60648201526084015b60405180910390fd5b6007546001600160a01b0382165f908152600660205260409020556104a881683635c9adc5dea00000610639565b50565b6104b361060c565b6104bc5f61066d565b565b6060600480546102ee906109ec565b6104d561060c565b6103d582826106be565b5f3361037c8185856105af565b6104f461060c565b6001600160a01b03811661051d57604051631e4fbdf760e01b81525f6004820152602401610471565b6104a88161066d565b6103be83838360016106f2565b6001600160a01b038381165f908152600160209081526040808320938616835292905220545f198110156105a9578181101561059b57604051637dc7a0d960e11b81526001600160a01b03841660048201526024810182905260448101839052606401610471565b6105a984848484035f6106f2565b50505050565b6001600160a01b0383166105d857604051634b637e8f60e11b81525f6004820152602401610471565b6001600160a01b0382166106015760405163ec442f0560e01b81525f6004820152602401610471565b6103be8383836107c4565b6005546001600160a01b031633146104bc5760405163118cdaa760e01b8152336004820152602401610471565b6001600160a01b0382166106625760405163ec442f0560e01b81525f6004820152602401610471565b6103d55f83836107c4565b600580546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0905f90a35050565b6001600160a01b0382166106e757604051634b637e8f60e11b81525f6004820152602401610471565b6103d5825f836107c4565b6001600160a01b03841661071b5760405163e602df0560e01b81525f6004820152602401610471565b6001600160a01b03831661074457604051634a1406b160e11b81525f6004820152602401610471565b6001600160a01b038085165f90815260016020908152604080832093871683529290522082905580156105a957826001600160a01b0316846001600160a01b03167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925846040516107b691815260200190565b60405180910390a350505050565b6001600160a01b0383166107ee578060025f8282546107e39190610a50565b9091555061085e9050565b6001600160a01b0383165f90815260208190526040902054818110156108405760405163391434e360e21b81526001600160a01b03851660048201526024810182905260448101839052606401610471565b6001600160a01b0384165f9081526020819052604090209082900390555b6001600160a01b03821661087a57600280548290039055610898565b6001600160a01b0382165f9081526020819052604090208054820190555b816001600160a01b0316836001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040516108dd91815260200190565b60405180910390a3505050565b602081525f82518060208401528060208501604085015e5f604082850101526040601f19601f83011684010191505092915050565b80356001600160a01b0381168114610935575f80fd5b919050565b5f806040838503121561094b575f80fd5b6109548361091f565b946020939093013593505050565b5f805f60608486031215610974575f80fd5b61097d8461091f565b925061098b6020850161091f565b9150604084013590509250925092565b5f602082840312156109ab575f80fd5b6109b48261091f565b9392505050565b5f80604083850312156109cc575f80fd5b6109d58361091f565b91506109e36020840161091f565b90509250929050565b600181811c90821680610a0057607f821691505b602082108103610a1e57634e487b7160e01b5f52602260045260245ffd5b50919050565b634e487b7160e01b5f52601160045260245ffd5b5f60018201610a4957610a49610a24565b5060010190565b8082018082111561038257610382610a2456fea2646970667358221220c731f469416762c829c0a92480211f38f5ea788ff9e6770963bed1230fc2bcfd64736f6c63430008190033"
  },
  "VToken": {
    "abi": [
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "_ticker",
            "type": "string"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "allowance",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "needed",
            "type": "uint256"
          }
        ],
        "name": "ERC20InsufficientAllowance",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "sender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "balance",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "needed",
            "type": "uint256"
          }
        ],
        "name": "ERC20InsufficientBalance",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "approver",
            "type": "address"
          }
        ],
        "name": "ERC20InvalidApprover",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "receiver",
            "type": "address"
          }
        ],
        "name": "ERC20InvalidReceiver",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "sender",
            "type": "address"
          }
        ],
        "name": "ERC20InvalidSender",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          }
        ],
        "name": "ERC20InvalidSpender",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "OwnableInvalidOwner",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "OwnableUnauthorizedAccount",
        "type": "error"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "Approval",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "previousOwner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "Transfer",
        "type": "event"
      },
      {
        "inputs": [],
        "name": "MAX_SAVE_PER_MONTH",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "advanceEpoch",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          }
        ],
        "name": "allowance",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "approve",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "balanceOf",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "citizen",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "burn",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "colonyTransfer",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "currentEpoch",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "decimals",
        "outputs": [
          {
            "internalType": "uint8",
            "name": "",
            "type": "uint8"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "citizen",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "mint",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "company",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "mintCompany",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "name",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "owner",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "savedThisEpoch",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "symbol",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "transfer",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "pure",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "transferFrom",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "pure",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ],
    "bytecode": "0x60806040526001600755348015610014575f80fd5b50604051610df7380380610df783398101604081905261003391610133565b338160405160200161004591906101f4565b604051602081830303815290604052826040516020016100659190610217565b60408051601f19818403018152919052600361008183826102b8565b50600461008e82826102b8565b5050506001600160a01b0381166100be57604051631e4fbdf760e01b81525f600482015260240160405180910390fd5b6100c7816100ce565b5050610377565b600580546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0905f90a35050565b634e487b7160e01b5f52604160045260245ffd5b5f60208284031215610143575f80fd5b81516001600160401b0380821115610159575f80fd5b818401915084601f83011261016c575f80fd5b81518181111561017e5761017e61011f565b604051601f8201601f19908116603f011681019083821181831017156101a6576101a661011f565b816040528281528760208487010111156101be575f80fd5b8260208601602083015e5f928101602001929092525095945050505050565b5f81518060208401855e5f93019283525090919050565b5f6101ff82846101dd565b67102b16aa37b5b2b760c11b81526008019392505050565b61562d60f01b81525f61022d60028301846101dd565b9392505050565b600181811c9082168061024857607f821691505b60208210810361026657634e487b7160e01b5f52602260045260245ffd5b50919050565b601f8211156102b357805f5260205f20601f840160051c810160208510156102915750805b601f840160051c820191505b818110156102b0575f815560010161029d565b50505b505050565b81516001600160401b038111156102d1576102d161011f565b6102e5816102df8454610234565b8461026c565b602080601f831160018114610318575f84156103015750858301515b5f19600386901b1c1916600185901b17855561036f565b5f85815260208120601f198616915b8281101561034657888601518255948401946001909101908401610327565b508582101561036357878501515f19600388901b60f8161c191681555b505060018460011b0185555b505050505050565b610a73806103845f395ff3fe608060405234801561000f575f80fd5b5060043610610127575f3560e01c8063715018a6116100a95780639dc29fac1161006e5780639dc29fac14610269578063a9059cbb1461027c578063dd62ed3e1461028a578063f1fbbc4d146102c2578063f2fde38b146102d2575f80fd5b8063715018a614610222578063720093e41461022a578063766718081461023d5780638da5cb5b1461024657806395d89b4114610261575f80fd5b8063313ce567116100ef578063313ce567146101a65780633cf80e6c146101b557806340c10f19146101bd578063560b1c40146101d057806370a08231146101fa575f80fd5b806306fdde031461012b578063095ea7b31461014957806318160ddd1461016c57806323b872dd1461017e5780632e379d4c14610191575b5f80fd5b6101336102e5565b60405161014091906108c4565b60405180910390f35b61015c610157366004610914565b610375565b6040519015158152602001610140565b6002545b604051908152602001610140565b61015c61018c36600461093c565b61038e565b6101a461019f36600461093c565b6103dd565b005b60405160128152602001610140565b6101a46103f5565b6101a46101cb366004610914565b610413565b6101706101de366004610914565b600660209081525f928352604080842090915290825290205481565b610170610208366004610975565b6001600160a01b03165f9081526020819052604090205490565b6101a46104f4565b6101a4610238366004610914565b610507565b61017060075481565b6005546040516001600160a01b039091168152602001610140565b61013361051d565b6101a4610277366004610914565b61052c565b61015c61018c366004610914565b610170610298366004610995565b6001600160a01b039182165f90815260016020908152604080832093909416825291909152205490565b610170680ad78ebc5ac620000081565b6101a46102e0366004610975565b61053e565b6060600380546102f4906109c6565b80601f0160208091040260200160405190810160405280929190818152602001828054610320906109c6565b801561036b5780601f106103425761010080835404028352916020019161036b565b820191905f5260205f20905b81548152906001019060200180831161034e57829003601f168201915b5050505050905090565b5f3361038281858561057b565b60019150505b92915050565b60405162461bcd60e51b815260206004820152601860248201527f56546f6b656e3a206e6f6e2d7472616e7366657261626c65000000000000000060448201525f906064015b60405180910390fd5b6103e5610588565b6103f08383836105b5565b505050565b6103fd610588565b60078054905f61040c83610a12565b9190505550565b61041b610588565b6001600160a01b0382165f9081526006602090815260408083206007548452909152902054680ad78ebc5ac62000006104548383610a2a565b11156104b05760405162461bcd60e51b815260206004820152602560248201527f56546f6b656e3a2065786365656473206d6f6e74686c7920736176696e6773206044820152641b1a5b5a5d60da1b60648201526084016103d4565b6001600160a01b0383165f9081526006602090815260408083206007548452909152812080548492906104e4908490610a2a565b909155506103f090508383610612565b6104fc610588565b6105055f610646565b565b61050f610588565b6105198282610612565b5050565b6060600480546102f4906109c6565b610534610588565b6105198282610697565b610546610588565b6001600160a01b03811661056f57604051631e4fbdf760e01b81525f60048201526024016103d4565b61057881610646565b50565b6103f083838360016106cb565b6005546001600160a01b031633146105055760405163118cdaa760e01b81523360048201526024016103d4565b6001600160a01b0383166105de57604051634b637e8f60e11b81525f60048201526024016103d4565b6001600160a01b0382166106075760405163ec442f0560e01b81525f60048201526024016103d4565b6103f083838361079e565b6001600160a01b03821661063b5760405163ec442f0560e01b81525f60048201526024016103d4565b6105195f838361079e565b600580546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0905f90a35050565b6001600160a01b0382166106c057604051634b637e8f60e11b81525f60048201526024016103d4565b610519825f8361079e565b6001600160a01b0384166106f45760405163e602df0560e01b81525f60048201526024016103d4565b6001600160a01b03831661071d57604051634a1406b160e11b81525f60048201526024016103d4565b6001600160a01b038085165f908152600160209081526040808320938716835292905220829055801561079857826001600160a01b0316846001600160a01b03167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b9258460405161078f91815260200190565b60405180910390a35b50505050565b6001600160a01b0383166107c8578060025f8282546107bd9190610a2a565b909155506108389050565b6001600160a01b0383165f908152602081905260409020548181101561081a5760405163391434e360e21b81526001600160a01b038516600482015260248101829052604481018390526064016103d4565b6001600160a01b0384165f9081526020819052604090209082900390555b6001600160a01b03821661085457600280548290039055610872565b6001600160a01b0382165f9081526020819052604090208054820190555b816001600160a01b0316836001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040516108b791815260200190565b60405180910390a3505050565b602081525f82518060208401528060208501604085015e5f604082850101526040601f19601f83011684010191505092915050565b80356001600160a01b038116811461090f575f80fd5b919050565b5f8060408385031215610925575f80fd5b61092e836108f9565b946020939093013593505050565b5f805f6060848603121561094e575f80fd5b610957846108f9565b9250610965602085016108f9565b9150604084013590509250925092565b5f60208284031215610985575f80fd5b61098e826108f9565b9392505050565b5f80604083850312156109a6575f80fd5b6109af836108f9565b91506109bd602084016108f9565b90509250929050565b600181811c908216806109da57607f821691505b6020821081036109f857634e487b7160e01b5f52602260045260245ffd5b50919050565b634e487b7160e01b5f52601160045260245ffd5b5f60018201610a2357610a236109fe565b5060010190565b80820180821115610388576103886109fe56fea264697066735822122045df3ee9873c20f41f19745cb760ae30e4edd347246ca775e06200bc634325e464736f6c63430008190033"
  },
  "Colony": {
    "abi": [
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "_name",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "_registry",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "_gToken",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "_sToken",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "_vToken",
            "type": "address"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "citizen",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "gTokenId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "string",
            "name": "name",
            "type": "string"
          }
        ],
        "name": "CitizenJoined",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "wallet",
            "type": "address"
          }
        ],
        "name": "CompanyWalletRegistered",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "citizen",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "string",
            "name": "name",
            "type": "string"
          }
        ],
        "name": "NameUpdated",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "treasury",
            "type": "address"
          }
        ],
        "name": "ProtocolFeeSettled",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "citizen",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "Redeemed",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "citizen",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "Saved",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "string",
            "name": "note",
            "type": "string"
          }
        ],
        "name": "Sent",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "citizen",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "epoch",
            "type": "uint256"
          }
        ],
        "name": "UbiClaimed",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "VDividendPaid",
        "type": "event"
      },
      {
        "inputs": [],
        "name": "advanceEpoch",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "citizenCount",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "name": "citizenName",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "citizens",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "claimUbi",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "colonyName",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "companyFactory",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "founder",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "gToken",
        "outputs": [
          {
            "internalType": "contract GToken",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "name": "isCitizen",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "name": "isCompanyWallet",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          }
        ],
        "name": "join",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "uint8",
            "name": "orgType",
            "type": "uint8"
          }
        ],
        "name": "mintOrgToken",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "oToken",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "pendingProtocolFee",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "redeemV",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "wallet",
            "type": "address"
          }
        ],
        "name": "registerCompanyWallet",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "registry",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "sToken",
        "outputs": [
          {
            "internalType": "contract SToken",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "saveToV",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "saveToVCompany",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "note",
            "type": "string"
          }
        ],
        "name": "send",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_factory",
            "type": "address"
          }
        ],
        "name": "setCompanyFactory",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          }
        ],
        "name": "setName",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_oToken",
            "type": "address"
          }
        ],
        "name": "setOToken",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "settleProtocol",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "transferVDividend",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "vToken",
        "outputs": [
          {
            "internalType": "contract VToken",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "stateMutability": "payable",
        "type": "receive"
      }
    ],
    "bytecode": "0x608060405234801561000f575f80fd5b5060405161240138038061240183398101604081905261002e916100c7565b600461003a8682610236565b5060058054336001600160a01b0319918216179091556006805482166001600160a01b039687161790555f805482169486169490941790935560018054841692851692909217909155600280549092169216919091179055506102f5565b634e487b7160e01b5f52604160045260245ffd5b80516001600160a01b03811681146100c2575f80fd5b919050565b5f805f805f60a086880312156100db575f80fd5b85516001600160401b03808211156100f1575f80fd5b818801915088601f830112610104575f80fd5b81518181111561011657610116610098565b604051601f8201601f19908116603f0116810190838211818310171561013e5761013e610098565b816040528281528b6020848701011115610156575f80fd5b8260208601602083015e5f60208483010152809950505050505061017c602087016100ac565b935061018a604087016100ac565b9250610198606087016100ac565b91506101a6608087016100ac565b90509295509295909350565b600181811c908216806101c657607f821691505b6020821081036101e457634e487b7160e01b5f52602260045260245ffd5b50919050565b601f82111561023157805f5260205f20601f840160051c8101602085101561020f5750805b601f840160051c820191505b8181101561022e575f815560010161021b565b50505b505050565b81516001600160401b0381111561024f5761024f610098565b6102638161025d84546101b2565b846101ea565b602080601f831160018114610296575f841561027f5750858301515b5f19600386901b1c1916600185901b1785556102ed565b5f85815260208120601f198616915b828110156102c4578886015182559484019460019091019084016102a5565b50858210156102e157878501515f19600388901b60f8161c191681555b505060018460011b0185555b505050505050565b6120ff806103025f395ff3fe6080604052600436106101b2575f3560e01c80637b103999116100e7578063c3fa0e3b11610087578063f315132711610062578063f3151327146104c7578063f3caad03146104e6578063f44844eb14610514578063f49bb76b1461051c575f80fd5b8063c3fa0e3b14610474578063c47f002714610489578063dc1c44be146104a8575f80fd5b80639a3df2aa116100c25780639a3df2aa146104035780639bb1a99c146104175780639ebdf12c14610436578063b63e8d1514610455575f80fd5b80637b103999146103a657806382c154e0146103c55780638a73803e146103e4575f80fd5b8063514575bf116101525780635b4c777d1161012d5780635b4c777d146103175780635f88b00c1461032b5780636a786b071461036957806376ffb9bd14610388575f80fd5b8063514575bf146102b857806353b1a411146102e457806353c15f46146102f8575f80fd5b806339bc93771161018d57806339bc9377146102455780633cf80e6c146102665780634731d5491461027a5780634d853ee514610299575f80fd5b806309a34f00146101bd5780631a32aad6146101f957806321ff05c714610218575f80fd5b366101b957005b5f80fd5b3480156101c8575f80fd5b506101dc6101d7366004611be9565b61053b565b6040516001600160a01b0390911681526020015b60405180910390f35b348015610204575f80fd5b506003546101dc906001600160a01b031681565b348015610223575f80fd5b50610237610232366004611c5c565b610563565b6040519081526020016101f0565b348015610250575f80fd5b5061026461025f366004611be9565b61068b565b005b348015610271575f80fd5b50610264610869565b348015610285575f80fd5b50610264610294366004611be9565b610959565b3480156102a4575f80fd5b506005546101dc906001600160a01b031681565b3480156102c3575f80fd5b506102d76102d2366004611cc5565b610b2f565b6040516101f09190611ce7565b3480156102ef575f80fd5b506102d7610bc6565b348015610303575f80fd5b50610264610312366004611d1c565b610bd3565b348015610322575f80fd5b50600b54610237565b348015610336575f80fd5b50610359610345366004611cc5565b600c6020525f908152604090205460ff1681565b60405190151581526020016101f0565b348015610374575f80fd5b50610264610383366004611d46565b610d94565b348015610393575f80fd5b505f546101dc906001600160a01b031681565b3480156103b1575f80fd5b506006546101dc906001600160a01b031681565b3480156103d0575f80fd5b506102646103df366004611cc5565b6110c1565b3480156103ef575f80fd5b506102646103fe366004611be9565b61115a565b34801561040e575f80fd5b506102646112a6565b348015610422575f80fd5b506002546101dc906001600160a01b031681565b348015610441575f80fd5b506001546101dc906001600160a01b031681565b348015610460575f80fd5b5061026461046f366004611cc5565b6113de565b34801561047f575f80fd5b5061023760085481565b348015610494575f80fd5b506102646104a3366004611d46565b61147a565b3480156104b3575f80fd5b506007546101dc906001600160a01b031681565b3480156104d2575f80fd5b506102646104e1366004611cc5565b611597565b3480156104f1575f80fd5b50610359610500366004611cc5565b60096020525f908152604090205460ff1681565b610264611689565b348015610527575f80fd5b50610264610536366004611d85565b611997565b600b818154811061054a575f80fd5b5f918252602090912001546001600160a01b0316905081565b6007545f906001600160a01b031633146105bb5760405162461bcd60e51b8152602060048201526014602482015273436f6c6f6e793a206f6e6c7920666163746f727960601b60448201526064015b60405180910390fd5b6003546001600160a01b031661060c5760405162461bcd60e51b815260206004820152601660248201527510dbdb1bdb9e4e8813d51bdad95b881b9bdd081cd95d60521b60448201526064016105b2565b600354604051636a4b888360e01b81526001600160a01b0390911690636a4b888390610642908890889088908890600401611e05565b6020604051808303815f875af115801561065e573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906106829190611e3d565b95945050505050565b335f908152600c602052604090205460ff166106e95760405162461bcd60e51b815260206004820152601c60248201527f436f6c6f6e793a206e6f74206120636f6d70616e792077616c6c65740000000060448201526064016105b2565b6001546040516370a0823160e01b815233600482015282916001600160a01b0316906370a0823190602401602060405180830381865afa15801561072f573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906107539190611e3d565b10156107715760405162461bcd60e51b81526004016105b290611e54565b600154604051632770a7eb60e21b8152336004820152602481018390526001600160a01b0390911690639dc29fac906044015f604051808303815f87803b1580156107ba575f80fd5b505af11580156107cc573d5f803e3d5ffd5b5050600254604051631c8024f960e21b8152336004820152602481018590526001600160a01b03909116925063720093e491506044015b5f604051808303815f87803b15801561081a575f80fd5b505af115801561082c573d5f803e3d5ffd5b50506040518381523392507fed23a82fe3387ce0bc3ec900dee36d8ca8c965f8dc65c02281a59f7e9e69728c91506020015b60405180910390a250565b6005546001600160a01b031633146108935760405162461bcd60e51b81526004016105b290611e8b565b60015f9054906101000a90046001600160a01b03166001600160a01b0316633cf80e6c6040518163ffffffff1660e01b81526004015f604051808303815f87803b1580156108df575f80fd5b505af11580156108f1573d5f803e3d5ffd5b5050505060025f9054906101000a90046001600160a01b03166001600160a01b0316633cf80e6c6040518163ffffffff1660e01b81526004015f604051808303815f87803b158015610941575f80fd5b505af1158015610953573d5f803e3d5ffd5b50505050565b335f9081526009602052604090205460ff166109875760405162461bcd60e51b81526004016105b290611eb9565b6002546040516370a0823160e01b815233600482015282916001600160a01b0316906370a0823190602401602060405180830381865afa1580156109cd573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906109f19190611e3d565b1015610a3f5760405162461bcd60e51b815260206004820152601e60248201527f436f6c6f6e793a20696e73756666696369656e7420562062616c616e6365000060448201526064016105b2565b600254604051632770a7eb60e21b8152336004820152602481018390526001600160a01b0390911690639dc29fac906044015f604051808303815f87803b158015610a88575f80fd5b505af1158015610a9a573d5f803e3d5ffd5b50506001546040516334332a4f60e01b8152336004820152602481018590526001600160a01b0390911692506334332a4f91506044015f604051808303815f87803b158015610ae7575f80fd5b505af1158015610af9573d5f803e3d5ffd5b50506040518381523392507f4896181ff8f4543cc00db9fe9b6fb7e6f032b7eb772c72ab1ec1b4d2e03b9369915060200161085e565b600a6020525f908152604090208054610b4790611ee8565b80601f0160208091040260200160405190810160405280929190818152602001828054610b7390611ee8565b8015610bbe5780601f10610b9557610100808354040283529160200191610bbe565b820191905f5260205f20905b815481529060010190602001808311610ba157829003601f168201915b505050505081565b60048054610b4790611ee8565b335f908152600c602052604090205460ff16610c315760405162461bcd60e51b815260206004820152601c60248201527f436f6c6f6e793a206e6f74206120636f6d70616e792077616c6c65740000000060448201526064016105b2565b6002546040516370a0823160e01b815233600482015282916001600160a01b0316906370a0823190602401602060405180830381865afa158015610c77573d5f803e3d5ffd5b505050506040513d601f19601f82011682018060405250810190610c9b9190611e3d565b1015610ce95760405162461bcd60e51b815260206004820152601e60248201527f436f6c6f6e793a20696e73756666696369656e7420562062616c616e6365000060448201526064016105b2565b600254604051630b8de75360e21b81523360048201526001600160a01b0384811660248301526044820184905290911690632e379d4c906064015f604051808303815f87803b158015610d3a575f80fd5b505af1158015610d4c573d5f803e3d5ffd5b50506040518381526001600160a01b03851692503391507fb7eb6b14ad7398cb61e2b65b5354576f2b984a716c2e47bc7be7623e0e0c1c6c9060200160405180910390a35050565b335f9081526009602052604090205460ff1615610df35760405162461bcd60e51b815260206004820152601960248201527f436f6c6f6e793a20616c7265616479206120636974697a656e0000000000000060448201526064016105b2565b80610e385760405162461bcd60e51b815260206004820152601560248201527410dbdb1bdb9e4e881b985b59481c995c5d5a5c9959605a1b60448201526064016105b2565b6040811115610e815760405162461bcd60e51b8152602060048201526015602482015274436f6c6f6e793a206e616d6520746f6f206c6f6e6760581b60448201526064016105b2565b335f908152600960209081526040808320805460ff19166001179055600a9091529020610eaf828483611f80565b50600b80546001810182555f9182527f0175b7a638427703f0dbe7bb9bbf987a2551717b34e79f33b5b1008d1fa01db90180546001600160a01b0319163390811790915581546040516335313c2160e11b815260048101929092526001600160a01b031690636a627842906024016020604051808303815f875af1158015610f39573d5f803e3d5ffd5b505050506040513d601f19601f82011682018060405250810190610f5d9190611e3d565b600154604051632387942160e11b81523360048201529192506001600160a01b03169063470f2842906024015f604051808303815f87803b158015610fa0575f80fd5b505af1158015610fb2573d5f803e3d5ffd5b50505050336001600160a01b03167f2acf71b0e61c7066b1d8b5158deb8fe165bc1bf3524d07161db0324838e0536d828585604051610ff39392919061203a565b60405180910390a2336001600160a01b03167f816f6b34d513a8d388fab654720a6dcee5371bf7e4880792df1be465c089402b683635c9adc5dea0000060015f9054906101000a90046001600160a01b03166001600160a01b031663766718086040518163ffffffff1660e01b8152600401602060405180830381865afa158015611080573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906110a49190611e3d565b6040805192835260208301919091520160405180910390a2505050565b6005546001600160a01b031633146110eb5760405162461bcd60e51b81526004016105b290611e8b565b6001600160a01b0381166111385760405162461bcd60e51b8152602060048201526014602482015273436f6c6f6e793a207a65726f206164647265737360601b60448201526064016105b2565b600780546001600160a01b0319166001600160a01b0392909216919091179055565b335f9081526009602052604090205460ff166111885760405162461bcd60e51b81526004016105b290611eb9565b6001546040516370a0823160e01b815233600482015282916001600160a01b0316906370a0823190602401602060405180830381865afa1580156111ce573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906111f29190611e3d565b10156112105760405162461bcd60e51b81526004016105b290611e54565b600154604051632770a7eb60e21b8152336004820152602481018390526001600160a01b0390911690639dc29fac906044015f604051808303815f87803b158015611259575f80fd5b505af115801561126b573d5f803e3d5ffd5b50506002546040516340c10f1960e01b8152336004820152602481018590526001600160a01b0390911692506340c10f199150604401610803565b335f9081526009602052604090205460ff166112d45760405162461bcd60e51b81526004016105b290611eb9565b600154604051632387942160e11b81523360048201526001600160a01b039091169063470f2842906024015f604051808303815f87803b158015611316575f80fd5b505af1158015611328573d5f803e3d5ffd5b505060015460408051630ecce30160e31b815290513394507f816f6b34d513a8d388fab654720a6dcee5371bf7e4880792df1be465c089402b9350683635c9adc5dea00000926001600160a01b03169163766718089160048083019260209291908290030181865afa1580156113a0573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906113c49190611e3d565b6040805192835260208301919091520160405180910390a2565b6007546001600160a01b0316331461142f5760405162461bcd60e51b8152602060048201526014602482015273436f6c6f6e793a206f6e6c7920666163746f727960601b60448201526064016105b2565b6001600160a01b0381165f818152600c6020526040808220805460ff19166001179055517f96927ac359c5a1ec8122d13af7141b4a952e05cc8d3278666628e46103ce36369190a250565b335f9081526009602052604090205460ff166114a85760405162461bcd60e51b81526004016105b290611eb9565b806114ed5760405162461bcd60e51b815260206004820152601560248201527410dbdb1bdb9e4e881b985b59481c995c5d5a5c9959605a1b60448201526064016105b2565b60408111156115365760405162461bcd60e51b8152602060048201526015602482015274436f6c6f6e793a206e616d6520746f6f206c6f6e6760581b60448201526064016105b2565b335f908152600a6020526040902061154f828483611f80565b50336001600160a01b03167f74321da206c1b9fa34367f7ece59ca49371dcd13820b9a5c3767ae1ecceed51a838360405161158b929190612053565b60405180910390a25050565b6005546001600160a01b031633146115c15760405162461bcd60e51b81526004016105b290611e8b565b6003546001600160a01b03161561161a5760405162461bcd60e51b815260206004820152601a60248201527f436f6c6f6e793a204f546f6b656e20616c72656164792073657400000000000060448201526064016105b2565b6001600160a01b0381166116675760405162461bcd60e51b8152602060048201526014602482015273436f6c6f6e793a207a65726f206164647265737360601b60448201526064016105b2565b600380546001600160a01b0319166001600160a01b0392909216919091179055565b6005546001600160a01b031633146116b35760405162461bcd60e51b81526004016105b290611e8b565b6006546001600160a01b03166117015760405162461bcd60e51b8152602060048201526013602482015272436f6c6f6e793a206e6f20726567697374727960681b60448201526064016105b2565b600854806117515760405162461bcd60e51b815260206004820152601960248201527f436f6c6f6e793a206e6f7468696e6720746f20736574746c650000000000000060448201526064016105b2565b803410156117a15760405162461bcd60e51b815260206004820152601860248201527f436f6c6f6e793a20696e73756666696369656e7420455448000000000000000060448201526064016105b2565b5f60088190556006546040805163803db96d60e01b815290516001600160a01b039092169163803db96d916004808201926020929091908290030181865afa1580156117ef573d5f803e3d5ffd5b505050506040513d601f19601f82011682018060405250810190611813919061206e565b90505f816001600160a01b0316836040515f6040518083038185875af1925050503d805f811461185e576040519150601f19603f3d011682016040523d82523d5f602084013e611863565b606091505b50509050806118b45760405162461bcd60e51b815260206004820152601760248201527f436f6c6f6e793a207472616e73666572206661696c656400000000000000000060448201526064016105b2565b82341115611951575f336118c8853461209d565b6040515f81818185875af1925050503d805f8114611901576040519150601f19603f3d011682016040523d82523d5f602084013e611906565b606091505b505090508061194f5760405162461bcd60e51b815260206004820152601560248201527410dbdb1bdb9e4e881c99599d5b990819985a5b1959605a1b60448201526064016105b2565b505b604080518481526001600160a01b03841660208201527f583c0d69510eb7e85b42a097e9d3e0ce80981a6b8d17864d3dee7f7aa22eb3d0910160405180910390a1505050565b335f9081526009602052604090205460ff16806119c25750335f908152600c602052604090205460ff165b611a075760405162461bcd60e51b815260206004820152601660248201527510dbdb1bdb9e4e881b9bdd08185d5d1a1bdc9a5e995960521b60448201526064016105b2565b6001546040516370a0823160e01b815233600482015284916001600160a01b0316906370a0823190602401602060405180830381865afa158015611a4d573d5f803e3d5ffd5b505050506040513d601f19601f82011682018060405250810190611a719190611e3d565b1015611a8f5760405162461bcd60e51b81526004016105b290611e54565b600154604051630b8de75360e21b81523360048201526001600160a01b0386811660248301526044820186905290911690632e379d4c906064015f604051808303815f87803b158015611ae0575f80fd5b505af1158015611af2573d5f803e3d5ffd5b50506006546001600160a01b0316159150611b94905057600654604051630332353560e51b81523060048201525f916001600160a01b031690636646a6a090602401602060405180830381865afa158015611b4f573d5f803e3d5ffd5b505050506040513d601f19601f82011682018060405250810190611b739190611e3d565b90508015611b92578060085f828254611b8c91906120b6565b90915550505b505b836001600160a01b0316336001600160a01b03167f02605d54d67ccbe0064a8ce6c39465102dd02b85ad8709391c5953a27083964b858585604051611bdb9392919061203a565b60405180910390a350505050565b5f60208284031215611bf9575f80fd5b5035919050565b6001600160a01b0381168114611c14575f80fd5b50565b5f8083601f840112611c27575f80fd5b50813567ffffffffffffffff811115611c3e575f80fd5b602083019150836020828501011115611c55575f80fd5b9250929050565b5f805f8060608587031215611c6f575f80fd5b8435611c7a81611c00565b9350602085013567ffffffffffffffff811115611c95575f80fd5b611ca187828801611c17565b909450925050604085013560ff81168114611cba575f80fd5b939692955090935050565b5f60208284031215611cd5575f80fd5b8135611ce081611c00565b9392505050565b602081525f82518060208401528060208501604085015e5f604082850101526040601f19601f83011684010191505092915050565b5f8060408385031215611d2d575f80fd5b8235611d3881611c00565b946020939093013593505050565b5f8060208385031215611d57575f80fd5b823567ffffffffffffffff811115611d6d575f80fd5b611d7985828601611c17565b90969095509350505050565b5f805f8060608587031215611d98575f80fd5b8435611da381611c00565b935060208501359250604085013567ffffffffffffffff811115611dc5575f80fd5b611dd187828801611c17565b95989497509550505050565b81835281816020850137505f828201602090810191909152601f909101601f19169091010190565b6001600160a01b03851681526060602082018190525f90611e299083018587611ddd565b905060ff8316604083015295945050505050565b5f60208284031215611e4d575f80fd5b5051919050565b6020808252601e908201527f436f6c6f6e793a20696e73756666696369656e7420532062616c616e63650000604082015260600190565b60208082526014908201527321b7b637b73c9d1037b7363c903337bab73232b960611b604082015260600190565b60208082526015908201527421b7b637b73c9d103737ba10309031b4ba34bd32b760591b604082015260600190565b600181811c90821680611efc57607f821691505b602082108103611f1a57634e487b7160e01b5f52602260045260245ffd5b50919050565b634e487b7160e01b5f52604160045260245ffd5b601f821115611f7b57805f5260205f20601f840160051c81016020851015611f595750805b601f840160051c820191505b81811015611f78575f8155600101611f65565b50505b505050565b67ffffffffffffffff831115611f9857611f98611f20565b611fac83611fa68354611ee8565b83611f34565b5f601f841160018114611fdd575f8515611fc65750838201355b5f19600387901b1c1916600186901b178355611f78565b5f83815260208120601f198716915b8281101561200c5786850135825560209485019460019092019101611fec565b5086821015612028575f1960f88860031b161c19848701351681555b505060018560011b0183555050505050565b838152604060208201525f610682604083018486611ddd565b602081525f612066602083018486611ddd565b949350505050565b5f6020828403121561207e575f80fd5b8151611ce081611c00565b634e487b7160e01b5f52601160045260245ffd5b818103818111156120b0576120b0612089565b92915050565b808201808211156120b0576120b061208956fea2646970667358221220f628f163badbc08c00857b4fe4cd3a17a3c2498bf93ff03db7b0ee1bf3a7663e64736f6c63430008190033"
  },
  "OToken": {
    "abi": [
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "_colonyName",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "_colony",
            "type": "address"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "sender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "ERC721IncorrectOwner",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "operator",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "ERC721InsufficientApproval",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "approver",
            "type": "address"
          }
        ],
        "name": "ERC721InvalidApprover",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "operator",
            "type": "address"
          }
        ],
        "name": "ERC721InvalidOperator",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "ERC721InvalidOwner",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "receiver",
            "type": "address"
          }
        ],
        "name": "ERC721InvalidReceiver",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "sender",
            "type": "address"
          }
        ],
        "name": "ERC721InvalidSender",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "ERC721NonexistentToken",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "OwnableInvalidOwner",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "OwnableUnauthorizedAccount",
        "type": "error"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "approved",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "Approval",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "operator",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "bool",
            "name": "approved",
            "type": "bool"
          }
        ],
        "name": "ApprovalForAll",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "holder",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "enum OToken.OrgType",
            "name": "orgType",
            "type": "uint8"
          },
          {
            "indexed": false,
            "internalType": "string",
            "name": "name",
            "type": "string"
          }
        ],
        "name": "OrgRegistered",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "previousOwner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "to",
            "type": "address"
          }
        ],
        "name": "RoleHandedOver",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "Transfer",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "approve",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "balanceOf",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "colony",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "getApproved",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "incoming",
            "type": "address"
          }
        ],
        "name": "handOver",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "operator",
            "type": "address"
          }
        ],
        "name": "isApprovedForAll",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "enum OToken.OrgType",
            "name": "orgType",
            "type": "uint8"
          }
        ],
        "name": "mint",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "name",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "nextTokenId",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "orgs",
        "outputs": [
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "enum OToken.OrgType",
            "name": "orgType",
            "type": "uint8"
          },
          {
            "internalType": "uint256",
            "name": "registeredAt",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "owner",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "ownerOf",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "safeTransferFrom",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          },
          {
            "internalType": "bytes",
            "name": "",
            "type": "bytes"
          }
        ],
        "name": "safeTransferFrom",
        "outputs": [],
        "stateMutability": "pure",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "operator",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "approved",
            "type": "bool"
          }
        ],
        "name": "setApprovalForAll",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes4",
            "name": "interfaceId",
            "type": "bytes4"
          }
        ],
        "name": "supportsInterface",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "symbol",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "tokenURI",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "holder",
            "type": "address"
          }
        ],
        "name": "tokensOf",
        "outputs": [
          {
            "internalType": "uint256[]",
            "name": "",
            "type": "uint256[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "transferFrom",
        "outputs": [],
        "stateMutability": "pure",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ],
    "bytecode": "0x60806040526001600855348015610014575f80fd5b506040516125cf3803806125cf83398101604081905261003391610164565b3382604051602001610045919061021f565b60408051601f19818403018152828201909152600682526527aa27a5a2a760d11b6020830152905f61007783826102c3565b50600161008482826102c3565b5050506001600160a01b0381166100b457604051631e4fbdf760e01b81525f600482015260240160405180910390fd5b6100bd816100e4565b50600780546001600160a01b0319166001600160a01b039290921691909117905550610382565b600680546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0905f90a35050565b634e487b7160e01b5f52604160045260245ffd5b80516001600160a01b038116811461015f575f80fd5b919050565b5f8060408385031215610175575f80fd5b82516001600160401b038082111561018b575f80fd5b818501915085601f83011261019e575f80fd5b8151818111156101b0576101b0610135565b604051601f8201601f19908116603f011681019083821181831017156101d8576101d8610135565b816040528281528860208487010111156101f0575f80fd5b8260208601602083015e5f60208483010152809650505050505061021660208401610149565b90509250929050565b5f82518060208501845e63204f726760e01b920191825250600401919050565b600181811c9082168061025357607f821691505b60208210810361027157634e487b7160e01b5f52602260045260245ffd5b50919050565b601f8211156102be57805f5260205f20601f840160051c8101602085101561029c5750805b601f840160051c820191505b818110156102bb575f81556001016102a8565b50505b505050565b81516001600160401b038111156102dc576102dc610135565b6102f0816102ea845461023f565b84610277565b602080601f831160018114610323575f841561030c5750858301515b5f19600386901b1c1916600185901b17855561037a565b5f85815260208120601f198616915b8281101561035157888601518255948401946001909101908401610332565b508582101561036e57878501515f19600388901b60f8161c191681555b505060018460011b0185555b505050505050565b6122408061038f5f395ff3fe608060405234801561000f575f80fd5b506004361061013d575f3560e01c806370a08231116100b4578063a22cb46511610079578063a22cb465146102aa578063b88d4fde146102bd578063c87b56dd146102cb578063e985e9c5146102de578063f2fde38b146102f1578063f5fed02c14610304575f80fd5b806370a082311461026d578063715018a61461028057806375794a3c146102885780638da5cb5b1461029157806395d89b41146102a2575f80fd5b8063349ff77011610105578063349ff770146101d157806342842e0e146101e45780634f5c2e6c146101f75780635a3f2672146102195780636352211e146102395780636a4b88831461024c575f80fd5b806301ffc9a71461014157806306fdde0314610169578063081812fc1461017e578063095ea7b3146101a957806323b872dd146101be575b5f80fd5b61015461014f3660046115f7565b610317565b60405190151581526020015b60405180910390f35b610171610368565b6040516101609190611653565b61019161018c366004611665565b6103f7565b6040516001600160a01b039091168152602001610160565b6101bc6101b7366004611697565b61041e565b005b6101bc6101cc3660046116bf565b61042d565b600754610191906001600160a01b031681565b6101bc6101f23660046116bf565b610473565b61020a610205366004611665565b610492565b6040516101609392919061172c565b61022c61022736600461175b565b61053d565b6040516101609190611774565b610191610247366004611665565b6105fc565b61025f61025a3660046117b7565b610606565b604051908152602001610160565b61025f61027b36600461175b565b61072d565b6101bc610772565b61025f60085481565b6006546001600160a01b0316610191565b610171610785565b6101bc6102b8366004611856565b610794565b6101bc6101cc36600461189f565b6101716102d9366004611665565b61079f565b6101546102ec366004611974565b6109ce565b6101bc6102ff36600461175b565b6109fb565b6101bc6103123660046119a5565b610a38565b5f6001600160e01b031982166380ac58cd60e01b148061034757506001600160e01b03198216635b5e139f60e01b145b8061036257506301ffc9a760e01b6001600160e01b03198316145b92915050565b60605f8054610376906119c6565b80601f01602080910402602001604051908101604052809291908181526020018280546103a2906119c6565b80156103ed5780601f106103c4576101008083540402835291602001916103ed565b820191905f5260205f20905b8154815290600101906020018083116103d057829003601f168201915b5050505050905090565b5f61040182610b3e565b505f828152600460205260409020546001600160a01b0316610362565b610429828233610b76565b5050565b60405162461bcd60e51b81526020600482015260166024820152754f546f6b656e3a207573652068616e644f766572282960501b60448201526064015b60405180910390fd5b61048d83838360405180602001604052805f81525061042d565b505050565b60096020525f90815260409020805481906104ac906119c6565b80601f01602080910402602001604051908101604052809291908181526020018280546104d8906119c6565b80156105235780601f106104fa57610100808354040283529160200191610523565b820191905f5260205f20905b81548152906001019060200180831161050657829003601f168201915b505050506001830154600290930154919260ff1691905083565b60605f6105498361072d565b90505f8167ffffffffffffffff8111156105655761056561188b565b60405190808252806020026020018201604052801561058e578160200160208202803683370190505b5090505f60015b6008548110156105f2575f818152600260205260409020546001600160a01b038781169116036105ea578083836105cb81611a12565b9450815181106105dd576105dd611a2a565b6020026020010181815250505b600101610595565b5090949350505050565b5f61036282610b3e565b5f61060f610b83565b60088054905f61061e83611a12565b909155506040805160806020601f880181900402820181019092526060810186815292935091829187908790819085018382808284375f92019190915250505090825250602001836003811115610677576106776116f8565b8152426020918201525f8381526009909152604090208151819061069b9082611a89565b50602082015160018083018054909160ff19909116908360038111156106c3576106c36116f8565b0217905550604082015181600201559050506106df8582610bb0565b846001600160a01b0316817f2cbf284c18a6cdd96884fd3721698452ac1750ae851c33c95fd5b8c04cfaca9584878760405161071d93929190611b49565b60405180910390a3949350505050565b5f6001600160a01b038216610757576040516322718ad960e21b81525f600482015260240161046a565b506001600160a01b03165f9081526003602052604090205490565b61077a610b83565b6107835f610c11565b565b606060018054610376906119c6565b610429338383610c62565b5f818152600260205260409020546060906001600160a01b03166108055760405162461bcd60e51b815260206004820152601960248201527f4f546f6b656e3a206e6f6e6578697374656e7420746f6b656e00000000000000604482015260640161046a565b5f8281526009602052604080822081516060810190925280548290829061082b906119c6565b80601f0160208091040260200160405190810160405280929190818152602001828054610857906119c6565b80156108a25780601f10610879576101008083540402835291602001916108a2565b820191905f5260205f20905b81548152906001019060200180831161088557829003601f168201915b5050509183525050600182015460209091019060ff1660038111156108c9576108c96116f8565b60038111156108da576108da6116f8565b815260200160028201548152505090505f6108f88260200151610d29565b90505f6109088360200151610e00565b90505f61091486610ed9565b6040516020016109249190611b9c565b60405160208183030381529060405290505f8283865f015185878660405160200161095496959493929190611bb1565b60405160208183030381529060405290505f82865f01518661097585610f69565b6040516020016109889493929190612052565b60405160208183030381529060405290506109a281610f69565b6040516020016109b2919061216a565b6040516020818303038152906040529650505050505050919050565b6001600160a01b039182165f90815260056020908152604080832093909416825291909152205460ff1690565b610a03610b83565b6001600160a01b038116610a2c57604051631e4fbdf760e01b81525f600482015260240161046a565b610a3581610c11565b50565b33610a42836105fc565b6001600160a01b031614610a985760405162461bcd60e51b815260206004820152601e60248201527f4f546f6b656e3a206e6f74207468652063757272656e7420686f6c6465720000604482015260640161046a565b610aa181610f75565b610af85760405162461bcd60e51b815260206004820152602260248201527f4f546f6b656e3a20726563697069656e74206973206e6f74206120636974697a60448201526132b760f11b606482015260840161046a565b610b03338284611033565b6040516001600160a01b03821690339084907fa0c7406958e58553b8e9b22cc5e955794f16be349e4b33c18839c53b76e230ae905f90a45050565b5f818152600260205260408120546001600160a01b03168061036257604051637e27328960e01b81526004810184905260240161046a565b61048d83838360016110e6565b6006546001600160a01b031633146107835760405163118cdaa760e01b815233600482015260240161046a565b6001600160a01b038216610bd957604051633250574960e11b81525f600482015260240161046a565b5f610be583835f6111ea565b90506001600160a01b0381161561048d576040516339e3563760e11b81525f600482015260240161046a565b600680546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0905f90a35050565b6001600160a01b038316610c8b5760405163a9fbf51f60e01b81525f600482015260240161046a565b6001600160a01b038216610cbd57604051630b61174360e31b81526001600160a01b038316600482015260240161046a565b6001600160a01b038381165f81815260056020908152604080832094871680845294825291829020805460ff191686151590811790915591519182527f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31910160405180910390a3505050565b60606001826003811115610d3f57610d3f6116f8565b03610d635750506040805180820190915260038152624d434360e81b602082015290565b6002826003811115610d7757610d776116f8565b03610da357505060408051808201909152600b81526a434f4f504552415449564560a81b602082015290565b6003826003811115610db757610db76116f8565b03610ddd575050604080518082019091526005815264434956494360d81b602082015290565b5050604080518082019091526007815266434f4d50414e5960c81b602082015290565b60606001826003811115610e1657610e166116f8565b03610e3e575050604080518082019091526007815266119c311ab1b31b60c91b602082015290565b6002826003811115610e5257610e526116f8565b03610e7a5750506040805180820190915260078152662331366133346160c81b602082015290565b6003826003811115610e8e57610e8e6116f8565b03610eb65750506040805180820190915260078152661199b11c19331b60c91b602082015290565b505060408051808201909152600781526611a11c1c1b182160c91b602082015290565b60605f610ee5836112dc565b60010190505f8167ffffffffffffffff811115610f0457610f0461188b565b6040519080825280601f01601f191660200182016040528015610f2e576020820181803683370190505b5090508181016020015b5f19016f181899199a1a9b1b9c1cb0b131b232b360811b600a86061a8153600a8504945084610f3857509392505050565b6060610362825f6113b3565b6007546040516001600160a01b0383811660248301525f92839283929091169060440160408051601f198184030181529181526020820180516001600160e01b031663f3caad0360e01b17905251610fcd919061219b565b5f60405180830381855afa9150503d805f8114611005576040519150601f19603f3d011682016040523d82523d5f602084013e61100a565b606091505b509150915081801561102b57508080602001905181019061102b91906121a6565b949350505050565b6001600160a01b03821661105c57604051633250574960e11b81525f600482015260240161046a565b5f61106883835f6111ea565b90506001600160a01b03811661109457604051637e27328960e01b81526004810183905260240161046a565b836001600160a01b0316816001600160a01b0316146110e0576040516364283d7b60e01b81526001600160a01b038086166004830152602482018490528216604482015260640161046a565b50505050565b80806110fa57506001600160a01b03821615155b156111bb575f61110984610b3e565b90506001600160a01b038316158015906111355750826001600160a01b0316816001600160a01b031614155b8015611148575061114681846109ce565b155b156111715760405163a9fbf51f60e01b81526001600160a01b038416600482015260240161046a565b81156111b95783856001600160a01b0316826001600160a01b03167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92560405160405180910390a45b505b50505f90815260046020526040902080546001600160a01b0319166001600160a01b0392909216919091179055565b5f828152600260205260408120546001600160a01b039081169083161561121657611216818486611532565b6001600160a01b03811615611250576112315f855f806110e6565b6001600160a01b0381165f90815260036020526040902080545f190190555b6001600160a01b0385161561127e576001600160a01b0385165f908152600360205260409020805460010190555b5f8481526002602052604080822080546001600160a01b0319166001600160a01b0389811691821790925591518793918516917fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef91a4949350505050565b5f8072184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b831061131a5772184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b830492506040015b6d04ee2d6d415b85acef81000000008310611346576d04ee2d6d415b85acef8100000000830492506020015b662386f26fc10000831061136457662386f26fc10000830492506010015b6305f5e100831061137c576305f5e100830492506008015b612710831061139057612710830492506004015b606483106113a2576064830492506002015b600a83106103625760010192915050565b606082515f036113d1575060408051602081019091525f8152610362565b5f82611401576003845160026113e791906121c1565b6113f191906121d4565b6113fc9060046121f3565b611426565b60038451600461141191906121f3565b61141c9060026121c1565b61142691906121d4565b905060405191507f4142434445464748494a4b4c4d4e4f505152535455565758595a616263646566601f5261067083027f6768696a6b6c6d6e6f707172737475767778797a303132333435363738392b2f18603f526020820181810185865187016020810180515f82525b828410156114e4576003840193508351603f8160121c16518753600187019650603f81600c1c16518753600187019650603f8160061c16518753600187019650603f811651875350600186019550611491565b90525085905061152557600386510660018114611508576002811461151b57611523565b603d6001840353603d6002840353611523565b603d60018403535b505b9183525060405292915050565b61153d838383611596565b61048d576001600160a01b03831661156b57604051637e27328960e01b81526004810182905260240161046a565b60405163177e802f60e01b81526001600160a01b03831660048201526024810182905260440161046a565b5f6001600160a01b0383161580159061102b5750826001600160a01b0316846001600160a01b031614806115cf57506115cf84846109ce565b8061102b5750505f908152600460205260409020546001600160a01b03908116911614919050565b5f60208284031215611607575f80fd5b81356001600160e01b03198116811461161e575f80fd5b9392505050565b5f81518084528060208401602086015e5f602082860101526020601f19601f83011685010191505092915050565b602081525f61161e6020830184611625565b5f60208284031215611675575f80fd5b5035919050565b80356001600160a01b0381168114611692575f80fd5b919050565b5f80604083850312156116a8575f80fd5b6116b18361167c565b946020939093013593505050565b5f805f606084860312156116d1575f80fd5b6116da8461167c565b92506116e86020850161167c565b9150604084013590509250925092565b634e487b7160e01b5f52602160045260245ffd5b6004811061172857634e487b7160e01b5f52602160045260245ffd5b9052565b606081525f61173e6060830186611625565b905061174d602083018561170c565b826040830152949350505050565b5f6020828403121561176b575f80fd5b61161e8261167c565b602080825282518282018190525f9190848201906040850190845b818110156117ab5783518352928401929184019160010161178f565b50909695505050505050565b5f805f80606085870312156117ca575f80fd5b6117d38561167c565b9350602085013567ffffffffffffffff808211156117ef575f80fd5b818701915087601f830112611802575f80fd5b813581811115611810575f80fd5b886020828501011115611821575f80fd5b60208301955080945050505060408501356004811061183e575f80fd5b939692955090935050565b8015158114610a35575f80fd5b5f8060408385031215611867575f80fd5b6118708361167c565b9150602083013561188081611849565b809150509250929050565b634e487b7160e01b5f52604160045260245ffd5b5f805f80608085870312156118b2575f80fd5b6118bb8561167c565b93506118c96020860161167c565b925060408501359150606085013567ffffffffffffffff808211156118ec575f80fd5b818701915087601f8301126118ff575f80fd5b8135818111156119115761191161188b565b604051601f8201601f19908116603f011681019083821181831017156119395761193961188b565b816040528281528a6020848701011115611951575f80fd5b826020860160208301375f60208483010152809550505050505092959194509250565b5f8060408385031215611985575f80fd5b61198e8361167c565b915061199c6020840161167c565b90509250929050565b5f80604083850312156119b6575f80fd5b8235915061199c6020840161167c565b600181811c908216806119da57607f821691505b6020821081036119f857634e487b7160e01b5f52602260045260245ffd5b50919050565b634e487b7160e01b5f52601160045260245ffd5b5f60018201611a2357611a236119fe565b5060010190565b634e487b7160e01b5f52603260045260245ffd5b601f82111561048d57805f5260205f20601f840160051c81016020851015611a635750805b601f840160051c820191505b81811015611a82575f8155600101611a6f565b5050505050565b815167ffffffffffffffff811115611aa357611aa361188b565b611ab781611ab184546119c6565b84611a3e565b602080601f831160018114611aea575f8415611ad35750858301515b5f19600386901b1c1916600185901b178555611b41565b5f85815260208120601f198616915b82811015611b1857888601518255948401946001909101908401611af9565b5085821015611b3557878501515f19600388901b60f8161c191681555b505060018460011b0185555b505050505050565b611b53818561170c565b60406020820152816040820152818360608301375f818301606090810191909152601f909201601f1916010192915050565b5f81518060208401855e5f93019283525090919050565b602360f81b81525f61161e6001830184611b85565b7f3c73766720786d6c6e733d22687474703a2f2f7777772e77332e6f72672f323081527f30302f737667222077696474683d2234303022206865696768743d223430302260208201527f2076696577426f783d223020302034303020343030223e00000000000000000060408201527f3c726563742077696474683d2234303022206865696768743d2234303022206660578201526e34b6361e911198309830983091179f60891b60778201527f3c7265637420783d2232302220793d223230222077696474683d22333630222060868201527f6865696768743d22333630222066696c6c3d226e6f6e6522207374726f6b653d60a6820152601160f91b60c68201525f611cc260c7830189611b85565b7f22207374726f6b652d77696474683d2231222072783d2238222f3e000000000081527f3c7465787420783d223230302220793d2237362220666f6e742d66616d696c79601b8201527f3d226d6f6e6f73706163652220666f6e742d73697a653d223133222066696c6c603b820152611e9160f11b605b820152611d91611d8b611d4f605d84018b611b85565b7f2220746578742d616e63686f723d226d6964646c6522206c65747465722d737081526930b1b4b7339e911a111f60b11b6020820152602a0190565b88611b85565b661e17ba32bc3a1f60c91b815290507f3c7465787420783d223230302220793d223233322220666f6e742d66616d696c60078201527f793d226d6f6e6f73706163652220666f6e742d73697a653d223134302220666960278201526336361e9160e11b6047820152611ee4611ede611e4f611e0f604b85018a611b85565b7f2220746578742d616e63686f723d226d6964646c6522206f7061636974793d2281526d1817181c111f279e17ba32bc3a1f60911b6020820152602e0190565b7f3c7465787420783d223230302220793d223236382220666f6e742d66616d696c81527f793d226d6f6e6f73706163652220666f6e742d73697a653d223131222066696c60208201527f6c3d22233535352220746578742d616e63686f723d226d6964646c6522206c656040820152703a3a32b916b9b830b1b4b7339e9119911f60791b606082015260710190565b86611b85565b661e17ba32bc3a1f60c91b815290507f3c7465787420783d223230302220793d223331382220666f6e742d66616d696c60078201527f793d226d6f6e6f73706163652220666f6e742d73697a653d223338222066696c60278201527f6c3d22236666666666662220746578742d616e63686f723d226d6964646c65226047820152601f60f91b6067820152611f7c6068820185611b85565b661e17ba32bc3a1f60c91b81527f3c7465787420783d223230302220793d223336382220666f6e742d66616d696c60078201527f793d226d6f6e6f73706163652220666f6e742d73697a653d223130222066696c60278201527f6c3d22233333332220746578742d616e63686f723d226d6964646c6522206c656047820152703a3a32b916b9b830b1b4b7339e911a911f60791b60678201527429a824a1a290282927aa27a1a7a61e17ba32bc3a1f60591b6078820152651e17b9bb339f60d11b608d8201526093019998505050505050505050565b7003d913730b6b2911d112796aa37b5b2b71607d1b81525f6120776011830187611b85565b61088b60f21b81527f226465736372697074696f6e223a224f7267616e69736174696f6e20746f6b65600282015265037103337b9160d51b60228201526120c16028820187611b85565b905061040560f31b81526120d86002820186611b85565b7f292e20526f6c652d7472616e7366657261626c65206265747765656e20636f6c81526e1bdb9e4818da5d1a5e995b9ccb888b608a1b60208201527f22696d616765223a22646174613a696d6167652f7376672b786d6c3b62617365602f820152620d8d0b60ea1b604f82015290506121546052820185611b85565b61227d60f01b8152600201979650505050505050565b7f646174613a6170706c69636174696f6e2f6a736f6e3b6261736536342c00000081525f61161e601d830184611b85565b5f61161e8284611b85565b5f602082840312156121b6575f80fd5b815161161e81611849565b80820180821115610362576103626119fe565b5f826121ee57634e487b7160e01b5f52601260045260245ffd5b500490565b8082028115828204841417610362576103626119fe56fea264697066735822122013867b6eff13d2c5d5af8040f05d3bea4204cace1e0017403b42584338966f2164736f6c63430008190033"
  },
  "CompanyImplementation": {
    "abi": [
      {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [],
        "name": "InvalidInitialization",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "NotInitializing",
        "type": "error"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "ConvertedToV",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "totalAmount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "holderCount",
            "type": "uint256"
          }
        ],
        "name": "DividendDistributed",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "uint64",
            "name": "version",
            "type": "uint64"
          }
        ],
        "name": "Initialized",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "string",
            "name": "role",
            "type": "string"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "addr",
            "type": "address"
          }
        ],
        "name": "OfficerAppointed",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "string",
            "name": "role",
            "type": "string"
          }
        ],
        "name": "OfficerRemoved",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "string",
            "name": "note",
            "type": "string"
          }
        ],
        "name": "PaymentMade",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "to",
            "type": "address"
          }
        ],
        "name": "SecretaryChanged",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "proposalId",
            "type": "uint256"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "approver",
            "type": "address"
          }
        ],
        "name": "ShareTransferApproved",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "proposalId",
            "type": "uint256"
          }
        ],
        "name": "ShareTransferCancelled",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "proposalId",
            "type": "uint256"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "basisPoints",
            "type": "uint256"
          }
        ],
        "name": "ShareTransferExecuted",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "proposalId",
            "type": "uint256"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "basisPoints",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "approver1",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "approver2",
            "type": "address"
          }
        ],
        "name": "ShareTransferProposed",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "role",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "addr",
            "type": "address"
          }
        ],
        "name": "appointOfficer",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "proposalId",
            "type": "uint256"
          }
        ],
        "name": "approveShareTransfer",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "proposalId",
            "type": "uint256"
          }
        ],
        "name": "cancelShareTransfer",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "ceo",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "newSecretary",
            "type": "address"
          }
        ],
        "name": "changeSecretary",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "colony",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "convertToV",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "distributeVDividend",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "equityHolders",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "equityStakes",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "fd",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "getEquityTable",
        "outputs": [
          {
            "internalType": "address[]",
            "name": "holders",
            "type": "address[]"
          },
          {
            "internalType": "uint256[]",
            "name": "stakes",
            "type": "uint256[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "proposalId",
            "type": "uint256"
          }
        ],
        "name": "getProposal",
        "outputs": [
          {
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "basisPoints",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "approver1",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "approver2",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "approved1",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "approved2",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "executed",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "cancelled",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "expiresAt",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "holderCount",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_colony",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "_name",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "_secretary",
            "type": "address"
          },
          {
            "internalType": "address[]",
            "name": "_holders",
            "type": "address[]"
          },
          {
            "internalType": "uint256[]",
            "name": "_stakes",
            "type": "uint256[]"
          }
        ],
        "name": "initialize",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "name",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "nextProposalId",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "note",
            "type": "string"
          }
        ],
        "name": "pay",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "proposals",
        "outputs": [
          {
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "basisPoints",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "approver1",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "approver2",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "approved1",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "approved2",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "executed",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "cancelled",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "expiresAt",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "basisPoints",
            "type": "uint256"
          }
        ],
        "name": "proposeShareTransfer",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "proposalId",
            "type": "uint256"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "role",
            "type": "string"
          }
        ],
        "name": "removeOfficer",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "sBalance",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "secretary",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "vBalance",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    "bytecode": "0x6080604052348015600e575f80fd5b5060156019565b60c9565b7ff0c57e16840df040f15088dc2f81fe391c3923bec73e23a9662efc9c229c6a00805468010000000000000000900460ff161560685760405163f92ee8a960e01b815260040160405180910390fd5b80546001600160401b039081161460c65780546001600160401b0319166001600160401b0390811782556040519081527fc7f505b2f371ae2175ee4913f4499e1f2633a7b5936321eed1cdaeb6115181d29060200160405180910390a15b50565b61239d806100d65f395ff3fe608060405234801561000f575f80fd5b5060043610610153575f3560e01c80635495d2aa116100bf578063c061160311610079578063c061160314610390578063c7f758a814610398578063cb8a517514610417578063cbeee4691461042a578063e2be222114610432578063e4c0f55f14610445575f80fd5b80635495d2aa1461031b578063797abfbf1461032e5780637ec0f93114610341578063908921fc14610357578063b81d7a411461036a578063bd7638dc1461037d575f80fd5b806332b653041161011057806332b65304146102925780633365a1a2146102a5578063349ff770146102b857806334c46b70146102e257806336e49483146102f55780634a4bdb3014610308575f80fd5b8063013cf08b1461015757806306fdde031461023a57806307ad30d31461024f578063127be12b146102645780631aab9a9f146102775780632ab09d1414610289575b5f80fd5b6101d4610165366004611cd8565b60076020525f90815260409020805460018201546002830154600384015460048501546005909501546001600160a01b03948516959385169492939183169282169160ff600160a01b8204811692600160a81b8304821692600160b01b8104831692600160b81b90910416908a565b604080516001600160a01b039b8c168152998b1660208b01528901979097529488166060880152969092166080860152151560a0850152151560c084015292151560e0830152911515610100820152610120810191909152610140015b60405180910390f35b61024261044d565b6040516102319190611cef565b61026261025d366004611cd8565b6104d9565b005b610262610272366004611d80565b6105a0565b6005545b604051908152602001610231565b61027b60085481565b6102626102a0366004611dd3565b610738565b61027b6102b3366004611cd8565b61082f565b5f546102ca906001600160a01b031681565b6040516001600160a01b039091168152602001610231565b6004546102ca906001600160a01b031681565b610262610303366004611cd8565b61084e565b610262610316366004611e12565b6109ab565b6002546102ca906001600160a01b031681565b6102ca61033c366004611cd8565b610a74565b610349610a9c565b604051610231929190611e6a565b6003546102ca906001600160a01b031681565b610262610378366004611eec565b610b55565b61027b61038b366004611f0e565b610c00565b610262610f1d565b6101d46103a6366004611cd8565b5f908152600760205260409020805460018201546002830154600384015460048501546005909501546001600160a01b0394851696938516959294918216939183169260ff600160a01b8204811693600160a81b8304821693600160b01b8404831693600160b81b90049092169190565b610262610425366004611f79565b61119c565b61027b611534565b610262610440366004611cd8565b611615565b61027b61181f565b6001805461045a90612032565b80601f016020809104026020016040519081016040528092919081815260200182805461048690612032565b80156104d15780601f106104a8576101008083540402835291602001916104d1565b820191905f5260205f20905b8154815290600101906020018083116104b457829003601f168201915b505050505081565b6002546001600160a01b0316331461050c5760405162461bcd60e51b81526004016105039061206a565b60405180910390fd5b5f546040516339bc937760e01b8152600481018390526001600160a01b03909116906339bc9377906024015f604051808303815f87803b15801561054e575f80fd5b505af1158015610560573d5f803e3d5ffd5b505050507f2cb420c41f7e9445fd6ee7ef33231c6322ead403a431fcc15e923d1e0ac55b798160405161059591815260200190565b60405180910390a150565b6002546001600160a01b031633146105ca5760405162461bcd60e51b81526004016105039061206a565b6001600160a01b0381166105f05760405162461bcd60e51b81526004016105039061209a565b5f83836040516106019291906120c9565b604051809103902090507fdc0d7a095c4e917ecbeb7deda7c942ff9744013d419e37549215a413915e421d810361065257600380546001600160a01b0319166001600160a01b0384161790556106ef565b7ffc742e123dab805d8342d9b1c2004b5c07fc27d27e8e2866f0275a3e65a7b7b3810361069957600480546001600160a01b0319166001600160a01b0384161790556106ef565b60405162461bcd60e51b815260206004820152602560248201527f436f6d70616e793a20756e6b6e6f776e20726f6c6520287573652043454f206f604482015264722046442960d81b6064820152608401610503565b816001600160a01b03167ff57a02bc01251569026959623a216217c197c199cc5011ed3563b3b5c1d57fd9858560405161072a929190612100565b60405180910390a250505050565b6002546001600160a01b031633146107625760405162461bcd60e51b81526004016105039061206a565b5f82826040516107739291906120c9565b604051809103902090507fdc0d7a095c4e917ecbeb7deda7c942ff9744013d419e37549215a413915e421d81036107b957600380546001600160a01b03191690556107f1565b7ffc742e123dab805d8342d9b1c2004b5c07fc27d27e8e2866f0275a3e65a7b7b3810361069957600480546001600160a01b03191690555b7f19e076775dff378e27d48707938b116febc2aa73335d72ab7a5d709ee429a6648383604051610822929190612100565b60405180910390a1505050565b6006818154811061083e575f80fd5b5f91825260209091200154905081565b5f8181526007602052604090206004810154600160b01b900460ff16156108b35760405162461bcd60e51b815260206004820152601960248201527810dbdb5c185b9e4e88185b1c9958591e48195e1958dd5d1959603a1b6044820152606401610503565b6004810154600160b81b900460ff161561090f5760405162461bcd60e51b815260206004820152601a60248201527f436f6d70616e793a20616c72656164792063616e63656c6c65640000000000006044820152606401610503565b80546001600160a01b031633146109685760405162461bcd60e51b815260206004820152601960248201527f436f6d70616e793a206e6f74207468652070726f706f736572000000000000006044820152606401610503565b60048101805460ff60b81b1916600160b81b17905560405182907fa6aeb4af4b0ac3fedadea0e4a0b11abda0cac7252e706cd63fc927f570cf0524905f90a25050565b6002546001600160a01b031633146109d55760405162461bcd60e51b81526004016105039061206a565b5f5460405163f49bb76b60e01b81526001600160a01b039091169063f49bb76b90610a0a90879087908790879060040161211b565b5f604051808303815f87803b158015610a21575f80fd5b505af1158015610a33573d5f803e3d5ffd5b50505050836001600160a01b03167f5ce0614a46459714585c219d6fb0dd3a4b01b81fc18567ebe68bf418067c91d484848460405161072a9392919061214c565b60058181548110610a83575f80fd5b5f918252602090912001546001600160a01b0316905081565b6060806005600681805480602002602001604051908101604052809291908181526020018280548015610af657602002820191905f5260205f20905b81546001600160a01b03168152600190910190602001808311610ad8575b5050505050915080805480602002602001604051908101604052809291908181526020018280548015610b4657602002820191905f5260205f20905b815481526020019060010190808311610b32575b50505050509050915091509091565b6002546001600160a01b03163314610b7f5760405162461bcd60e51b81526004016105039061206a565b6001600160a01b038116610ba55760405162461bcd60e51b81526004016105039061209a565b6002546040516001600160a01b038084169216907fca4de081ad2eb92babef22ea663c56c9b11b18bbdfee317b404312827094e7c2905f90a3600280546001600160a01b0319166001600160a01b0392909216919091179055565b5f6001600160a01b038316610c275760405162461bcd60e51b81526004016105039061209a565b5f8211610c6d5760405162461bcd60e51b815260206004820152601460248201527310dbdb5c185b9e4e881e995c9bc8185b5bdd5b9d60621b6044820152606401610503565b5f610c773361186f565b6005549091508110610ccb5760405162461bcd60e51b815260206004820152601d60248201527f436f6d70616e793a206e6f7420616e2065717569747920686f6c6465720000006044820152606401610503565b60068181548110610cde57610cde61216e565b905f5260205f200154831115610d365760405162461bcd60e51b815260206004820152601b60248201527f436f6d70616e793a20696e73756666696369656e74207374616b6500000000006044820152606401610503565b6003545f9081906001600160a01b031615801590610d5e57506004546001600160a01b031615155b15610d7d5750506003546004546001600160a01b039182169116610dd4565b6003546001600160a01b031615610da1576003546001600160a01b03169150610dd4565b6004546001600160a01b031615610dc5576004546001600160a01b03169150610dd4565b6002546001600160a01b031691505b6001600160a01b038281163314905f90831615801590610dfc5750336001600160a01b038416145b600880549192505f610e0d83612196565b909155505f8181526007602052604090208054336001600160a01b031991821617825560018201805482166001600160a01b038d811691909117909155600283018b9055600383018054909216888216179091556004820180549187166001600160a81b031990921691909117600160a01b861515021762ffffff60a81b1916600160a81b8515150261ffff60b01b1916179055909650610eb14262278d006121ae565b6005820155604080518981526001600160a01b038781166020830152868116828401529151918b169133918a917f92912417cc9cd09968485ff1b013237a642c56698ea5cb62b299ab4a66f95ce09181900360600190a4610f11876118ca565b50505050505092915050565b6002546001600160a01b03163314610f475760405162461bcd60e51b81526004016105039061206a565b5f805f9054906101000a90046001600160a01b03166001600160a01b0316639bb1a99c6040518163ffffffff1660e01b8152600401602060405180830381865afa158015610f97573d5f803e3d5ffd5b505050506040513d601f19601f82011682018060405250810190610fbb91906121c1565b6040516370a0823160e01b81523060048201526001600160a01b0391909116906370a0823190602401602060405180830381865afa158015610fff573d5f803e3d5ffd5b505050506040513d601f19601f8201168201806040525081019061102391906121dc565b90505f811161107f5760405162461bcd60e51b815260206004820152602260248201527f436f6d70616e793a206e6f20562d746f6b656e7320746f206469737472696275604482015261746560f01b6064820152608401610503565b5f5b600554811015611161575f612710600683815481106110a2576110a261216e565b905f5260205f200154846110b691906121f3565b6110c0919061220a565b90508015611158575f54600580546001600160a01b03909216916353c15f469190859081106110f1576110f161216e565b5f9182526020909120015460405160e083901b6001600160e01b03191681526001600160a01b039091166004820152602481018490526044015f604051808303815f87803b158015611141575f80fd5b505af1158015611153573d5f803e3d5ffd5b505050505b50600101611081565b506005546040805183815260208101929092527f2f588cf4bb0247b0f3f60e06187f92e6fd1deaabb56e2bcc56723523378713279101610595565b5f6111a56119af565b805490915060ff600160401b820416159067ffffffffffffffff165f811580156111cc5750825b90505f8267ffffffffffffffff1660011480156111e85750303b155b9050811580156111f6575080155b156112145760405163f92ee8a960e01b815260040160405180910390fd5b845467ffffffffffffffff19166001178555831561123e57845460ff60401b1916600160401b1785555b6001600160a01b038d1661128b5760405162461bcd60e51b8152602060048201526014602482015273436f6d70616e793a207a65726f20636f6c6f6e7960601b6044820152606401610503565b6001600160a01b038a166112e15760405162461bcd60e51b815260206004820152601760248201527f436f6d70616e793a207a65726f207365637265746172790000000000000000006044820152606401610503565b876113245760405162461bcd60e51b8152602060048201526013602482015272436f6d70616e793a206e6f20686f6c6465727360681b6044820152606401610503565b8786146113735760405162461bcd60e51b815260206004820152601860248201527f436f6d70616e793a206c656e677468206d69736d6174636800000000000000006044820152606401610503565b5f80546001600160a01b0319166001600160a01b038f16179055600161139a8c8e83612286565b50600280546001600160a01b0319166001600160a01b038c161790555f805b8981101561147e5760058b8b838181106113d5576113d561216e565b90506020020160208101906113ea9190611eec565b81546001810183555f928352602090922090910180546001600160a01b0319166001600160a01b03909216919091179055600689898381811061142f5761142f61216e565b83546001810185555f9485526020948590209190940292909201359190920155508888828181106114625761146261216e565b905060200201358261147491906121ae565b91506001016113b9565b5080612710146114de5760405162461bcd60e51b815260206004820152602560248201527f436f6d70616e793a207374616b6573206d7573742073756d20746f2031303030604482015264302062707360d81b6064820152608401610503565b50831561152557845460ff60401b19168555604051600181527fc7f505b2f371ae2175ee4913f4499e1f2633a7b5936321eed1cdaeb6115181d29060200160405180910390a15b50505050505050505050505050565b5f805f9054906101000a90046001600160a01b03166001600160a01b0316639ebdf12c6040518163ffffffff1660e01b8152600401602060405180830381865afa158015611584573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906115a891906121c1565b6040516370a0823160e01b81523060048201526001600160a01b0391909116906370a0823190602401602060405180830381865afa1580156115ec573d5f803e3d5ffd5b505050506040513d601f19601f8201168201806040525081019061161091906121dc565b905090565b5f8181526007602052604090206004810154600160b01b900460ff161561167a5760405162461bcd60e51b815260206004820152601960248201527810dbdb5c185b9e4e88185b1c9958591e48195e1958dd5d1959603a1b6044820152606401610503565b6004810154600160b81b900460ff16156116cb5760405162461bcd60e51b815260206004820152601260248201527110dbdb5c185b9e4e8818d85b98d95b1b195960721b6044820152606401610503565b806005015442111561171f5760405162461bcd60e51b815260206004820152601960248201527f436f6d70616e793a2070726f706f73616c2065787069726564000000000000006044820152606401610503565b60038101546001600160a01b0316331480611746575060048101546001600160a01b031633145b6117925760405162461bcd60e51b815260206004820181905260248201527f436f6d70616e793a206e6f74206120726571756972656420617070726f7665726044820152606401610503565b60038101546001600160a01b031633036117bc5760048101805460ff60a01b1916600160a01b1790555b60048101546001600160a01b031633036117e65760048101805460ff60a81b1916600160a81b1790555b604051339083907f11aacbe2f2825ef52cbdb5ae2078e4e68ce89098f098f0e575127f7e8a0a0376905f90a361181b826118ca565b5050565b5f805f9054906101000a90046001600160a01b03166001600160a01b0316639bb1a99c6040518163ffffffff1660e01b8152600401602060405180830381865afa158015611584573d5f803e3d5ffd5b5f805b6005548110156118c057826001600160a01b0316600582815481106118995761189961216e565b5f918252602090912001546001600160a01b0316036118b85792915050565b600101611872565b5050600554919050565b5f8181526007602052604081206004810154909190600160a01b900460ff168015611915575060048201546001600160a01b0316158061191557506004820154600160a81b900460ff165b90508061192157505050565b60048201805460ff60b01b1916600160b01b179055815460018301546002840154611959926001600160a01b039081169216906119d9565b6001820154825460028401546040519081526001600160a01b03928316929091169085907f652f164e170503a2ea46cac2a6040846604bf24847a97efe0a581b121bbd141f9060200160405180910390a4505050565b5f807ff0c57e16840df040f15088dc2f81fe391c3923bec73e23a9662efc9c229c6a005b92915050565b5f6119e38461186f565b6005549091508110611a375760405162461bcd60e51b815260206004820152601a60248201527f436f6d70616e793a2066726f6d206e6f74206120686f6c6465720000000000006044820152606401610503565b60068181548110611a4a57611a4a61216e565b905f5260205f200154821115611a9b5760405162461bcd60e51b815260206004820152601660248201527510dbdb5c185b9e4e881cdd185ad94818da185b99d95960521b6044820152606401610503565b8160068281548110611aaf57611aaf61216e565b905f5260205f20015f828254611ac59190612340565b909155505f9050611ad58461186f565b600554909150811015611b17578260068281548110611af657611af661216e565b905f5260205f20015f828254611b0c91906121ae565b90915550611b8f9050565b6005805460018082019092557f036b6384b5eca791c62761152d0c79bb0604c104a5fb6f4eb0703f3154bb3db00180546001600160a01b0319166001600160a01b0387161790556006805491820181555f527ff652222313e28459528d920b65115c16c04f3efc82aaedc97be59f3f377c0d3f018390555b60068281548110611ba257611ba261216e565b905f5260205f2001545f03611bba57611bba82611bc1565b5050505050565b6005545f90611bd290600190612340565b9050808214611c7f5760058181548110611bee57611bee61216e565b5f91825260209091200154600580546001600160a01b039092169184908110611c1957611c1961216e565b905f5260205f20015f6101000a8154816001600160a01b0302191690836001600160a01b0316021790555060068181548110611c5757611c5761216e565b905f5260205f20015460068381548110611c7357611c7361216e565b5f918252602090912001555b6005805480611c9057611c90612353565b5f8281526020902081015f1990810180546001600160a01b03191690550190556006805480611cc157611cc1612353565b600190038181905f5260205f20015f905590555050565b5f60208284031215611ce8575f80fd5b5035919050565b602081525f82518060208401528060208501604085015e5f604082850101526040601f19601f83011684010191505092915050565b5f8083601f840112611d34575f80fd5b50813567ffffffffffffffff811115611d4b575f80fd5b602083019150836020828501011115611d62575f80fd5b9250929050565b6001600160a01b0381168114611d7d575f80fd5b50565b5f805f60408486031215611d92575f80fd5b833567ffffffffffffffff811115611da8575f80fd5b611db486828701611d24565b9094509250506020840135611dc881611d69565b809150509250925092565b5f8060208385031215611de4575f80fd5b823567ffffffffffffffff811115611dfa575f80fd5b611e0685828601611d24565b90969095509350505050565b5f805f8060608587031215611e25575f80fd5b8435611e3081611d69565b935060208501359250604085013567ffffffffffffffff811115611e52575f80fd5b611e5e87828801611d24565b95989497509550505050565b604080825283519082018190525f906020906060840190828701845b82811015611eab5781516001600160a01b031684529284019290840190600101611e86565b505050838103828501528451808252858301918301905f5b81811015611edf57835183529284019291840191600101611ec3565b5090979650505050505050565b5f60208284031215611efc575f80fd5b8135611f0781611d69565b9392505050565b5f8060408385031215611f1f575f80fd5b8235611f2a81611d69565b946020939093013593505050565b5f8083601f840112611f48575f80fd5b50813567ffffffffffffffff811115611f5f575f80fd5b6020830191508360208260051b8501011115611d62575f80fd5b5f805f805f805f8060a0898b031215611f90575f80fd5b8835611f9b81611d69565b9750602089013567ffffffffffffffff80821115611fb7575f80fd5b611fc38c838d01611d24565b909950975060408b01359150611fd882611d69565b90955060608a01359080821115611fed575f80fd5b611ff98c838d01611f38565b909650945060808b0135915080821115612011575f80fd5b5061201e8b828c01611f38565b999c989b5096995094979396929594505050565b600181811c9082168061204657607f821691505b60208210810361206457634e487b7160e01b5f52602260045260245ffd5b50919050565b602080825260169082015275436f6d70616e793a206e6f742073656372657461727960501b604082015260600190565b602080825260159082015274436f6d70616e793a207a65726f206164647265737360581b604082015260600190565b818382375f9101908152919050565b81835281816020850137505f828201602090810191909152601f909101601f19169091010190565b602081525f6121136020830184866120d8565b949350505050565b60018060a01b0385168152836020820152606060408201525f6121426060830184866120d8565b9695505050505050565b838152604060208201525f6121656040830184866120d8565b95945050505050565b634e487b7160e01b5f52603260045260245ffd5b634e487b7160e01b5f52601160045260245ffd5b5f600182016121a7576121a7612182565b5060010190565b808201808211156119d3576119d3612182565b5f602082840312156121d1575f80fd5b8151611f0781611d69565b5f602082840312156121ec575f80fd5b5051919050565b80820281158282048414176119d3576119d3612182565b5f8261222457634e487b7160e01b5f52601260045260245ffd5b500490565b634e487b7160e01b5f52604160045260245ffd5b601f82111561228157805f5260205f20601f840160051c810160208510156122625750805b601f840160051c820191505b81811015611bba575f815560010161226e565b505050565b67ffffffffffffffff83111561229e5761229e612229565b6122b2836122ac8354612032565b8361223d565b5f601f8411600181146122e3575f85156122cc5750838201355b5f19600387901b1c1916600186901b178355611bba565b5f83815260208120601f198716915b8281101561231257868501358255602094850194600190920191016122f2565b508682101561232e575f1960f88860031b161c19848701351681555b505060018560011b0183555050505050565b818103818111156119d3576119d3612182565b634e487b7160e01b5f52603160045260245ffdfea26469706673582212207418093203ec333cb71120bc6ffad4a735048d65f2d07b177278319d3dcb0f8464736f6c63430008190033"
  },
  "UpgradeableBeacon": {
    "abi": [
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "implementation_",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "initialOwner",
            "type": "address"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "implementation",
            "type": "address"
          }
        ],
        "name": "BeaconInvalidImplementation",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "OwnableInvalidOwner",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "OwnableUnauthorizedAccount",
        "type": "error"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "previousOwner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "implementation",
            "type": "address"
          }
        ],
        "name": "Upgraded",
        "type": "event"
      },
      {
        "inputs": [],
        "name": "implementation",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "owner",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "newImplementation",
            "type": "address"
          }
        ],
        "name": "upgradeTo",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ],
    "bytecode": "0x608060405234801561000f575f80fd5b5060405161042138038061042183398101604081905261002e9161015f565b806001600160a01b03811661005d57604051631e4fbdf760e01b81525f60048201526024015b60405180910390fd5b61006681610077565b50610070826100c6565b5050610190565b5f80546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b806001600160a01b03163b5f036100fb5760405163211eb15960e21b81526001600160a01b0382166004820152602401610054565b600180546001600160a01b0319166001600160a01b0383169081179091556040517fbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b905f90a250565b80516001600160a01b038116811461015a575f80fd5b919050565b5f8060408385031215610170575f80fd5b61017983610144565b915061018760208401610144565b90509250929050565b6102848061019d5f395ff3fe608060405234801561000f575f80fd5b5060043610610055575f3560e01c80633659cfe6146100595780635c60da1b1461006e578063715018a6146100975780638da5cb5b1461009f578063f2fde38b146100af575b5f80fd5b61006c610067366004610221565b6100c2565b005b6001546001600160a01b03165b6040516001600160a01b03909116815260200160405180910390f35b61006c6100d6565b5f546001600160a01b031661007b565b61006c6100bd366004610221565b6100e9565b6100ca610128565b6100d381610154565b50565b6100de610128565b6100e75f6101d2565b565b6100f1610128565b6001600160a01b03811661011f57604051631e4fbdf760e01b81525f60048201526024015b60405180910390fd5b6100d3816101d2565b5f546001600160a01b031633146100e75760405163118cdaa760e01b8152336004820152602401610116565b806001600160a01b03163b5f036101895760405163211eb15960e21b81526001600160a01b0382166004820152602401610116565b600180546001600160a01b0319166001600160a01b0383169081179091556040517fbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b905f90a250565b5f80546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b5f60208284031215610231575f80fd5b81356001600160a01b0381168114610247575f80fd5b939250505056fea26469706673582212203956f87d88f7eea233e395fb4c6b72594e816e27bafc6ddee5aadf0e98c92c0864736f6c63430008190033"
  },
  "CompanyFactory": {
    "abi": [
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "colonyAddress",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "oTokenAddress",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "beaconAddress",
            "type": "address"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "wallet",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "founder",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "oTokenId",
            "type": "uint256"
          }
        ],
        "name": "CompanyDeployed",
        "type": "event"
      },
      {
        "inputs": [],
        "name": "beacon",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "colony",
        "outputs": [
          {
            "internalType": "contract Colony",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "companyCount",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "address[]",
            "name": "equityHolders",
            "type": "address[]"
          },
          {
            "internalType": "uint256[]",
            "name": "equityStakes",
            "type": "uint256[]"
          },
          {
            "internalType": "uint8",
            "name": "orgType",
            "type": "uint8"
          }
        ],
        "name": "deployCompany",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "companyId",
            "type": "uint256"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "wallet",
            "type": "address"
          }
        ],
        "name": "getCompaniesOf",
        "outputs": [
          {
            "internalType": "uint256[]",
            "name": "",
            "type": "uint256[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          }
        ],
        "name": "getCompany",
        "outputs": [
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "wallet",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "founder",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "oTokenId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "registeredAt",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "oToken",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    "bytecode": "0x6080604052348015600e575f80fd5b50604051611394380380611394833981016040819052602b916085565b5f80546001600160a01b039485166001600160a01b03199182161790915560018054938516938216939093179092556002805491909316911617905560be565b80516001600160a01b03811681146080575f80fd5b919050565b5f805f606084860312156096575f80fd5b609d84606b565b925060a960208501606b565b915060b560408501606b565b90509250925092565b6112c9806100cb5f395ff3fe608060405234801561000f575f80fd5b506004361061007a575f3560e01c806357d139171161005857806357d13917146100e157806359659e90146101055780638342b22b146101185780638e75dd4714610138575f80fd5b80631a32aad61461007e578063349ff770146100ae5780633b56fd44146100c0575b5f80fd5b600154610091906001600160a01b031681565b6040516001600160a01b0390911681526020015b60405180910390f35b5f54610091906001600160a01b031681565b6100d36100ce366004610878565b610140565b6040519081526020016100a5565b6100f46100ef366004610943565b6106b4565b6040516100a5959493929190610988565b600254610091906001600160a01b031681565b61012b6101263660046109dd565b6107a5565b6040516100a591906109fd565b6003546100d3565b5f805460405163f3caad0360e01b81523360048201526001600160a01b039091169063f3caad0390602401602060405180830381865afa158015610186573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906101aa9190610a40565b6101fb5760405162461bcd60e51b815260206004820152601d60248201527f436f6d70616e79466163746f72793a206e6f74206120636974697a656e00000060448201526064015b60405180910390fd5b866102485760405162461bcd60e51b815260206004820152601d60248201527f436f6d70616e79466163746f72793a206e616d6520726571756972656400000060448201526064016101f2565b846102955760405162461bcd60e51b815260206004820152601a60248201527f436f6d70616e79466163746f72793a206e6f20686f6c6465727300000000000060448201526064016101f2565b8483146102e45760405162461bcd60e51b815260206004820152601f60248201527f436f6d70616e79466163746f72793a206c656e677468206d69736d617463680060448201526064016101f2565b5f805b8481101561031d5785858281811061030157610301610a5f565b90506020020135826103139190610a73565b91506001016102e7565b5080612710146103845760405162461bcd60e51b815260206004820152602c60248201527f436f6d70616e79466163746f72793a207374616b6573206d7573742073756d2060448201526b746f2031303030302062707360a01b60648201526084016101f2565b5f80546040516103ae916001600160a01b0316908c908c9033908d908d908d908d90602401610ac0565b60408051601f198184030181529181526020820180516001600160e01b031663cb8a517560e01b17905260025490519192505f916001600160a01b039091169083906103f99061080e565b610404929190610b5f565b604051809103905ff08015801561041d573d5f803e3d5ffd5b5090505f805f9054906101000a90046001600160a01b03166001600160a01b03166321ff05c7838e8e8a6040518563ffffffff1660e01b81526004016104669493929190610b8a565b6020604051808303815f875af1158015610482573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906104a69190610bc2565b5f5460405163b63e8d1560e01b81526001600160a01b03858116600483015292935091169063b63e8d15906024015f604051808303815f87803b1580156104eb575f80fd5b505af11580156104fd573d5f803e3d5ffd5b50505050600380549050945060036040518060a001604052808e8e8080601f0160208091040260200160405190810160405280939291908181526020018383808284375f9201829052509385525050506001600160a01b038616602080840191909152336040840152606083018690524260809093019290925283546001810185559381522081519192600502019081906105989082610c71565b5060208201516001820180546001600160a01b039283166001600160a01b0319918216179091556040840151600284018054919093169116179055606082015160038201556080909101516004909101555f5b898110156106545760045f8c8c8481811061060857610608610a5f565b905060200201602081019061061d91906109dd565b6001600160a01b031681526020808201929092526040015f90812080546001818101835591835292909120909101879055016105eb565b50336001600160a01b0316826001600160a01b0316867fdfb72d7c9bc6f5c82e4fdfa88d06f1a6cfc5e09231d89fd9f778c761b12e737d8f8f8660405161069d93929190610d31565b60405180910390a450505050979650505050505050565b60605f805f805f600387815481106106ce576106ce610a5f565b5f91825260209091206005909102016001810154600282015460038301546004840154845494955085946001600160a01b039485169490931692859061071390610bed565b80601f016020809104026020016040519081016040528092919081815260200182805461073f90610bed565b801561078a5780601f106107615761010080835404028352916020019161078a565b820191905f5260205f20905b81548152906001019060200180831161076d57829003601f168201915b50505050509450955095509550955095505091939590929450565b6001600160a01b0381165f9081526004602090815260409182902080548351818402810184019094528084526060939283018282801561080257602002820191905f5260205f20905b8154815260200190600101908083116107ee575b50505050509050919050565b61053f80610d5583390190565b5f8083601f84011261082b575f80fd5b50813567ffffffffffffffff811115610842575f80fd5b6020830191508360208260051b850101111561085c575f80fd5b9250929050565b803560ff81168114610873575f80fd5b919050565b5f805f805f805f6080888a03121561088e575f80fd5b873567ffffffffffffffff808211156108a5575f80fd5b818a0191508a601f8301126108b8575f80fd5b8135818111156108c6575f80fd5b8b60208285010111156108d7575f80fd5b6020928301995097509089013590808211156108f1575f80fd5b6108fd8b838c0161081b565b909750955060408a0135915080821115610915575f80fd5b506109228a828b0161081b565b9094509250610935905060608901610863565b905092959891949750929550565b5f60208284031215610953575f80fd5b5035919050565b5f81518084528060208401602086015e5f602082860101526020601f19601f83011685010191505092915050565b60a081525f61099a60a083018861095a565b6001600160a01b039687166020840152949095166040820152606081019290925260809091015292915050565b80356001600160a01b0381168114610873575f80fd5b5f602082840312156109ed575f80fd5b6109f6826109c7565b9392505050565b602080825282518282018190525f9190848201906040850190845b81811015610a3457835183529284019291840191600101610a18565b50909695505050505050565b5f60208284031215610a50575f80fd5b815180151581146109f6575f80fd5b634e487b7160e01b5f52603260045260245ffd5b80820180821115610a9257634e487b7160e01b5f52601160045260245ffd5b92915050565b81835281816020850137505f828201602090810191909152601f909101601f19169091010190565b5f60018060a01b03808b168352602060a081850152610ae360a085018b8d610a98565b89831660408601528481036060860152878152889082015f5b89811015610b215784610b0e846109c7565b1682529183019190830190600101610afc565b5085810360808701528681526001600160fb1b03871115610b40575f80fd5b8660051b9350838884830137909201019b9a5050505050505050505050565b6001600160a01b03831681526040602082018190525f90610b829083018461095a565b949350505050565b6001600160a01b03851681526060602082018190525f90610bae9083018587610a98565b905060ff8316604083015295945050505050565b5f60208284031215610bd2575f80fd5b5051919050565b634e487b7160e01b5f52604160045260245ffd5b600181811c90821680610c0157607f821691505b602082108103610c1f57634e487b7160e01b5f52602260045260245ffd5b50919050565b601f821115610c6c57805f5260205f20601f840160051c81016020851015610c4a5750805b601f840160051c820191505b81811015610c69575f8155600101610c56565b50505b505050565b815167ffffffffffffffff811115610c8b57610c8b610bd9565b610c9f81610c998454610bed565b84610c25565b602080601f831160018114610cd2575f8415610cbb5750858301515b5f19600386901b1c1916600185901b178555610d29565b5f85815260208120601f198616915b82811015610d0057888601518255948401946001909101908401610ce1565b5085821015610d1d57878501515f19600388901b60f8161c191681555b505060018460011b0185555b505050505050565b604081525f610d44604083018587610a98565b905082602083015294935050505056fe60a060405260405161053f38038061053f83398101604081905261002291610331565b61002c828261003e565b506001600160a01b031660805261040d565b610047826100fb565b6040516001600160a01b038316907f1cf3b03a6cf19fa2baba4df148e9dcabedea7f8a5c07840e207e5c089be95d3e905f90a28051156100ef576100ea826001600160a01b0316635c60da1b6040518163ffffffff1660e01b8152600401602060405180830381865afa1580156100c0573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906100e491906103ed565b82610209565b505050565b6100f76102aa565b5050565b806001600160a01b03163b5f0361013557604051631933b43b60e21b81526001600160a01b03821660048201526024015b60405180910390fd5b807fa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d5080546001600160a01b0319166001600160a01b0392831617905560408051635c60da1b60e01b815290515f92841691635c60da1b9160048083019260209291908290030181865afa1580156101ae573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906101d291906103ed565b9050806001600160a01b03163b5f036100f757604051634c9c8ce360e01b81526001600160a01b038216600482015260240161012c565b60605f61021684846102cb565b905080801561023757505f3d118061023757505f846001600160a01b03163b115b1561024c576102446102de565b9150506102a4565b801561027657604051639996b31560e01b81526001600160a01b038516600482015260240161012c565b3d15610289576102846102f7565b6102a2565b60405163d6bda27560e01b815260040160405180910390fd5b505b92915050565b34156102c95760405163b398979f60e01b815260040160405180910390fd5b565b5f805f835160208501865af49392505050565b6040513d81523d5f602083013e3d602001810160405290565b6040513d5f823e3d81fd5b80516001600160a01b0381168114610318575f80fd5b919050565b634e487b7160e01b5f52604160045260245ffd5b5f8060408385031215610342575f80fd5b61034b83610302565b60208401519092506001600160401b0380821115610367575f80fd5b818501915085601f83011261037a575f80fd5b81518181111561038c5761038c61031d565b604051601f8201601f19908116603f011681019083821181831017156103b4576103b461031d565b816040528281528860208487010111156103cc575f80fd5b8260208601602083015e5f6020848301015280955050505050509250929050565b5f602082840312156103fd575f80fd5b61040682610302565b9392505050565b60805161011b6104245f395f601d015261011b5ff3fe6080604052600a600c565b005b60186014601a565b609d565b565b5f7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316635c60da1b6040518163ffffffff1660e01b8152600401602060405180830381865afa1580156076573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906098919060ba565b905090565b365f80375f80365f845af43d5f803e80801560b6573d5ff35b3d5ffd5b5f6020828403121560c9575f80fd5b81516001600160a01b038116811460de575f80fd5b939250505056fea2646970667358221220b4d171c91104b11935acfb0e21f3489de043d1f81010125fab26bfe1470a144e64736f6c63430008190033a264697066735822122098505328313290ee54b3ad3c67a387b361cfff26c6d8defb25002af888a0b9e364736f6c63430008190033"
  },
  "MCCBilling": {
    "abi": [
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "colonyAddr",
            "type": "address"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "citizen",
            "type": "address"
          }
        ],
        "name": "BillCleared",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "citizen",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amountWei",
            "type": "uint256"
          }
        ],
        "name": "BillSet",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [],
        "name": "MonthReset",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "citizen",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amountWei",
            "type": "uint256"
          }
        ],
        "name": "PaymentRecorded",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "name": "billOf",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "citizen",
            "type": "address"
          }
        ],
        "name": "clearBill",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "colony",
        "outputs": [
          {
            "internalType": "contract Colony",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address[]",
            "name": "citizens",
            "type": "address[]"
          }
        ],
        "name": "getBills",
        "outputs": [
          {
            "internalType": "uint256[]",
            "name": "amounts",
            "type": "uint256[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "citizen",
            "type": "address"
          }
        ],
        "name": "recordPayment",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "resetMonth",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "citizen",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amountS",
            "type": "uint256"
          }
        ],
        "name": "setBill",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address[]",
            "name": "citizens",
            "type": "address[]"
          },
          {
            "internalType": "uint256[]",
            "name": "amountsS",
            "type": "uint256[]"
          }
        ],
        "name": "setBillBatch",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "totalRevenueMTD",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    "bytecode": "0x6080604052348015600e575f80fd5b50604051610c9f380380610c9f833981016040819052602b91604e565b5f80546001600160a01b0319166001600160a01b03929092169190911790556079565b5f60208284031215605d575f80fd5b81516001600160a01b03811681146072575f80fd5b9392505050565b610c19806100865f395ff3fe608060405234801561000f575f80fd5b5060043610610090575f3560e01c80633f0e5ada116100635780633f0e5ada146101185780637a522e021461013857806390e2d2cc1461014b578063916b6c4b14610154578063ebe71a5f1461015c575f80fd5b8063050ff70714610094578063078d4c2b146100c6578063158905e8146100db578063349ff770146100ee575b5f80fd5b6100b36100a2366004610989565b60016020525f908152604090205481565b6040519081526020015b60405180910390f35b6100d96100d4366004610989565b61016f565b005b6100d96100e93660046109ab565b610320565b5f54610100906001600160a01b031681565b6040516001600160a01b0390911681526020016100bd565b61012b610126366004610a1d565b6104ee565b6040516100bd9190610a5c565b6100d9610146366004610989565b6105b5565b6100b360025481565b6100d961069a565b6100d961016a366004610a9f565b61076b565b5f8054906101000a90046001600160a01b03166001600160a01b0316634d853ee56040518163ffffffff1660e01b8152600401602060405180830381865afa1580156101bd573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906101e19190610b06565b6001600160a01b0316336001600160a01b03161461021a5760405162461bcd60e51b815260040161021190610b21565b60405180910390fd5b6001600160a01b0381165f908152600160205260409020548061027f5760405162461bcd60e51b815260206004820152601f60248201527f4d434342696c6c696e673a206e6f206f75747374616e64696e672062696c6c006044820152606401610211565b8060025f8282546102909190610b6c565b90915550506001600160a01b0382165f8181526001602052604080822091909155517f8d40b1e890ced9adf397d25a06046df796e132dd75cbfb5a21c868c2b4a4a75e906102e19084815260200190565b60405180910390a26040516001600160a01b038316907fcb2977ef021a9b6164dd76c1a65eb5f89dc79216151911b46665d48b49d5434a905f90a25050565b5f8054906101000a90046001600160a01b03166001600160a01b0316634d853ee56040518163ffffffff1660e01b8152600401602060405180830381865afa15801561036e573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906103929190610b06565b6001600160a01b0316336001600160a01b0316146103c25760405162461bcd60e51b815260040161021190610b21565b5f5460405163f3caad0360e01b81526001600160a01b0384811660048301529091169063f3caad0390602401602060405180830381865afa158015610409573d5f803e3d5ffd5b505050506040513d601f19601f8201168201806040525081019061042d9190610b85565b6104795760405162461bcd60e51b815260206004820152601960248201527f4d434342696c6c696e673a206e6f74206120636974697a656e000000000000006044820152606401610211565b61048b81670de0b6b3a7640000610ba4565b6001600160a01b0383165f818152600160205260409020919091557f5464440453fc39b658a9b561093845a38ca97029be9942ab109286c83ab820a26104d983670de0b6b3a7640000610ba4565b60405190815260200160405180910390a25050565b60608167ffffffffffffffff81111561050957610509610bbb565b604051908082528060200260200182016040528015610532578160200160208202803683370190505b5090505f5b828110156105ae5760015f85858481811061055457610554610bcf565b90506020020160208101906105699190610989565b6001600160a01b03166001600160a01b031681526020019081526020015f205482828151811061059b5761059b610bcf565b6020908102919091010152600101610537565b5092915050565b5f8054906101000a90046001600160a01b03166001600160a01b0316634d853ee56040518163ffffffff1660e01b8152600401602060405180830381865afa158015610603573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906106279190610b06565b6001600160a01b0316336001600160a01b0316146106575760405162461bcd60e51b815260040161021190610b21565b6001600160a01b0381165f81815260016020526040808220829055517fcb2977ef021a9b6164dd76c1a65eb5f89dc79216151911b46665d48b49d5434a9190a250565b5f8054906101000a90046001600160a01b03166001600160a01b0316634d853ee56040518163ffffffff1660e01b8152600401602060405180830381865afa1580156106e8573d5f803e3d5ffd5b505050506040513d601f19601f8201168201806040525081019061070c9190610b06565b6001600160a01b0316336001600160a01b03161461073c5760405162461bcd60e51b815260040161021190610b21565b5f60028190556040517f90101c41c01c8c5597abff0f6dfac9deda2262990f3a32bca35cca06b3b9ec259190a1565b5f8054906101000a90046001600160a01b03166001600160a01b0316634d853ee56040518163ffffffff1660e01b8152600401602060405180830381865afa1580156107b9573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906107dd9190610b06565b6001600160a01b0316336001600160a01b03161461080d5760405162461bcd60e51b815260040161021190610b21565b82811461085c5760405162461bcd60e51b815260206004820152601b60248201527f4d434342696c6c696e673a206c656e677468206d69736d6174636800000000006044820152606401610211565b5f5b8381101561096b5782828281811061087857610878610bcf565b90506020020135670de0b6b3a76400006108929190610ba4565b60015f8787858181106108a7576108a7610bcf565b90506020020160208101906108bc9190610989565b6001600160a01b0316815260208101919091526040015f20558484828181106108e7576108e7610bcf565b90506020020160208101906108fc9190610989565b6001600160a01b03167f5464440453fc39b658a9b561093845a38ca97029be9942ab109286c83ab820a284848481811061093857610938610bcf565b90506020020135670de0b6b3a76400006109529190610ba4565b60405190815260200160405180910390a260010161085e565b5050505050565b6001600160a01b0381168114610986575f80fd5b50565b5f60208284031215610999575f80fd5b81356109a481610972565b9392505050565b5f80604083850312156109bc575f80fd5b82356109c781610972565b946020939093013593505050565b5f8083601f8401126109e5575f80fd5b50813567ffffffffffffffff8111156109fc575f80fd5b6020830191508360208260051b8501011115610a16575f80fd5b9250929050565b5f8060208385031215610a2e575f80fd5b823567ffffffffffffffff811115610a44575f80fd5b610a50858286016109d5565b90969095509350505050565b602080825282518282018190525f9190848201906040850190845b81811015610a9357835183529284019291840191600101610a77565b50909695505050505050565b5f805f8060408587031215610ab2575f80fd5b843567ffffffffffffffff80821115610ac9575f80fd5b610ad5888389016109d5565b90965094506020870135915080821115610aed575f80fd5b50610afa878288016109d5565b95989497509550505050565b5f60208284031215610b16575f80fd5b81516109a481610972565b60208082526017908201527f4d434342696c6c696e673a206e6f7420666f756e646572000000000000000000604082015260600190565b634e487b7160e01b5f52601160045260245ffd5b80820180821115610b7f57610b7f610b58565b92915050565b5f60208284031215610b95575f80fd5b815180151581146109a4575f80fd5b8082028115828204841417610b7f57610b7f610b58565b634e487b7160e01b5f52604160045260245ffd5b634e487b7160e01b5f52603260045260245ffdfea264697066735822122005641d183b34372ba4f01144b70778ceae907a68d2fdf7eee3412bce8c5cdba364736f6c63430008190033"
  },
  "MCCServices": {
    "abi": [
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "colonyAddress",
            "type": "address"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "indexed": false,
            "internalType": "string",
            "name": "price",
            "type": "string"
          }
        ],
        "name": "ServiceAdded",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "indexed": false,
            "internalType": "string",
            "name": "price",
            "type": "string"
          }
        ],
        "name": "ServiceEdited",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          }
        ],
        "name": "ServiceRemoved",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "billing",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "price",
            "type": "string"
          }
        ],
        "name": "addService",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "colony",
        "outputs": [
          {
            "internalType": "contract Colony",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "billing",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "price",
            "type": "string"
          }
        ],
        "name": "editService",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "getServices",
        "outputs": [
          {
            "internalType": "uint256[]",
            "name": "ids",
            "type": "uint256[]"
          },
          {
            "internalType": "string[]",
            "name": "names",
            "type": "string[]"
          },
          {
            "internalType": "string[]",
            "name": "billings",
            "type": "string[]"
          },
          {
            "internalType": "string[]",
            "name": "prices",
            "type": "string[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          }
        ],
        "name": "removeService",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "serviceCount",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    "bytecode": "0x6080604052348015600e575f80fd5b50604051611176380380611176833981016040819052602b91604e565b5f80546001600160a01b0319166001600160a01b03929092169190911790556079565b5f60208284031215605d575f80fd5b81516001600160a01b03811681146072575f80fd5b9392505050565b6110f0806100865f395ff3fe608060405234801561000f575f80fd5b5060043610610060575f3560e01c80630623752614610064578063349ff7701461007b5780633f9b4946146100a55780635d8e843a146100b857806375417851146100cd5780639b66b139146100e5575b5f80fd5b6001545b6040519081526020015b60405180910390f35b5f5461008d906001600160a01b031681565b6040516001600160a01b039091168152602001610072565b6100686100b3366004610b8a565b6100f8565b6100cb6100c6366004610c1d565b610366565b005b6100d56105a3565b6040516100729493929190610d26565b6100cb6100f3366004610da7565b6109f8565b5f805f9054906101000a90046001600160a01b03166001600160a01b0316634d853ee56040518163ffffffff1660e01b8152600401602060405180830381865afa158015610148573d5f803e3d5ffd5b505050506040513d601f19601f8201168201806040525081019061016c9190610dbe565b6001600160a01b0316336001600160a01b0316146101a55760405162461bcd60e51b815260040161019c90610deb565b60405180910390fd5b856101f25760405162461bcd60e51b815260206004820152601a60248201527f4d434353657276696365733a206e616d65207265717569726564000000000000604482015260640161019c565b50600180546040805160a06020601f8b0181900402820181019092526080810189815292939290918291908b908b90819085018382808284375f92019190915250505090825250604080516020601f8a01819004810282018101909252888152918101919089908990819084018382808284375f92019190915250505090825250604080516020601f8801819004810282018101909252868152918101919087908790819084018382808284375f92018290525093855250506001602093840181905285549081018655948252502081519192600402019081906102d69082610eba565b50602082015160018201906102eb9082610eba565b50604082015160028201906103009082610eba565b50606091909101516003909101805460ff191691151591909117905560405181907fddcfb03769e1dafa409f0203646fccd45573c7e7ee64130e14f26454b70eb97a90610354908a908a9088908890610fa2565b60405180910390a29695505050505050565b5f8054906101000a90046001600160a01b03166001600160a01b0316634d853ee56040518163ffffffff1660e01b8152600401602060405180830381865afa1580156103b4573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906103d89190610dbe565b6001600160a01b0316336001600160a01b0316146104085760405162461bcd60e51b815260040161019c90610deb565b60015487106104525760405162461bcd60e51b81526020600482015260166024820152751350d0d4d95c9d9a58d95cce881b9bdd08199bdd5b9960521b604482015260640161019c565b6001878154811061046557610465610fc8565b5f91825260209091206003600490920201015460ff166104c75760405162461bcd60e51b815260206004820152601c60248201527f4d434353657276696365733a20736572766963652072656d6f76656400000000604482015260640161019c565b8585600189815481106104dc576104dc610fc8565b905f5260205f2090600402015f0191826104f7929190610fdc565b5083836001898154811061050d5761050d610fc8565b905f5260205f2090600402016001019182610529929190610fdc565b5081816001898154811061053f5761053f610fc8565b905f5260205f209060040201600201918261055b929190610fdc565b50867f6e5513e8628895f1ea4671eaffcf4e0a879285edf1a0d5135d5f1c5b1148a417878785856040516105929493929190610fa2565b60405180910390a250505050505050565b6060806060805f805b6001548110156105fa57600181815481106105c9576105c9610fc8565b5f91825260209091206003600490920201015460ff16156105f257816105ee81611096565b9250505b6001016105ac565b508067ffffffffffffffff81111561061457610614610e22565b60405190808252806020026020018201604052801561063d578160200160208202803683370190505b5094508067ffffffffffffffff81111561065957610659610e22565b60405190808252806020026020018201604052801561068c57816020015b60608152602001906001900390816106775790505b5093508067ffffffffffffffff8111156106a8576106a8610e22565b6040519080825280602002602001820160405280156106db57816020015b60608152602001906001900390816106c65790505b5092508067ffffffffffffffff8111156106f7576106f7610e22565b60405190808252806020026020018201604052801561072a57816020015b60608152602001906001900390816107155790505b5091505f805b6001548110156109ef576001818154811061074d5761074d610fc8565b5f91825260209091206003600490920201015460ff16156109e7578087838151811061077b5761077b610fc8565b6020026020010181815250506001818154811061079a5761079a610fc8565b905f5260205f2090600402015f0180546107b390610e36565b80601f01602080910402602001604051908101604052809291908181526020018280546107df90610e36565b801561082a5780601f106108015761010080835404028352916020019161082a565b820191905f5260205f20905b81548152906001019060200180831161080d57829003601f168201915b505050505086838151811061084157610841610fc8565b60200260200101819052506001818154811061085f5761085f610fc8565b905f5260205f209060040201600101805461087990610e36565b80601f01602080910402602001604051908101604052809291908181526020018280546108a590610e36565b80156108f05780601f106108c7576101008083540402835291602001916108f0565b820191905f5260205f20905b8154815290600101906020018083116108d357829003601f168201915b505050505085838151811061090757610907610fc8565b60200260200101819052506001818154811061092557610925610fc8565b905f5260205f209060040201600201805461093f90610e36565b80601f016020809104026020016040519081016040528092919081815260200182805461096b90610e36565b80156109b65780601f1061098d576101008083540402835291602001916109b6565b820191905f5260205f20905b81548152906001019060200180831161099957829003601f168201915b50505050508483815181106109cd576109cd610fc8565b602002602001018190525081806109e390611096565b9250505b600101610730565b50505090919293565b5f8054906101000a90046001600160a01b03166001600160a01b0316634d853ee56040518163ffffffff1660e01b8152600401602060405180830381865afa158015610a46573d5f803e3d5ffd5b505050506040513d601f19601f82011682018060405250810190610a6a9190610dbe565b6001600160a01b0316336001600160a01b031614610a9a5760405162461bcd60e51b815260040161019c90610deb565b6001548110610ae45760405162461bcd60e51b81526020600482015260166024820152751350d0d4d95c9d9a58d95cce881b9bdd08199bdd5b9960521b604482015260640161019c565b5f60018281548110610af857610af8610fc8565b5f9182526020822060049190910201600301805460ff19169215159290921790915560405182917f419a91c001167ea76233ed548fd1a02c21b5b63f8b6eaa7dd5747aac8791489291a250565b5f8083601f840112610b55575f80fd5b50813567ffffffffffffffff811115610b6c575f80fd5b602083019150836020828501011115610b83575f80fd5b9250929050565b5f805f805f8060608789031215610b9f575f80fd5b863567ffffffffffffffff80821115610bb6575f80fd5b610bc28a838b01610b45565b90985096506020890135915080821115610bda575f80fd5b610be68a838b01610b45565b90965094506040890135915080821115610bfe575f80fd5b50610c0b89828a01610b45565b979a9699509497509295939492505050565b5f805f805f805f6080888a031215610c33575f80fd5b87359650602088013567ffffffffffffffff80821115610c51575f80fd5b610c5d8b838c01610b45565b909850965060408a0135915080821115610c75575f80fd5b610c818b838c01610b45565b909650945060608a0135915080821115610c99575f80fd5b50610ca68a828b01610b45565b989b979a50959850939692959293505050565b5f82825180855260208086019550808260051b8401018186015f5b84811015610d1957601f1980878503018a5282518051808652808783018888015e5f8682018801529a86019a601f019091169093018401925090830190600101610cd4565b5090979650505050505050565b608080825285519082018190525f9060209060a0840190828901845b82811015610d5e57815184529284019290840190600101610d42565b5050508381036020850152610d738188610cb9565b9150508281036040840152610d888186610cb9565b90508281036060840152610d9c8185610cb9565b979650505050505050565b5f60208284031215610db7575f80fd5b5035919050565b5f60208284031215610dce575f80fd5b81516001600160a01b0381168114610de4575f80fd5b9392505050565b6020808252601f908201527f4d434353657276696365733a206e6f7420636f6c6f6e7920666f756e64657200604082015260600190565b634e487b7160e01b5f52604160045260245ffd5b600181811c90821680610e4a57607f821691505b602082108103610e6857634e487b7160e01b5f52602260045260245ffd5b50919050565b601f821115610eb557805f5260205f20601f840160051c81016020851015610e935750805b601f840160051c820191505b81811015610eb2575f8155600101610e9f565b50505b505050565b815167ffffffffffffffff811115610ed457610ed4610e22565b610ee881610ee28454610e36565b84610e6e565b602080601f831160018114610f1b575f8415610f045750858301515b5f19600386901b1c1916600185901b178555610f72565b5f85815260208120601f198616915b82811015610f4957888601518255948401946001909101908401610f2a565b5085821015610f6657878501515f19600388901b60f8161c191681555b505060018460011b0185555b505050505050565b81835281816020850137505f828201602090810191909152601f909101601f19169091010190565b604081525f610fb5604083018688610f7a565b8281036020840152610d9c818587610f7a565b634e487b7160e01b5f52603260045260245ffd5b67ffffffffffffffff831115610ff457610ff4610e22565b611008836110028354610e36565b83610e6e565b5f601f841160018114611039575f85156110225750838201355b5f19600387901b1c1916600186901b178355610eb2565b5f83815260208120601f198716915b828110156110685786850135825560209485019460019092019101611048565b5086821015611084575f1960f88860031b161c19848701351681555b505060018560011b0183555050505050565b5f600182016110b357634e487b7160e01b5f52601160045260245ffd5b506001019056fea26469706673582212200a1d2486696e426e99c17f6079301f9a3f3b1cac6a0f2992c2ec69487e17f39364736f6c63430008190033"
  }
};
