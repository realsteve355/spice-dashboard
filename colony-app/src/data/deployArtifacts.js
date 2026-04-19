// AUTO-GENERATED from Hardhat artifacts — do not edit manually.
// Run: node scripts/extract-bytecodes.js to regenerate.
// Colony is ABI-only — colonies are deployed as BeaconProxy instances.

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
    "bytecode": "0x6080604090808252346104bc57611f3e803803809161001e82856104c0565b833981019082818303126104bc5780516001600160401b0391908281116104bc578361004b9183016104e3565b90602093848201518481116104bc5761006492016104e3565b90845193825161009d602b878487019380858784015e81016a20476f7665726e616e636560a81b8682015203600b8101895201876104c0565b6100cf87519461472d60f01b848701528560229384925180918484015e81015f838201520360028101875201856104c0565b8551938585116102fa575f54946001978887811c971680156104b2575b858810146103dd578190601f97888111610464575b508590888311600114610405575f926103fa575b50505f19600383901b1c191690881b175f555b8051908682116102fa5787548881811c911680156103f0575b858210146103dd5790818784931161038f575b508490878311600114610330575f92610325575b50505f19600383901b1c191690871b1786555b331561030e5760068054336001600160a01b0319821681179092556001600160a01b03167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e05f80a38560075582519485116102fa57600854908682811c921680156102f0575b838310146102de575083811161029a575b508092841160011461023657509282939183925f9461022b575b50501b915f199060031b1c1916176008555b51611a0590816105398239f35b015192505f8061020c565b919083601f19811660085f52845f20945f905b888383106102805750505010610268575b505050811b0160085561021e565b01515f1960f88460031b161c191690555f808061025a565b858701518855909601959485019487935090810190610249565b60085f52815f208480870160051c8201928488106102d5575b0160051c019086905b8281106102ca5750506101f2565b5f81550186906102bc565b925081926102b3565b634e487b7160e01b5f5260045260245ffd5b91607f16916101e1565b634e487b7160e01b5f52604160045260245ffd5b8651631e4fbdf760e01b81525f6004820152602490fd5b015190505f80610168565b90899350601f19831691845f52865f20925f5b888282106103795750508411610361575b505050811b01865561017b565b01515f1960f88460031b161c191690555f8080610354565b8385015186558d97909501949384019301610343565b909150885f52845f208780850160051c8201928786106103d4575b918b91869594930160051c01915b8281106103c6575050610154565b5f81558594508b91016103b8565b925081926103aa565b83634e487b7160e01b5f5260045260245ffd5b90607f1690610141565b015190505f80610115565b908a9350601f198316915f8052875f20925f5b8982821061044e5750508411610436575b505050811b015f55610128565b01515f1960f88460031b161c191690555f8080610429565b8385015186558e97909501949384019301610418565b9091505f8052855f208880850160051c8201928886106104a9575b918c91869594930160051c01915b82811061049b575050610101565b5f81558594508c910161048d565b9250819261047f565b96607f16966100ec565b5f80fd5b601f909101601f19168101906001600160401b038211908210176102fa57604052565b81601f820112156104bc578051906001600160401b0382116102fa5760405192610517601f8401601f1916602001856104c0565b828452602083830101116104bc57815f9260208093018386015e830101529056fe608060409080825260049081361015610016575f80fd5b5f3560e01c90816301ffc9a7146110515750806306fdde0314610fa4578063081812fc14610f6b578063095ea7b314610e8f57806323b872dd14610e7857806342842e0e14610e5057806342ec38e214610e2457806353b1a41114610d755780636352211e14610d455780636a62784214610ba757806370a0823114610b52578063715018a614610af757806375794a3c14610ad95780638da5cb5b14610ab157806395d89b41146109dd5780639f37e2fd146109b5578063a22cb465146108fd578063b88d4fde14610876578063c87b56dd146101e1578063e985e9c5146101935763f2fde38b14610107575f80fd5b3461018f57602036600319011261018f576101206110df565b90610129611637565b6001600160a01b03918216928315610179575050600654826001600160601b0360a01b821617600655167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e05f80a3005b905f6024925191631e4fbdf760e01b8352820152fd5b5f80fd5b823461018f578060031936011261018f576020906101af6110df565b6101b76110f5565b9060018060a01b038091165f5260058452825f2091165f52825260ff815f20541690519015158152f35b50903461018f576020918260031936011261018f5780355f81815260028552839020549091906001600160a01b03161561083357508291610820603d6107d761022c61082f95611663565b6106e8604586516102646021828c80820197602360f81b89528051918291018484015e81015f838201520360018101845201826111a8565b896106ed89517f3c73766720786d6c6e733d22687474703a2f2f7777772e77332e6f72672f3230838201527f30302f737667222077696474683d2234303022206865696768743d22343030228b8201527f2076696577426f783d223020302034303020343030223e00000000000000000060608201527f3c726563742077696474683d2234303022206865696768743d2234303022206660778201526e34b6361e911198309830983091179f60891b60978201527f3c7265637420783d2232302220793d223230222077696474683d22333630222060a68201527f6865696768743d22333630222066696c6c3d226e6f6e6522207374726f6b653d60c68201527f222342383836304222207374726f6b652d77696474683d2231222072783d223860e68201526211179f60e91b6101068201527f3c7465787420783d223230302220793d2237362220666f6e742d66616d696c796101098201527f3d226d6f6e6f73706163652220666f6e742d73697a653d223133222066696c6c6101298201527f3d22234238383630422220746578742d616e63686f723d226d6964646c6522206101498201526106e86101fc82610169723632ba3a32b916b9b830b1b4b7339e911a111f60691b8183015261043e61017c8301611571565b8b661e17ba32bc3a1f60c91b918281527f3c7465787420783d223230302220793d223233322220666f6e742d66616d696c60078201527f793d226d6f6e6f73706163652220666f6e742d73697a653d223134302220666960278201527f6c6c3d22234238383630422220746578742d616e63686f723d226d6964646c6560478201527f22206f7061636974793d22302e3038223e473c2f746578743e0000000000000060678201527f3c7465787420783d223230302220793d223236382220666f6e742d66616d696c60808201527f793d226d6f6e6f73706163652220666f6e742d73697a653d223131222066696c60a08201527f6c3d22233535352220746578742d616e63686f723d226d6964646c6522206c6560c08201527f747465722d73706163696e673d2233223e474f5645524e414e434520544f4b4560e082015267271e17ba32bc3a1f60c11b6101008201527f3c7465787420783d223230302220793d223331382220666f6e742d66616d696c6101088201527f793d226d6f6e6f73706163652220666f6e742d73697a653d223338222066696c6101288201527f6c3d22236666666666662220746578742d616e63686f723d226d6964646c6522610148820152601f60f91b6101688201528a5180928583015e01918201527f3c7465787420783d223230302220793d223336382220666f6e742d66616d696c6101708201527f793d226d6f6e6f73706163652220666f6e742d73697a653d223130222066696c6101908201527f6c3d22233333332220746578742d616e63686f723d226d6964646c6522206c656101b08201527f747465722d73706163696e673d2235223e53504943452050524f544f434f4c3c6101d08201526517ba32bc3a1f60d11b6101f0820152651e17b9bb339f60d11b6101f6820152036101dc8101845201826111a8565b61187c565b61075e60578b519788957003d913730b6b2911d112396aa37b5b2b71607d1b86880152518091603188015e850161088b60f21b60318201527f226465736372697074696f6e223a22476f7665726e616e636520746f6b656e2060338201526303337b9160e51b605382015201611571565b907f2e20536f756c626f756e642c206e6f6e2d7472616e7366657261626c652e222c82527f22696d616765223a22646174613a696d6167652f7376672b786d6c3b6261736583830152620d8d0b60ea1b8b830152805192839101604383015e0161227d60f01b60438201520360258101845201826111a8565b83519687917f646174613a6170706c69636174696f6e2f6a736f6e3b6261736536342c000000828401528051918291018484015e81015f8382015203601d8101875201856111a8565b519282849384528301906110bb565b0390f35b825162461bcd60e51b8152908101849052601960248201527f47546f6b656e3a206e6f6e6578697374656e7420746f6b656e000000000000006044820152606490fd5b50903461018f57608036600319011261018f576108916110df565b6108996110f5565b6064359367ffffffffffffffff851161018f573660238601121561018f578401356108cf6108c6826111ca565b945194856111a8565b808452366024828701011161018f576020815f9260246108fb9801838801378501015260443591611423565b005b50903461018f578060031936011261018f576109176110df565b906024359182151580930361018f57331561099f576001600160a01b031692831561098a5750335f526005602052805f20835f52602052805f2060ff1981541660ff8416179055519081527f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c3160203392a3005b836024925191630b61174360e31b8352820152fd5b815163a9fbf51f60e01b81525f81860152602490fd5b50903461018f57602036600319011261018f57602091355f5260098252805f20549051908152f35b823461018f575f36600319011261018f578051905f908260019260015493610a0485611140565b90818452602095866001821691825f14610a8f575050600114610a34575b505061082f92916108209103856111a8565b9085925060015f527fb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf6915f925b828410610a775750505082010181610820610a22565b8054848a018601528895508794909301928101610a61565b60ff19168682015292151560051b850190920192508391506108209050610a22565b823461018f575f36600319011261018f5760065490516001600160a01b039091168152602090f35b823461018f575f36600319011261018f576020906007549051908152f35b3461018f575f36600319011261018f57610b0f611637565b600680546001600160a01b031981169091555f906001600160a01b03167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e08280a3005b50903461018f57602036600319011261018f576001600160a01b03610b756110df565b168015610b9157602092505f5260038252805f20549051908152f35b81516322718ad960e21b81525f81850152602490fd5b503461018f576020918260031936011261018f57610bc36110df565b91610bcc611637565b600754925f1990818514610d3257600185016007555f858152600987528490204290556001600160a01b03908116908115610d1c57855f526002875280855f205416610ccd57908591825f5260028852855f2054168015159384610c9c575b505f82815260038952868120805460010190558381526002895286812080546001600160a01b031916841790557fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9080a4610c87575051908152f35b5f60249251916339e3563760e11b8352820152fd5b5f84815260046020526040902080546001600160a01b0319169055815f5260038952865f209081540190555f610c2b565b845162461bcd60e51b8152808501889052602360248201527f47546f6b656e3a20736f756c626f756e642c206e6f6e2d7472616e7366657261604482015262626c6560e81b6064820152608490fd5b8451633250574960e11b81525f81860152602490fd5b601183634e487b7160e01b5f525260245ffd5b50903461018f57602036600319011261018f57610d64602092356115fd565b90516001600160a01b039091168152f35b823461018f575f36600319011261018f5780516008549091825f610d9884611140565b808352602094600190866001821691825f14610a8f575050600114610dc957505061082f92916108209103856111a8565b9085925060085f527ff3f7a9fe364faab93b216da50a3214154f22a0a2b415b23a84c8169e8b636ee3915f925b828410610e0c5750505082010181610820610a22565b8054848a018601528895508794909301928101610df6565b823461018f57602036600319011261018f57602090610e49610e446110df565b6113de565b9051908152f35b823461018f576108fb90610e633661110b565b91925192610e7084611178565b5f8452611423565b3461018f576108fb610e893661110b565b916111e6565b50903461018f578060031936011261018f57610ea96110df565b91602435610eb6816115fd565b33151580610f58575b80610f31575b610f1b576001600160a01b039485169482918691167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b9255f80a45f526020525f20906001600160601b0360a01b8254161790555f80f35b835163a9fbf51f60e01b81523381850152602490fd5b5060018060a01b0381165f526005602052835f20335f5260205260ff845f20541615610ec5565b506001600160a01b038116331415610ebf565b50903461018f57602036600319011261018f578160209235610f8c816115fd565b505f52825260018060a01b03815f2054169051908152f35b823461018f575f36600319011261018f578051905f90825f5492610fc784611140565b808352602094600190866001821691825f14610a8f575050600114610ff857505061082f92916108209103856111a8565b5f80805286935091907f290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e5635b8284106110395750505082010181610820610a22565b8054848a018601528895508794909301928101611023565b823461018f57602036600319011261018f57359063ffffffff60e01b821680920361018f576020916380ac58cd60e01b81149081156110aa575b8115611099575b5015158152f35b6301ffc9a760e01b14905083611092565b635b5e139f60e01b8114915061108b565b805180835260209291819084018484015e5f828201840152601f01601f1916010190565b600435906001600160a01b038216820361018f57565b602435906001600160a01b038216820361018f57565b606090600319011261018f576001600160a01b0390600435828116810361018f5791602435908116810361018f579060443590565b90600182811c9216801561116e575b602083101461115a57565b634e487b7160e01b5f52602260045260245ffd5b91607f169161114f565b6020810190811067ffffffffffffffff82111761119457604052565b634e487b7160e01b5f52604160045260245ffd5b90601f8019910116810190811067ffffffffffffffff82111761119457604052565b67ffffffffffffffff811161119457601f01601f191660200190565b6001600160a01b0391821692909183156113c657815f526020926002845260409482865f205416611376578390815f526002865283875f20541695331515806112e4575b50600290876112b3575b825f5260038152885f2060018154019055835f5252865f20816001600160601b0360a01b825416179055857fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef5f80a416928383036112925750505050565b6064945051926364283d7b60e01b8452600484015260248301526044820152fd5b5f84815260046020526040812080546001600160a01b03191690558881526003825289902080545f19019055611234565b9192509080611335575b156112fc579084915f61122a565b868587611319576024915190637e27328960e01b82526004820152fd5b604491519063177e802f60e01b82523360048301526024820152fd5b50338614801561135a575b806112ee5750845f52600481523384885f205416146112ee565b50855f5260058152865f20335f52815260ff875f205416611340565b855162461bcd60e51b815260048101869052602360248201527f47546f6b656e3a20736f756c626f756e642c206e6f6e2d7472616e7366657261604482015262626c6560e81b6064820152608490fd5b604051633250574960e11b81525f6004820152602490fd5b600754600191825b8281106113f557505050505f90565b5f818152600260205260409020546001600160a01b0383811691161461141c5783016113e6565b9250505090565b91926114308483856111e6565b813b61143d575b50505050565b604051630a85bd0160e11b8082523360048301526001600160a01b0394851660248301526044820195909552608060648201526020959390921693919085908290819061148e9060848301906110bb565b03815f885af15f9181611531575b506114fb575050503d5f146114f3573d916114b6836111ca565b926114c460405194856111a8565b83523d5f8285013e5b825192836114ee57604051633250574960e11b815260048101849052602490fd5b019050fd5b6060916114cd565b9193506001600160e01b03199091160361151957505f808080611437565b60249060405190633250574960e11b82526004820152fd5b9091508581813d831161156a575b61154981836111a8565b8101031261018f57516001600160e01b03198116810361018f57905f61149c565b503d61153f565b6008545f929161158082611140565b916001908181169081156115ea575060011461159b57505050565b909192935060085f527ff3f7a9fe364faab93b216da50a3214154f22a0a2b415b23a84c8169e8b636ee3905f915b8483106115d7575050500190565b81816020925485870152019201916115c9565b60ff191683525050811515909102019150565b5f818152600260205260409020546001600160a01b031690811561161f575090565b60249060405190637e27328960e01b82526004820152fd5b6006546001600160a01b0316330361164b57565b60405163118cdaa760e01b8152336004820152602490fd5b5f90807a184f03e93ff9f4daa797ed6e38ed64bf6a1f010000000000000000818181101561186e575b50506d04ee2d6d415b85acef810000000080821015611861575b50662386f26fc1000080821015611854575b506305f5e10080821015611847575b506127108082101561183a575b50606481101561182c575b600a80911015611822575b6001808401928160216117156116ff876111ca565b9661170d60405198896111a8565b8088526111ca565b602087019790601f1901368937860101905b6117ed575b50505050805160048110156117e757600381146117b45760021461178157602361177e916040519384916203030360ec1b60208401525180918484015e81015f838201520360038101845201826111a8565b90565b602261177e9160405193849161030360f41b60208401525180918484015e81015f838201520360028101845201826111a8565b50602161177e91604051938491600360fc1b60208401525180918484015e81015f838201520360018101845201826111a8565b50905090565b5f19019083906f181899199a1a9b1b9c1cb0b131b232b360811b8282061a83530491821561181d57919082611727565b61172c565b91600101916116ea565b6064600291049201916116df565b600491049201915f6116d4565b600891049201915f6116c7565b601091049201915f6116b8565b602091049201915f6116a6565b604094500490505f8061168c565b8051156119bc5780519160028084018094116119a857600393849004600281901b91906001600160fe1b038116036119a85793604051937f4142434445464748494a4b4c4d4e4f505152535455565758595a616263646566601f52603f917f6768696a6b6c6d6e6f707172737475767778797a303132333435363738392b2f603f5260208601928291835184019160208301998a51945f8c525b84811061196c575050505050906003916020959697525106806001146119575760021461194a575b50808452830101604052565b603d905f1901535f61193e565b50603d90815f1982015360011901535f61193e565b836004919c95989c019b838d51818160121c165183538181600c1c16516001840153818160061c1651858401531651858201530196939a611916565b634e487b7160e01b5f52601160045260245ffd5b506040516119c981611178565b5f81529056fea264697066735822122048b2d8944697cd2aa2f2042fbb9335ed3dbe39df481cf3fd4ff40a1450e6658764736f6c63430008190033"
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
    "bytecode": "0x60806040818152346103b957610f5f803803809161001d82866103bd565b8439820191602080828503126103b95781516001600160401b03928382116103b9570191601f948086850112156103b9578351958287116102d457601f199686519561006f868a8585011601886103bd565b818752858701938683830101116103b957815f9287809301865e870101526100ee60228751966100c3602889835180898c84015e810167102996aa37b5b2b760c11b8b82015203600881018b5201896103bd565b885194859161532d60f01b898401525180918484015e81015f838201520360028101855201836103bd565b8451918383116102d45760039283546001978882811c921680156103af575b8883101461039b57818584931161034d575b5087908583116001146102f3575f926102e8575b50505f1982861b1c191690871b1783555b80519384116102d45760049485548781811c911680156102ca575b828210146102b757838111610278575b508495969798819386116001146102165750505f9361020b575b505082851b925f19911b1c19161781555b33156101f5575060058054336001600160a01b0319821681179092559251926001600160a01b03167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e05f80a3600755610b7e90816103e18239f35b6024905f845191631e4fbdf760e01b8352820152fd5b015191505f80610189565b8896949392919416875f52845f20945f905b82821061025f5750508511610246575b50505050811b01815561019a565b01519060f8845f19921b161c191690555f808080610238565b8484015187558a98909601959384019390810190610228565b865f52815f208480880160051c8201928489106102ae575b0160051c01905b8181106102a4575061016f565b5f81558801610297565b92508192610290565b602287634e487b7160e01b5f525260245ffd5b90607f169061015f565b634e487b7160e01b5f52604160045260245ffd5b015190505f80610133565b908b8a941691875f52895f20925f5b8b8282106103375750508411610320575b505050811b018355610144565b01515f1983881b60f8161c191690555f8080610313565b8385015186558d97909501949384019301610302565b909150855f52875f208580850160051c8201928a8610610392575b918b91869594930160051c01915b82811061038457505061011f565b5f81558594508b9101610376565b92508192610368565b634e487b7160e01b5f52602260045260245ffd5b91607f169161010d565b5f80fd5b601f909101601f19168101906001600160401b038211908210176102d45760405256fe608060409080825260049081361015610016575f80fd5b5f3560e01c90816306fdde03146108ca57508063095ea7b31461082157806318160ddd1461080357806323b872dd146107235780632e379d4c14610702578063313ce567146106e757806334332a4f1461065f5780633cf80e6c14610631578063470f28421461052057806352d0643f146104fd57806370a08231146104c7578063715018a61461046c578063766718081461044e57806379bf70d3146104175780638da5cb5b146103ef57806395d89b41146102cf5780639dc29fac1461020a578063a9059cbb146101da578063dd62ed3e1461018d5763f2fde38b146100fc575f80fd5b34610189576020366003190112610189576101156109ea565b9061011e610afc565b6001600160a01b03918216928315610173575050600554826bffffffffffffffffffffffff60a01b821617600555167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e05f80a3005b905f6024925191631e4fbdf760e01b8352820152fd5b5f80fd5b82346101895780600319360112610189576101a66109ea565b906024356001600160a01b038181169182900361018957602093165f5260018352815f20905f528252805f20549051908152f35b82346101895780600319360112610189576020906102036101f96109ea565b6024359033610a35565b5160018152f35b5090346101895780600319360112610189576102246109ea565b9060243592610231610afc565b6001600160a01b0383169283156102b957835f525f602052825f205491858310610285575f855f80516020610b298339815191526020898881898688528785520381872055816002540360025551908152a3005b835163391434e360e21b81526001600160a01b03909216908201908152602081018390526040810186905281906060010390fd5b505f6024925191634b637e8f60e11b8352820152fd5b509034610189575f366003190112610189578051905f835460018160011c90600183169283156103e5575b60209384841081146103d2578388529081156103b65750600114610362575b505050829003601f01601f191682019267ffffffffffffffff84118385101761034f575082918261034b9252826109c0565b0390f35b604190634e487b7160e01b5f525260245ffd5b5f878152929350837f8a35acfbc15ff81a39ae7d344fd709f28e8600b4aa8c65c6b64bfe7fe36bd19b5b8385106103a257505050508301015f8080610319565b80548886018301529301928490820161038c565b60ff1916878501525050151560051b84010190505f8080610319565b602289634e487b7160e01b5f525260245ffd5b91607f16916102fa565b8234610189575f3660031901126101895760055490516001600160a01b039091168152602090f35b8234610189576020366003190112610189576020906001600160a01b0361043c6109ea565b165f5260068252805f20549051908152f35b8234610189575f366003190112610189576020906007549051908152f35b34610189575f36600319011261018957610484610afc565b600580546001600160a01b031981169091555f906001600160a01b03167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e08280a3005b8234610189576020366003190112610189576020906001600160a01b036104ec6109ea565b165f525f8252805f20549051908152f35b8234610189575f3660031901126101895760209051683635c9adc5dea000008152f35b503461018957602090816003193601126101895761053c6109ea565b610544610afc565b60018060a01b031692835f5260068352805f2054600754809110156105e157845f5260068452815f205583156105cb57600254683635c9adc5dea00000928382018092116105b857506002555f8481528084528181208054840190559051918252915f80516020610b2983398151915291a3005b601190634e487b7160e01b5f525260245ffd5b905f602492519163ec442f0560e01b8352820152fd5b5091608492519162461bcd60e51b8352820152602560248201527f53546f6b656e3a2055424920616c7265616479206973737565642074686973206044820152640dadedce8d60db1b6064820152fd5b5034610189575f3660031901126101895761064a610afc565b600754905f1982146105b85760018201600755005b5090346101895780600319360112610189576106796109ea565b9060243591610686610afc565b6001600160a01b03169283156106d257600254908382018092116105b857505f925f80516020610b298339815191529260209260025585855284835280852082815401905551908152a3005b5f602492519163ec442f0560e01b8352820152fd5b8234610189575f366003190112610189576020905160128152f35b346101895761072161071336610a00565b9161071c610afc565b610a35565b005b50346101895761073236610a00565b6001600160a01b0383165f8181526001602090815287822033835290528690205491949293925f19831061076f575b602087610203888888610a35565b8583106107d75781156107c15733156107ab57505f90815260016020908152868220338352815290869020918590039091558290610203610761565b6024905f885191634a1406b160e11b8352820152fd5b6024905f88519163e602df0560e01b8352820152fd5b8651637dc7a0d960e11b8152339181019182526020820193909352604081018690528291506060010390fd5b8234610189575f366003190112610189576020906002549051908152f35b50903461018957806003193601126101895761083b6109ea565b6024359033156108b4576001600160a01b031690811561089e5760209350335f5260018452825f20825f52845280835f205582519081527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925843392a35160018152f35b8251634a1406b160e11b81525f81860152602490fd5b825163e602df0560e01b81525f81860152602490fd5b90508234610189575f366003190112610189575f60035460018160011c90600183169283156109b6575b60209384841081146103d25783885290811561099a575060011461094457505050829003601f01601f191682019267ffffffffffffffff84118385101761034f575082918261034b9252826109c0565b60035f908152929350837fc2575a0e9e593c00f959f8c92f12db2869c3395a3b0502d05e2516446f71f85b5b8385106109865750505050830101848080610319565b805488860183015293019284908201610970565b60ff1916878501525050151560051b8401019050848080610319565b91607f16916108f4565b602060409281835280519182918282860152018484015e5f828201840152601f01601f1916010190565b600435906001600160a01b038216820361018957565b6060906003190112610189576001600160a01b0390600435828116810361018957916024359081168103610189579060443590565b916001600160a01b03808416928315610ae45716928315610acc57825f525f60205260405f205490828210610a9a5750815f80516020610b2983398151915292602092855f525f84520360405f2055845f5260405f20818154019055604051908152a3565b60405163391434e360e21b81526001600160a01b03919091166004820152602481019190915260448101829052606490fd5b60405163ec442f0560e01b81525f6004820152602490fd5b604051634b637e8f60e11b81525f6004820152602490fd5b6005546001600160a01b03163303610b1057565b60405163118cdaa760e01b8152336004820152602490fdfeddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3efa2646970667358221220dc210509e29260bff0283f1dc391136cdd006bdca1e584a8c2cb1d8e358d264064736f6c63430008190033"
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
    "bytecode": "0x60806040818152346103b957610eb9803803809161001d82866103bd565b8439820191602080828503126103b95781516001600160401b03928382116103b9570191601f948086850112156103b9578351958287116102d457601f199686519561006f868a8585011601886103bd565b818752858701938683830101116103b957815f9287809301865e870101526100ee60228751966100c3602889835180898c84015e810167102b16aa37b5b2b760c11b8b82015203600881018b5201896103bd565b885194859161562d60f01b898401525180918484015e81015f838201520360028101855201836103bd565b8451918383116102d45760039283546001978882811c921680156103af575b8883101461039b57818584931161034d575b5087908583116001146102f3575f926102e8575b50505f1982861b1c191690871b1783555b80519384116102d45760049485548781811c911680156102ca575b828210146102b757838111610278575b508495969798819386116001146102165750505f9361020b575b505082851b925f19911b1c19161781555b33156101f5575060058054336001600160a01b0319821681179092559251926001600160a01b03167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e05f80a3600755610ad890816103e18239f35b6024905f845191631e4fbdf760e01b8352820152fd5b015191505f80610189565b8896949392919416875f52845f20945f905b82821061025f5750508511610246575b50505050811b01815561019a565b01519060f8845f19921b161c191690555f808080610238565b8484015187558a98909601959384019390810190610228565b865f52815f208480880160051c8201928489106102ae575b0160051c01905b8181106102a4575061016f565b5f81558801610297565b92508192610290565b602287634e487b7160e01b5f525260245ffd5b90607f169061015f565b634e487b7160e01b5f52604160045260245ffd5b015190505f80610133565b908b8a941691875f52895f20925f5b8b8282106103375750508411610320575b505050811b018355610144565b01515f1983881b60f8161c191690555f8080610313565b8385015186558d97909501949384019301610302565b909150855f52875f208580850160051c8201928a8610610392575b918b91869594930160051c01915b82811061038457505061011f565b5f81558594508b9101610376565b92508192610368565b634e487b7160e01b5f52602260045260245ffd5b91607f169161010d565b5f80fd5b601f909101601f19168101906001600160401b038211908210176102d45760405256fe608060409080825260049081361015610016575f80fd5b5f3560e01c90816306fdde031461083057508063095ea7b31461078757806318160ddd1461076957806323b872dd146107535780632e379d4c14610678578063313ce5671461065d5780633cf80e6c1461061c57806340c10f1914610540578063560b1c401461050057806370a08231146104ca578063715018a61461046f578063720093e41461044157806376671808146104235780638da5cb5b146103fb57806395d89b41146102db5780639dc29fac1461021b578063a9059cbb146101fd578063dd62ed3e146101b0578063f1fbbc4d1461018d5763f2fde38b146100fc575f80fd5b3461018957602036600319011261018957610115610950565b9061011e610a01565b6001600160a01b03918216928315610173575050600554826bffffffffffffffffffffffff60a01b821617600555167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e05f80a3005b905f6024925191631e4fbdf760e01b8352820152fd5b5f80fd5b8234610189575f3660031901126101895760209051680ad78ebc5ac62000008152f35b82346101895780600319360112610189576101c9610950565b906024356001600160a01b038181169182900361018957602093165f5260018352815f20905f528252805f20549051908152f35b82346101895736600319011261018957610215610950565b5061099b565b5034610189578160031936011261018957610234610950565b60243590610240610a01565b6001600160a01b03169182156102c557825f525f602052835f2054908282106102a65750815f947fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef936020938688528785520381872055816002540360025551908152a3005b92606494519363391434e360e21b855284015260248301526044820152fd5b6024905f855191634b637e8f60e11b8352820152fd5b509034610189575f366003190112610189578051905f835460018160011c90600183169283156103f1575b60209384841081146103de578388529081156103c2575060011461036e575b505050829003601f01601f191682019267ffffffffffffffff84118385101761035b5750829182610357925282610926565b0390f35b604190634e487b7160e01b5f525260245ffd5b5f878152929350837f8a35acfbc15ff81a39ae7d344fd709f28e8600b4aa8c65c6b64bfe7fe36bd19b5b8385106103ae57505050508301015f8080610325565b805488860183015293019284908201610398565b60ff1916878501525050151560051b84010190505f8080610325565b602289634e487b7160e01b5f525260245ffd5b91607f1691610306565b8234610189575f3660031901126101895760055490516001600160a01b039091168152602090f35b8234610189575f366003190112610189576020906007549051908152f35b8234610189573660031901126101895761046d61045c610950565b610464610a01565b60243590610a2d565b005b34610189575f36600319011261018957610487610a01565b600580546001600160a01b031981169091555f906001600160a01b03167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e08280a3005b8234610189576020366003190112610189576020906001600160a01b036104ef610950565b165f525f8252805f20549051908152f35b82346101895780600319360112610189576020906001600160a01b03610524610950565b165f5260068252805f206024355f528252805f20549051908152f35b50903461018957806003193601126101895761055a610950565b60243591610566610a01565b60018060a01b03821693845f526006602052815f209060075491825f52602052680ad78ebc5ac620000061059d86855f20546109e0565b116105cb575061046d945f526006602052815f20905f526020525f206105c48382546109e0565b9055610a2d565b608490602084519162461bcd60e51b8352820152602560248201527f56546f6b656e3a2065786365656473206d6f6e74686c7920736176696e6773206044820152641b1a5b5a5d60da1b6064820152fd5b5034610189575f36600319011261018957610635610a01565b600754905f19821461064a5760018201600755005b601190634e487b7160e01b5f525260245ffd5b8234610189575f366003190112610189576020905160128152f35b5090346101895761068836610966565b91610694939193610a01565b6001600160a01b0390811693841561073d571693841561072857835f525f602052815f205490838210610707575091602091817fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef94865f525f855203815f2055855f52805f2082815401905551908152a3005b929193606494519363391434e360e21b855284015260248301526044820152fd5b5f602492519163ec442f0560e01b8352820152fd5b8251634b637e8f60e11b81525f81880152602490fd5b346101895761076136610966565b50505061099b565b8234610189575f366003190112610189576020906002549051908152f35b5090346101895780600319360112610189576107a1610950565b60243590331561081a576001600160a01b03169081156108045760209350335f5260018452825f20825f52845280835f205582519081527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925843392a35160018152f35b8251634a1406b160e11b81525f81860152602490fd5b825163e602df0560e01b81525f81860152602490fd5b90508234610189575f366003190112610189575f60035460018160011c906001831692831561091c575b60209384841081146103de5783885290811561090057506001146108aa57505050829003601f01601f191682019267ffffffffffffffff84118385101761035b5750829182610357925282610926565b60035f908152929350837fc2575a0e9e593c00f959f8c92f12db2869c3395a3b0502d05e2516446f71f85b5b8385106108ec5750505050830101848080610325565b8054888601830152930192849082016108d6565b60ff1916878501525050151560051b8401019050848080610325565b91607f169161085a565b602060409281835280519182918282860152018484015e5f828201840152601f01601f1916010190565b600435906001600160a01b038216820361018957565b6060906003190112610189576001600160a01b0390600435828116810361018957916024359081168103610189579060443590565b60405162461bcd60e51b815260206004820152601860248201527f56546f6b656e3a206e6f6e2d7472616e7366657261626c6500000000000000006044820152606490fd5b919082018092116109ed57565b634e487b7160e01b5f52601160045260245ffd5b6005546001600160a01b03163303610a1557565b60405163118cdaa760e01b8152336004820152602490fd5b6001600160a01b0316908115610a8a577fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef602082610a6e5f946002546109e0565b60025584845283825260408420818154019055604051908152a3565b60405163ec442f0560e01b81525f6004820152602490fdfea2646970667358221220a0fdf0750441657be5fe2d98f026d3390f53489e484f9432e9bb6ef079307adf64736f6c63430008190033"
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
    "bytecode": "0x6080604090808252346103ea576121bb803803809161001e8285610402565b833981019180828403126103ea5781516001600160401b0393908481116103ea578301601f938285830112156103ea578151956020928188116103ee57601f199286519861007286868b840116018b610402565b808a52858a01968682850101116103ea5785815f92828096018a5e8b01015201516001600160a01b039788821697918890036103ea5786519586915180918784015e810163204f726760e01b8682015203926024946100da866004968781018a520188610402565b875191888301838110868211176103d8578952600683526527aa27a5a2a760d11b8284015287518581116103d8575f54986001998a81811c911680156103ce575b858210146103bc5790818784931161036e575b508490878311600114610313575f92610308575b50505f19600383901b1c191690891b175f555b82519485116102f65787548881811c911680156102ec575b838210146102da57908185879695949311610286575b50819385116001146102275750505f9261021c575b50505f19600383901b1c191690841b1783555b3315610209575050600680546001600160a01b031980821633908117909355935195167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e05f80a36008556007541617600755611d9590816104268239f35b5f845191631e4fbdf760e01b8352820152fd5b015190505f80610198565b88959392919316855f52835f20935f905b82821061026d5750508411610255575b505050811b0183556101ab565b01515f1960f88460031b161c191690555f8080610248565b8484015186558a97909501949384019390810190610238565b909192939450885f52825f208580880160051c8201928589106102d1575b9188978c9297969594930160051c01915b8281106102c3575050610183565b5f81558897508b91016102b5565b925081926102a4565b87602288634e487b7160e01b5f52525ffd5b90607f169061016d565b86604187634e487b7160e01b5f52525ffd5b015190505f80610142565b90848c9416915f8052865f20925f5b888282106103585750508411610340575b505050811b015f55610155565b01515f1960f88460031b161c191690555f8080610333565b8385015186558f97909501949384019301610322565b9091505f8052845f208780850160051c8201928786106103b3575b918d91869594930160051c01915b8281106103a557505061012e565b5f81558594508d9101610397565b92508192610389565b8960228a634e487b7160e01b5f52525ffd5b90607f169061011b565b87604188634e487b7160e01b5f52525ffd5b5f80fd5b634e487b7160e01b5f52604160045260245ffd5b601f909101601f19168101906001600160401b038211908210176103ee5760405256fe608060409080825260049081361015610016575f80fd5b5f3560e01c90816301ffc9a7146116295750806306fdde031461157c578063081812fc14611543578063095ea7b31461146757806323b872dd14611451578063349ff7701461142957806342842e0e146114055780634f5c2e6c146113a35780635a3f2672146112975780636352211e146112675780636a4b888314610fac57806370a0823114610f80578063715018a614610f2557806375794a3c14610f075780638da5cb5b14610edf57806395d89b4114610dfc578063a22cb46514610d44578063b88d4fde14610cea578063c87b56dd146103d9578063e985e9c51461038b578063f2fde38b146103025763f5fed02c14610112575f80fd5b346102b457816003193601126102b457803561012c6116cd565b92610136826119a9565b6001600160a01b03949033908616036102bf578460075416948251915f80602085019863f3caad0360e01b8a5260249985851696878c8201528b815261017b81611750565b51915afa3d156102b8573d61018f8161189d565b9061019c875192836117b8565b81523d5f602083013e5b81610292575b501561024557821561023057846101c291611b69565b16806101db57505051637e27328960e01b815291820152fd5b9093918590338303610210578533867fa0c7406958e58553b8e9b22cc5e955794f16be349e4b33c18839c53b76e230ae5f80a4005b906064949151936364283d7b60e01b855233908501528301526044820152fd5b8351633250574960e11b81525f818801528790fd5b835162461bcd60e51b81526020818801526022818901527f4f546f6b656e3a20726563697069656e74206973206e6f74206120636974697a60448201526132b760f11b6064820152608490fd5b90506020818051810103126102b4576020015180151581036102b4575f6101ac565b5f80fd5b60606101a6565b815162461bcd60e51b8152602081860152601e60248201527f4f546f6b656e3a206e6f74207468652063757272656e7420686f6c64657200006044820152606490fd5b50346102b45760203660031901126102b45761031c6116b7565b906103256119e3565b6001600160a01b03918216928315610375575050600654826001600160601b0360a01b821617600655167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e05f80a3005b905f6024925191631e4fbdf760e01b8352820152fd5b82346102b457806003193601126102b4576020906103a76116b7565b6103af6116cd565b9060018060a01b038091165f5260058452825f2091165f52825260ff815f20541690519015158152f35b5090346102b457602090816003193601126102b45782355f81815260028452829020549093906001600160a01b031615610ca957835f5260098352815f2093825161042381611750565b61042c866117da565b8152600192600260ff60018901541697610449888501998a611967565b015485830152865181811015610c965761046290611a0f565b96519681881015610c96576104778798611abb565b918485915f967a184f03e93ff9f4daa797ed6e38ed64bf6a1f0100000000000000009081811015610c89575b5050896d04ee2d6d415b85acef810000000080851015610c7b575b5050662386f26fc1000080841015610c6c575b506305f5e10080841015610c5d575b5061271080841015610c4f575b50506064821015610c3f575b600a80921015610c35575b908689959493928998602161053360018b0161052b6105228261189d565b9d519d8e6117b8565b808d5261189d565b8b8a019a90601f1901368c378b0101905b610bec575b505050508651809585820197602360f81b8952518091602184015e8101602181015f90520360018101865260210161058190866117b8565b825187517f3c73766720786d6c6e733d22687474703a2f2f7777772e77332e6f72672f3230818701527f30302f737667222077696474683d2234303022206865696768743d2234303022818a01527f2076696577426f783d223020302034303020343030223e00000000000000000060608201527f3c726563742077696474683d2234303022206865696768743d2234303022206660778201526e34b6361e911198309830983091179f60891b60978201527f3c7265637420783d2232302220793d223230222077696474683d22333630222060a68201527f6865696768743d22333630222066696c6c3d226e6f6e6522207374726f6b653d60c6820152601160f91b60e68201528351909486929091869190868501908590808360e787015e7f22207374726f6b652d77696474683d2231222072783d2238222f3e000000000060e7918601918201527f3c7465787420783d223230302220793d2237362220666f6e742d66616d696c796101028201527f3d226d6f6e6f73706163652220666f6e742d73697a653d223133222066696c6c610122820152611e9160f11b61014282015288516101449181858483015e7f2220746578742d616e63686f723d226d6964646c6522206c65747465722d73709101918201526930b1b4b7339e911a111f60b11b610164820152835161016e9490928391018583015e01661e17ba32bc3a1f60c91b809382015261017581017f3c7465787420783d223230302220793d223233322220666f6e742d66616d696c905261019581017f793d226d6f6e6f73706163652220666f6e742d73697a653d223134302220666990526336361e9160e11b6101b58201526101b9975180928983015e7f2220746578742d616e63686f723d226d6964646c6522206f7061636974793d229101968701526d1817181c111f279e17ba32bc3a1f60911b6101d98701527f3c7465787420783d223230302220793d223236382220666f6e742d66616d696c6101e78701527f793d226d6f6e6f73706163652220666f6e742d73697a653d223131222066696c6102078701527f6c3d22233535352220746578742d616e63686f723d226d6964646c6522206c65610227870152703a3a32b916b9b830b1b4b7339e9119911f60791b61024787015284518486019661025892918291818a8683015e01928301527f3c7465787420783d223230302220793d223331382220666f6e742d66616d696c61025f8301527f793d226d6f6e6f73706163652220666f6e742d73697a653d223338222066696c61027f8301527f6c3d22236666666666662220746578742d616e63686f723d226d6964646c652261029f830152601f60f91b6102bf83015289516102c092818d8583015e01918201527f3c7465787420783d223230302220793d223336382220666f6e742d66616d696c6102c78201527f793d226d6f6e6f73706163652220666f6e742d73697a653d223130222066696c6102e78201527f6c3d22233333332220746578742d616e63686f723d226d6964646c6522206c65610307820152703a3a32b916b9b830b1b4b7339e911a911f60791b6103278201527429a824a1a290282927aa27a1a7a61e17ba32bc3a1f60591b610338820152651e17b9bb339f60d11b61034d8201520361033381018652610a429061035301866117b8565b5193610a4d90611c20565b9388519788977003d913730b6b2911d112796aa37b5b2b71607d1b848a015251809160318a015e61088b60f21b6031918901918201527f226465736372697074696f6e223a224f7267616e69736174696f6e20746f6b65603382015265037103337b9160d51b60538201528151929091839101605983015e01906059820161040560f31b9052518092605b83015e0190605b82017f292e20526f6c652d7472616e7366657261626c65206265747765656e20636f6c90526e1bdb9e4818da5d1a5e995b9ccb888b608a1b607b830152608a82017f22696d616765223a22646174613a696d6167652f7376672b786d6c3b62617365905260aa8201620d8d0b60ea1b905280519283910160ad83015e0161227d60f01b60ad82015203608f8101825260af01610b7b90826117b8565b610b8490611c20565b81517f646174613a6170706c69636174696f6e2f6a736f6e3b6261736536342c00000085820152815190948592829101603d84015e8101603d81015f905203601d81018452603d01610bd690846117b8565b519181839283528201610be891611693565b0390f35b8394959697505f939192931901916f181899199a1a9b1b9c1cb0b131b232b360811b8282061a835304918a8315610c2c575090918a969594939282610544565b96959493610549565b9460010194610504565b94906064600291049101946104f9565b960195909104905f806104ed565b6008919793049201955f6104e0565b6010919793049201955f6104d1565b97019690920491895f6104be565b8a98500492505f806104a3565b602182634e487b7160e01b5f525260245ffd5b82606492519162461bcd60e51b8352820152601960248201527f4f546f6b656e3a206e6f6e6578697374656e7420746f6b656e000000000000006044820152fd5b50346102b45760803660031901126102b457610d046116b7565b50610d0d6116cd565b506064359067ffffffffffffffff82116102b457366023830112156102b457816024610d3e933693013591016118b9565b506118ef565b5090346102b457806003193601126102b457610d5e6116b7565b90602435918215158093036102b4573315610de6576001600160a01b0316928315610dd15750335f526005602052805f20835f52602052805f2060ff1981541660ff8416179055519081527f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c3160203392a3005b836024925191630b61174360e31b8352820152fd5b815163a9fbf51f60e01b81525f81860152602490fd5b82346102b4575f3660031901126102b4578051905f908260019260015493610e2385611718565b90818452602095866001821691825f14610ebd575050600114610e62575b5050610be89291610e539103856117b8565b51928284938452830190611693565b9085925060015f527fb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf6915f925b828410610ea55750505082010181610e53610e41565b8054848a018601528895508794909301928101610e8f565b60ff19168682015292151560051b85019092019250839150610e539050610e41565b82346102b4575f3660031901126102b45760065490516001600160a01b039091168152602090f35b82346102b4575f3660031901126102b4576020906008549051908152f35b346102b4575f3660031901126102b457610f3d6119e3565b600680546001600160a01b031981169091555f906001600160a01b03167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e08280a3005b82346102b45760203660031901126102b457602090610fa5610fa06116b7565b611973565b9051908152f35b50346102b45760603660031901126102b457610fc66116b7565b67ffffffffffffffff92906024358481116102b457366023820112156102b457808401358581116102b457602482019160248236920101116102b45760443591858310156102b4576110166119e3565b6008549561102387611945565b600855855161103181611750565b61103c3685856118b9565b815260209889820161104e8782611967565b888301914283528a5f5260098c52895f2093518051918211611254578c82916110778754611718565b601f81116111fc575b5081601f841160011461119857505f9261118d575b50508160011b915f199060031b1c19161783555b6001830190518481101561117a57815460ff191660ff9190911617905551600291909101556001600160a01b0385811695861561116457886110ea91611b69565b1661114e575060608693837f2cbf284c18a6cdd96884fd3721698452ac1750ae851c33c95fd5b8c04cfaca95946111269489519586809561187c565b898c850152818a850152848401375f828201840152601f01601f19168101030190a351908152f35b6024905f8751916339e3563760e11b8352820152fd5b8751633250574960e11b81525f81850152602490fd5b602185634e487b7160e01b5f525260245ffd5b015190505f80611095565b5f8881528181209450601f198616915b8282106111e45750509084600195949392106111cc575b505050811b0183556110a9565b01515f1960f88460031b161c191690555f80806111bf565b806001869782949787015181550196019401906111a8565b909250865f52815f2090601f850160051c820192851061124a575b918f9291601f8695930160051c01905b8181106112345750611080565b90925060019193505f815501918e918493611227565b9091508190611217565b604186634e487b7160e01b5f525260245ffd5b5090346102b45760203660031901126102b457611286602092356119a9565b90516001600160a01b039091168152f35b5090346102b457602091826003193601126102b457916112b56116b7565b906112bf82611973565b6112e06112cb8261192d565b916112d8865193846117b8565b80835261192d565b8183019590601f19013687376008546001945f906001600160a01b0390811690875b848110611343575050505050508351938285019183865251809252840194915f5b8281106113305785870386f35b8351875295810195928101928401611323565b9788819b995f999899526002885283838c5f2054161461136a575b01999799969596611302565b905061137584611945565b938851811015611390579080888d9360051b8b01015261135e565b603287634e487b7160e01b5f525260245ffd5b5090346102b45760203660031901126102b4576113f391355f526009602052805f206113ce816117da565b91600260ff600184015416920154906113fe8151958695606087526060870190611693565b93602086019061187c565b8301520390f35b82346102b4575f90611416366116e3565b5050505161142381611780565b526118ef565b82346102b4575f3660031901126102b45760075490516001600160a01b039091168152602090f35b346102b45761145f366116e3565b5050506118ef565b5090346102b457806003193601126102b4576114816116b7565b9160243561148e816119a9565b33151580611530575b80611509575b6114f3576001600160a01b039485169482918691167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b9255f80a45f526020525f20906001600160601b0360a01b8254161790555f80f35b835163a9fbf51f60e01b81523381850152602490fd5b5060018060a01b0381165f526005602052835f20335f5260205260ff845f2054161561149d565b506001600160a01b038116331415611497565b5090346102b45760203660031901126102b4578160209235611564816119a9565b505f52825260018060a01b03815f2054169051908152f35b82346102b4575f3660031901126102b4578051905f90825f549261159f84611718565b808352602094600190866001821691825f14610ebd5750506001146115d0575050610be89291610e539103856117b8565b5f80805286935091907f290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e5635b8284106116115750505082010181610e53610e41565b8054848a0186015288955087949093019281016115fb565b82346102b45760203660031901126102b457359063ffffffff60e01b82168092036102b4576020916380ac58cd60e01b8114908115611682575b8115611671575b5015158152f35b6301ffc9a760e01b1490508361166a565b635b5e139f60e01b81149150611663565b805180835260209291819084018484015e5f828201840152601f01601f1916010190565b600435906001600160a01b03821682036102b457565b602435906001600160a01b03821682036102b457565b60609060031901126102b4576001600160a01b039060043582811681036102b4579160243590811681036102b4579060443590565b90600182811c92168015611746575b602083101461173257565b634e487b7160e01b5f52602260045260245ffd5b91607f1691611727565b6060810190811067ffffffffffffffff82111761176c57604052565b634e487b7160e01b5f52604160045260245ffd5b6020810190811067ffffffffffffffff82111761176c57604052565b6040810190811067ffffffffffffffff82111761176c57604052565b90601f8019910116810190811067ffffffffffffffff82111761176c57604052565b9060405191825f82546117ec81611718565b908184526020946001916001811690815f1461185a575060011461181c575b50505061181a925003836117b8565b565b5f90815285812095935091905b81831061184257505061181a93508201015f808061180b565b85548884018501529485019487945091830191611829565b9250505061181a94925060ff191682840152151560051b8201015f808061180b565b9060048210156118895752565b634e487b7160e01b5f52602160045260245ffd5b67ffffffffffffffff811161176c57601f01601f191660200190565b9291926118c58261189d565b916118d360405193846117b8565b8294818452818301116102b4578281602093845f960137010152565b60405162461bcd60e51b81526020600482015260166024820152754f546f6b656e3a207573652068616e644f766572282960501b6044820152606490fd5b67ffffffffffffffff811161176c5760051b60200190565b5f1981146119535760010190565b634e487b7160e01b5f52601160045260245ffd5b60048210156118895752565b6001600160a01b03168015611991575f52600360205260405f205490565b6040516322718ad960e21b81525f6004820152602490fd5b5f818152600260205260409020546001600160a01b03169081156119cb575090565b60249060405190637e27328960e01b82526004820152fd5b6006546001600160a01b031633036119f757565b60405163118cdaa760e01b8152336004820152602490fd5b60048110156118895760018114611a9b5760028114611a7357600314611a5257604051611a3b8161179c565b6007815266434f4d50414e5960c81b602082015290565b604051611a5e8161179c565b6005815264434956494360d81b602082015290565b50604051611a808161179c565b600b81526a434f4f504552415449564560a81b602082015290565b50604051611aa88161179c565b60038152624d434360e81b602082015290565b60048110156118895760018114611b455760028114611b2157600314611afe57604051611ae78161179c565b600781526611a11c1c1b182160c91b602082015290565b604051611b0a8161179c565b60078152661199b11c19331b60c91b602082015290565b50604051611b2e8161179c565b60078152662331366133346160c81b602082015290565b50604051611b528161179c565b6007815266119c311ab1b31b60c91b602082015290565b5f828152600260205260409020546001600160a01b03908116929183611bef575b1680611bd7575b815f52600260205260405f20816001600160601b0360a01b825416179055827fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef5f80a490565b805f52600360205260405f2060018154019055611b91565b600460205260405f206001600160601b0360a01b8154169055835f52600360205260405f205f198154019055611b8a565b805115611d4c57805191600280840180941161195357600393849004600281901b91906001600160fe1b038116036119535793604051937f4142434445464748494a4b4c4d4e4f505152535455565758595a616263646566601f52603f917f6768696a6b6c6d6e6f707172737475767778797a303132333435363738392b2f603f5260208601928291835184019160208301998a51945f8c525b848110611d1057505050505090600391602095969752510680600114611cfb57600214611cee575b50808452830101604052565b603d905f1901535f611ce2565b50603d90815f1982015360011901535f611ce2565b836004919c95989c019b838d51818160121c165183538181600c1c16516001840153818160061c1651858401531651858201530196939a611cba565b50604051611d5981611780565b5f81529056fea2646970667358221220d56b4dc4c513707477b213f2fac755e99db3e6130d8a6653dd6829ccb83759c164736f6c63430008190033"
  },
  "Colony": {
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
            "indexed": true,
            "internalType": "uint256",
            "name": "id",
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
            "internalType": "uint256",
            "name": "valueSTokens",
            "type": "uint256"
          }
        ],
        "name": "AssetRegistered",
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
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "newValueS",
            "type": "uint256"
          }
        ],
        "name": "AssetTransferred",
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
            "internalType": "uint256",
            "name": "assetId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "bps",
            "type": "uint256"
          }
        ],
        "name": "EquityCancelled",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "assetId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "forfeitedBps",
            "type": "uint256"
          }
        ],
        "name": "EquityForfeited",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "company",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "holder",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "assetId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "stakeBps",
            "type": "uint256"
          }
        ],
        "name": "EquityIssued",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "fromAssetId",
            "type": "uint256"
          },
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "toAssetId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "bps",
            "type": "uint256"
          }
        ],
        "name": "EquityTransferred",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "colony",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "founderWallet",
            "type": "address"
          }
        ],
        "name": "FounderSharePaid",
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
            "indexed": true,
            "internalType": "uint256",
            "name": "assetId",
            "type": "uint256"
          },
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "liabilityId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "creditor",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "obligor",
            "type": "address"
          }
        ],
        "name": "ObligationCreated",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "liabilityId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "obligor",
            "type": "address"
          }
        ],
        "name": "ObligationDefaulted",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "liabilityId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "obligor",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "creditor",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "ObligationSettled",
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
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "assetId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "newlyVestedBps",
            "type": "uint256"
          }
        ],
        "name": "VestedTranchesClaimed",
        "type": "event"
      },
      {
        "inputs": [],
        "name": "aToken",
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
        "name": "advanceEpoch",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "assetId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "bps",
            "type": "uint256"
          }
        ],
        "name": "cancelEquity",
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
        "inputs": [
          {
            "internalType": "uint256",
            "name": "assetId",
            "type": "uint256"
          }
        ],
        "name": "claimVestedTranches",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "newlyVestedBps",
            "type": "uint256"
          }
        ],
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
        "inputs": [
          {
            "internalType": "uint256",
            "name": "assetId",
            "type": "uint256"
          }
        ],
        "name": "forfeitEquity",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "forfeitedBps",
            "type": "uint256"
          }
        ],
        "stateMutability": "nonpayable",
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
        "name": "initialize",
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
            "internalType": "address",
            "name": "company",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "holder",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "stakeBps",
            "type": "uint256"
          },
          {
            "internalType": "uint256[]",
            "name": "vestingEpochs",
            "type": "uint256[]"
          },
          {
            "internalType": "uint256[]",
            "name": "trancheBps",
            "type": "uint256[]"
          }
        ],
        "name": "issueEquity",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "assetId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "liabilityId",
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
            "name": "company",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "holder",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "stakeBps",
            "type": "uint256"
          },
          {
            "internalType": "uint256[]",
            "name": "vestingEpochs",
            "type": "uint256[]"
          },
          {
            "internalType": "uint256[]",
            "name": "trancheBps",
            "type": "uint256[]"
          }
        ],
        "name": "issueFoundingEquity",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "assetId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "liabilityId",
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
            "name": "creditor",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "obligor",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "monthlyAmountS",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "totalEpochs",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "collateralId",
            "type": "uint256"
          }
        ],
        "name": "issueObligation",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "assetId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "liabilityId",
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
            "internalType": "address",
            "name": "companyWallet",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "exDirector",
            "type": "address"
          }
        ],
        "name": "redeemDirectorShares",
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
        "name": "redeemV",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "valueSTokens",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "weightKg",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "hasAI",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "depreciationBps",
            "type": "uint256"
          }
        ],
        "name": "registerAsset",
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
            "name": "_aToken",
            "type": "address"
          }
        ],
        "name": "setAToken",
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
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "newValueS",
            "type": "uint256"
          }
        ],
        "name": "transferAsset",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "assetId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "bps",
            "type": "uint256"
          }
        ],
        "name": "transferEquity",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "newAssetId",
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
    ]
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
    "bytecode": "0x60803461011857601f6103b038819003918201601f19168301916001600160401b0383118484101761011c57808492604094855283398101031261011857602061004882610130565b916001600160a01b0391829161005e9101610130565b16918215610100575f5460018060a01b03199380858316175f558360405192167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e05f80a3813b156100e957501680916001541617600155604051907fbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b5f80a261026b90816101458239f35b63211eb15960e21b81529082166004820152602490fd5b604051631e4fbdf760e01b81525f6004820152602490fd5b5f80fd5b634e487b7160e01b5f52604160045260245ffd5b51906001600160a01b03821682036101185756fe60806040526004361015610011575f80fd5b5f3560e01c80633659cfe6146101865780635c60da1b1461015e578063715018a6146101075780638da5cb5b146100e05763f2fde38b14610050575f80fd5b346100dc5760203660031901126100dc576004356001600160a01b03818116918290036100dc5761007f61020a565b81156100c4575f54826bffffffffffffffffffffffff60a01b8216175f55167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e05f80a3005b604051631e4fbdf760e01b81525f6004820152602490fd5b5f80fd5b346100dc575f3660031901126100dc575f546040516001600160a01b039091168152602090f35b346100dc575f3660031901126100dc5761011f61020a565b5f80546001600160a01b0319811682556001600160a01b03167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e08280a3005b346100dc575f3660031901126100dc576001546040516001600160a01b039091168152602090f35b346100dc5760203660031901126100dc576004356001600160a01b038116908181036100dc576101b461020a565b3b156101f257600180546001600160a01b031916821790557fbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b5f80a2005b6024906040519063211eb15960e21b82526004820152fd5b5f546001600160a01b0316330361021d57565b60405163118cdaa760e01b8152336004820152602490fdfea2646970667358221220c5744d43298806970c6e9fa9afba81bd87cbf087d700a6bc8c260c1a410cfd2864736f6c63430008190033"
  },
  "BeaconProxy": {
    "abi": [
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "beacon",
            "type": "address"
          },
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          }
        ],
        "stateMutability": "payable",
        "type": "constructor"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "target",
            "type": "address"
          }
        ],
        "name": "AddressEmptyCode",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "beacon",
            "type": "address"
          }
        ],
        "name": "ERC1967InvalidBeacon",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "implementation",
            "type": "address"
          }
        ],
        "name": "ERC1967InvalidImplementation",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "ERC1967NonPayable",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "FailedCall",
        "type": "error"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "beacon",
            "type": "address"
          }
        ],
        "name": "BeaconUpgraded",
        "type": "event"
      },
      {
        "stateMutability": "payable",
        "type": "fallback"
      }
    ],
    "bytecode": "0x60a060409080825261045580380380916100198285610265565b833981019082818303126101a35761003081610288565b916020918281015160018060401b03918282116101a3570182601f820112156101a357805191821161025157855192610072601f8401601f1916860185610265565b8284528483830101116101a357815f92858093018386015e83010152823b15610231577fa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d5080546001600160a01b0319166001600160a01b038581169182179092558551635c60da1b60e01b8082529194928382600481895afa918215610227575f926101f0575b50813b156101d75750508551847f1cf3b03a6cf19fa2baba4df148e9dcabedea7f8a5c07840e207e5c089be95d3e5f80a28351156101b857508190600487518096819382525afa9081156101ae575f91610173575b50610159925061029c565b505b60805251610127908161032e82396080518160180152f35b905082813d83116101a7575b6101898183610265565b810103126101a35761019d61015992610288565b5f61014e565b5f80fd5b503d61017f565b85513d5f823e3d90fd5b9350505050346101c8575061015b565b63b398979f60e01b8152600490fd5b8751634c9c8ce360e01b81529116600482015260249150fd5b9091508381813d8311610220575b6102088183610265565b810103126101a35761021990610288565b905f6100f9565b503d6101fe565b88513d5f823e3d90fd5b8351631933b43b60e21b81526001600160a01b0384166004820152602490fd5b634e487b7160e01b5f52604160045260245ffd5b601f909101601f19168101906001600160401b0382119082101761025157604052565b51906001600160a01b03821682036101a357565b905f8091602081519101845af4808061031a575b156102d05750506040513d81523d5f602083013e60203d82010160405290565b156102f757604051639996b31560e01b81526001600160a01b039091166004820152602490fd5b3d15610308576040513d5f823e3d90fd5b60405163d6bda27560e01b8152600490fd5b503d1515806102b05750813b15156102b056fe60806040819052635c60da1b60e01b81526020816004817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa90811560a6575f916053575b5060d5565b905060203d60201160a0575b601f8101601f191682019167ffffffffffffffff831181841017608c576087926040520160b1565b5f604e565b634e487b7160e01b5f52604160045260245ffd5b503d605f565b6040513d5f823e3d90fd5b602090607f19011260d1576080516001600160a01b038116810360d15790565b5f80fd5b5f8091368280378136915af43d5f803e1560ed573d5ff35b3d5ffdfea264697066735822122085b8a810c1a55ac85d077ad9eb450e666900850fe4e60939e127edac4ead932564736f6c63430008190033"
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
            "indexed": true,
            "internalType": "address",
            "name": "exDirector",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "totalVPaid",
            "type": "uint256"
          }
        ],
        "name": "DirectorSharesRedeemed",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "vAmount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "holderCount",
            "type": "uint256"
          }
        ],
        "name": "DividendDeclared",
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
            "name": "assetId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "bps",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "priceS",
            "type": "uint256"
          }
        ],
        "name": "SharesBoughtBack",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "assetId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "forfeitedBps",
            "type": "uint256"
          }
        ],
        "name": "SharesForfeited",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "holder",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "stakeBps",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "bool",
            "name": "hasVesting",
            "type": "bool"
          }
        ],
        "name": "SharesIssued",
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
            "name": "assetId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "bps",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "priceS",
            "type": "uint256"
          }
        ],
        "name": "buybackShares",
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
        "inputs": [
          {
            "internalType": "uint256",
            "name": "vAmount",
            "type": "uint256"
          }
        ],
        "name": "declareDividend",
        "outputs": [],
        "stateMutability": "nonpayable",
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
        "inputs": [
          {
            "internalType": "uint256",
            "name": "assetId",
            "type": "uint256"
          }
        ],
        "name": "forfeitShares",
        "outputs": [],
        "stateMutability": "nonpayable",
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
            "name": "totalStakeBps",
            "type": "uint256[]"
          },
          {
            "internalType": "uint256[]",
            "name": "vestedStakeBps",
            "type": "uint256[]"
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
          }
        ],
        "name": "initialize",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "investor",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "stakeBps",
            "type": "uint256"
          }
        ],
        "name": "issueOpenShares",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "holder",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "stakeBps",
            "type": "uint256"
          },
          {
            "internalType": "uint256[]",
            "name": "vestingEpochs",
            "type": "uint256[]"
          },
          {
            "internalType": "uint256[]",
            "name": "trancheBps",
            "type": "uint256[]"
          }
        ],
        "name": "issueVestingShares",
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
            "internalType": "address",
            "name": "exDirector",
            "type": "address"
          }
        ],
        "name": "redeemDirectorShares",
        "outputs": [],
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
        "inputs": [
          {
            "internalType": "uint256",
            "name": "stakeBps",
            "type": "uint256"
          }
        ],
        "name": "shareNAV",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "navV",
            "type": "uint256"
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
    "bytecode": "0x6080806040523460b4577ff0c57e16840df040f15088dc2f81fe391c3923bec73e23a9662efc9c229c6a009081549060ff8260401c1660a557506001600160401b036002600160401b0319828216016061575b60405161294990816100b98239f35b6001600160401b031990911681179091556040519081527fc7f505b2f371ae2175ee4913f4499e1f2633a7b5936321eed1cdaeb6115181d290602090a15f80806052565b63f92ee8a960e01b8152600490fd5b5f80fdfe6080806040526004361015610012575f80fd5b5f905f3560e01c90816306fdde03146120e05750806307ad30d314612034578063127be12b14611eeb5780631aab9a9f14611e1357806325f615711461183b57806332b65304146116b8578063349ff7701461169157806334c46b70146116685780634a4bdb30146115665780635495d2aa1461153d5780635ecce1ab146111115780637bb7c0d814610dbe5780637ec0f93114610c7857806385fa33eb1461086357806386d4d1ee14610680578063908921fc14610657578063ab18e8ef146104ee578063b81d7a4114610477578063c7a8620114610450578063cbeee469146103d3578063e4c0f55f146102d65763ef2f92ad14610110575f80fd5b346102d3576020806003193601126102cf57816004359160018060a01b0361013d81600254163314612314565b80835416604051635060f8af60e11b81528381600481855afa80156102865783918691610291575b50606090602460405180948193632331088960e11b83528b6004840152165afa80156102865784936101a1928792610252575b5016301461265d565b6024604051809581936335ee811960e01b83528860048401525af180156102475784906101f6575b7f7416ef90f517a6ef1ab261803ebc4e673f73751bc82fc6556cd4298dd103794b9250604051908152a280f35b508082813d8311610240575b61020c818361224d565b8101031261023c577f7416ef90f517a6ef1ab261803ebc4e673f73751bc82fc6556cd4298dd103794b91516101c9565b5f80fd5b503d610202565b6040513d86823e3d90fd5b61027591925060603d60601161027f575b61026d818361224d565b81019061260d565b915050905f610198565b503d610263565b6040513d87823e3d90fd5b809250858092503d83116102c8575b6102aa818361224d565b810103126102c45760606102be8492612402565b90610165565b8480fd5b503d6102a0565b5080fd5b80fd5b50346102d357806003193601126102d35780546040516326ec6a6760e21b8152602092916001600160a01b03919084908290600490829086165afa9081156103c857908491849161038e575b506024604051809481936370a0823160e01b8352306004840152165afa9182156103825791610355575b50604051908152f35b90508181813d831161037b575b61036c818361224d565b8101031261023c57515f61034c565b503d610362565b604051903d90823e3d90fd5b82819392503d83116103c1575b6103a5818361224d565b810103126103bd576103b78491612402565b5f610322565b8280fd5b503d61039b565b6040513d85823e3d90fd5b50346102d357806003193601126102d35780546040516327af7c4b60e21b8152602092916001600160a01b03919084908290600490829086165afa9081156103c857908491849161038e57506024604051809481936370a0823160e01b8352306004840152165afa91821561038257916103555750604051908152f35b50346102d35760203660031901126102d357602061046f600435612731565b604051908152f35b50346102d35760203660031901126102d35761049161229b565b6002546001600160a01b03808216926104ab338514612314565b1680926104b9821515612359565b7fca4de081ad2eb92babef22ea663c56c9b11b18bbdfee317b404312827094e7c28580a36001600160a01b0319161760025580f35b50346102d3576003196040368201126102cf5761050961229b565b9060243560018060a01b03809361052582600254163314612314565b169283156106195760409061053b8315156126b5565b85541681519061054a82612232565b8682526105998784519361055d85612232565b8185526105a8865198899687958694635ac1bb6b60e11b86523060048701528d60248701528b604487015260a0606487015260a48601906122b1565b918483030160848501526122b1565b03925af1908115610247577fc7b81c180e9478202e3cb472ff09b52b057ec79827ad7af3e4708d0728cb93af926040926105ed575b508151908152846020820152a280f35b61060c90833d8511610612575b610604818361224d565b8101906126f7565b506105dd565b503d6105fa565b60405162461bcd60e51b815260206004820152601660248201527521b7b6b830b73c9d103d32b9379034b73b32b9ba37b960511b6044820152606490fd5b50346102d357806003193601126102d3576003546040516001600160a01b039091168152602090f35b50346102d3576003196080368201126102cf5761069b61229b565b602435604435916001600160401b039283811161085f576106c09036906004016122e4565b9360643590811161085b576106d99036906004016122e4565b9460018060a01b0380946106f282600254163314612314565b1696871561081f576107058615156126b5565b81156107c257876107608a92610751996040988554169689519b8c998a988997635ac1bb6b60e11b89523060048a015260248901528d604489015260a0606489015260a488019161270d565b9285840301608486015261270d565b03925af1908115610247577fc7b81c180e9478202e3cb472ff09b52b057ec79827ad7af3e4708d0728cb93af926040926107a6575b50815190815260016020820152a280f35b6107bc90833d851161061257610604818361224d565b50610795565b60405162461bcd60e51b815260206004820152602f60248201527f436f6d70616e793a207573652069737375654f70656e53686172657320666f7260448201526e081a5b5b59591a585d19481d995cdd608a1b6064820152608490fd5b60405162461bcd60e51b815260206004820152601460248201527321b7b6b830b73c9d103d32b937903437b63232b960611b6044820152606490fd5b8680fd5b8580fd5b50346102d3576020806003193601126102cf57600254600435916001600160a01b0391821633148015610c6b575b15610c27578215610bea57818454166040516326ec6a6760e21b81528281600481855afa908115610aed57849184918891610bb3575b506024604051809481936370a0823160e01b8352306004840152165afa8015610aed5785918791610b82575b5010610b3d57604051635060f8af60e11b815290858383600481855afa8015610b305785938291610af8575b506024604051809581936329e7dd5760e11b8352306004840152165afa918215610aed5786908793610ac5575b508051948515610a805787885b878110610a61575061096c811515612590565b885b8781106109a857897fae52e650e0d7846103a034e23a81f401f776de50bb5bb37a4c8900daa5e0f5b760408b8b8b8351928352820152a180f35b6109b28187612547565b5115610a5957896109d6836109d16109ca858b612547565b518d61262c565b61263f565b806109e8575b50506001905b0161096e565b846109f38488612547565b5116873b156103bd576040516329e0afa360e11b81526001600160a01b0391909116600482015260248101919091528181604481838b5af18015610a4e57156109dc57610a3f9061220b565b610a4a57895f6109dc565b8980fd5b6040513d84823e3d90fd5b6001906109e2565b90610a79600191610a728489612547565b519061256f565b9101610959565b60405162461bcd60e51b815260048101869052601a60248201527f436f6d70616e793a206e6f2065717569747920686f6c646572730000000000006044820152606490fd5b9050610ae49192503d8088833e610adc818361224d565b81019061248e565b5091905f61094c565b6040513d88823e3d90fd5b809450858092503d8311610b29575b610b11818361224d565b810103126102d357610b238593612402565b5f61091f565b503d610b07565b50604051903d90823e3d90fd5b60405162461bcd60e51b815260048101839052601f60248201527f436f6d70616e793a20696e73756666696369656e7420562062616c616e6365006044820152606490fd5b809250848092503d8311610bac575b610b9b818361224d565b8101031261023c578490515f6108f3565b503d610b91565b92505081813d8311610be3575b610bca818361224d565b8101031261085f5782610bdd8592612402565b5f6108c7565b503d610bc0565b6064906040519062461bcd60e51b82526004820152601660248201527510dbdb5c185b9e4e881e995c9bc8191a5d9a59195b9960521b6044820152fd5b6064906040519062461bcd60e51b82526004820152601c60248201527f436f6d70616e793a206e6f7420736563726574617279206f72204644000000006044820152fd5b5081600454163314610891565b50346102d357806003193601126102d3578054604051635060f8af60e11b81526020916001600160a01b039190849084908390600490829087165afa8015610b305783928291610d86575b506024604051809481936329e7dd5760e11b8352306004840152165afa92831561024757849285928695610d62575b509392919060405195869560608701906060885285518092528360808901960192905b828210610d4557888703858a01528880610d418a610d338b8b6122b1565b9083820360408501526122b1565b0390f35b835181168752899850958401959284019260019190910190610d15565b9193509350610d7b91503d8086833e610adc818361224d565b91929091935f610cf2565b809350858092503d8311610db7575b610d9f818361224d565b810103126102d357610db18392612402565b5f610cc3565b503d610d95565b50346102d35760603660031901126102d357610dd861229b565b6001600160401b0360243581811161110d57610df890369060040161226e565b6001600160a01b03939192604435858116929083900361023c577ff0c57e16840df040f15088dc2f81fe391c3923bec73e23a9662efc9c229c6a009485549660ff8860401c16159584891698891580611106575b6001809b1490816110fc575b1590816110f3575b506110e15767ffffffffffffffff1981168a178955876110c2575b5016928315611086578415611041576bffffffffffffffffffffffff60a01b93848a5416178955821161102d578190610eb488546121d3565b601f8111610fbe575b508890601f8311600114610f42578992610f37575b50505f19600383901b1c191690861b1785555b6002541617600255610ef5578280f35b805468ff0000000000000000191690556040519081527fc7f505b2f371ae2175ee4913f4499e1f2633a7b5936321eed1cdaeb6115181d290602090a15f808280f35b013590505f80610ed2565b888a528893507fb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf691601f1984168b5b818110610fa657508411610f8d575b505050811b018555610ee5565b01355f19600384901b60f8161c191690555f8080610f80565b8284013585558b969094019360209283019201610f71565b9091508789527fb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf6601f840160051c81019160208510611023575b84939291601f8b920160051c01915b828110611015575050610ebd565b8b81558594508a9101611007565b9091508190610ff8565b634e487b7160e01b88526041600452602488fd5b60405162461bcd60e51b815260206004820152601760248201527f436f6d70616e793a207a65726f207365637265746172790000000000000000006044820152606490fd5b60405162461bcd60e51b8152602060048201526014602482015273436f6d70616e793a207a65726f20636f6c6f6e7960601b6044820152606490fd5b68ffffffffffffffffff1916680100000000000000011788555f610e7b565b60405163f92ee8a960e01b8152600490fd5b9050155f610e60565b303b159150610e58565b5087610e4c565b8380fd5b50346102d35760603660031901126102d35760043560248035604480359260018060a01b039161114683600254163314612314565b83156115065784156114cd57828754169160405193635060f8af60e11b85526020948581600481885afa80156113a85782918b91611495575b501690604051633295655360e21b815289600482015286818581865afa80156113ed5782918c9161145d575b501691821561141a5760608a8560405180948193632331088960e11b835260048301525afa80156113ed576111eb918c916113f8575b508216301461265d565b6040516327af7c4b60e21b81528681600481895afa80156113ed5787918c916113b3575b5084604051809481936370a0823160e01b8352306004840152165afa80156113a85788918b91611377575b5010611334579083929189943b156102c4576040519063f49bb76b60e01b825260048201528782820152606083820152600d60648201526c7368617265206275796261636b60981b6084820152848160a48183885af1908115610286578591611320575b5050823b1561110d578391869183604051958694859363dde77f2b60e01b85528d60048601528401525af18015610a4e57611308575b5050907f8220ea01ac83f8dfa3fa03efff145f0df6bc0ef871c35871d0fbe480bda4c331926040928351928352820152a280f35b6113149093929361220b565b6102c45790845f6112d4565b6113299061220b565b61110d57835f61129e565b60405162461bcd60e51b815260048101869052601f818401527f436f6d70616e793a20696e73756666696369656e7420532062616c616e63650081850152606490fd5b809250878092503d83116113a1575b611390818361224d565b8101031261023c578790515f61123a565b503d611386565b6040513d8c823e3d90fd5b82819392503d83116113e6575b6113ca818361224d565b810103126113e2576113dc8791612402565b5f61120f565b8a80fd5b503d6113c0565b6040513d8d823e3d90fd5b611411915060603d60601161027f5761026d818361224d565b9150505f6111e1565b60405162461bcd60e51b815260048101889052601c818601527f436f6d70616e793a20746f6b656e20686173206e6f20686f6c6465720000000081870152606490fd5b809250888092503d831161148e575b611476818361224d565b810103126113e2576114888291612402565b5f6111ab565b503d61146c565b809250878092503d83116114c6575b6114ae818361224d565b81010312610a4a576114c08291612402565b5f61117f565b503d6114a4565b9072436f6d70616e793a207a65726f20707269636560681b60649260136040519362461bcd60e51b855260206004860152840152820152fd5b9070436f6d70616e793a207a65726f2062707360781b60649260116040519362461bcd60e51b855260206004860152840152820152fd5b50346102d357806003193601126102d3576002546040516001600160a01b039091168152602090f35b50346102d35760603660031901126102d35761158061229b565b6024356044356001600160401b03811161110d576115a290369060040161226e565b90918460018060a01b036115bb81600254163314612314565b8082541695863b156103bd57829060405192839163f49bb76b60e01b83521697886004830152856024830152606060448301528183816115ff606482018b8d6123e2565b03925af18015610a4e57611654575b505061164e7f5ce0614a46459714585c219d6fb0dd3a4b01b81fc18567ebe68bf418067c91d49360405193849384526040602085015260408401916123e2565b0390a280f35b61165d9061220b565b6102c457845f61160e565b50346102d357806003193601126102d3576004546040516001600160a01b039091168152602090f35b50346102d357806003193601126102d357546040516001600160a01b039091168152602090f35b50346102d35760203660031901126102d3576004356001600160401b0381116102cf576116e990369060040161226e565b906116ff60018060a01b03600254163314612314565b61170a36838361239d565b602081519101207fdc0d7a095c4e917ecbeb7deda7c942ff9744013d419e37549215a413915e421d81145f1461178b5750600380546001600160a01b03191690557f19e076775dff378e27d48707938b116febc2aa73335d72ab7a5d709ee429a664915b6117856040519283926020845260208401916123e2565b0390a180f35b7ffc742e123dab805d8342d9b1c2004b5c07fc27d27e8e2866f0275a3e65a7b7b3036117e857600480546001600160a01b03191690557f19e076775dff378e27d48707938b116febc2aa73335d72ab7a5d709ee429a6649161176e565b60405162461bcd60e51b815260206004820152602560248201527f436f6d70616e793a20756e6b6e6f776e20726f6c6520287573652043454f206f604482015264722046442960d81b6064820152608490fd5b50346102d35760203660031901126102d35761185561229b565b81546001600160a01b03929190831633819003611dd8576118798483161515612359565b604051635060f8af60e11b815290602082600481845afa918215610247578492611d9c575b506040516329e7dd5760e11b8152306004820152938085602481868a165afa958615610b305781958297611d79575b50819482955b87518710156118f4576118ec600191610a72898c612547565b9601956118d3565b6118ff811515612590565b604051632d1f933960e11b815282841660048201529584876024818785165afa968715610286578597611d37575b50849661193a81516125db565b9161194582516125db565b9361195083516125db565b95885b8451811015611a35576119668186612547565b5160405190632331088960e11b825260048201526060816024818d89165afa80156113ed578b908c928d91611a10575b508b16301480611a07575b6119b0575b5050600101611953565b6119bc839e9388612547565b516119c7848a612547565b526119d2838a612547565b526119dd828a612547565b525f1981146119f35760018091019b908d6119a6565b634e487b7160e01b8a52601160045260248afd5b508015156119a1565b915050611a2c915060603d60601161027f5761026d818361224d565b9190918f611996565b898984848f8f8d8c8e8415611ce1576040516326ec6a6760e21b815296602088600481885afa80156113a85789988b91611ca3575b506020906024604051809c81936370a0823160e01b8352306004840152165afa9889156113a8578a99611c6f575b5089988a5b878110611ad7578b8b7f1d3002d6fa1d6023eeb3daf8b7c181cbe7d5fb6edacb1e15a7fda3ec84e9a40c60208d8d6040519485521692a280f35b611aef836109d1611ae88488612547565b518561262c565b80611c03575b50611b008185612547565b51611b0b8288612547565b5110611b93575b611b1c8187612547565b51611b2a575b600101611a9d565b8b611b358287612547565b51611b408389612547565b51893b156103bd576040519163dde77f2b60e01b8352600483015260248201528181604481838d5af18015610a4e57611b7b575b5050611b22565b611b849061220b565b611b8f578b8d611b74565b8b80fd5b8b6020611ba08388612547565b516024604051809481936335ee811960e01b835260048301528c5af18015611bf857611bcd575b50611b12565b602090813d8311611bf1575b611be3818361224d565b8101031261023c578c611bc7565b503d611bd9565b6040513d8f823e3d90fd5b8c889c929c3b156102d3576040516329e0afa360e11b81526001600160a01b038c166004820152602481018390528181604481838e5af18015610a4e57611c57575b5050611c509161256f565b998c611af5565b611c609061220b565b611c6b578c8e611c45565b8c80fd5b9098506020813d602011611c9b575b81611c8b6020938361224d565b8101031261023c5751978a611a98565b3d9150611c7e565b9850506020883d602011611cd9575b81611cbf6020938361224d565b81010312610a4a576020611cd38a99612402565b90611a6a565b3d9150611cb2565b60405162461bcd60e51b815260206004820152602860248201527f436f6d70616e793a2065784469726563746f7220686f6c6473206e6f20657175604482015267697479206865726560c01b6064820152608490fd5b9096503d8086833e611d49818361224d565b81019060208183031261085f578051906001600160401b03821161085b57611d7292910161242d565b958761192d565b909650611d919195503d8087833e610adc818361224d565b50949094955f6118cd565b9091506020813d602011611dd0575b81611db86020938361224d565b8101031261110d57611dc990612402565b905f61189e565b3d9150611dab565b60405162461bcd60e51b8152602060048201526013602482015272436f6d70616e793a206e6f7420436f6c6f6e7960681b6044820152606490fd5b50346102d357806003193601126102d3578054604051635060f8af60e11b81526001600160a01b03918391906020908290600490829087165afa908115610a4e578291611eb1575b506024604051809481936329e7dd5760e11b8352306004840152165afa908115610a4e578260209392611e94575b505051604051908152f35b611ea892503d8091833e610adc818361224d565b50505f80611e89565b90506020813d602011611ee3575b81611ecc6020938361224d565b810103126102cf57611edd90612402565b5f611e5b565b3d9150611ebf565b50346102d35760403660031901126102d3576004356001600160401b0381116102cf57611f1c90369060040161226e565b6024356001600160a01b03818116939184900361023c57611f4290600254163314612314565b611f4d831515612359565b611f5836838361239d565b602081519101207fdc0d7a095c4e917ecbeb7deda7c942ff9744013d419e37549215a413915e421d81145f14611fd55750600380546001600160a01b031916841790557ff57a02bc01251569026959623a216217c197c199cc5011ed3563b3b5c1d57fd9915b61164e6040519283926020845260208401916123e2565b7ffc742e123dab805d8342d9b1c2004b5c07fc27d27e8e2866f0275a3e65a7b7b3036117e857600480546001600160a01b031916841790557ff57a02bc01251569026959623a216217c197c199cc5011ed3563b3b5c1d57fd991611fbe565b503461023c57602036600319011261023c5760043560018060a01b0361205f81600254163314612314565b5f5416803b1561023c575f80916024604051809481936339bc937760e01b83528760048401525af180156120d5576120c1575b5060207f2cb420c41f7e9445fd6ee7ef33231c6322ead403a431fcc15e923d1e0ac55b7991604051908152a180f35b6120cc91925061220b565b5f906020612092565b6040513d5f823e3d90fd5b3461023c575f36600319011261023c575f600191600154612100816121d3565b80835260208095818501936001811690815f146121b5575060011461215a575b50505061213182604094038361224d565b825193849281845251918280928501528484015e5f828201840152601f01601f19168101030190f35b9190945060015f527fb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf6915f925b8284106121a257505050820190920191612131846040612120565b8054868501880152928601928101612187565b60ff19168552505090151560051b8301019250612131846040612120565b90600182811c92168015612201575b60208310146121ed57565b634e487b7160e01b5f52602260045260245ffd5b91607f16916121e2565b6001600160401b03811161221e57604052565b634e487b7160e01b5f52604160045260245ffd5b602081019081106001600160401b0382111761221e57604052565b90601f801991011681019081106001600160401b0382111761221e57604052565b9181601f8401121561023c578235916001600160401b03831161023c576020838186019501011161023c57565b600435906001600160a01b038216820361023c57565b9081518082526020808093019301915f5b8281106122d0575050505090565b8351855293810193928101926001016122c2565b9181601f8401121561023c578235916001600160401b03831161023c576020808501948460051b01011161023c57565b1561231b57565b60405162461bcd60e51b8152602060048201526016602482015275436f6d70616e793a206e6f742073656372657461727960501b6044820152606490fd5b1561236057565b60405162461bcd60e51b8152602060048201526015602482015274436f6d70616e793a207a65726f206164647265737360581b6044820152606490fd5b9291926001600160401b03821161221e57604051916123c6601f8201601f19166020018461224d565b82948184528183011161023c578281602093845f960137010152565b908060209392818452848401375f828201840152601f01601f1916010190565b51906001600160a01b038216820361023c57565b6001600160401b03811161221e5760051b60200190565b9080601f8301121561023c5781519060209161244881612416565b93612456604051958661224d565b81855260208086019260051b82010192831161023c57602001905b82821061247f575050505090565b81518152908301908301612471565b909160608284031261023c578151916001600160401b039283811161023c5781019380601f8601121561023c578451946020956124ca81612416565b916124d8604051938461224d565b818352878084019260051b8201019184831161023c5788809201905b83821061253057505050509482015184811161023c578161251691840161242d565b93604083015190811161023c5761252d920161242d565b90565b82809161253c84612402565b8152019101906124f4565b805182101561255b5760209160051b010190565b634e487b7160e01b5f52603260045260245ffd5b9190820180921161257c57565b634e487b7160e01b5f52601160045260245ffd5b1561259757565b606460405162461bcd60e51b815260206004820152602060248201527f436f6d70616e793a207a65726f206f75747374616e64696e67206571756974796044820152fd5b906125e582612416565b6125f2604051918261224d565b8281528092612603601f1991612416565b0190602036910137565b9081606091031261023c5780519161252d604060208401519301612402565b8181029291811591840414171561257c57565b8115612649570490565b634e487b7160e01b5f52601260045260245ffd5b1561266457565b60405162461bcd60e51b815260206004820152602360248201527f436f6d70616e793a20746f6b656e206e6f7420666f72207468697320636f6d70604482015262616e7960e81b6064820152608490fd5b156126bc57565b60405162461bcd60e51b8152602060048201526013602482015272436f6d70616e793a207a65726f207374616b6560681b6044820152606490fd5b919082604091031261023c576020825192015190565b81835290916001600160fb1b03831161023c5760209260051b809284830137010190565b5f5460408051635060f8af60e11b81526001600160a01b0394928516936020939290918481600481895afa9081156128d0579087915f916128da575b505f9060248451809a81936329e7dd5760e11b8352306004840152165afa9687156128d0575f976128b1575b505f94855b88518710156127bf576127b7600191610a72898c612547565b96019561279e565b955091939650919484156128a757816004918551928380926326ec6a6760e21b82525afa90811561289d579082915f91612867575b5060248551809581936370a0823160e01b8352306004840152165afa92831561285e57505f9261282e575b505061252d926109d19161262c565b90809250813d8311612857575b612845818361224d565b8101031261023c5751826109d161281f565b503d61283b565b513d5f823e3d90fd5b82819392503d8311612896575b61287e818361224d565b8101031261023c576128908291612402565b5f6127f4565b503d612874565b84513d5f823e3d90fd5b5050505050505f90565b6128c69197503d805f833e610adc818361224d565b509050955f612799565b82513d5f823e3d90fd5b809250868092503d831161290c575b6128f3818361224d565b8101031261023c575f6129068892612402565b9061276d565b503d6128e956fea26469706673582212202a9c0419a12e837bac21b8e24f0d9d191ff836a2c660215bcd2f3b1cef21393664736f6c63430008190033"
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
    "bytecode": "0x608034609557601f61115d38819003918201601f19168301916001600160401b0383118484101760995780849260609460405283398101031260955760428160ad565b906057604060516020840160ad565b920160ad565b60018060a01b0380928160018060a01b03199516855f5416175f55168360015416176001551690600254161760025560405161109c90816100c18239f35b5f80fd5b634e487b7160e01b5f52604160045260245ffd5b51906001600160a01b038216820360955756fe6080806040526004361015610012575f80fd5b5f905f3560e01c9081631a32aad614610a7357508063349ff77014610a4c5780633b56fd44146101b657806357d13917146100a957806359659e901461008057638e75dd4714610060575f80fd5b3461007d578060031936011261007d576020600354604051908152f35b80fd5b503461007d578060031936011261007d576002546040516001600160a01b039091168152602090f35b503461007d576020806003193601126101b2576100c7600435610ba0565b509060018060a01b0391600192806001830154169060028301541660038301549160048401549360405196888254926100ff84610bd9565b808b52936001811690811561018e5750600114610155575b5050505061012a8661013e980387610b07565b60405196879660a0885260a0880190610ac7565b948601526040850152606084015260808301520390f35b90809a50528689205b828a1061017b5750505061012a868661013e99820101985f610117565b8054898b0189015298870198810161015e565b60ff19168a8c015250505050151560051b86018501965061012a8661013e5f610117565b5080fd5b50346108375760803660031901126108375760043567ffffffffffffffff811161083757366023820112156108375767ffffffffffffffff816004013511610837573660248260040135830101116108375760243567ffffffffffffffff811161083757610228903690600401610a96565b9060443567ffffffffffffffff811161083757610249903690600401610a96565b91906064359260ff84168403610837575f5460405163f3caad0360e01b81523360048201526001600160a01b0390911690602081602481855afa90811561082c575f91610a11575b50156109cc57866004013515610987578515610942578186036108fd575f805b8382106108c95761271091500361086f5760405190630f76f81b60e31b602083015260248201526060604482015261030e816102f8608482018a6004013560248c01610b4d565b336064830152601f198282030182520382610b07565b60025460405191906001600160a01b031667ffffffffffffffff6104558401908111908411176106fd57829161035e91610455610c12853961045584019081526040602082018190520190610ac7565b03905ff094851561082c5760206103ba60ff96895f8a60018060a01b03825416936040519b8c96879586946321ff05c760e01b865260018060a01b03166004860152606060248601526064850190602481600401359101610b4d565b9116604483015203925af194851561082c575f9561083b575b505f546001600160a01b0316803b156108375760405163b63e8d1560e01b81526001600160a01b0388166004820152905f908290602490829084905af1801561082c5761080f575b5087546001600160a01b031690885b81811061071157505050505050600354926040519060a0820182811067ffffffffffffffff8211176106fd57806040526104726020601f19601f856004013501160182610b07565b60048201358082526024830160c08501376004820135830160c00187905282526001600160a01b038416602083015233604083015260608201839052426080830152680100000000000000008510156106e957600185016003556104d585610ba0565b6106d55782519283519367ffffffffffffffff85116106c1576104f88354610bd9565b601f8111610680575b5060209888949392918a916001601f8911146105f1579680608093600495937fdfb72d7c9bc6f5c82e4fdfa88d06f1a6cfc5e09231d89fd9f778c761b12e737d999a926105e6575b50508160011b915f199060031b1c19161784555b808b01516001850180546001600160a01b03199081166001600160a01b039384161790915560408084015160028801805490931693169290921790556060820151600386015591015191909201558051818152916105c691830190600481013590602401610b4d565b8188019490945233946001600160a01b03169381900390a4604051908152f35b015190505f80610549565b9691908488528b8820975b601f19841681106106665750827fdfb72d7c9bc6f5c82e4fdfa88d06f1a6cfc5e09231d89fd9f778c761b12e737d979860049593600193608096601f1981161061064e575b505050811b01845561055d565b01515f1960f88460031b161c191690555f8080610641565b8282015189556001909801978b9750918c01918c016105fc565b838a5260208a20601f870160051c8101602088106106ba575b601f830160051c820181106106af575050610501565b8b8155600101610699565b5080610699565b634e487b7160e01b89526041600452602489fd5b634e487b7160e01b87526004879052602487fd5b634e487b7160e01b86526041600452602486fd5b634e487b7160e01b5f52604160045260245ffd5b61071c818388610b29565b356001600160a01b038116810361080b57604061073a838789610b29565b358c82519361074885610aeb565b8185528c6107b8855161075a81610aeb565b8481528651633f5f75cd60e01b81526001600160a01b039384166004820152929093166024830152604482019490945260a06064820152948593849283926107a69060a4850190610b6d565b83810360031901608485015290610b6d565b0391885af18015610800576107d1575b5060010161042a565b604090813d83116107f9575b6107e78183610b07565b810103126107f5575f6107c8565b8980fd5b503d6107dd565b6040513d8d823e3d90fd5b8a80fd5b90975067ffffffffffffffff81116106fd576040525f965f61041b565b6040513d5f823e3d90fd5b5f80fd5b9094506020813d602011610867575b8161085760209383610b07565b810103126108375751935f6103d3565b3d915061084a565b60405162461bcd60e51b815260206004820152602c60248201527f436f6d70616e79466163746f72793a207374616b6573206d7573742073756d2060448201526b746f2031303030302062707360a01b6064820152608490fd5b6108d4828587610b29565b3581018091116108e9576001909101906102b1565b634e487b7160e01b5f52601160045260245ffd5b60405162461bcd60e51b815260206004820152601f60248201527f436f6d70616e79466163746f72793a206c656e677468206d69736d61746368006044820152606490fd5b60405162461bcd60e51b815260206004820152601a60248201527f436f6d70616e79466163746f72793a206e6f20686f6c646572730000000000006044820152606490fd5b60405162461bcd60e51b815260206004820152601d60248201527f436f6d70616e79466163746f72793a206e616d652072657175697265640000006044820152606490fd5b60405162461bcd60e51b815260206004820152601d60248201527f436f6d70616e79466163746f72793a206e6f74206120636974697a656e0000006044820152606490fd5b90506020813d602011610a44575b81610a2c60209383610b07565b8101031261083757518015158103610837575f610291565b3d9150610a1f565b34610837575f366003190112610837575f546040516001600160a01b039091168152602090f35b34610837575f366003190112610837576001546001600160a01b03168152602090f35b9181601f840112156108375782359167ffffffffffffffff8311610837576020808501948460051b01011161083757565b805180835260209291819084018484015e5f828201840152601f01601f1916010190565b6020810190811067ffffffffffffffff8211176106fd57604052565b90601f8019910116810190811067ffffffffffffffff8211176106fd57604052565b9190811015610b395760051b0190565b634e487b7160e01b5f52603260045260245ffd5b908060209392818452848401375f828201840152601f01601f1916010190565b9081518082526020808093019301915f5b828110610b8c575050505090565b835185529381019392810192600101610b7e565b600354811015610b395760059060035f52027fc2575a0e9e593c00f959f8c92f12db2869c3395a3b0502d05e2516446f71f85b01905f90565b90600182811c92168015610c07575b6020831014610bf357565b634e487b7160e01b5f52602260045260245ffd5b91607f1691610be856fe60a060409080825261045580380380916100198285610265565b833981019082818303126101a35761003081610288565b916020918281015160018060401b03918282116101a3570182601f820112156101a357805191821161025157855192610072601f8401601f1916860185610265565b8284528483830101116101a357815f92858093018386015e83010152823b15610231577fa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d5080546001600160a01b0319166001600160a01b038581169182179092558551635c60da1b60e01b8082529194928382600481895afa918215610227575f926101f0575b50813b156101d75750508551847f1cf3b03a6cf19fa2baba4df148e9dcabedea7f8a5c07840e207e5c089be95d3e5f80a28351156101b857508190600487518096819382525afa9081156101ae575f91610173575b50610159925061029c565b505b60805251610127908161032e82396080518160180152f35b905082813d83116101a7575b6101898183610265565b810103126101a35761019d61015992610288565b5f61014e565b5f80fd5b503d61017f565b85513d5f823e3d90fd5b9350505050346101c8575061015b565b63b398979f60e01b8152600490fd5b8751634c9c8ce360e01b81529116600482015260249150fd5b9091508381813d8311610220575b6102088183610265565b810103126101a35761021990610288565b905f6100f9565b503d6101fe565b88513d5f823e3d90fd5b8351631933b43b60e21b81526001600160a01b0384166004820152602490fd5b634e487b7160e01b5f52604160045260245ffd5b601f909101601f19168101906001600160401b0382119082101761025157604052565b51906001600160a01b03821682036101a357565b905f8091602081519101845af4808061031a575b156102d05750506040513d81523d5f602083013e60203d82010160405290565b156102f757604051639996b31560e01b81526001600160a01b039091166004820152602490fd5b3d15610308576040513d5f823e3d90fd5b60405163d6bda27560e01b8152600490fd5b503d1515806102b05750813b15156102b056fe60806040819052635c60da1b60e01b81526020816004817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa90811560a6575f916053575b5060d5565b905060203d60201160a0575b601f8101601f191682019167ffffffffffffffff831181841017608c576087926040520160b1565b5f604e565b634e487b7160e01b5f52604160045260245ffd5b503d605f565b6040513d5f823e3d90fd5b602090607f19011260d1576080516001600160a01b038116810360d15790565b5f80fd5b5f8091368280378136915af43d5f803e1560ed573d5ff35b3d5ffdfea264697066735822122085b8a810c1a55ac85d077ad9eb450e666900850fe4e60939e127edac4ead932564736f6c63430008190033a26469706673582212209abbb6abaf8af730ae5f3578a15f4db9266b5145c6206eb960919a1e8b64a8a464736f6c63430008190033"
  },
  "AToken": {
    "abi": [
      {
        "inputs": [
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
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "length",
            "type": "uint256"
          }
        ],
        "name": "StringsInsufficientHexLength",
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
            "name": "id",
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
            "internalType": "uint256",
            "name": "valueSTokens",
            "type": "uint256"
          }
        ],
        "name": "AssetRegistered",
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
            "name": "newValue",
            "type": "uint256"
          }
        ],
        "name": "AssetTransferred",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "assetId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "bps",
            "type": "uint256"
          }
        ],
        "name": "EquityCancelled",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "assetId",
            "type": "uint256"
          },
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "liabilityId",
            "type": "uint256"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "company",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "holder",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "stakeBps",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "bool",
            "name": "hasVesting",
            "type": "bool"
          }
        ],
        "name": "EquityIssued",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "fromAssetId",
            "type": "uint256"
          },
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "toAssetId",
            "type": "uint256"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "bps",
            "type": "uint256"
          }
        ],
        "name": "EquityTransferred",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "liabilityId",
            "type": "uint256"
          }
        ],
        "name": "ObligationCompleted",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "liabilityId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "collateralId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "creditor",
            "type": "address"
          }
        ],
        "name": "ObligationDefaulted",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "liabilityId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "epochNumber",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amountS",
            "type": "uint256"
          }
        ],
        "name": "ObligationEpochSettled",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "assetId",
            "type": "uint256"
          },
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "liabilityId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "creditor",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "obligor",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "monthlyAmountS",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "totalEpochs",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "bool",
            "name": "secured",
            "type": "bool"
          }
        ],
        "name": "ObligationIssued",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "assetId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "trancheIndex",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "bps",
            "type": "uint256"
          }
        ],
        "name": "TrancheClaimed",
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
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "assetId",
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
            "internalType": "uint256",
            "name": "bps",
            "type": "uint256"
          }
        ],
        "name": "UnvestedForfeited",
        "type": "event"
      },
      {
        "inputs": [],
        "name": "activeObligationIds",
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
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "approve",
        "outputs": [],
        "stateMutability": "pure",
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
        "name": "assetData",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "valueSTokens",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "weightKg",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "hasAutonomousAI",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "depreciationBps",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "registrationEpoch",
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
        "inputs": [
          {
            "internalType": "uint256",
            "name": "assetId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "bps",
            "type": "uint256"
          }
        ],
        "name": "cancelEquity",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "assetId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "currentEpoch",
            "type": "uint256"
          }
        ],
        "name": "claimVestedTranches",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "newlyVestedBps",
            "type": "uint256"
          }
        ],
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
        "name": "collateralFor",
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
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "currentEpoch",
            "type": "uint256"
          }
        ],
        "name": "currentAssetValue",
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
        "name": "escrowedFor",
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
            "name": "assetId",
            "type": "uint256"
          }
        ],
        "name": "forfeitUnvested",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "forfeitedBps",
            "type": "uint256"
          }
        ],
        "stateMutability": "nonpayable",
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
            "name": "company",
            "type": "address"
          }
        ],
        "name": "getEquityTable",
        "outputs": [
          {
            "internalType": "address[]",
            "name": "holders",
            "type": "address[]"
          },
          {
            "internalType": "uint256[]",
            "name": "totalStakeBps",
            "type": "uint256[]"
          },
          {
            "internalType": "uint256[]",
            "name": "vestedStakeBps",
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
            "name": "liabilityId",
            "type": "uint256"
          }
        ],
        "name": "getObligation",
        "outputs": [
          {
            "internalType": "address",
            "name": "obligor",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "creditor",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "monthlyAmountS",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "totalEpochs",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "epochsPaid",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "collateralId",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "defaulted",
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
            "name": "id",
            "type": "uint256"
          }
        ],
        "name": "getTokenHolder",
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
            "name": "assetId",
            "type": "uint256"
          }
        ],
        "name": "getVestingStake",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "totalStakeBps",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "vestedBps",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "company",
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
            "internalType": "address",
            "name": "company",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "holder",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "stakeBps",
            "type": "uint256"
          },
          {
            "internalType": "uint256[]",
            "name": "vestingEpochs",
            "type": "uint256[]"
          },
          {
            "internalType": "uint256[]",
            "name": "trancheBps",
            "type": "uint256[]"
          }
        ],
        "name": "issueEquity",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "assetId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "liabilityId",
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
            "name": "creditor",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "obligor",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "monthlyAmountS",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "totalEpochs",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "collateralId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "maxMonthlyS",
            "type": "uint256"
          }
        ],
        "name": "issueObligation",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "assetId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "liabilityId",
            "type": "uint256"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "liabilityId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "creditor",
            "type": "address"
          }
        ],
        "name": "markObligationDefaulted",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "liabilityId",
            "type": "uint256"
          }
        ],
        "name": "markObligationPaid",
        "outputs": [
          {
            "internalType": "bool",
            "name": "completed",
            "type": "bool"
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
        "name": "nextId",
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
        "name": "obligationData",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "monthlyAmountS",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "totalEpochs",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "epochsPaid",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "collateralId",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "defaulted",
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
        "inputs": [
          {
            "internalType": "address",
            "name": "holder",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "valueSTokens",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "weightKg",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "hasAI",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "depreciationBps",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "currentEpoch",
            "type": "uint256"
          }
        ],
        "name": "registerAsset",
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
            "name": "",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "name": "setApprovalForAll",
        "outputs": [],
        "stateMutability": "pure",
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
            "name": "id",
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
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "tokens",
        "outputs": [
          {
            "internalType": "enum AToken.Form",
            "name": "form",
            "type": "uint8"
          },
          {
            "internalType": "address",
            "name": "holder",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "counterparty",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "linkedId",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "active",
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
            "name": "obligor",
            "type": "address"
          }
        ],
        "name": "totalMonthlyUnsecuredObligations",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "total",
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
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "newValueS",
            "type": "uint256"
          }
        ],
        "name": "transferAsset",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "assetId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "bps",
            "type": "uint256"
          }
        ],
        "name": "transferEquity",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "newAssetId",
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
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "vestingData",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "totalStakeBps",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "vestedBps",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "company",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "nextTranche",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    "bytecode": "0x60803461034857601f90601f19906001600160401b03906144063881900385810185168301848111848210176102765783928291604052833960209283918101031261034857516001600160a01b03811692908390036103485761006161034c565b93600d85526c29a824a1a2902096aa37b5b2b760991b8386015261008361034c565b90600582526441544f4b4560d81b848301528551838111610276575f546001978882811c9216801561033e575b8783101461025857818a8493116102f0575b5086908a8311600114610295575f9261028a575b50505f19600383901b1c191690871b175f555b81519283116102765785548681811c9116801561026c575b8582101461025857878111610215575b50839683116001146101ba57509481929394955f926101af575b50505f19600383901b1c191690841b1783555b811561016b5750600680546001600160a01b03191691909117905560075560405161409a908161036c8239f35b6064906040519062461bcd60e51b82526004820152601360248201527f41546f6b656e3a207a65726f20636f6c6f6e79000000000000000000000000006044820152fd5b015190505f8061012b565b821695855f52835f20915f5b888110610200575083879897959697106101e8575b505050811b01835561013e565b01515f1960f88460031b161c191690555f80806101db565b818301518455928701929185019185016101c6565b865f52845f208880860160051c82019287871061024f575b0160051c019087905b828110610244575050610111565b5f8155018790610236565b9250819261022d565b634e487b7160e01b5f52602260045260245ffd5b90607f1690610101565b634e487b7160e01b5f52604160045260245ffd5b015190505f806100d6565b90848a9416915f8052885f20925f5b8a8282106102da57505084116102c2575b505050811b015f556100e9565b01515f1960f88460031b161c191690555f80806102b5565b8385015186558d979095019493840193016102a4565b9091505f8052865f208a80850160051c820192898610610335575b918b91869594930160051c01915b8281106103275750506100c2565b5f81558594508b9101610319565b9250819261030b565b91607f16916100b0565b5f80fd5b60408051919082016001600160401b038111838210176102765760405256fe6080806040526004361015610012575f80fd5b5f3560e01c90816301cc7ad41461293b5750806301ffc9a7146128cd57806306fdde031461281357806307ca660e146125425780630808e18814612412578063081812fc146123d6578063095ea7b3146123675780630afb3c041461230c57806323b872dd146122f657806328ab2218146122cc578063349ff770146122a45780633956cdfe1461219757806342842e0e1461217357806346621112146121295780634f64b2be146120b857806353cfbaae14611edd578063553c7e6514611d1c5780635652b97d14611ce95780635a3f267214611c635780635abae4f314611bc15780635e617acd14611b8457806361b8ce8c14611b675780636352211e14611b3757806370a0823114611ae15780637a6e102814611a8d57806395d89b411461199b578063993ca18914611971578063a22cb465146118f7578063ac823a7e1461189c578063ae023771146111e9578063b58376d614610e27578063b88d4fde14610da7578063c590f30014610d8e578063c87b56dd14610613578063ca55954c146105de578063d224ca15146105b3578063dde77f2b146104bd578063e985e9c51461046b5763f7f7f6db146101c9575f80fd5b346104675760c0366003190112610467576101e2612a20565b6064359060248035831515604435818603610467576006546001600160a01b0394906102119086163314612b99565b848616948515976102228915613253565b681b1ae4d6e2ef500000861190811561045c575b8115610454575b5015610403576007549661025088612e63565b600755604051986102608a612b0c565b5f8a52602099898b8083018b815260408401905f8252600860608601935f85526080870195600187525f525260405f20945160058110156103f057855491516001600160a81b031990921660ff9091161790881660081b610100600160a81b0316178455610304939260039290915b88600186019151166001600160601b0360a01b82541617905551600284015551151591019060ff801983541691151516179055565b61030e8983613e30565b6103d9578761031c91613fad565b166103c4575084927fac3dcdc20bb35a0f2b39fb2ddbe12a30d20c4795d2026bf2fc48df3ce84ca67d92600488936040519261035784612b0c565b848452858401918252604084019081526103ab60608501916084358352608086019360a43585528a5f526009895260405f2096518755516001870155511515600286019060ff801983541691151516179055565b51600384015551910155604051908152a3604051908152f35b6040516339e3563760e11b81525f6004820152fd5b604051633250574960e11b81525f60048201528390fd5b89634e487b7160e01b5f5260216004525ffd5b60405162461bcd60e51b8152602060048201528083018390527f41546f6b656e3a2062656c6f7720726567697374726174696f6e2074687265736044820152631a1bdb1960e21b6064820152608490fd5b90505f61023d565b603285119150610236565b5f80fd5b3461046757604036600319011261046757610484612a20565b61048c612a36565b9060018060a01b038091165f52600560205260405f2091165f52602052602060ff60405f2054166040519015158152f35b34610467576104cb36612a76565b6104e060018060a01b03600654163314612b99565b815f52600860205260ff60405f206104fd82600383015416612bdb565b5416600581101561059f577f788f486facf15f8d493992d5c9122be3ef240a15e5abe0e9e94076c3c07360a891610538600160209314612c1a565b835f52600a825260405f2081151580610591575b61055590612cb5565b60018101610564838254612d0b565b9055610571828254612d0b565b80915515610583575b604051908152a2005b61058c846134a6565b61057a565b50600181015482111561054c565b634e487b7160e01b5f52602160045260245ffd5b346104675760203660031901126104675760206105d66105d1612a20565b6133bb565b604051908152f35b34610467576020366003190112610467576004355f526008602052602060018060a01b0360405f205460081c16604051908152f35b34610467576020806003193601126104675760043590610632826136fe565b50815f526008815260405f209182549060ff82169061065082613a07565b9160ff6003870154165f14610d805761066761339b565b935b6001600160a01b03906106809060081c8216613b32565b603f8760405197818901937f5b7b2274726169745f74797065223a22466f726d222c2276616c7565223a22008552828951808c838d01978891015e8b0162089f4b60ea1b9384603f8301527f7b2274726169745f74797065223a22416374697665222c2276616c7565223a226042830152805192839101606283015e019160628301527f7b2274726169745f74797065223a22486f6c646572222c2276616c7565223a226065830152805192839101608583015e019461075760878961227d60f01b9889608582015203606781018b520189612b5d565b8796600586101561059f57610a109a8a603d996109ba9982996109b599606a99610a049f60019784898096145f14610a145750505050926108c89285609b93816108ff98978c5f52600a8252816107cd60405f209260026107c46107bb8654613bfd565b97860154613bfd565b94015416613b32565b936040519a888c995191829101848b015e8801907f2c7b2274726169745f74797065223a22546f74616c205374616b652028627073838301526b149116113b30b63ab2911d1160a11b6040830152805192839101604c83015e019085604c8301527f2c7b2274726169745f74797065223a22566573746564202862707329222c2276604e8301526630b63ab2911d1160c91b606e830152805192839101607583015e01908360758301527f2c7b2274726169745f74797065223a22436f6d70616e79222c2276616c7565226077830152611d1160f11b6097830152805192839101609983015e0190609982015203607b810184520182612b5d565b935b6108fa602160405194858c605d60f81b818084019b8051918291018d5e8301918201520390810186520184612b5d565b613bfd565b604051717b226e616d65223a22412d546f6b656e202360701b8982015281519098899692829101603288015e850161088b60f21b938460328301527f226465736372697074696f6e223a22535049434520436f6c6f6e7920412d546f603483015265035b2b71016960d51b6054830152518092605a83015e0191605a8301526c1130ba3a3934b13aba32b9911d60991b605c830152518092606983015e01607d60f81b606982015203604a810184520182612b5d565b613e6e565b6040519384917f646174613a6170706c69636174696f6e2f6a736f6e3b6261736536342c000000828401528051918291018484015e81015f8382015203601d810184520182612b5d565b604051918291826129f6565b0390f35b92945090929180610b85575050505050609c6108ff9392610b7092885f52600985528460405f2081610a50670de0b6b3a7640000835404613bfd565b9160ff6002610a618d840154613bfd565b9201541615610b765781610a7361339b565b935b6040519a888c995191829101848b015e8801907f2c7b2274726169745f74797065223a2256616c756520285329222c2276616c75838301526332911d1160e11b6040830152805192839101604483015e01908560448301527f2c7b2274726169745f74797065223a2257656967687420286b6729222c227661604683015265363ab2911d1160d11b6066830152805192839101606c83015e019083606c8301527f2c7b2274726169745f74797065223a22486173204175746f6e6f6d6f75732041606e8301526b249116113b30b63ab2911d1160a11b608e830152805192839101609a83015e0190609a82015203607c810184520182612b5d565b936108ca565b81610b7f61337a565b93610a75565b60048103610cd957505050505060a06108ff9392610b7092885f52600b855284878160405f2081610bd96002610bd1610bc8670de0b6b3a7640000865404613bfd565b96850154613bfd565b930154613bfd565b936040519a888c995191829101848b015e8801907f2c7b2274726169745f74797065223a224d6f6e74686c7920416d6f756e742028838301526c29949116113b30b63ab2911d1160991b6040830152805192839101604d83015e019085604d8301527f2c7b2274726169745f74797065223a22546f74616c2045706f636873222c2276604f8301526630b63ab2911d1160c91b606f830152805192839101607683015e01908360768301527f2c7b2274726169745f74797065223a2245706f6368732050616964222c227661607883015265363ab2911d1160d11b6098830152805192839101609e83015e0190609e820152036080810184520182612b5d565b6003909a97939594969a14610cf8575b5050505050506108ff906108ca565b6108ff96995091610d146044949289610d749795015416613b32565b6040519687945180918487015e8401907f2c7b2274726169745f74797065223a224f626c69676f72222c2276616c75652283830152611d1160f11b6040830152805192839101604283015e01906042820152036024810184520182612b5d565b93908e808a8180610ce9565b610d8861337a565b93610669565b346104675760206105d6610da136612a76565b906132e3565b3461046757608036600319011261046757610dc0612a20565b50610dc9612a36565b506064356001600160401b038111610467573660238201121561046757806004013590610df582612b7e565b91610e036040519384612b5d565b8083523660248284010111610467575f928160246020940184830137010152612e71565b346104675760a036600319011261046757610e40612a20565b610e48612a36565b6064356001600160401b03811161046757610e67903690600401612ac1565b916084356001600160401b03811161046757610e87903690600401612ac1565b9390610e9e60018060a01b03600654163314612b99565b6001600160a01b038616156111ad57610ec16001600160a01b0384161515613253565b604435156111735784820361112f57816110ab575b610edf8661388f565b93610eeb858886613592565b9583156110a2575f905b610f3f60405194610f0586612af1565b6044358652602086019384526001600160a01b038b166040870190815294610f309036908990613295565b92606087019384523691613295565b906080850191825260a08501935f8552895f52600a60205260405f2095518655600193516001870155600286019060018060a01b039051166001600160601b0360a01b825416179055600385019051908151916001600160401b03831161107b57602090610fad8484612db8565b01905f5260205f20845f5b84811061108f575050505050600484019051908151916001600160401b03831161107b57602090610fe98484612db8565b01905f5260205f205f5b83811061106857505050505060606040978694889460057f6468119657454ae108a2def13838f817f302d27edf79111c34be9cbf5ddc76cf955191015561103a858361369d565b89516001600160a01b0397881681526044356020820152901515818b0152951694a482519182526020820152f35b8490602084519401938184015501610ff3565b634e487b7160e01b5f52604160045260245ffd5b6020845194019381840155018590610fb8565b60443590610ef5565b5f805b868110611114575060443514610ed65760405162461bcd60e51b815260206004820152602860248201527f41546f6b656e3a207472616e63686520627073206d7573742073756d20746f206044820152677374616b6542707360c01b6064820152608490fd5b906111286001918360051b85013590612e56565b91016110ae565b606460405162461bcd60e51b815260206004820152602060248201527f41546f6b656e3a207363686564756c65206c656e677468206d69736d617463686044820152fd5b60405162461bcd60e51b815260206004820152601260248201527141546f6b656e3a207a65726f207374616b6560701b6044820152606490fd5b60405162461bcd60e51b815260206004820152601460248201527341546f6b656e3a207a65726f20636f6d70616e7960601b6044820152606490fd5b346104675760c036600319011261046757611202612a20565b61120a612a36565b90604490606460849260a4359461122c60018060a01b03600654163314612b99565b6001600160a01b03841615611862576001600160a01b03811615611829578135156117e7578235156117af578435159586806117a6575b611736575b508515611597575b6007549361127d85612e63565b60075560405161128c81612b0c565b6004815260018060a01b038316602082015260018060a01b03821660408201525f606082015260016080820152855f52600860205260405f20815191600583101561059f5781546020820151610100600160a81b0360089190911b1660ff949094166001600160a81b03199091161792909217815561134f916003906080905b6001840160018060a01b036040830151166001600160601b0360a01b825416179055606081015160028501550151151591019060ff801983541691151516179055565b6113598583613e30565b6001600160a01b0361136b8684613fad565b1661157f576007549561137d87612e63565b60075560405161138c81612b0c565b6003815260018060a01b038316602082015260018060a01b038416604082015286606082015260016080820152875f52600860205260405f20815191600583101561059f5781546020820151610100600160a81b0360089190911b1660ff949094166001600160a81b0319909116179290921781556114109160039060809061130c565b61141a8783613e30565b6001600160a01b0361142c8884613fad565b1661157f57855f52600860205286600260405f2001556114af60405161145181612b0c565b8535815260046020820188358152604083015f815260608401908635825260808501925f84528c5f52600b60205260405f209551865551600186015551600285015551600384015551151591019060ff801983541691151516179055565b871561155c575b506010549060116020528160405f2055600160401b82101561107b57604097869588957faa45e66205470dd78318a0cf957a20ffda9a2871fc2b4cb33bc41bbf76566bfe956115298961151188600160a09a01601055612df8565b90919082549060031b91821b915f19901b1916179055565b8b515f196001881b0195861681529416602085015235838b0152356060830152156080820152a382519182526020820152f35b80355f5260126020528560405f2055855f5260136020523560405f2055876114b6565b6040516339e3563760e11b81525f6004820152602490fd5b84355f5260206008815260405f2060ff600382015416156116e8575460ff8116600581101561059f57611690576001600160a01b0383811660089290921c160361163f5785355f526012815260405f20546115f25750611270565b85906363726f7760e01b857f41546f6b656e3a20636f6c6c61746572616c20616c726561647920696e206573866040519462461bcd60e51b86526004860152602480860152840152820152fd5b8590661b185d195c985b60ca1b857f41546f6b656e3a206f626c69676f72206d757374206f776e2074686520636f6c866040519462461bcd60e51b8652600486015260276024860152840152820152fd5b60405162461bcd60e51b815260048101839052602d60248201527f41546f6b656e3a20636f6c6c61746572616c206d757374206265206120756e69818601526c1b185d195c985b08185cdcd95d609a1b818701528790fd5b60405162461bcd60e51b8152600481018390526024808201527f41546f6b656e3a20636f6c6c61746572616c20746f6b656e20697320696e616381860152637469766560e01b818701528790fd5b6117498335611744846133bb565b612e56565b116117545786611268565b50660554249206361760cc1b84927f41546f6b656e3a206f626c69676174696f6e20776f756c6420657863656564206040519362461bcd60e51b85526020600486015260276024860152840152820152fd5b50801515611263565b507241546f6b656e3a207a65726f2065706f63687360681b6040519162461bcd60e51b83526020600484015260136024840152820152fd5b507f41546f6b656e3a207a65726f207061796d656e7420616d6f756e7400000000006040519162461bcd60e51b835260206004840152601b6024840152820152fd5b507320aa37b5b2b71d103d32b9379037b13634b3b7b960611b6040519162461bcd60e51b83526020600484015260146024840152820152fd5b507420aa37b5b2b71d103d32b9379031b932b234ba37b960591b6040519162461bcd60e51b83526020600484015260156024840152820152fd5b34610467576020366003190112610467576004355f52600960205260a060405f2080549060018101549060ff600282015416600460038301549201549260405194855260208501521515604084015260608301526080820152f35b3461046757604036600319011261046757611910612a20565b50602435801515036104675760405162461bcd60e51b815260206004820152602760248201527f41546f6b656e3a20617070726f76616c732064697361626c6564202d2075736560448201526620436f6c6f6e7960c81b6064820152608490fd5b34610467576020366003190112610467576004355f526012602052602060405f2054604051908152f35b34610467575f366003190112610467576040515f9060018054908160011c9060018316928315611a83575b6020938484108114611a6f57838652908115611a4f57506001146119f5575b610a1084610a0481880382612b5d565b60015f9081529294507fb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf65b828410611a3c5750505081610a1093610a0492820101936119e5565b8054858501870152928501928101611a20565b60ff1916858501525050151560051b8201019150610a0481610a106119e5565b634e487b7160e01b5f52602260045260245ffd5b91607f16916119c6565b34610467576020366003190112610467576004355f52600a602052608060405f20805490600181015490600560018060a01b0360028301541691015491604051938452602084015260408301526060820152f35b34610467576020366003190112610467576001600160a01b03611b02612a20565b168015611b1f575f526003602052602060405f2054604051908152f35b6040516322718ad960e21b81525f6004820152602490fd5b34610467576020366003190112610467576020611b556004356136fe565b6040516001600160a01b039091168152f35b34610467575f366003190112610467576020600754604051908152f35b3461046757602036600319011261046757611baa60018060a01b03600654163314612b99565b6020611bb760043561306b565b6040519015158152f35b3461046757602036600319011261046757600435805f52600860205260405f2080549060ff821690600582101561059f5760e093611c03600460019414612f3c565b5f52600b60205260405f2090828060a01b03928391015416815460018301549060028401549260ff6004600387015496015416956040519760081c168752602087015260408601526060850152608084015260a0830152151560c0820152f35b3461046757602080600319360112610467576001600160a01b03611c85612a20565b165f52600c815260405f20906040518083838295549384815201905f52835f20925f5b85828210611cd357505050611cbf92500383612b5d565b610a106040519282849384528301906129c3565b8554845260019586019588955093019201611ca8565b3461046757602036600319011261046757611d0f60018060a01b03600654163314612b99565b60206105d6600435612f94565b3461046757604036600319011261046757600435611d38612a36565b6006546001600160a01b0390611d519082163314612b99565b825f526020906008825260405f2092611d7060ff600386015416612bdb565b60ff845416600581101561059f576004611d8a9114612f3c565b845f52600b835260405f20936004850180549560ff8716611e985760030154958615611e405760027fd0fa2de7f7d21d53843fbb0cb827be6fe5665338bcb0765f90a84b1c931cce4e97959360409795936001611e2a9460ff1916179055865f5260088652611e0284868a5f205460081c1689613738565b865f52601286525f88812055895f52601386525f888120550154611e25896134a6565b6134a6565b611e33876137eb565b84519384521690820152a2005b60405162461bcd60e51b815260048101879052602a60248201527f41546f6b656e3a20756e73656375726564202d206e6f20636f6c6c61746572616044820152696c20746f207365697a6560b01b6064820152608490fd5b60405162461bcd60e51b815260048101879052601960248201527f41546f6b656e3a20616c72656164792064656661756c746564000000000000006044820152606490fd5b3461046757602080600319360112610467576001600160a01b039081611f01612a20565b165f52600e815260405f205f808254915b82811061206d5750611f2381612d2c565b93611f316040519586612b5d565b818552611f3d82612d2c565b8582019390601f1901368537611f5b611f5584612d43565b93612d43565b945f90815b838310611fd05750505050604051958695606087019060608852518091526080870194915f905b828210611fb357888703858a01528880610a108a611fa58b8b6129c3565b9083820360408501526129c3565b835181168752899850958401959284019260019190910190611f87565b89611fe184849b9798999a9b612e41565b919054600392831b1c91825f52600890818a5260ff60405f20918201541615612060579161205193916001959354901c1661201c838a612f28565b52805f52600a90818a5260405f2054612035848d612f28565b525f5288528260405f20015461204b828d612f28565b52612e63565b925b0191979695949397611f60565b5050505091600190612053565b60ff61207d828697949596612e41565b9054600391821b1c5f526008845260405f200154166120a4575b6001019392919093611f12565b916120b0600191612e63565b929050612097565b34610467576020366003190112610467576004355f52600860205260405f20805460ff81169160018060a01b03908160018201541660ff60036002840154930154169260405194600587101561059f5760a096865260081c1660208501526040840152606083015215156080820152f35b34610467576020366003190112610467576004355f52600a602052606060405f20805490600181015490600260018060a01b03910154169060405192835260208301526040820152f35b346104675761218136612a8c565b5050505f60405161219181612b27565b52612e71565b34610467576121a536612a4c565b6006546001600160a01b039391906121c09085163314612b99565b815f52600860205260405f206121dc60ff600383015416612bdb565b549360ff8516600581101561059f576121f59015612edc565b825f52601260205260405f205461225f577ff3ece9284d33275d9c297a27c91c816d5543b99eb1a60525f3cee810ed720091916122498260209387169761223d891515612c70565b60081c16958686613738565b835f52600982528060405f2055604051908152a4005b60405162461bcd60e51b815260206004820152601a60248201527f41546f6b656e3a20746f6b656e20697320696e20657363726f770000000000006044820152606490fd5b34610467575f366003190112610467576006546040516001600160a01b039091168152602090f35b34610467576020366003190112610467576004355f526013602052602060405f2054604051908152f35b346104675761230436612a8c565b505050612e71565b34610467576020366003190112610467576004355f52600b60205260a060405f20805490600181015490600281015460ff60046003840154930154169260405194855260208501526040840152606083015215156080820152f35b3461046757604036600319011261046757612380612a20565b5060405162461bcd60e51b815260206004820152602760248201527f41546f6b656e3a20617070726f76616c732064697361626c6564202d2075736560448201526620436f6c6f6e7960c81b6064820152608490fd5b34610467576020366003190112610467576004356123f3816136fe565b505f526004602052602060018060a01b0360405f205416604051908152f35b346104675761242036612a76565b9061243660018060a01b03600654163314612b99565b5f91815f52602091600860205260405f209260ff60039461245c82600383015416612bdb565b5416600581101561059f576124746001809214612c1a565b825f52600a60205260405f2094600586019560038101836001600484019301945b6124a5575b60208a604051908152f35b88548254811080612529575b1561252357876124c18286612e41565b905490871b1c9b8c808954906124d691612e56565b89556124e191612e56565b9b604051908382528982015260407fa8244a340c825298b79cfc32334fed512284c91d293cc65ee0e37ba288687d1291a261251b90612e63565b895580612495565b5061249a565b50886125358285612e41565b905490871b1c11156124b1565b346104675761255036612a4c565b61256860018060a09594951b03600654163314612b99565b815f52600860205260405f209161258560ff600385015416612bdb565b825460ff8116600581101561059f5760016125a09114612c1a565b6125b46001600160a01b0386161515612c70565b60081c6001600160a01b03908116908516146127d657805f52600a60205260405f2093821515806127c8575b6125e990612cb5565b61262c60018060a01b03600287015416956002860154906001810161260f878254612d0b565b905561261c868254612d0b565b809155156127ba575b8683613592565b936040519561263a87612b27565b5f875260405161264981612b27565b5f81526040519761265989612af1565b868952602089019187835260408a019084825260608b0192835260808b01525f60a08b0152885f52600a60205260405f20928a518455516001840155600283019060018060a01b039051166001600160601b0360a01b825416179055600382019051908151916001600160401b03831161107b576020906126da8484612db8565b01905f5260205f205f5b8381106127a65750505050600481019760808101518051906001600160401b03821161107b57602090612717838d612db8565b01995f5260205f20995f905b82821061279257505050602098509261276d8860409481989794600560a07f6dfb44ecd6d25774bd51e42e44a046178b5ca77e149cd347083ca6bf286a04ee99015191015561369d565b5482516001600160a01b0392831681528981019790975260081c1694a4604051908152f35b80518c830155600190910190602001612723565b6001906020845194019381840155016126e4565b6127c3846134a6565b612625565b5060018501548311156125e0565b60405162461bcd60e51b815260206004820152601560248201527420aa37b5b2b71d1039b2b63316ba3930b739b332b960591b6044820152606490fd5b34610467575f366003190112610467576040515f905f5460018160011c90600183169283156128c3575b6020938484108114611a6f57838652908115611a4f575060011461286b57610a1084610a0481880382612b5d565b5f8080529294507f290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e5635b8284106128b05750505081610a1093610a0492820101936119e5565b8054858501870152928501928101612894565b91607f169161283d565b346104675760203660031901126104675760043563ffffffff60e01b8116809103610467576020906380ac58cd60e01b811490811561292a575b8115612919575b506040519015158152f35b6301ffc9a760e01b1490508261290e565b635b5e139f60e01b81149150612907565b34610467575f366003190112610467576010549081815260208082019260105f527f1b6847dc741a1b0cd08d278845f9d819d87b734759afb55fe2de5cb82a9ae672915f905b8282106129ac57610a108561299881890382612b5d565b6040519182916020835260208301906129c3565b835486529485019460019384019390910190612981565b9081518082526020808093019301915f5b8281106129e2575050505090565b8351855293810193928101926001016129d4565b602060409281835280519182918282860152018484015e5f828201840152601f01601f1916010190565b600435906001600160a01b038216820361046757565b602435906001600160a01b038216820361046757565b606090600319011261046757600435906024356001600160a01b0381168103610467579060443590565b6040906003190112610467576004359060243590565b6060906003190112610467576001600160a01b0390600435828116810361046757916024359081168103610467579060443590565b9181601f84011215610467578235916001600160401b038311610467576020808501948460051b01011161046757565b60c081019081106001600160401b0382111761107b57604052565b60a081019081106001600160401b0382111761107b57604052565b602081019081106001600160401b0382111761107b57604052565b604081019081106001600160401b0382111761107b57604052565b90601f801991011681019081106001600160401b0382111761107b57604052565b6001600160401b03811161107b57601f01601f191660200190565b15612ba057565b60405162461bcd60e51b815260206004820152601360248201527241546f6b656e3a206f6e6c7920436f6c6f6e7960681b6044820152606490fd5b15612be257565b60405162461bcd60e51b815260206004820152601060248201526f41546f6b656e3a20696e61637469766560801b6044820152606490fd5b15612c2157565b60405162461bcd60e51b815260206004820152602160248201527f41546f6b656e3a206e6f7420616e2065717569747920617373657420746f6b656044820152603760f91b6064820152608490fd5b15612c7757565b60405162461bcd60e51b815260206004820152601660248201527510551bdad95b8e881e995c9bc81c9958da5c1a595b9d60521b6044820152606490fd5b15612cbc57565b60405162461bcd60e51b815260206004820152602160248201527f41546f6b656e3a20696e73756666696369656e7420766573746564207374616b6044820152606560f81b6064820152608490fd5b91908203918211612d1857565b634e487b7160e01b5f52601160045260245ffd5b6001600160401b03811161107b5760051b60200190565b90612d4d82612d2c565b612d5a6040519182612b5d565b8281528092612d6b601f1991612d2c565b0190602036910137565b81810292918115918404141715612d1857565b8054905f815581612d97575050565b5f5260205f20908101905b818110612dad575050565b5f8155600101612da2565b90600160401b811161107b57815491818155828210612dd657505050565b5f5260205f2091820191015b818110612ded575050565b5f8155600101612de2565b601054811015612e2d5760105f527f1b6847dc741a1b0cd08d278845f9d819d87b734759afb55fe2de5cb82a9ae67201905f90565b634e487b7160e01b5f52603260045260245ffd5b8054821015612e2d575f5260205f2001905f90565b91908201809211612d1857565b5f198114612d185760010190565b60405162461bcd60e51b815260206004820152603960248201527f41546f6b656e3a2075736520436f6c6f6e792e7472616e73666572417373657460448201527f206f7220436f6c6f6e792e7472616e73666572457175697479000000000000006064820152608490fd5b15612ee357565b60405162461bcd60e51b815260206004820152601a60248201527f41546f6b656e3a206e6f7420616e20617373657420746f6b656e0000000000006044820152606490fd5b8051821015612e2d5760209160051b010190565b15612f4357565b60405162461bcd60e51b815260206004820152602360248201527f41546f6b656e3a206e6f7420616e206f626c69676174696f6e206c696162696c60448201526269747960e81b6064820152608490fd5b90815f52600860205260405f2091612fb260ff600385015416612bdb565b60ff835416600581101561059f576001612fcc9114612c1a565b805f52600a60205260405f2092835493612feb60018201548096612d0b565b94851561306257815561300060038201612d88565b61300c60048201612d88565b5f1960058201555415613054575b60018060a01b03905460081c16907f30b1e484d2ca7dc7dbe479de5ccedb0be1ee291551f3ffb6b3a635a8e0b314406020604051868152a3565b61305d826134a6565b61301a565b505f9450505050565b805f526020600881526040805f2061308960ff600383015416612bdb565b60ff815416600581101561059f5760046130a39114612f3c565b835f52600b8352815f2060ff6004820154166131de57600281018054916001810154928381101561318e578588926130fb7f906356bce80317bc059cb2958e7e6fe33866824109516f5c5fc466b348171ab193612e63565b8095555481519085825289820152a21461311757505050505f90565b61313d92600292855f5260138252805f20548061316f575b5050500154611e25836134a6565b613146816137eb565b7f22f92762dfcedccf1f7ea1669a43c1407c423106d379901d3187ba7d544de5905f80a2600190565b5f926013918452601281528383812055878452528120555f808061312f565b855162461bcd60e51b8152600481018890526024808201527f41546f6b656e3a206f626c69676174696f6e20616c726561647920636f6d706c604482015263195d195960e21b6064820152608490fd5b825162461bcd60e51b8152600481018590526024808201527f41546f6b656e3a206f626c69676174696f6e20616c72656164792064656661756044820152631b1d195960e21b6064820152608490fd5b90815491600160401b83101561107b578261151191600161325195018155612e41565b565b1561325a57565b60405162461bcd60e51b815260206004820152601360248201527220aa37b5b2b71d103d32b937903437b63232b960691b6044820152606490fd5b92916132a082612d2c565b916132ae6040519384612b5d565b829481845260208094019160051b810192831161046757905b8282106132d45750505050565b813581529083019083016132c7565b805f52600860205260ff60405f205416600581101561059f576133069015612edc565b5f52600960205260405f209060038201548015801561336c575b6133665761333661333b92600485015490612d0b565b612d75565b612710918282101561335f5754908203828111612d185761335b91612d75565b0490565b5050505f90565b50505490565b506004830154821115613320565b6040519061338782612b42565b600582526466616c736560d81b6020830152565b604051906133a882612b42565b60048252637472756560e01b6020830152565b6001600160a01b03165f908152600c6020908152604080832080549394939190855b8381106133eb575050505050565b6133f58183612e41565b9054600391821b1c805f5260088752845f209060ff91828085830154161591821561348e575b5050613483575f52600b8752845f2091820154159081613474575b5080613463575b61344d575b506001905b016133dd565b6001919761345c915490612e56565b9690613442565b50600281015460018201541161343d565b9050600482015416155f613436565b505050600190613447565b54169050600581101561059f5760041415825f61341b565b805f5260086020526040805f206003810180549060ff82161561358b57915460ff199091169091556001600160a01b03906134e790849060081c8316613d64565b825f526002602052815f205416825f821592831561355c575b828252600260205284822080546001600160a01b03191690557fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef8280a4613545575050565b602492505190637e27328960e01b82526004820152fd5b60046020528482206001600160601b0360a01b8154169055808252600360205284822082198154019055613500565b5050505050565b9291926007546135a181612e63565b60075580946040516135b281612b0c565b60018152602081019060018060a01b03958686169384845287604084019216825260608301908152608083019060018252865f52600860205260405f20935192600584101561059f57845495516001600160a81b031990961660ff9094169390931794891660081b610100600160a81b03169490941783556136669360039289600186019151166001600160601b0360a01b82541617905551600284015551151591019060ff801983541691151516179055565b6136708284613e30565b156136855761367e91613fad565b1661157f57565b604051633250574960e11b81525f6004820152602490fd5b60018060a01b031690815f52600f60205260405f20815f5260205260ff60405f205416156136c9575050565b81613251925f52600f60205260405f20825f5260205260405f20600160ff198254161790555f52600e60205260405f2061322e565b5f818152600260205260409020546001600160a01b0316908115613720575090565b60249060405190637e27328960e01b82526004820152fd5b916137438383613d64565b5f8381526008602081905260409091208054610100600160a81b0319169183901b610100600160a81b031691909117905561377e8382613e30565b6001600160a01b0390808216156136855761379a848392613fad565b1691826137ba57604051637e27328960e01b815260048101859052602490fd5b16918282036137c857505050565b60649350604051926364283d7b60e01b8452600484015260248301526044820152fd5b805f52601160205260405f2054601054905f1991828101908111612d185780820361385f575b5050601054801561384b570161383961382982612df8565b8154905f199060031b1b19169055565b6010555f5260116020525f6040812055565b634e487b7160e01b5f52603160045260245ffd5b61386890612df8565b90549060031b1c61387c8161151184612df8565b5f52601160205260405f20555f80613811565b60018060a01b039081811691825f52602091600c602052604092835f20905f918054925b83811061399c5750505050600754936138cb85612e63565b60075583516138d981612b0c565b6002815260208101908282528581015f8152606082015f8152608083019060018252895f526008602052885f20935192600584101561059f57845495516001600160a81b031990961660ff9094169390931794881660081b610100600160a81b031694909417835561394d936003926102cf565b6139578583613e30565b15613985578361396691613fad565b1661396f575090565b516339e3563760e11b81525f6004820152602490fd5b8251633250574960e11b81525f6004820152602490fd5b6139a68183612e41565b9054600391821b1c90815f5260089081865260ff90818b5f205416600581101561059f5760021492836139f0575b5050506139e457506001016138b3565b97505050505050505090565b90919250835f528652895f200154165f80806139d4565b600581101561059f578015613b0b5760018114613ae25760028114613ab55760038114613a8857600414613a5857604051613a4181612b42565b60078152662aa725a727aba760c91b602082015290565b604051613a6481612b42565b60148152734f424c49474154494f4e5f4c494142494c49545960601b602082015290565b50604051613a9581612b42565b601081526f13d0931251d0551253d397d054d4d15560821b602082015290565b50604051613ac281612b42565b601081526f4551554954595f4c494142494c49545960801b602082015290565b50604051613aef81612b42565b600c81526b11545552551657d054d4d15560a21b602082015290565b50604051613b1881612b42565b600a8152691553925310551154905360b21b602082015290565b8060405191606083018381106001600160401b0382111761107b57604052602a835260208084016040368237845115612e2d576030905383519060019160011015612e2d5790607860218601536029915b818311613bb457505050613b95575090565b6044906040519063e22e27eb60e01b8252600482015260146024820152fd5b909192600f81166010811015612e2d578651851015612e2d576f181899199a1a9b1b9c1cb0b131b232b360811b901a86850183015360041c928015612d18575f19019190613b83565b805f917a184f03e93ff9f4daa797ed6e38ed64bf6a1f01000000000000000080821015613d56575b506d04ee2d6d415b85acef810000000080831015613d47575b50662386f26fc1000080831015613d38575b506305f5e10080831015613d29575b5061271080831015613d1a575b506064821015613d0a575b600a80921015613d00575b6001908160216001860195613c9687612b7e565b96613ca46040519889612b5d565b808852613cb3601f1991612b7e565b01366020890137860101905b613ccb575b5050505090565b5f19019083906f181899199a1a9b1b9c1cb0b131b232b360811b8282061a835304918215613cfb57919082613cbf565b613cc4565b9160010191613c82565b9190606460029104910191613c77565b6004919392049101915f613c6c565b6008919392049101915f613c5f565b6010919392049101915f613c50565b6020919392049101915f613c3e565b60409350810491505f613c25565b6001600160a01b03165f818152600d60209081526040808320858452825280832054848452600c835292819020545f19959194919390868101908111612d1857808203613de5575b5050805f52600c8252835f20805495861561384b575f960190613dd26138298383612e41565b558452600d815282842091845252812055565b613df890835f52600c8552865f20612e41565b90549060031b1c825f52600c8452613e168161151184895f20612e41565b825f52600d8452855f20905f528352845f20555f80613dac565b906132519160018060a01b0316805f52600c60205260405f2054600d60205260405f20835f5260205260405f20555f52600c60205260405f2061322e565b805115613f9a578051916002808401809411612d1857600393849004600281901b91906001600160fe1b03811603612d185793604051937f4142434445464748494a4b4c4d4e4f505152535455565758595a616263646566601f52603f917f6768696a6b6c6d6e6f707172737475767778797a303132333435363738392b2f603f5260208601928291835184019160208301998a51945f8c525b848110613f5e57505050505090600391602095969752510680600114613f4957600214613f3c575b50808452830101604052565b603d905f1901535f613f30565b50603d90815f1982015360011901535f613f30565b836004919c95989c019b838d51818160121c165183538181600c1c16516001840153818160061c1651858401531651858201530196939a613f08565b50604051613fa781612b27565b5f815290565b5f828152600260205260409020546001600160a01b03908116929183614033575b168061401b575b815f52600260205260405f20816001600160601b0360a01b825416179055827fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef5f80a490565b805f52600360205260405f2060018154019055613fd5565b600460205260405f206001600160601b0360a01b8154169055835f52600360205260405f205f198154019055613fce56fea2646970667358221220f0a04382f57c0a33001c08afedcdc54fd73feff86b57ddf0ec76317b7ff4a6b764736f6c63430008190033"
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
    "bytecode": "0x608034606f57601f6109e238819003918201601f19168301916001600160401b03831184841017607357808492602094604052833981010312606f57516001600160a01b03811690819003606f575f80546001600160a01b03191691909117905560405161095a90816100888239f35b5f80fd5b634e487b7160e01b5f52604160045260245ffdfe608060409080825260049081361015610016575f80fd5b5f3560e01c908163050ff707146107b857508063078d4c2b14610666578063158905e8146104d8578063349ff770146104b15780633f0e5ada146103ad5780637a522e021461031657806390e2d2cc146102f8578063916b6c4b1461025b5763ebe71a5f14610083575f80fd5b3461025757816003193601126102575767ffffffffffffffff8135818111610257576100b29036908401610802565b929091602490602435908111610257576100cf9036908401610802565b95909160018060a01b0393845f54169783518099634d853ee560e01b8252818460209c8d935afa90811561024d576101139188915f91610220575b50163314610888565b8088036101dd575f5b88811061012557005b6101308183886108ec565b35670de0b6b3a764000090818102908082048314901517156101cb578861016061015b858e8e6108ec565b610910565b165f5260018c52865f205561017961015b838c8c6108ec565b61018483858a6108ec565b358281029281840414901517156101cb57907f5464440453fc39b658a9b561093845a38ca97029be9942ab109286c83ab820a28c8a600195948a519485521692a20161011c565b85601186634e487b7160e01b5f52525ffd5b835162461bcd60e51b81528083018a9052601b60248201527f4d434342696c6c696e673a206c656e677468206d69736d6174636800000000006044820152606490fd5b61024091508c8d3d10610246575b6102388183610833565b810190610869565b5f61010a565b503d61022e565b85513d5f823e3d90fd5b5f80fd5b5034610257575f366003190112610257575f548251634d853ee560e01b81526001600160a01b039290916020918391829086165afa9081156102ee576102ab93505f916102d55750163314610888565b5f6002557f90101c41c01c8c5597abff0f6dfac9deda2262990f3a32bca35cca06b3b9ec255f80a1005b610240915060203d602011610246576102388183610833565b83513d5f823e3d90fd5b8234610257575f366003190112610257576020906002549051908152f35b5034610257576020366003190112610257576103306107ec565b5f548351634d853ee560e01b8152926001600160a01b0392916020918591829086165afa80156103a35782610370915f9586916102d55750163314610888565b169182825260016020528120557fcb2977ef021a9b6164dd76c1a65eb5f89dc79216151911b46665d48b49d5434a5f80a2005b84513d5f823e3d90fd5b50346102575760208060031936011261025757813567ffffffffffffffff811161025757826103e0859236908301610802565b9390916103ec856108d4565b946103f985519687610833565b808652610405816108d4565b8684019490601f19013686375f5b82811061045a575050505082519384938285019183865251809252840192915f5b82811061044357505050500390f35b835185528695509381019392810192600101610434565b959694956001600160a01b0361047461015b8386866108ec565b165f5260018552875f2054865182101561049e57600582901b870186015294969594600101610413565b603285634e487b7160e01b5f525260245ffd5b8234610257575f366003190112610257575f5490516001600160a01b039091168152602090f35b5090346102575780600319360112610257576104f26107ec565b5f548251634d853ee560e01b81526001600160a01b0391821693602093602435939192858189818a5afa9081156103a3578387939261053a925f9161064f5750163314610888565b602484518094819363f3caad0360e01b83521698898b8301525afa908115610645575f9161060f575b50156105cd57670de0b6b3a7640000918281029281840414901517156105ba57837f5464440453fc39b658a9b561093845a38ca97029be9942ab109286c83ab820a29495505f526001835281815f205551908152a2005b601185634e487b7160e01b5f525260245ffd5b5162461bcd60e51b8152808501839052601960248201527f4d434342696c6c696e673a206e6f74206120636974697a656e000000000000006044820152606490fd5b90508381813d831161063e575b6106268183610833565b8101031261025757518015158103610257575f610563565b503d61061c565b82513d5f823e3d90fd5b6102409150853d8711610246576102388183610833565b50346102575760209081600319360112610257576106826107ec565b5f548451634d853ee560e01b81526001600160a01b039291859082908690829087165afa9081156107ae576106c29184915f916107975750163314610888565b1692835f5260018352805f2054918215610756576002549083820180921161074357506002555f84815260018452818120555190815282917f8d40b1e890ced9adf397d25a06046df796e132dd75cbfb5a21c868c2b4a4a75e91a27fcb2977ef021a9b6164dd76c1a65eb5f89dc79216151911b46665d48b49d5434a5f80a2005b601190634e487b7160e01b5f525260245ffd5b83606492519162461bcd60e51b8352820152601f60248201527f4d434342696c6c696e673a206e6f206f75747374616e64696e672062696c6c006044820152fd5b6102409150873d8911610246576102388183610833565b86513d5f823e3d90fd5b839034610257576020366003190112610257576020916001600160a01b036107de6107ec565b165f52600183525f20548152f35b600435906001600160a01b038216820361025757565b9181601f840112156102575782359167ffffffffffffffff8311610257576020808501948460051b01011161025757565b90601f8019910116810190811067ffffffffffffffff82111761085557604052565b634e487b7160e01b5f52604160045260245ffd5b9081602091031261025757516001600160a01b03811681036102575790565b1561088f57565b60405162461bcd60e51b815260206004820152601760248201527f4d434342696c6c696e673a206e6f7420666f756e6465720000000000000000006044820152606490fd5b67ffffffffffffffff81116108555760051b60200190565b91908110156108fc5760051b0190565b634e487b7160e01b5f52603260045260245ffd5b356001600160a01b0381168103610257579056fea2646970667358221220d2418e9324a4f5047d987b59be76ab25fca719a98aa14b25b263d5e2301a780c64736f6c63430008190033"
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
    "bytecode": "0x608034606f57601f6110b138819003918201601f19168301916001600160401b03831184841017607357808492602094604052833981010312606f57516001600160a01b03811690819003606f575f80546001600160a01b03191691909117905560405161102990816100888239f35b5f80fd5b634e487b7160e01b5f52604160045260245ffdfe60808060405260049081361015610014575f80fd5b5f3560e01c9081630623752614610bb957508063349ff77014610b925780633f9b49461461070b5780635d8e843a14610312578063754178511461013a57639b66b13914610060575f80fd5b34610136576020366003190112610136575f54604051634d853ee560e01b815282359290916001600160a01b0391602091849190829085165afa801561012b576100b4925f916100fc575b50163314610cc6565b6100c16001548210610e75565b60036100cc82610d58565b5001805460ff191690557f419a91c001167ea76233ed548fd1a02c21b5b63f8b6eaa7dd5747aac879148925f80a2005b61011e915060203d602011610124575b6101168183610c71565b810190610ca7565b5f6100ab565b503d61010c565b6040513d5f823e3d90fd5b5f80fd5b34610136575f36600319011261013657600180545f90815b8181106102dc575061016382610edc565b916101716040519384610c71565b80835261017d81610edc565b60208481019591601f190136873761019483610ef4565b916101a76101a185610ef4565b94610ef4565b945f805b82811061022557505050604051956080870190608088525180915260a0870197925f5b8281106102125750878061020e896102008a6101f28f8c8782036020890152610c01565b908582036040870152610c01565b908382036060850152610c01565b0390f35b84518a52988101989381019383016101ce565b928360ff600361023784989c97610d58565b5001541661024a575b01979392976101ab565b91808361025a6102d69388610f3d565b5261026d61026785610d58565b50610f51565b610277828a610f3d565b526102828189610f3d565b506102978361029086610d58565b5001610f51565b6102a1828b610f3d565b526102ac818a610f3d565b506102bb600261029086610d58565b6102c5828c610f3d565b526102d0818b610f3d565b50610eba565b91610240565b60ff60036102ec83969596610d58565b500154166102ff575b8201929192610152565b9261030a8391610eba565b9390506102f5565b50346101365760803660031901126101365780356024359167ffffffffffffffff92838111610136576103489036908301610bd3565b91604435858111610136576103609036908301610bd3565b9590606435828111610136576103799036908501610bd3565b97909360018060a01b0392835f5416604051948591634d853ee560e01b8352828560209889935afa801561012b576103ba925f916106f45750163314610cc6565b6001926103c984548b10610e75565b60ff60036103d68c610d58565b50015416156106b0576103e88a610d58565b50868a1161062c576104048a6103fe8354610da4565b83610ddc565b5f8a601f811160011461064a5780610430925f9161063f575b508160011b915f199060031b1c19161790565b90555b8361043d8b610d58565b50019186821161062c5761045b826104558554610da4565b85610ddc565b5f90601f83116001146105cc5761048992915f91836105c1575b50508160011b915f199060031b1c19161790565b90555b600261049789610d58565b50019389116105ae57506104af886104558554610da4565b5f91601f8911600114610524575050918691610505837f6e5513e8628895f1ea4671eaffcf4e0a879285edf1a0d5135d5f1c5b1148a4179899610514965f9161051957508160011b915f199060031b1c19161790565b90555b60405194859485610e4b565b0390a2005b90508401355f61041d565b9091601f198916845f52825f20925f905b828210610597575050916105149593918a7f6e5513e8628895f1ea4671eaffcf4e0a879285edf1a0d5135d5f1c5b1148a4179a9b96941061057e575b505083811b019055610508565b8401355f19600387901b60f8161c191690555f80610571565b808685968294968b01358155019501930190610535565b604190634e487b7160e01b5f525260245ffd5b013590505f80610475565b90859291601f19831691855f52885f20925f5b8a82821061061657505084116105fd575b505050811b01905561048c565b01355f19600384901b60f8161c191690555f80806105f0565b8385013586558a979095019492830192016105df565b604184634e487b7160e01b5f525260245ffd5b90508b01355f61041d565b50601f198b1690825f528b885f20928c8a8a5f925b84841061069757505050501061067e575b5050848a811b019055610433565b8a01355f1960038d901b60f8161c191690555f80610670565b860135875590950194938401938f9350018a8a8f61065f565b60405162461bcd60e51b8152808401869052601c60248201527f4d434353657276696365733a20736572766963652072656d6f766564000000006044820152606490fd5b61011e9150873d8911610124576101168183610c71565b50346101365760603660031901126101365767ffffffffffffffff81358181116101365761073c9036908401610bd3565b602492919235828111610136576107569036908601610bd3565b939092604435818111610136576107709036908801610bd3565b918760018060a01b036020815f541660405193848092634d853ee560e01b82525afa801561012b576107ab925f916100fc5750163314610cc6565b8415610b4e5760015495604051976080890189811084821117610b16576040526107e491906107db368989610d12565b8a523691610d12565b60208801526107f4368484610d12565b60408801526001606088015268010000000000000000861015610b3b576001860160015561082186610d58565b919091610b29578751805190828211610b1657610848826108428654610da4565b86610ddc565b602090601f8311600114610ab25761087692915f91836109835750508160011b915f199060031b1c19161790565b82555b600182016020890151805190838211610a9f5761089a826104558554610da4565b602090601f8311600114610a37576108c892915f91836109835750508160011b915f199060031b1c19161790565b90555b60408801518051918211610a2457602099506108f7826108ee6002860154610da4565b60028601610ddc565b8990601f831160011461098e5760037fddcfb03769e1dafa409f0203646fccd45573c7e7ee64130e14f26454b70eb97a989796946109548561097898968d9e966060965f926109835750508160011b915f199060031b1c19161790565b60028201555b01910151151560ff8019835416911617905560405194859485610e4b565b0390a2604051908152f35b015190505f80610475565b90601f19831691600285015f528b5f20925f5b818110610a0d5750946001858c9d956060956003956109789b997fddcfb03769e1dafa409f0203646fccd45573c7e7ee64130e14f26454b70eb97a9f9e9d9b106109f6575b505050811b01600282015561095a565b01515f1983871b60f8161c191690555f80806109e6565b92938d6001819287860151815501950193016109a1565b60418a634e487b7160e01b5f525260245ffd5b9190835f5260205f20905f935b601f1984168510610a84576001945083601f19811610610a6c575b505050811b0190556108cb565b01515f1960f88460031b161c191690555f8080610a5f565b81810151835560209485019460019093019290910190610a44565b60418c634e487b7160e01b5f525260245ffd5b90601f19831691855f5260205f20925f5b818110610afe5750908460019594939210610ae6575b505050811b018255610879565b01515f1960f88460031b161c191690555f8080610ad9565b92936020600181928786015181550195019301610ac3565b60418b634e487b7160e01b5f525260245ffd5b5f89634e487b7160e01b82525260245ffd5b604188634e487b7160e01b5f525260245ffd5b60405162461bcd60e51b81526020818a0152601a60248201527f4d434353657276696365733a206e616d652072657175697265640000000000006044820152606490fd5b34610136575f366003190112610136575f546040516001600160a01b039091168152602090f35b34610136575f366003190112610136576020906001548152f35b9181601f840112156101365782359167ffffffffffffffff8311610136576020838186019501011161013657565b908082519081815260208091019281808460051b8301019501935f915b848310610c2e5750505050505090565b909192939495848080600193601f1980878303018852601f838d518051918291828752018686015e5f858286010152011601019801930193019194939290610c1e565b90601f8019910116810190811067ffffffffffffffff821117610c9357604052565b634e487b7160e01b5f52604160045260245ffd5b9081602091031261013657516001600160a01b03811681036101365790565b15610ccd57565b60405162461bcd60e51b815260206004820152601f60248201527f4d434353657276696365733a206e6f7420636f6c6f6e7920666f756e646572006044820152606490fd5b92919267ffffffffffffffff8211610c935760405191610d3c601f8201601f191660200184610c71565b829481845281830111610136578281602093845f960137010152565b600154811015610d905760015f5260021b7fb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf601905f90565b634e487b7160e01b5f52603260045260245ffd5b90600182811c92168015610dd2575b6020831014610dbe57565b634e487b7160e01b5f52602260045260245ffd5b91607f1691610db3565b601f8211610de957505050565b5f5260205f20906020601f840160051c83019310610e21575b601f0160051c01905b818110610e16575050565b5f8155600101610e0b565b9091508190610e02565b908060209392818452848401375f828201840152601f01601f1916010190565b9290610e6490610e729593604086526040860191610e2b565b926020818503910152610e2b565b90565b15610e7c57565b60405162461bcd60e51b81526020600482015260166024820152751350d0d4d95c9d9a58d95cce881b9bdd08199bdd5b9960521b6044820152606490fd5b5f198114610ec85760010190565b634e487b7160e01b5f52601160045260245ffd5b67ffffffffffffffff8111610c935760051b60200190565b90610efe82610edc565b610f0b6040519182610c71565b8281528092610f1c601f1991610edc565b01905f5b828110610f2c57505050565b806060602080938501015201610f20565b8051821015610d905760209160051b010190565b9060405191825f8254610f6381610da4565b908184526020946001916001811690815f14610fd15750600114610f93575b505050610f9192500383610c71565b565b5f90815285812095935091905b818310610fb9575050610f9193508201015f8080610f82565b85548884018501529485019487945091830191610fa0565b92505050610f9194925060ff191682840152151560051b8201015f8080610f8256fea264697066735822122068d7c5445d6d91a17960506c2145e93ca6980b35b9abd7a49663711387c212c064736f6c63430008190033"
  }
};
