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
        "inputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
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
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
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
    "bytecode": "0x6080604090808252346104bc576124f9803803809161001e82856104c0565b833981019082818303126104bc5780516001600160401b0391908281116104bc578361004b9183016104e3565b90602093848201518481116104bc5761006492016104e3565b90845193825161009d602b878487019380858784015e81016a20476f7665726e616e636560a81b8682015203600b8101895201876104c0565b6100cf87519461472d60f01b848701528560229384925180918484015e81015f838201520360028101875201856104c0565b8551938585116102fa575f54946001978887811c971680156104b2575b858810146103dd578190601f97888111610464575b508590888311600114610405575f926103fa575b50505f19600383901b1c191690881b175f555b8051908682116102fa5787548881811c911680156103f0575b858210146103dd5790818784931161038f575b508490878311600114610330575f92610325575b50505f19600383901b1c191690871b1786555b331561030e5760068054336001600160a01b0319821681179092556001600160a01b03167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e05f80a38560075582519485116102fa57600854908682811c921680156102f0575b838310146102de575083811161029a575b508092841160011461023657509282939183925f9461022b575b50501b915f199060031b1c1916176008555b51611fc090816105398239f35b015192505f8061020c565b919083601f19811660085f52845f20945f905b888383106102805750505010610268575b505050811b0160085561021e565b01515f1960f88460031b161c191690555f808061025a565b858701518855909601959485019487935090810190610249565b60085f52815f208480870160051c8201928488106102d5575b0160051c019086905b8281106102ca5750506101f2565b5f81550186906102bc565b925081926102b3565b634e487b7160e01b5f5260045260245ffd5b91607f16916101e1565b634e487b7160e01b5f52604160045260245ffd5b8651631e4fbdf760e01b81525f6004820152602490fd5b015190505f80610168565b90899350601f19831691845f52865f20925f5b888282106103795750508411610361575b505050811b01865561017b565b01515f1960f88460031b161c191690555f8080610354565b8385015186558d97909501949384019301610343565b909150885f52845f208780850160051c8201928786106103d4575b918b91869594930160051c01915b8281106103c6575050610154565b5f81558594508b91016103b8565b925081926103aa565b83634e487b7160e01b5f5260045260245ffd5b90607f1690610141565b015190505f80610115565b908a9350601f198316915f8052875f20925f5b8982821061044e5750508411610436575b505050811b015f55610128565b01515f1960f88460031b161c191690555f8080610429565b8385015186558e97909501949384019301610418565b9091505f8052855f208880850160051c8201928886106104a9575b918c91869594930160051c01915b82811061049b575050610101565b5f81558594508c910161048d565b9250819261047f565b96607f16966100ec565b5f80fd5b601f909101601f19168101906001600160401b038211908210176102fa57604052565b81601f820112156104bc578051906001600160401b0382116102fa5760405192610517601f8401601f1916602001856104c0565b828452602083830101116104bc57815f9260208093018386015e830101529056fe608060409080825260049081361015610016575f80fd5b5f3560e01c90816301ffc9a7146115325750806306fdde0314611485578063081812fc1461144c578063095ea7b31461137057806323b872dd1461135957806342842e0e1461133157806342ec38e21461130557806353b1a411146112565780636352211e1461122657806370a08231146111d1578063715018a61461117657806375794a3c146111585780638da5cb5b1461113057806395d89b411461105c5780639f37e2fd14611034578063a22cb46514610f7c578063b88d4fde14610ef5578063c87b56dd14610514578063cf59e652146104d3578063d0def521146101ec578063e985e9c51461019e5763f2fde38b14610112575f80fd5b3461019a57602036600319011261019a5761012b6115c0565b90610134611bd6565b6001600160a01b03918216928315610184575050600654826001600160601b0360a01b821617600655167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e05f80a3005b905f6024925191631e4fbdf760e01b8352820152fd5b5f80fd5b823461019a578060031936011261019a576020906101ba6115c0565b6101c26115d6565b9060018060a01b038091165f5260058452825f2091165f52825260ff815f20541690519015158152f35b50903461019a578060031936011261019a576102066115c0565b90602480359367ffffffffffffffff9485811161019a573660238201121561019a578082013595861161019a573683878301011161019a57610246611bd6565b600754945f19918287146104c157600190818801600755875f5260209860098a5242885f2055600a8a528087895f20936102808554611621565b601f811161046c575b505f90601f84116001146103ff575f936103f2575b5050508582851b9260031b1c19161790555b6001600160a01b039182169182156103dd57875f526002895280875f20541661038f5790879291835f5260028a52875f20541690811515948561035e575b50825f5260038a52875f20908154019055825f5260028952865f20826001600160601b0360a01b8254161790557fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef5f80a461034b57505051908152f35b5f8351916339e3563760e11b8352820152fd5b5f85815260046020526040902080546001600160a01b0319169055825f5260038b52885f209081540190555f6102ee565b865162461bcd60e51b81528086018a90526023818801527f47546f6b656e3a20736f756c626f756e642c206e6f6e2d7472616e7366657261604482015262626c6560e81b6064820152608490fd5b8651633250574960e11b81525f818701528690fd5b0101359050875f8061029e565b90869450918d92601f198516875f52845f20945f905b82821061044d5750508511610433575b50505050811b0190556102b0565b8960f88660031b161c19920101351690555f808981610425565b858401909401358655899795909501948d939283019290810190610415565b91509150835f528b5f20601f840160051c8101918d85106104b7575b9186859492601f8d950160051c01915b8281106104a6575050610289565b5f81558695508c9450889101610498565b9091508190610488565b84601185634e487b7160e01b5f52525ffd5b50903461019a57602036600319011261019a5761051091355f52600a6020526104fd815f206116c7565b905191829160208352602083019061159c565b0390f35b50903461019a576020918260031936011261019a5780355f81815260028552839020549091906001600160a01b031615610eb257508291828083816105598196611c02565b855161058c6021828580820195602360f81b87528051918291018484015e81015f838201520360018101845201826116a5565b835f52600a835261059e875f206116c7565b9384511515805f14610e99578489610b2a81517f3c7465787420783d223230302220793d223330342220666f6e742d66616d696c848201527f793d226d6f6e6f73706163652220666f6e742d73697a653d223136222066696c838201527f6c3d22236666666666662220746578742d616e63686f723d226d6964646c65226060820152601f60f91b608082015261065e608882868d805191829101608184015e8101661e17ba32bc3a1f60c91b60818201520360688101845201826116a5565b945b8415610e7357610b256101f9845161067781611689565b600381526206666760eb1b87820152975b85517f3c73766720786d6c6e733d22687474703a2f2f7777772e77332e6f72672f3230888201527f30302f737667222077696474683d2234303022206865696768743d2234303022818801527f2076696577426f783d223020302034303020343030223e00000000000000000060608201527f3c726563742077696474683d2234303022206865696768743d2234303022206660778201526e34b6361e911198309830983091179f60891b60978201527f3c7265637420783d2232302220793d223230222077696474683d22333630222060a68201527f6865696768743d22333630222066696c6c3d226e6f6e6522207374726f6b653d60c68201527f222342383836304222207374726f6b652d77696474683d2231222072783d223860e68201526211179f60e91b6101068201527f3c7465787420783d223230302220793d2237362220666f6e742d66616d696c796101098201527f3d226d6f6e6f73706163652220666f6e742d73697a653d223133222066696c6c6101298201527f3d22234238383630422220746578742d616e63686f723d226d6964646c652220610149820152723632ba3a32b916b9b830b1b4b7339e911a111f60691b6101698201529889917f2220666f6e742d66616d696c793d226d6f6e6f73706163652220666f6e742d738961087b61017c8601611b10565b9281661e17ba32bc3a1f60c91b948581527f3c7465787420783d223230302220793d223233322220666f6e742d66616d696c60078201527f793d226d6f6e6f73706163652220666f6e742d73697a653d223134302220666960278201527f6c6c3d22234238383630422220746578742d616e63686f723d226d6964646c6560478201527f22206f7061636974793d22302e3038223e473c2f746578743e0000000000000060678201527f3c7465787420783d223230302220793d223236382220666f6e742d66616d696c60808201527f793d226d6f6e6f73706163652220666f6e742d73697a653d223131222066696c60a08201527f6c3d22233535352220746578742d616e63686f723d226d6964646c6522206c6560c08201527f747465722d73706163696e673d2233223e474f5645524e414e434520544f4b4560e082015267271e17ba32bc3a1f60c11b610100820152610108928051928391018483015e701e3a32bc3a103c1e9119181811103c9e9160791b91019182015284516101199590928391018683015e01928301527f697a653d223338222066696c6c3d22234238383630422220746578742d616e636101398301526c3437b91e9136b4b2323632911f60991b6101598301528b5161016692818f8583015e01918201527f3c7465787420783d223230302220793d223336382220666f6e742d66616d696c61016d8201527f793d226d6f6e6f73706163652220666f6e742d73697a653d223130222066696c61018d8201527f6c3d22233333332220746578742d616e63686f723d226d6964646c6522206c656101ad8201527f747465722d73706163696e673d2235223e53504943452050524f544f434f4c3c6101cd8201526517ba32bc3a1f60d11b6101ed820152651e17b9bb339f60d11b6101f3820152036101d98101895201876116a5565b611cd0565b928015610e5f5781517f2c7b2274726169745f74797065223a22436974697a656e222c2276616c75652284820152611d1160f11b818401528951610b91906044908390808e8901604284015e810161227d60f01b60428201520360248101845201826116a5565b935b82517f5b7b2274726169745f74797065223a22436f6c6f6e79222c2276616c7565223a8d820152601160f91b818501529b8c91859190610bd560418501611b10565b62089f4b60ea1b81527f7b2274726169745f74797065223a22546f6b656e204944222c2276616c7565226003820152611d1160f11b60238201528151929091839101602583015e0161227d60f01b96876025830152805192839101602783015e0160278101605d60f81b905203600881018c52602801610c55908c6116a5565b5f149b610e159a610d24604f6105109f603d9d610dcc9d610dc79c60539c610cbd94610e24575050610cb790610ca960248a519483869451918291018c86015e830163010615b960e51b8b82015201611b10565b03601f1981018352826116a5565b98611e37565b9451683d913730b6b2911d1160b91b8c8201528851909b8c9982910160298b015e880161088b60f21b60298201527f226465736372697074696f6e223a22476f7665726e616e636520746f6b656e20602b8201526303337b9160e51b604b82015201611b10565b7f2e20536f756c626f756e642c206e6f6e2d7472616e7366657261626c652e222c81526c1130ba3a3934b13aba32b9911d60991b838201528151929091839101602d83015e0190600b60fa1b602d8301527f22696d616765223a22646174613a696d6167652f7376672b786d6c3b62617365602e830152620d8d0b60ea1b604e830152805192839101605183015e019060518201520360338101845201826116a5565b611e37565b83519687917f646174613a6170706c69636174696f6e2f6a736f6e3b6261736536342c000000828401528051918291018484015e81015f8382015203601d8101875201856116a5565b5192828493845283019061159c565b6028919350610cb7925089519384916702396aa37b5b2b7160c51b8b8401525180918484015e81015f838201520360088101845201826116a5565b8151610e6a81611659565b5f815293610b93565b610b256101f98451610e8481611689565b600381526206662760eb1b8782015297610688565b8489610b2a8151610ea981611659565b5f815294610660565b825162461bcd60e51b8152908101849052601960248201527f47546f6b656e3a206e6f6e6578697374656e7420746f6b656e000000000000006044820152606490fd5b50903461019a57608036600319011261019a57610f106115c0565b610f186115d6565b6064359367ffffffffffffffff851161019a573660238601121561019a57840135610f4e610f4582611769565b945194856116a5565b808452366024828701011161019a576020815f926024610f7a98018388013785010152604435916119c2565b005b50903461019a578060031936011261019a57610f966115c0565b906024359182151580930361019a57331561101e576001600160a01b03169283156110095750335f526005602052805f20835f52602052805f2060ff1981541660ff8416179055519081527f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c3160203392a3005b836024925191630b61174360e31b8352820152fd5b815163a9fbf51f60e01b81525f81860152602490fd5b50903461019a57602036600319011261019a57602091355f5260098252805f20549051908152f35b823461019a575f36600319011261019a578051905f90826001926001549361108385611621565b90818452602095866001821691825f1461110e5750506001146110b3575b50506105109291610e159103856116a5565b9085925060015f527fb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf6915f925b8284106110f65750505082010181610e156110a1565b8054848a0186015288955087949093019281016110e0565b60ff19168682015292151560051b85019092019250839150610e1590506110a1565b823461019a575f36600319011261019a5760065490516001600160a01b039091168152602090f35b823461019a575f36600319011261019a576020906007549051908152f35b3461019a575f36600319011261019a5761118e611bd6565b600680546001600160a01b031981169091555f906001600160a01b03167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e08280a3005b50903461019a57602036600319011261019a576001600160a01b036111f46115c0565b16801561121057602092505f5260038252805f20549051908152f35b81516322718ad960e21b81525f81850152602490fd5b50903461019a57602036600319011261019a5761124560209235611b9c565b90516001600160a01b039091168152f35b823461019a575f36600319011261019a5780516008549091825f61127984611621565b808352602094600190866001821691825f1461110e5750506001146112aa5750506105109291610e159103856116a5565b9085925060085f527ff3f7a9fe364faab93b216da50a3214154f22a0a2b415b23a84c8169e8b636ee3915f925b8284106112ed5750505082010181610e156110a1565b8054848a0186015288955087949093019281016112d7565b823461019a57602036600319011261019a5760209061132a6113256115c0565b61197d565b9051908152f35b823461019a57610f7a90611344366115ec565b9192519261135184611659565b5f84526119c2565b3461019a57610f7a61136a366115ec565b91611785565b50903461019a578060031936011261019a5761138a6115c0565b9160243561139781611b9c565b33151580611439575b80611412575b6113fc576001600160a01b039485169482918691167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b9255f80a45f526020525f20906001600160601b0360a01b8254161790555f80f35b835163a9fbf51f60e01b81523381850152602490fd5b5060018060a01b0381165f526005602052835f20335f5260205260ff845f205416156113a6565b506001600160a01b0381163314156113a0565b50903461019a57602036600319011261019a57816020923561146d81611b9c565b505f52825260018060a01b03815f2054169051908152f35b823461019a575f36600319011261019a578051905f90825f54926114a884611621565b808352602094600190866001821691825f1461110e5750506001146114d95750506105109291610e159103856116a5565b5f80805286935091907f290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e5635b82841061151a5750505082010181610e156110a1565b8054848a018601528895508794909301928101611504565b823461019a57602036600319011261019a57359063ffffffff60e01b821680920361019a576020916380ac58cd60e01b811490811561158b575b811561157a575b5015158152f35b6301ffc9a760e01b14905083611573565b635b5e139f60e01b8114915061156c565b805180835260209291819084018484015e5f828201840152601f01601f1916010190565b600435906001600160a01b038216820361019a57565b602435906001600160a01b038216820361019a57565b606090600319011261019a576001600160a01b0390600435828116810361019a5791602435908116810361019a579060443590565b90600182811c9216801561164f575b602083101461163b57565b634e487b7160e01b5f52602260045260245ffd5b91607f1691611630565b6020810190811067ffffffffffffffff82111761167557604052565b634e487b7160e01b5f52604160045260245ffd5b6040810190811067ffffffffffffffff82111761167557604052565b90601f8019910116810190811067ffffffffffffffff82111761167557604052565b9060405191825f82546116d981611621565b908184526020946001916001811690815f146117475750600114611709575b505050611707925003836116a5565b565b5f90815285812095935091905b81831061172f57505061170793508201015f80806116f8565b85548884018501529485019487945091830191611716565b9250505061170794925060ff191682840152151560051b8201015f80806116f8565b67ffffffffffffffff811161167557601f01601f191660200190565b6001600160a01b03918216929091831561196557815f526020926002845260409482865f205416611915578390815f526002865283875f2054169533151580611883575b5060029087611852575b825f5260038152885f2060018154019055835f5252865f20816001600160601b0360a01b825416179055857fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef5f80a416928383036118315750505050565b6064945051926364283d7b60e01b8452600484015260248301526044820152fd5b5f84815260046020526040812080546001600160a01b03191690558881526003825289902080545f190190556117d3565b91925090806118d4575b1561189b579084915f6117c9565b8685876118b8576024915190637e27328960e01b82526004820152fd5b604491519063177e802f60e01b82523360048301526024820152fd5b5033861480156118f9575b8061188d5750845f52600481523384885f2054161461188d565b50855f5260058152865f20335f52815260ff875f2054166118df565b855162461bcd60e51b815260048101869052602360248201527f47546f6b656e3a20736f756c626f756e642c206e6f6e2d7472616e7366657261604482015262626c6560e81b6064820152608490fd5b604051633250574960e11b81525f6004820152602490fd5b600754600191825b82811061199457505050505f90565b5f818152600260205260409020546001600160a01b038381169116146119bb578301611985565b9250505090565b91926119cf848385611785565b813b6119dc575b50505050565b604051630a85bd0160e11b8082523360048301526001600160a01b03948516602483015260448201959095526080606482015260209593909216939190859082908190611a2d90608483019061159c565b03815f885af15f9181611ad0575b50611a9a575050503d5f14611a92573d91611a5583611769565b92611a6360405194856116a5565b83523d5f8285013e5b82519283611a8d57604051633250574960e11b815260048101849052602490fd5b019050fd5b606091611a6c565b9193506001600160e01b031990911603611ab857505f8080806119d6565b60249060405190633250574960e11b82526004820152fd5b9091508581813d8311611b09575b611ae881836116a5565b8101031261019a57516001600160e01b03198116810361019a57905f611a3b565b503d611ade565b6008545f9291611b1f82611621565b91600190818116908115611b895750600114611b3a57505050565b909192935060085f527ff3f7a9fe364faab93b216da50a3214154f22a0a2b415b23a84c8169e8b636ee3905f915b848310611b76575050500190565b8181602092548587015201920191611b68565b60ff191683525050811515909102019150565b5f818152600260205260409020546001600160a01b0316908115611bbe575090565b60249060405190637e27328960e01b82526004820152fd5b6006546001600160a01b03163303611bea57565b60405163118cdaa760e01b8152336004820152602490fd5b611c0b90611cd0565b80516004811015611ccc579081600360209314611c9757600214611c62576023611c5f916040519384916203030360ec1b828401528051918291018484015e81015f838201520360038101845201826116a5565b90565b6022611c5f9160405193849161030360f41b828401528051918291018484015e81015f838201520360028101845201826116a5565b506021611c5f91604051938491600360fc1b828401528051918291018484015e81015f838201520360018101845201826116a5565b5090565b805f917a184f03e93ff9f4daa797ed6e38ed64bf6a1f01000000000000000080821015611e29575b506d04ee2d6d415b85acef810000000080831015611e1a575b50662386f26fc1000080831015611e0b575b506305f5e10080831015611dfc575b5061271080831015611ded575b506064821015611ddd575b600a80921015611dd3575b6001908160216001860195611d6987611769565b96611d7760405198896116a5565b808852611d86601f1991611769565b01366020890137860101905b611d9e575b5050505090565b5f19019083906f181899199a1a9b1b9c1cb0b131b232b360811b8282061a835304918215611dce57919082611d92565b611d97565b9160010191611d55565b9190606460029104910191611d4a565b6004919392049101915f611d3f565b6008919392049101915f611d32565b6010919392049101915f611d23565b6020919392049101915f611d11565b60409350810491505f611cf8565b805115611f77578051916002808401809411611f6357600393849004600281901b91906001600160fe1b03811603611f635793604051937f4142434445464748494a4b4c4d4e4f505152535455565758595a616263646566601f52603f917f6768696a6b6c6d6e6f707172737475767778797a303132333435363738392b2f603f5260208601928291835184019160208301998a51945f8c525b848110611f2757505050505090600391602095969752510680600114611f1257600214611f05575b50808452830101604052565b603d905f1901535f611ef9565b50603d90815f1982015360011901535f611ef9565b836004919c95989c019b838d51818160121c165183538181600c1c16516001840153818160061c1651858401531651858201530196939a611ed1565b634e487b7160e01b5f52601160045260245ffd5b50604051611f8481611659565b5f81529056fea2646970667358221220638611c569f2c08e73e7198fe745b769250eb43dd738c5ba647d6acb17c00c9564736f6c63430008190033"
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
            "internalType": "address",
            "name": "authority",
            "type": "address"
          }
        ],
        "name": "ElectionAuthoritySet",
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
        "inputs": [],
        "name": "electionAuthority",
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
        "name": "electionHandOver",
        "outputs": [],
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
            "internalType": "address",
            "name": "authority",
            "type": "address"
          }
        ],
        "name": "setElectionAuthority",
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
    "bytecode": "0x6080604090808252346103ea57612440803803809161001e8285610402565b833981019180828403126103ea5781516001600160401b0393908481116103ea578301601f938285830112156103ea578151956020928188116103ee57601f199286519861007286868b840116018b610402565b808a52858a01968682850101116103ea5785815f92828096018a5e8b01015201516001600160a01b039788821697918890036103ea5786519586915180918784015e810163204f726760e01b8682015203926024946100da866004968781018a520188610402565b875191888301838110868211176103d8578952600683526527aa27a5a2a760d11b8284015287518581116103d8575f54986001998a81811c911680156103ce575b858210146103bc5790818784931161036e575b508490878311600114610313575f92610308575b50505f19600383901b1c191690891b175f555b82519485116102f65787548881811c911680156102ec575b838210146102da57908185879695949311610286575b50819385116001146102275750505f9261021c575b50505f19600383901b1c191690841b1783555b3315610209575050600680546001600160a01b031980821633908117909355935195167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e05f80a3600955600754161760075561201a90816104268239f35b5f845191631e4fbdf760e01b8352820152fd5b015190505f80610198565b88959392919316855f52835f20935f905b82821061026d5750508411610255575b505050811b0183556101ab565b01515f1960f88460031b161c191690555f8080610248565b8484015186558a97909501949384019390810190610238565b909192939450885f52825f208580880160051c8201928589106102d1575b9188978c9297969594930160051c01915b8281106102c3575050610183565b5f81558897508b91016102b5565b925081926102a4565b87602288634e487b7160e01b5f52525ffd5b90607f169061016d565b86604187634e487b7160e01b5f52525ffd5b015190505f80610142565b90848c9416915f8052865f20925f5b888282106103585750508411610340575b505050811b015f55610155565b01515f1960f88460031b161c191690555f8080610333565b8385015186558f97909501949384019301610322565b9091505f8052845f208780850160051c8201928786106103b3575b918d91869594930160051c01915b8281106103a557505061012e565b5f81558594508d9101610397565b92508192610389565b8960228a634e487b7160e01b5f52525ffd5b90607f169061011b565b87604188634e487b7160e01b5f52525ffd5b5f80fd5b634e487b7160e01b5f52604160045260245ffd5b601f909101601f19168101906001600160401b038211908210176103ee5760405256fe6080604081815260049182361015610015575f80fd5b5f3560e01c90816301ffc9a7146115d15750806306fdde0314611524578063081812fc146114ec578063095ea7b31461141157806323b872dd146113fb578063349ff770146113d357806342842e0e146113af5780634f5c2e6c1461134e5780635a3f2672146112435780636352211e146112145780636a4b888314610f5857806370a0823114610f2c578063715018a614610ed157806375794a3c14610eb35780638da5cb5b14610e8b57806395d89b4114610da8578063a22cb46514610cf1578063a3af1d0014610c8b578063b7ec32f214610c66578063b88d4fde14610c0c578063c87b56dd146102f9578063dc46d6ea146102d1578063e985e9c514610283578063f2fde38b146101f95763f5fed02c14610132575f80fd5b346101f557806003193601126101f55781359161014d611675565b9061015784611b13565b6001600160a01b03939033908516036101b257505061017d61017882611b79565b611951565b610188838233611c0e565b169033907fa0c7406958e58553b8e9b22cc5e955794f16be349e4b33c18839c53b76e230ae5f80a4005b906020606492519162461bcd60e51b8352820152601e60248201527f4f546f6b656e3a206e6f74207468652063757272656e7420686f6c64657200006044820152fd5b5f80fd5b5090346101f55760203660031901126101f55761021461165f565b9061021d611b4d565b6001600160a01b0391821692831561026d575050600654826001600160601b0360a01b821617600655167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e05f80a3005b905f6024925191631e4fbdf760e01b8352820152fd5b50346101f557806003193601126101f55760209061029f61165f565b6102a7611675565b9060018060a01b038091165f5260058452825f2091165f52825260ff815f20541690519015158152f35b50346101f5575f3660031901126101f55760085490516001600160a01b039091168152602090f35b50346101f557602090816003193601126101f55782355f81815260028452829020549093906001600160a01b031615610bcb57835f52600a93600a8452825f2091835190610346826116f8565b61034f84611782565b8252600193600260ff6001830154169161036c898601938461190f565b015486840152805182811015610bb85761038590611c94565b90519782891015610bb85761039a8899611d40565b5f95909381907a184f03e93ff9f4daa797ed6e38ed64bf6a1f0100000000000000008281811015610bab575b50508a6d04ee2d6d415b85acef810000000080841015610b9d575b5050662386f26fc1000080831015610b8e575b506305f5e10080831015610b7c575b5090600a9161271080831015610b70575b50506064811015610b62575b1015610b58575b908689959493928998602161045660018b0161044e61044582611845565b9d519d8e611760565b808d52611845565b8b8a019a90601f1901368c378b0101905b610b0f575b505050508651809585820197602360f81b8952518091602184015e8101602181015f9052036001810186526021016104a49086611760565b825187517f3c73766720786d6c6e733d22687474703a2f2f7777772e77332e6f72672f3230818701527f30302f737667222077696474683d2234303022206865696768743d2234303022818a01527f2076696577426f783d223020302034303020343030223e00000000000000000060608201527f3c726563742077696474683d2234303022206865696768743d2234303022206660778201526e34b6361e911198309830983091179f60891b60978201527f3c7265637420783d2232302220793d223230222077696474683d22333630222060a68201527f6865696768743d22333630222066696c6c3d226e6f6e6522207374726f6b653d60c6820152601160f91b60e68201528351909486929091869190868501908590808360e787015e7f22207374726f6b652d77696474683d2231222072783d2238222f3e000000000060e7918601918201527f3c7465787420783d223230302220793d2237362220666f6e742d66616d696c796101028201527f3d226d6f6e6f73706163652220666f6e742d73697a653d223133222066696c6c610122820152611e9160f11b61014282015288516101449181858483015e7f2220746578742d616e63686f723d226d6964646c6522206c65747465722d73709101918201526930b1b4b7339e911a111f60b11b610164820152835161016e9490928391018583015e01661e17ba32bc3a1f60c91b809382015261017581017f3c7465787420783d223230302220793d223233322220666f6e742d66616d696c905261019581017f793d226d6f6e6f73706163652220666f6e742d73697a653d223134302220666990526336361e9160e11b6101b58201526101b9975180928983015e7f2220746578742d616e63686f723d226d6964646c6522206f7061636974793d229101968701526d1817181c111f279e17ba32bc3a1f60911b6101d98701527f3c7465787420783d223230302220793d223236382220666f6e742d66616d696c6101e78701527f793d226d6f6e6f73706163652220666f6e742d73697a653d223131222066696c6102078701527f6c3d22233535352220746578742d616e63686f723d226d6964646c6522206c65610227870152703a3a32b916b9b830b1b4b7339e9119911f60791b61024787015284518486019661025892918291818a8683015e01928301527f3c7465787420783d223230302220793d223331382220666f6e742d66616d696c61025f8301527f793d226d6f6e6f73706163652220666f6e742d73697a653d223338222066696c61027f8301527f6c3d22236666666666662220746578742d616e63686f723d226d6964646c652261029f830152601f60f91b6102bf83015289516102c092818d8583015e01918201527f3c7465787420783d223230302220793d223336382220666f6e742d66616d696c6102c78201527f793d226d6f6e6f73706163652220666f6e742d73697a653d223130222066696c6102e78201527f6c3d22233333332220746578742d616e63686f723d226d6964646c6522206c65610307820152703a3a32b916b9b830b1b4b7339e911a911f60791b6103278201527429a824a1a290282927aa27a1a7a61e17ba32bc3a1f60591b610338820152651e17b9bb339f60d11b61034d8201520361033381018652610965906103530186611760565b519361097090611ea5565b9388519788977003d913730b6b2911d112796aa37b5b2b71607d1b848a015251809160318a015e61088b60f21b6031918901918201527f226465736372697074696f6e223a224f7267616e69736174696f6e20746f6b65603382015265037103337b9160d51b60538201528151929091839101605983015e01906059820161040560f31b9052518092605b83015e0190605b82017f292e20526f6c652d7472616e7366657261626c65206265747765656e20636f6c90526e1bdb9e4818da5d1a5e995b9ccb888b608a1b607b830152608a82017f22696d616765223a22646174613a696d6167652f7376672b786d6c3b62617365905260aa8201620d8d0b60ea1b905280519283910160ad83015e0161227d60f01b60ad82015203608f8101825260af01610a9e9082611760565b610aa790611ea5565b81517f646174613a6170706c69636174696f6e2f6a736f6e3b6261736536342c00000085820152815190948592829101603d84015e8101603d81015f905203601d81018452603d01610af99084611760565b519181839283528201610b0b9161163b565b0390f35b8394959697505f939192931901916f181899199a1a9b1b9c1cb0b131b232b360811b8282061a835304918a8315610b4f575090918a969594939282610467565b9695949361046c565b9460010194610427565b606460029104970196610420565b98019790045f80610414565b6008989098019790910490600a610403565b6010919892049101965f6103f4565b980197909104908a5f6103e1565b8b99500491505f806103c6565b602183634e487b7160e01b5f525260245ffd5b82606492519162461bcd60e51b8352820152601960248201527f4f546f6b656e3a206e6f6e6578697374656e7420746f6b656e000000000000006044820152fd5b82346101f55760803660031901126101f557610c2661165f565b50610c2f611675565b506064359067ffffffffffffffff82116101f557366023830112156101f557816024610c6093369301359101611861565b50611897565b50346101f5573660031901126101f557610c8990610c82611675565b90356119a8565b005b346101f55760203660031901126101f557610ca461165f565b610cac611b4d565b600880546001600160a01b0319166001600160a01b039290921691821790557ff1d7894561083c1c8e466c5483a5422c85fe9c07a940e661661e2c3b7ff9d4a75f80a2005b50346101f557806003193601126101f557610d0a61165f565b90602435918215158093036101f5573315610d92576001600160a01b0316928315610d7d5750335f526005602052805f20835f52602052805f2060ff1981541660ff8416179055519081527f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c3160203392a3005b836024925191630b61174360e31b8352820152fd5b815163a9fbf51f60e01b81525f81860152602490fd5b50346101f5575f3660031901126101f5578051905f908260019260015493610dcf856116c0565b90818452602095866001821691825f14610e69575050600114610e0e575b5050610b0b9291610dff910385611760565b5192828493845283019061163b565b9085925060015f527fb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf6915f925b828410610e515750505082010181610dff610ded565b8054848a018601528895508794909301928101610e3b565b60ff19168682015292151560051b85019092019250839150610dff9050610ded565b50346101f5575f3660031901126101f55760065490516001600160a01b039091168152602090f35b50346101f5575f3660031901126101f5576020906009549051908152f35b346101f5575f3660031901126101f557610ee9611b4d565b600680546001600160a01b031981169091555f906001600160a01b03167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e08280a3005b50346101f55760203660031901126101f557602090610f51610f4c61165f565b61191b565b9051908152f35b5090346101f55760603660031901126101f557610f7361165f565b67ffffffffffffffff92906024358481116101f557366023820112156101f557808401358581116101f557602482019160248236920101116101f55760443591858310156101f557610fc3611b4d565b60095495610fd0876118ed565b6009558551610fde816116f8565b610fe9368585611861565b8152602098898201610ffb878261190f565b888301914283528a5f52600a8c52895f2093518051918211611201578c829161102487546116c0565b601f81116111a9575b5081601f841160011461114557505f9261113a575b50508160011b915f199060031b1c19161783555b6001830190518481101561112757815460ff191660ff9190911617905551600291909101556001600160a01b03858116958615611111578861109791611dee565b166110fb575060608693837f2cbf284c18a6cdd96884fd3721698452ac1750ae851c33c95fd5b8c04cfaca95946110d394895195868095611824565b898c850152818a850152848401375f828201840152601f01601f19168101030190a351908152f35b6024905f8751916339e3563760e11b8352820152fd5b8751633250574960e11b81525f81850152602490fd5b602185634e487b7160e01b5f525260245ffd5b015190505f80611042565b5f8881528181209450601f198616915b828210611191575050908460019594939210611179575b505050811b018355611056565b01515f1960f88460031b161c191690555f808061116c565b80600186978294978701518155019601940190611155565b909250865f52815f2090601f850160051c82019285106111f7575b918f9291601f8695930160051c01905b8181106111e1575061102d565b90925060019193505f815501918e9184936111d4565b90915081906111c4565b604186634e487b7160e01b5f525260245ffd5b50346101f55760203660031901126101f55761123260209235611b13565b90516001600160a01b039091168152f35b50346101f557602091826003193601126101f5579161126061165f565b9061126a8261191b565b61128b611276826118d5565b9161128386519384611760565b8083526118d5565b8183019590601f19013687376009546001945f906001600160a01b0390811690875b8481106112ee575050505050508351938285019183865251809252840194915f5b8281106112db5785870386f35b83518752958101959281019284016112ce565b9788819b995f999899526002885283838c5f20541614611315575b019997999695966112ad565b9050611320846118ed565b93885181101561133b579080888d9360051b8b010152611309565b603287634e487b7160e01b5f525260245ffd5b50346101f55760203660031901126101f55761139d91355f52600a602052805f2061137881611782565b91600260ff600184015416920154906113a8815195869560608752606087019061163b565b936020860190611824565b8301520390f35b50346101f5575f906113c03661168b565b505050516113cd81611728565b52611897565b50346101f5575f3660031901126101f55760075490516001600160a01b039091168152602090f35b346101f5576114093661168b565b505050611897565b50346101f557806003193601126101f55761142a61165f565b9160243561143781611b13565b331515806114d9575b806114b2575b61149c576001600160a01b039485169482918691167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b9255f80a45f526020525f20906001600160601b0360a01b8254161790555f80f35b835163a9fbf51f60e01b81523381850152602490fd5b5060018060a01b0381165f526005602052835f20335f5260205260ff845f20541615611446565b506001600160a01b038116331415611440565b50346101f55760203660031901126101f557816020923561150c81611b13565b505f52825260018060a01b03815f2054169051908152f35b50346101f5575f3660031901126101f5578051905f90825f5492611547846116c0565b808352602094600190866001821691825f14610e69575050600114611578575050610b0b9291610dff910385611760565b5f80805286935091907f290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e5635b8284106115b95750505082010181610dff610ded565b8054848a0186015288955087949093019281016115a3565b83346101f55760203660031901126101f557359063ffffffff60e01b82168092036101f5576020916380ac58cd60e01b811490811561162a575b8115611619575b5015158152f35b6301ffc9a760e01b14905083611612565b635b5e139f60e01b8114915061160b565b805180835260209291819084018484015e5f828201840152601f01601f1916010190565b600435906001600160a01b03821682036101f557565b602435906001600160a01b03821682036101f557565b60609060031901126101f5576001600160a01b039060043582811681036101f5579160243590811681036101f5579060443590565b90600182811c921680156116ee575b60208310146116da57565b634e487b7160e01b5f52602260045260245ffd5b91607f16916116cf565b6060810190811067ffffffffffffffff82111761171457604052565b634e487b7160e01b5f52604160045260245ffd5b6020810190811067ffffffffffffffff82111761171457604052565b6040810190811067ffffffffffffffff82111761171457604052565b90601f8019910116810190811067ffffffffffffffff82111761171457604052565b9060405191825f8254611794816116c0565b908184526020946001916001811690815f1461180257506001146117c4575b5050506117c292500383611760565b565b5f90815285812095935091905b8183106117ea5750506117c293508201015f80806117b3565b855488840185015294850194879450918301916117d1565b925050506117c294925060ff191682840152151560051b8201015f80806117b3565b9060048210156118315752565b634e487b7160e01b5f52602160045260245ffd5b67ffffffffffffffff811161171457601f01601f191660200190565b92919261186d82611845565b9161187b6040519384611760565b8294818452818301116101f5578281602093845f960137010152565b60405162461bcd60e51b81526020600482015260166024820152754f546f6b656e3a207573652068616e644f766572282960501b6044820152606490fd5b67ffffffffffffffff81116117145760051b60200190565b5f1981146118fb5760010190565b634e487b7160e01b5f52601160045260245ffd5b60048210156118315752565b6001600160a01b03168015611939575f52600360205260405f205490565b6040516322718ad960e21b81525f6004820152602490fd5b1561195857565b60405162461bcd60e51b815260206004820152602260248201527f4f546f6b656e3a20726563697069656e74206973206e6f74206120636974697a60448201526132b760f11b6064820152608490fd5b6008546001600160a01b03929190831633819003611ace5715611a8957805f52600a60205260ff600160405f20015416600481101561183157600103611a44576119f461017883611b79565b6119fd81611b13565b9183811693831692848414611a3d57611a17918391611c0e565b7fa0c7406958e58553b8e9b22cc5e955794f16be349e4b33c18839c53b76e230ae5f80a4565b5050505050565b60405162461bcd60e51b815260206004820152601860248201527f4f546f6b656e3a206f6e6c79204d4343204f2d746f6b656e00000000000000006044820152606490fd5b60405162461bcd60e51b815260206004820152601960248201527f4f546f6b656e3a20617574686f72697479206e6f7420736574000000000000006044820152606490fd5b60405162461bcd60e51b815260206004820152601e60248201527f4f546f6b656e3a206e6f7420656c656374696f6e20617574686f7269747900006044820152606490fd5b5f818152600260205260409020546001600160a01b0316908115611b35575090565b60249060405190637e27328960e01b82526004820152fd5b6006546001600160a01b03163303611b6157565b60405163118cdaa760e01b8152336004820152602490fd5b60075460405163f3caad0360e01b602082019081526001600160a01b0393841660248084019190915282525f9384931691611bb3816116f8565b51915afa3d15611c07573d611bc781611845565b90611bd56040519283611760565b81523d5f602083013e5b81611be8575090565b90506020818051810103126101f5576020015180151581036101f55790565b6060611bdf565b906001600160a01b039081811615611c7c57611c2b848392611dee565b169182611c4b57604051637e27328960e01b815260048101859052602490fd5b1691828203611c5957505050565b60649350604051926364283d7b60e01b8452600484015260248301526044820152fd5b604051633250574960e11b81525f6004820152602490fd5b60048110156118315760018114611d205760028114611cf857600314611cd757604051611cc081611744565b6007815266434f4d50414e5960c81b602082015290565b604051611ce381611744565b6005815264434956494360d81b602082015290565b50604051611d0581611744565b600b81526a434f4f504552415449564560a81b602082015290565b50604051611d2d81611744565b60038152624d434360e81b602082015290565b60048110156118315760018114611dca5760028114611da657600314611d8357604051611d6c81611744565b600781526611a11c1c1b182160c91b602082015290565b604051611d8f81611744565b60078152661199b11c19331b60c91b602082015290565b50604051611db381611744565b60078152662331366133346160c81b602082015290565b50604051611dd781611744565b6007815266119c311ab1b31b60c91b602082015290565b5f828152600260205260409020546001600160a01b03908116929183611e74575b1680611e5c575b815f52600260205260405f20816001600160601b0360a01b825416179055827fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef5f80a490565b805f52600360205260405f2060018154019055611e16565b600460205260405f206001600160601b0360a01b8154169055835f52600360205260405f205f198154019055611e0f565b805115611fd15780519160028084018094116118fb57600393849004600281901b91906001600160fe1b038116036118fb5793604051937f4142434445464748494a4b4c4d4e4f505152535455565758595a616263646566601f52603f917f6768696a6b6c6d6e6f707172737475767778797a303132333435363738392b2f603f5260208601928291835184019160208301998a51945f8c525b848110611f9557505050505090600391602095969752510680600114611f8057600214611f73575b50808452830101604052565b603d905f1901535f611f67565b50603d90815f1982015360011901535f611f67565b836004919c95989c019b838d51818160121c165183538181600c1c16516001840153818160061c1651858401531651858201530196939a611f3f565b50604051611fde81611728565b5f81529056fea2646970667358221220e43334deeca0ec87b7fd0050c8402a7b471ca5f1dd1314fa6a9f8f87a379ff7764736f6c63430008190033"
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
            "name": "declaredValueV",
            "type": "uint256"
          }
        ],
        "name": "LandClaimed",
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
            "internalType": "uint256",
            "name": "epochs",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "totalV",
            "type": "uint256"
          }
        ],
        "name": "LandFeePaid",
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
            "name": "priceV",
            "type": "uint256"
          }
        ],
        "name": "LandForcePurchased",
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
            "internalType": "uint256",
            "name": "newValueV",
            "type": "uint256"
          }
        ],
        "name": "LandValueUpdated",
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
        "inputs": [
          {
            "internalType": "string",
            "name": "label",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "declaredValueV",
            "type": "uint256"
          }
        ],
        "name": "claimLand",
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
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "name": "dateOfBirth",
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
        "name": "enableElectionHandover",
        "outputs": [],
        "stateMutability": "nonpayable",
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
            "name": "newDeclaredValueV",
            "type": "uint256"
          }
        ],
        "name": "forcePurchaseLand",
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
        "inputs": [],
        "name": "governance",
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
        "name": "issueObligationGov",
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
          },
          {
            "internalType": "uint256",
            "name": "dob",
            "type": "uint256"
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
            "name": "",
            "type": "address"
          }
        ],
        "name": "joinedAt",
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
        "inputs": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          }
        ],
        "name": "payLandStewardship",
        "outputs": [],
        "stateMutability": "nonpayable",
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
            "internalType": "string",
            "name": "label",
            "type": "string"
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
            "internalType": "address",
            "name": "_governance",
            "type": "address"
          }
        ],
        "name": "setGovernance",
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
        "inputs": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "newDeclaredValueV",
            "type": "uint256"
          }
        ],
        "name": "updateLandValue",
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
            "indexed": true,
            "internalType": "uint256",
            "name": "assetId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "string",
            "name": "label",
            "type": "string"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "valueSTokens",
            "type": "uint256"
          }
        ],
        "name": "AssetRegisteredByCompany",
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
        "name": "AssetTransferredByCompany",
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
            "name": "oldName",
            "type": "string"
          },
          {
            "indexed": false,
            "internalType": "string",
            "name": "newName",
            "type": "string"
          }
        ],
        "name": "NameChanged",
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
            "name": "label",
            "type": "string"
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
            "internalType": "string",
            "name": "newName",
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
    "bytecode": "0x6080806040523460b4577ff0c57e16840df040f15088dc2f81fe391c3923bec73e23a9662efc9c229c6a009081549060ff8260401c1660a557506001600160401b036002600160401b0319828216016061575b604051612e0390816100b98239f35b6001600160401b031990911681179091556040519081527fc7f505b2f371ae2175ee4913f4499e1f2633a7b5936321eed1cdaeb6115181d290602090a15f80806052565b63f92ee8a960e01b8152600490fd5b5f80fdfe6080806040526004361015610012575f80fd5b5f905f3560e01c90816306fdde03146125775750806307ad30d3146124cb578063127be12b146123845780631aab9a9f146122ac57806325f6157114611cd457806332b6530414611b51578063349ff77014611b2a57806334c46b7014611b015780633956cdfe14611a405780634a4bdb301461193e5780635495d2aa146119155780635ecce1ab146114e957806361eb01ab1461138e5780637bb7c0d8146110615780637ec0f93114610f1b57806385fa33eb14610b0657806386d4d1ee14610923578063908921fc146108fa578063ab18e8ef14610791578063b81d7a411461071a578063c47f002714610498578063c7a8620114610471578063cbeee469146103f4578063e4c0f55f146102f75763ef2f92ad14610131575f80fd5b346102f4576020806003193601126102f057816004359160018060a01b0361015e816002541633146127ae565b80835416604051635060f8af60e11b81528381600481855afa80156102a757839186916102b2575b50606090602460405180948193632331088960e11b83528b6004840152165afa80156102a75784936101c2928792610273575b50163014612af7565b6024604051809581936335ee811960e01b83528860048401525af18015610268578490610217575b7f7416ef90f517a6ef1ab261803ebc4e673f73751bc82fc6556cd4298dd103794b9250604051908152a280f35b508082813d8311610261575b61022d81836126d1565b8101031261025d577f7416ef90f517a6ef1ab261803ebc4e673f73751bc82fc6556cd4298dd103794b91516101ea565b5f80fd5b503d610223565b6040513d86823e3d90fd5b61029691925060603d6060116102a0575b61028e81836126d1565b810190612aa7565b915050905f6101b9565b503d610284565b6040513d87823e3d90fd5b809250858092503d83116102e9575b6102cb81836126d1565b810103126102e55760606102df849261289c565b90610186565b8480fd5b503d6102c1565b5080fd5b80fd5b50346102f457806003193601126102f45780546040516326ec6a6760e21b8152602092916001600160a01b03919084908290600490829086165afa9081156103e95790849184916103af575b506024604051809481936370a0823160e01b8352306004840152165afa9182156103a35791610376575b50604051908152f35b90508181813d831161039c575b61038d81836126d1565b8101031261025d57515f61036d565b503d610383565b604051903d90823e3d90fd5b82819392503d83116103e2575b6103c681836126d1565b810103126103de576103d8849161289c565b5f610343565b8280fd5b503d6103bc565b6040513d85823e3d90fd5b50346102f457806003193601126102f45780546040516327af7c4b60e21b8152602092916001600160a01b03919084908290600490829086165afa9081156103e95790849184916103af57506024604051809481936370a0823160e01b8352306004840152165afa9182156103a357916103765750604051908152f35b50346102f45760203660031901126102f4576020610490600435612bcb565b604051908152f35b50346102f457602090816003193601126102f4576001600160401b036004358181116103de576104cc9036906004016126f2565b906104e260018060a01b036002541633146127ae565b81156106df576040519260408452849060019485549261050184612657565b8060408401526060888616805f146106bb57600114610671575b5050908061055283827f6c20b91d1723b78732eba64ff11ebd7966a6e4af568a00fa4f6b72c20f58b02a95038c840152888861287c565b0390a1831161065d5761056490612657565b601f811161060f575b508394601f83116001146105a857509383948293949261059d575b50505f19600383901b1c191690821b17905580f35b013590505f80610588565b601f198316955f80516020612dae833981519152929186905b8882106105f857505083859697106105df575b505050811b01905580f35b01355f19600384901b60f8161c191690555f80806105d4565b8087849682949587013581550195019201906105c1565b5f80516020612dae833981519152601f840160051c810191878510610653575b601f0160051c019084905b82811061064857505061056d565b86815501849061063a565b909150819061062f565b634e487b7160e01b85526041600452602485fd5b888a528992508a895f80516020612dae8339815191525b8486106106a4575050505090820160600190508161055261051b565b805487870185015291909401938c918b9101610688565b505060ff19851660608085019190915290151560051b83010190508161055261051b565b60405162461bcd60e51b8152600481018690526013602482015272436f6d70616e793a20656d707479206e616d6560681b6044820152606490fd5b50346102f45760203660031901126102f457610734612735565b6002546001600160a01b038082169261074e3385146127ae565b16809261075c8215156127f3565b7fca4de081ad2eb92babef22ea663c56c9b11b18bbdfee317b404312827094e7c28580a36001600160a01b0319161760025580f35b50346102f4576003196040368201126102f0576107ac612735565b9060243560018060a01b0380936107c8826002541633146127ae565b169283156108bc576040906107de831515612b4f565b8554168151906107ed826126b6565b86825261083c87845193610800856126b6565b81855261084b865198899687958694635ac1bb6b60e11b86523060048701528d60248701528b604487015260a0606487015260a486019061274b565b9184830301608485015261274b565b03925af1908115610268577fc7b81c180e9478202e3cb472ff09b52b057ec79827ad7af3e4708d0728cb93af92604092610890575b508151908152846020820152a280f35b6108af90833d85116108b5575b6108a781836126d1565b810190612b91565b50610880565b503d61089d565b60405162461bcd60e51b815260206004820152601660248201527521b7b6b830b73c9d103d32b9379034b73b32b9ba37b960511b6044820152606490fd5b50346102f457806003193601126102f4576003546040516001600160a01b039091168152602090f35b50346102f4576003196080368201126102f05761093e612735565b602435604435916001600160401b0392838111610b025761096390369060040161277e565b93606435908111610afe5761097c90369060040161277e565b9460018060a01b038094610995826002541633146127ae565b16968715610ac2576109a8861515612b4f565b8115610a655787610a038a926109f4996040988554169689519b8c998a988997635ac1bb6b60e11b89523060048a015260248901528d604489015260a0606489015260a4880191612ba7565b92858403016084860152612ba7565b03925af1908115610268577fc7b81c180e9478202e3cb472ff09b52b057ec79827ad7af3e4708d0728cb93af92604092610a49575b50815190815260016020820152a280f35b610a5f90833d85116108b5576108a781836126d1565b50610a38565b60405162461bcd60e51b815260206004820152602f60248201527f436f6d70616e793a207573652069737375654f70656e53686172657320666f7260448201526e081a5b5b59591a585d19481d995cdd608a1b6064820152608490fd5b60405162461bcd60e51b815260206004820152601460248201527321b7b6b830b73c9d103d32b937903437b63232b960611b6044820152606490fd5b8680fd5b8580fd5b50346102f4576020806003193601126102f057600254600435916001600160a01b0391821633148015610f0e575b15610eca578215610e8d57818454166040516326ec6a6760e21b81528281600481855afa908115610d9057849184918891610e56575b506024604051809481936370a0823160e01b8352306004840152165afa8015610d905785918791610e25575b5010610de057604051635060f8af60e11b815290858383600481855afa8015610dd35785938291610d9b575b506024604051809581936329e7dd5760e11b8352306004840152165afa918215610d905786908793610d68575b508051948515610d235787885b878110610d045750610c0f811515612a2a565b885b878110610c4b57897fae52e650e0d7846103a034e23a81f401f776de50bb5bb37a4c8900daa5e0f5b760408b8b8b8351928352820152a180f35b610c5581876129e1565b5115610cfc5789610c7983610c74610c6d858b6129e1565b518d612ac6565b612ad9565b80610c8b575b50506001905b01610c11565b84610c9684886129e1565b5116873b156103de576040516329e0afa360e11b81526001600160a01b0391909116600482015260248101919091528181604481838b5af18015610cf15715610c7f57610ce29061268f565b610ced57895f610c7f565b8980fd5b6040513d84823e3d90fd5b600190610c85565b90610d1c600191610d1584896129e1565b5190612a09565b9101610bfc565b60405162461bcd60e51b815260048101869052601a60248201527f436f6d70616e793a206e6f2065717569747920686f6c646572730000000000006044820152606490fd5b9050610d879192503d8088833e610d7f81836126d1565b810190612928565b5091905f610bef565b6040513d88823e3d90fd5b809450858092503d8311610dcc575b610db481836126d1565b810103126102f457610dc6859361289c565b5f610bc2565b503d610daa565b50604051903d90823e3d90fd5b60405162461bcd60e51b815260048101839052601f60248201527f436f6d70616e793a20696e73756666696369656e7420562062616c616e6365006044820152606490fd5b809250848092503d8311610e4f575b610e3e81836126d1565b8101031261025d578490515f610b96565b503d610e34565b92505081813d8311610e86575b610e6d81836126d1565b81010312610b025782610e80859261289c565b5f610b6a565b503d610e63565b6064906040519062461bcd60e51b82526004820152601660248201527510dbdb5c185b9e4e881e995c9bc8191a5d9a59195b9960521b6044820152fd5b6064906040519062461bcd60e51b82526004820152601c60248201527f436f6d70616e793a206e6f7420736563726574617279206f72204644000000006044820152fd5b5081600454163314610b34565b50346102f457806003193601126102f4578054604051635060f8af60e11b81526020916001600160a01b039190849084908390600490829087165afa8015610dd35783928291611029575b506024604051809481936329e7dd5760e11b8352306004840152165afa92831561026857849285928695611005575b509392919060405195869560608701906060885285518092528360808901960192905b828210610fe857888703858a01528880610fe48a610fd68b8b61274b565b90838203604085015261274b565b0390f35b835181168752899850958401959284019260019190910190610fb8565b919350935061101e91503d8086833e610d7f81836126d1565b91929091935f610f95565b809350858092503d831161105a575b61104281836126d1565b810103126102f457611054839261289c565b5f610f66565b503d611038565b50346102f45760603660031901126102f45761107b612735565b6001600160401b0360243581811161138a5761109b9036906004016126f2565b6001600160a01b03939192604435858116929083900361025d577ff0c57e16840df040f15088dc2f81fe391c3923bec73e23a9662efc9c229c6a009485549660ff8860401c16159584891698891580611383575b6001809b149081611379575b159081611370575b5061135e5767ffffffffffffffff1981168a1789558761133f575b50169283156113035784156112be576bffffffffffffffffffffffff60a01b93848a541617895582116112aa5781906111578854612657565b601f811161124e575b508890601f83116001146111e55789926111da575b50505f19600383901b1c191690861b1785555b6002541617600255611198578280f35b805468ff0000000000000000191690556040519081527fc7f505b2f371ae2175ee4913f4499e1f2633a7b5936321eed1cdaeb6115181d290602090a15f808280f35b013590505f80611175565b888a528893505f80516020612dae83398151915291601f1984168b5b8181106112365750841161121d575b505050811b018555611188565b01355f19600384901b60f8161c191690555f8080611210565b8284013585558b969094019360209283019201611201565b9091508789525f80516020612dae833981519152601f840160051c810191602085106112a0575b84939291601f8b920160051c01915b828110611292575050611160565b8b81558594508a9101611284565b9091508190611275565b634e487b7160e01b88526041600452602488fd5b60405162461bcd60e51b815260206004820152601760248201527f436f6d70616e793a207a65726f207365637265746172790000000000000000006044820152606490fd5b60405162461bcd60e51b8152602060048201526014602482015273436f6d70616e793a207a65726f20636f6c6f6e7960601b6044820152606490fd5b68ffffffffffffffffff1916680100000000000000011788555f61111e565b60405163f92ee8a960e01b8152600490fd5b9050155f611103565b303b1591506110fb565b50876110ef565b8380fd5b50346102f45760a03660031901126102f4576004356001600160401b0381116102f0576113bf9036906004016126f2565b9190602435926064359384151580950361138a576002546001600160a01b03906113ec90821633146127ae565b845416604051958680926361eb01ab60e01b825260a0600483015261141560a48301878961287c565b92856024840152604435604484015260648301526084356084830152818860209a8b9503925af19485156103a35794611496575b50917fb1958ea10b6ab0ff968ac84f89a1898965280f488c6d3c2ebb22b04c67303f3d91849361148660405193849360408552604085019161287c565b90878301520390a2604051908152f35b919350918482813d83116114e2575b6114af81836126d1565b8101031261025d5790519290917fb1958ea10b6ab0ff968ac84f89a1898965280f488c6d3c2ebb22b04c67303f3d611449565b503d6114a5565b50346102f45760603660031901126102f45760043560248035604480359260018060a01b039161151e836002541633146127ae565b83156118de5784156118a557828754169160405193635060f8af60e11b85526020948581600481885afa80156117805782918b9161186d575b501690604051633295655360e21b815289600482015286818581865afa80156117c55782918c91611835575b50169182156117f25760608a8560405180948193632331088960e11b835260048301525afa80156117c5576115c3918c916117d0575b5082163014612af7565b6040516327af7c4b60e21b81528681600481895afa80156117c55787918c9161178b575b5084604051809481936370a0823160e01b8352306004840152165afa80156117805788918b9161174f575b501061170c579083929189943b156102e5576040519063f49bb76b60e01b825260048201528782820152606083820152600d60648201526c7368617265206275796261636b60981b6084820152848160a48183885af19081156102a75785916116f8575b5050823b1561138a578391869183604051958694859363dde77f2b60e01b85528d60048601528401525af18015610cf1576116e0575b5050907f8220ea01ac83f8dfa3fa03efff145f0df6bc0ef871c35871d0fbe480bda4c331926040928351928352820152a280f35b6116ec9093929361268f565b6102e55790845f6116ac565b6117019061268f565b61138a57835f611676565b60405162461bcd60e51b815260048101869052601f818401527f436f6d70616e793a20696e73756666696369656e7420532062616c616e63650081850152606490fd5b809250878092503d8311611779575b61176881836126d1565b8101031261025d578790515f611612565b503d61175e565b6040513d8c823e3d90fd5b82819392503d83116117be575b6117a281836126d1565b810103126117ba576117b4879161289c565b5f6115e7565b8a80fd5b503d611798565b6040513d8d823e3d90fd5b6117e9915060603d6060116102a05761028e81836126d1565b9150505f6115b9565b60405162461bcd60e51b815260048101889052601c818601527f436f6d70616e793a20746f6b656e20686173206e6f20686f6c6465720000000081870152606490fd5b809250888092503d8311611866575b61184e81836126d1565b810103126117ba57611860829161289c565b5f611583565b503d611844565b809250878092503d831161189e575b61188681836126d1565b81010312610ced57611898829161289c565b5f611557565b503d61187c565b9072436f6d70616e793a207a65726f20707269636560681b60649260136040519362461bcd60e51b855260206004860152840152820152fd5b9070436f6d70616e793a207a65726f2062707360781b60649260116040519362461bcd60e51b855260206004860152840152820152fd5b50346102f457806003193601126102f4576002546040516001600160a01b039091168152602090f35b50346102f45760603660031901126102f457611958612735565b6024356044356001600160401b03811161138a5761197a9036906004016126f2565b90918460018060a01b03611993816002541633146127ae565b8082541695863b156103de57829060405192839163f49bb76b60e01b83521697886004830152856024830152606060448301528183816119d7606482018b8d61287c565b03925af18015610cf157611a2c575b5050611a267f5ce0614a46459714585c219d6fb0dd3a4b01b81fc18567ebe68bf418067c91d493604051938493845260406020850152604084019161287c565b0390a280f35b611a359061268f565b6102e557845f6119e6565b50346102f45760603660031901126102f457600435611a5d61271f565b906044358360018060a01b03611a78816002541633146127ae565b8082541694853b156103de578291606483926040519485938492631cab66ff60e11b84528a600485015216998a60248401528860448401525af18015610cf157611aed575b505060207f7a1ea5307be28906e1f27ea7a286272929b5363ccbf587601c52a64aa6bcc8dc91604051908152a380f35b611af69061268f565b61138a57835f611abd565b50346102f457806003193601126102f4576004546040516001600160a01b039091168152602090f35b50346102f457806003193601126102f457546040516001600160a01b039091168152602090f35b50346102f45760203660031901126102f4576004356001600160401b0381116102f057611b829036906004016126f2565b90611b9860018060a01b036002541633146127ae565b611ba3368383612837565b602081519101207fdc0d7a095c4e917ecbeb7deda7c942ff9744013d419e37549215a413915e421d81145f14611c245750600380546001600160a01b03191690557f19e076775dff378e27d48707938b116febc2aa73335d72ab7a5d709ee429a664915b611c1e60405192839260208452602084019161287c565b0390a180f35b7ffc742e123dab805d8342d9b1c2004b5c07fc27d27e8e2866f0275a3e65a7b7b303611c8157600480546001600160a01b03191690557f19e076775dff378e27d48707938b116febc2aa73335d72ab7a5d709ee429a66491611c07565b60405162461bcd60e51b815260206004820152602560248201527f436f6d70616e793a20756e6b6e6f776e20726f6c6520287573652043454f206f604482015264722046442960d81b6064820152608490fd5b50346102f45760203660031901126102f457611cee612735565b81546001600160a01b0392919083163381900361227157611d1284831615156127f3565b604051635060f8af60e11b815290602082600481845afa918215610268578492612235575b506040516329e7dd5760e11b8152306004820152938085602481868a165afa958615610dd35781958297612212575b50819482955b8751871015611d8d57611d85600191610d15898c6129e1565b960195611d6c565b611d98811515612a2a565b604051632d1f933960e11b815282841660048201529584876024818785165afa9687156102a75785976121d0575b508496611dd38151612a75565b91611dde8251612a75565b93611de98351612a75565b95885b8451811015611ece57611dff81866129e1565b5160405190632331088960e11b825260048201526060816024818d89165afa80156117c5578b908c928d91611ea9575b508b16301480611ea0575b611e49575b5050600101611dec565b611e55839e93886129e1565b51611e60848a6129e1565b52611e6b838a6129e1565b52611e76828a6129e1565b525f198114611e8c5760018091019b908d611e3f565b634e487b7160e01b8a52601160045260248afd5b50801515611e3a565b915050611ec5915060603d6060116102a05761028e81836126d1565b9190918f611e2f565b898984848f8f8d8c8e841561217a576040516326ec6a6760e21b815296602088600481885afa80156117805789988b9161213c575b506020906024604051809c81936370a0823160e01b8352306004840152165afa988915611780578a99612108575b5089988a5b878110611f70578b8b7f1d3002d6fa1d6023eeb3daf8b7c181cbe7d5fb6edacb1e15a7fda3ec84e9a40c60208d8d6040519485521692a280f35b611f8883610c74611f8184886129e1565b5185612ac6565b8061209c575b50611f9981856129e1565b51611fa482886129e1565b511061202c575b611fb581876129e1565b51611fc3575b600101611f36565b8b611fce82876129e1565b51611fd983896129e1565b51893b156103de576040519163dde77f2b60e01b8352600483015260248201528181604481838d5af18015610cf157612014575b5050611fbb565b61201d9061268f565b612028578b8d61200d565b8b80fd5b8b602061203983886129e1565b516024604051809481936335ee811960e01b835260048301528c5af1801561209157612066575b50611fab565b602090813d831161208a575b61207c81836126d1565b8101031261025d578c612060565b503d612072565b6040513d8f823e3d90fd5b8c889c929c3b156102f4576040516329e0afa360e11b81526001600160a01b038c166004820152602481018390528181604481838e5af18015610cf1576120f0575b50506120e991612a09565b998c611f8e565b6120f99061268f565b612104578c8e6120de565b8c80fd5b9098506020813d602011612134575b81612124602093836126d1565b8101031261025d5751978a611f31565b3d9150612117565b9850506020883d602011612172575b81612158602093836126d1565b81010312610ced57602061216c8a9961289c565b90611f03565b3d915061214b565b60405162461bcd60e51b815260206004820152602860248201527f436f6d70616e793a2065784469726563746f7220686f6c6473206e6f20657175604482015267697479206865726560c01b6064820152608490fd5b9096503d8086833e6121e281836126d1565b810190602081830312610b02578051906001600160401b038211610afe5761220b9291016128c7565b9587611dc6565b90965061222a9195503d8087833e610d7f81836126d1565b50949094955f611d66565b9091506020813d602011612269575b81612251602093836126d1565b8101031261138a576122629061289c565b905f611d37565b3d9150612244565b60405162461bcd60e51b8152602060048201526013602482015272436f6d70616e793a206e6f7420436f6c6f6e7960681b6044820152606490fd5b50346102f457806003193601126102f4578054604051635060f8af60e11b81526001600160a01b03918391906020908290600490829087165afa908115610cf157829161234a575b506024604051809481936329e7dd5760e11b8352306004840152165afa908115610cf157826020939261232d575b505051604051908152f35b61234192503d8091833e610d7f81836126d1565b50505f80612322565b90506020813d60201161237c575b81612365602093836126d1565b810103126102f0576123769061289c565b5f6122f4565b3d9150612358565b50346102f45760403660031901126102f4576004356001600160401b0381116102f0576123b59036906004016126f2565b6123bd61271f565b6002546001600160a01b0391906123d790831633146127ae565b16916123e48315156127f3565b6123ef368383612837565b602081519101207fdc0d7a095c4e917ecbeb7deda7c942ff9744013d419e37549215a413915e421d81145f1461246c5750600380546001600160a01b031916841790557ff57a02bc01251569026959623a216217c197c199cc5011ed3563b3b5c1d57fd9915b611a2660405192839260208452602084019161287c565b7ffc742e123dab805d8342d9b1c2004b5c07fc27d27e8e2866f0275a3e65a7b7b303611c8157600480546001600160a01b031916841790557ff57a02bc01251569026959623a216217c197c199cc5011ed3563b3b5c1d57fd991612455565b503461025d57602036600319011261025d5760043560018060a01b036124f6816002541633146127ae565b5f5416803b1561025d575f80916024604051809481936339bc937760e01b83528760048401525af1801561256c57612558575b5060207f2cb420c41f7e9445fd6ee7ef33231c6322ead403a431fcc15e923d1e0ac55b7991604051908152a180f35b61256391925061268f565b5f906020612529565b6040513d5f823e3d90fd5b3461025d575f36600319011261025d575f60019160015461259781612657565b80835260208095818501936001811690815f1461263957506001146125f1575b5050506125c88260409403836126d1565b825193849281845251918280928501528484015e5f828201840152601f01601f19168101030190f35b9190945060015f525f80516020612dae833981519152915f925b828410612626575050508201909201916125c88460406125b7565b805486850188015292860192810161260b565b60ff19168552505090151560051b83010192506125c88460406125b7565b90600182811c92168015612685575b602083101461267157565b634e487b7160e01b5f52602260045260245ffd5b91607f1691612666565b6001600160401b0381116126a257604052565b634e487b7160e01b5f52604160045260245ffd5b602081019081106001600160401b038211176126a257604052565b90601f801991011681019081106001600160401b038211176126a257604052565b9181601f8401121561025d578235916001600160401b03831161025d576020838186019501011161025d57565b602435906001600160a01b038216820361025d57565b600435906001600160a01b038216820361025d57565b9081518082526020808093019301915f5b82811061276a575050505090565b83518552938101939281019260010161275c565b9181601f8401121561025d578235916001600160401b03831161025d576020808501948460051b01011161025d57565b156127b557565b60405162461bcd60e51b8152602060048201526016602482015275436f6d70616e793a206e6f742073656372657461727960501b6044820152606490fd5b156127fa57565b60405162461bcd60e51b8152602060048201526015602482015274436f6d70616e793a207a65726f206164647265737360581b6044820152606490fd5b9291926001600160401b0382116126a25760405191612860601f8201601f1916602001846126d1565b82948184528183011161025d578281602093845f960137010152565b908060209392818452848401375f828201840152601f01601f1916010190565b51906001600160a01b038216820361025d57565b6001600160401b0381116126a25760051b60200190565b9080601f8301121561025d578151906020916128e2816128b0565b936128f060405195866126d1565b81855260208086019260051b82010192831161025d57602001905b828210612919575050505090565b8151815290830190830161290b565b909160608284031261025d578151916001600160401b039283811161025d5781019380601f8601121561025d57845194602095612964816128b0565b9161297260405193846126d1565b818352878084019260051b8201019184831161025d5788809201905b8382106129ca57505050509482015184811161025d57816129b09184016128c7565b93604083015190811161025d576129c792016128c7565b90565b8280916129d68461289c565b81520191019061298e565b80518210156129f55760209160051b010190565b634e487b7160e01b5f52603260045260245ffd5b91908201809211612a1657565b634e487b7160e01b5f52601160045260245ffd5b15612a3157565b606460405162461bcd60e51b815260206004820152602060248201527f436f6d70616e793a207a65726f206f75747374616e64696e67206571756974796044820152fd5b90612a7f826128b0565b612a8c60405191826126d1565b8281528092612a9d601f19916128b0565b0190602036910137565b9081606091031261025d578051916129c760406020840151930161289c565b81810292918115918404141715612a1657565b8115612ae3570490565b634e487b7160e01b5f52601260045260245ffd5b15612afe57565b60405162461bcd60e51b815260206004820152602360248201527f436f6d70616e793a20746f6b656e206e6f7420666f72207468697320636f6d70604482015262616e7960e81b6064820152608490fd5b15612b5657565b60405162461bcd60e51b8152602060048201526013602482015272436f6d70616e793a207a65726f207374616b6560681b6044820152606490fd5b919082604091031261025d576020825192015190565b81835290916001600160fb1b03831161025d5760209260051b809284830137010190565b5f5460408051635060f8af60e11b81526001600160a01b0394928516936020939290918481600481895afa908115612d6a579087915f91612d74575b505f9060248451809a81936329e7dd5760e11b8352306004840152165afa968715612d6a575f97612d4b575b505f94855b8851871015612c5957612c51600191610d15898c6129e1565b960195612c38565b95509193965091948415612d4157816004918551928380926326ec6a6760e21b82525afa908115612d37579082915f91612d01575b5060248551809581936370a0823160e01b8352306004840152165afa928315612cf857505f92612cc8575b50506129c792610c7491612ac6565b90809250813d8311612cf1575b612cdf81836126d1565b8101031261025d575182610c74612cb9565b503d612cd5565b513d5f823e3d90fd5b82819392503d8311612d30575b612d1881836126d1565b8101031261025d57612d2a829161289c565b5f612c8e565b503d612d0e565b84513d5f823e3d90fd5b5050505050505f90565b612d609197503d805f833e610d7f81836126d1565b509050955f612c33565b82513d5f823e3d90fd5b809250868092503d8311612da6575b612d8d81836126d1565b8101031261025d575f612da0889261289c565b90612c07565b503d612d8356feb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf6a2646970667358221220ff72d1b50c824b854ec301a7613008586d1c1894678b2adc52bc517be9a36d6264736f6c63430008190033"
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
    "bytecode": "0x608034609557601f61115d38819003918201601f19168301916001600160401b0383118484101760995780849260609460405283398101031260955760428160ad565b906057604060516020840160ad565b920160ad565b60018060a01b0380928160018060a01b03199516855f5416175f55168360015416176001551690600254161760025560405161109c90816100c18239f35b5f80fd5b634e487b7160e01b5f52604160045260245ffd5b51906001600160a01b038216820360955756fe6080806040526004361015610012575f80fd5b5f905f3560e01c9081631a32aad614610a7357508063349ff77014610a4c5780633b56fd44146101b657806357d13917146100a957806359659e901461008057638e75dd4714610060575f80fd5b3461007d578060031936011261007d576020600354604051908152f35b80fd5b503461007d578060031936011261007d576002546040516001600160a01b039091168152602090f35b503461007d576020806003193601126101b2576100c7600435610ba0565b509060018060a01b0391600192806001830154169060028301541660038301549160048401549360405196888254926100ff84610bd9565b808b52936001811690811561018e5750600114610155575b5050505061012a8661013e980387610b07565b60405196879660a0885260a0880190610ac7565b948601526040850152606084015260808301520390f35b90809a50528689205b828a1061017b5750505061012a868661013e99820101985f610117565b8054898b0189015298870198810161015e565b60ff19168a8c015250505050151560051b86018501965061012a8661013e5f610117565b5080fd5b50346108375760803660031901126108375760043567ffffffffffffffff811161083757366023820112156108375767ffffffffffffffff816004013511610837573660248260040135830101116108375760243567ffffffffffffffff811161083757610228903690600401610a96565b9060443567ffffffffffffffff811161083757610249903690600401610a96565b91906064359260ff84168403610837575f5460405163f3caad0360e01b81523360048201526001600160a01b0390911690602081602481855afa90811561082c575f91610a11575b50156109cc57866004013515610987578515610942578186036108fd575f805b8382106108c95761271091500361086f5760405190630f76f81b60e31b602083015260248201526060604482015261030e816102f8608482018a6004013560248c01610b4d565b336064830152601f198282030182520382610b07565b60025460405191906001600160a01b031667ffffffffffffffff6104558401908111908411176106fd57829161035e91610455610c12853961045584019081526040602082018190520190610ac7565b03905ff094851561082c5760206103ba60ff96895f8a60018060a01b03825416936040519b8c96879586946321ff05c760e01b865260018060a01b03166004860152606060248601526064850190602481600401359101610b4d565b9116604483015203925af194851561082c575f9561083b575b505f546001600160a01b0316803b156108375760405163b63e8d1560e01b81526001600160a01b0388166004820152905f908290602490829084905af1801561082c5761080f575b5087546001600160a01b031690885b81811061071157505050505050600354926040519060a0820182811067ffffffffffffffff8211176106fd57806040526104726020601f19601f856004013501160182610b07565b60048201358082526024830160c08501376004820135830160c00187905282526001600160a01b038416602083015233604083015260608201839052426080830152680100000000000000008510156106e957600185016003556104d585610ba0565b6106d55782519283519367ffffffffffffffff85116106c1576104f88354610bd9565b601f8111610680575b5060209888949392918a916001601f8911146105f1579680608093600495937fdfb72d7c9bc6f5c82e4fdfa88d06f1a6cfc5e09231d89fd9f778c761b12e737d999a926105e6575b50508160011b915f199060031b1c19161784555b808b01516001850180546001600160a01b03199081166001600160a01b039384161790915560408084015160028801805490931693169290921790556060820151600386015591015191909201558051818152916105c691830190600481013590602401610b4d565b8188019490945233946001600160a01b03169381900390a4604051908152f35b015190505f80610549565b9691908488528b8820975b601f19841681106106665750827fdfb72d7c9bc6f5c82e4fdfa88d06f1a6cfc5e09231d89fd9f778c761b12e737d979860049593600193608096601f1981161061064e575b505050811b01845561055d565b01515f1960f88460031b161c191690555f8080610641565b8282015189556001909801978b9750918c01918c016105fc565b838a5260208a20601f870160051c8101602088106106ba575b601f830160051c820181106106af575050610501565b8b8155600101610699565b5080610699565b634e487b7160e01b89526041600452602489fd5b634e487b7160e01b87526004879052602487fd5b634e487b7160e01b86526041600452602486fd5b634e487b7160e01b5f52604160045260245ffd5b61071c818388610b29565b356001600160a01b038116810361080b57604061073a838789610b29565b358c82519361074885610aeb565b8185528c6107b8855161075a81610aeb565b8481528651633f5f75cd60e01b81526001600160a01b039384166004820152929093166024830152604482019490945260a06064820152948593849283926107a69060a4850190610b6d565b83810360031901608485015290610b6d565b0391885af18015610800576107d1575b5060010161042a565b604090813d83116107f9575b6107e78183610b07565b810103126107f5575f6107c8565b8980fd5b503d6107dd565b6040513d8d823e3d90fd5b8a80fd5b90975067ffffffffffffffff81116106fd576040525f965f61041b565b6040513d5f823e3d90fd5b5f80fd5b9094506020813d602011610867575b8161085760209383610b07565b810103126108375751935f6103d3565b3d915061084a565b60405162461bcd60e51b815260206004820152602c60248201527f436f6d70616e79466163746f72793a207374616b6573206d7573742073756d2060448201526b746f2031303030302062707360a01b6064820152608490fd5b6108d4828587610b29565b3581018091116108e9576001909101906102b1565b634e487b7160e01b5f52601160045260245ffd5b60405162461bcd60e51b815260206004820152601f60248201527f436f6d70616e79466163746f72793a206c656e677468206d69736d61746368006044820152606490fd5b60405162461bcd60e51b815260206004820152601a60248201527f436f6d70616e79466163746f72793a206e6f20686f6c646572730000000000006044820152606490fd5b60405162461bcd60e51b815260206004820152601d60248201527f436f6d70616e79466163746f72793a206e616d652072657175697265640000006044820152606490fd5b60405162461bcd60e51b815260206004820152601d60248201527f436f6d70616e79466163746f72793a206e6f74206120636974697a656e0000006044820152606490fd5b90506020813d602011610a44575b81610a2c60209383610b07565b8101031261083757518015158103610837575f610291565b3d9150610a1f565b34610837575f366003190112610837575f546040516001600160a01b039091168152602090f35b34610837575f366003190112610837576001546001600160a01b03168152602090f35b9181601f840112156108375782359167ffffffffffffffff8311610837576020808501948460051b01011161083757565b805180835260209291819084018484015e5f828201840152601f01601f1916010190565b6020810190811067ffffffffffffffff8211176106fd57604052565b90601f8019910116810190811067ffffffffffffffff8211176106fd57604052565b9190811015610b395760051b0190565b634e487b7160e01b5f52603260045260245ffd5b908060209392818452848401375f828201840152601f01601f1916010190565b9081518082526020808093019301915f5b828110610b8c575050505090565b835185529381019392810192600101610b7e565b600354811015610b395760059060035f52027fc2575a0e9e593c00f959f8c92f12db2869c3395a3b0502d05e2516446f71f85b01905f90565b90600182811c92168015610c07575b6020831014610bf357565b634e487b7160e01b5f52602260045260245ffd5b91607f1691610be856fe60a060409080825261045580380380916100198285610265565b833981019082818303126101a35761003081610288565b916020918281015160018060401b03918282116101a3570182601f820112156101a357805191821161025157855192610072601f8401601f1916860185610265565b8284528483830101116101a357815f92858093018386015e83010152823b15610231577fa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d5080546001600160a01b0319166001600160a01b038581169182179092558551635c60da1b60e01b8082529194928382600481895afa918215610227575f926101f0575b50813b156101d75750508551847f1cf3b03a6cf19fa2baba4df148e9dcabedea7f8a5c07840e207e5c089be95d3e5f80a28351156101b857508190600487518096819382525afa9081156101ae575f91610173575b50610159925061029c565b505b60805251610127908161032e82396080518160180152f35b905082813d83116101a7575b6101898183610265565b810103126101a35761019d61015992610288565b5f61014e565b5f80fd5b503d61017f565b85513d5f823e3d90fd5b9350505050346101c8575061015b565b63b398979f60e01b8152600490fd5b8751634c9c8ce360e01b81529116600482015260249150fd5b9091508381813d8311610220575b6102088183610265565b810103126101a35761021990610288565b905f6100f9565b503d6101fe565b88513d5f823e3d90fd5b8351631933b43b60e21b81526001600160a01b0384166004820152602490fd5b634e487b7160e01b5f52604160045260245ffd5b601f909101601f19168101906001600160401b0382119082101761025157604052565b51906001600160a01b03821682036101a357565b905f8091602081519101845af4808061031a575b156102d05750506040513d81523d5f602083013e60203d82010160405290565b156102f757604051639996b31560e01b81526001600160a01b039091166004820152602490fd5b3d15610308576040513d5f823e3d90fd5b60405163d6bda27560e01b8152600490fd5b503d1515806102b05750813b15156102b056fe60806040819052635c60da1b60e01b81526020816004817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa90811560a6575f916053575b5060d5565b905060203d60201160a0575b601f8101601f191682019167ffffffffffffffff831181841017608c576087926040520160b1565b5f604e565b634e487b7160e01b5f52604160045260245ffd5b503d605f565b6040513d5f823e3d90fd5b602090607f19011260d1576080516001600160a01b038116810360d15790565b5f80fd5b5f8091368280378136915af43d5f803e1560ed573d5ff35b3d5ffdfea264697066735822122085b8a810c1a55ac85d077ad9eb450e666900850fe4e60939e127edac4ead932564736f6c63430008190033a2646970667358221220c0c75b93bd68f27942506120e141ce54e09cd0cf1dcea92db4cc15da71caa74464736f6c63430008190033"
  },
  "AToken": {
    "abi": [
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_colony",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "_colonyName",
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
            "name": "declaredValueV",
            "type": "uint256"
          }
        ],
        "name": "LandClaimed",
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
            "internalType": "uint256",
            "name": "epoch",
            "type": "uint256"
          }
        ],
        "name": "LandFeePaid",
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
            "name": "priceV",
            "type": "uint256"
          }
        ],
        "name": "LandForcePurchased",
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
            "internalType": "uint256",
            "name": "oldValueV",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "newValueV",
            "type": "uint256"
          }
        ],
        "name": "LandValueUpdated",
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
        "name": "STEWARDSHIP_BPS",
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
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "assetLabel",
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
            "internalType": "address",
            "name": "holder",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "label",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "declaredValueV",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "currentEpoch",
            "type": "uint256"
          }
        ],
        "name": "claimLand",
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
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "newHolder",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "newDeclaredValueV",
            "type": "uint256"
          }
        ],
        "name": "forceLandPurchase",
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
            "name": "id",
            "type": "uint256"
          }
        ],
        "name": "getLandData",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "declaredValueV",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "lastFeeEpoch",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "isLand",
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
        "name": "getVestingSchedule",
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
            "internalType": "uint256[]",
            "name": "vestingEpochs",
            "type": "uint256[]"
          },
          {
            "internalType": "uint256[]",
            "name": "trancheBps",
            "type": "uint256[]"
          },
          {
            "internalType": "uint256",
            "name": "nextTranche",
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
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "landData",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "declaredValueV",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "lastFeeEpoch",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "isLand",
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
          },
          {
            "internalType": "uint256",
            "name": "currentEpoch",
            "type": "uint256"
          }
        ],
        "name": "markLandFeePaid",
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
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "currentEpoch",
            "type": "uint256"
          }
        ],
        "name": "outstandingLandFeeEpochs",
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
            "internalType": "string",
            "name": "label",
            "type": "string"
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
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "newDeclaredValueV",
            "type": "uint256"
          }
        ],
        "name": "updateLandValue",
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
    "bytecode": "0x6080604052346104a057615a5880380380610019816104c3565b9283398101906040818303126104a05780516001600160a01b03811691908290036104a0576020818101516001600160401b03928382116104a0570190601f918583820112156104a05780518481116102cf57601f199161007f828601841685016104c3565b978289528483830101116104a057815f9285809301838b015e880101526100a46104a4565b94600d86526c29a824a1a2902096aa37b5b2b760991b838701526100c66104a4565b906005918281526441544f4b4560d81b8582015287518781116102cf575f546001998a82811c92168015610496575b888310146102b157818984931161044a575b5087908983116001146103ef575f926103e4575b50505f19600383901b1c191690891b175f555b8051908782116102cf578854908982811c921680156103da575b878310146102b157818884931161038e575b508690888311600114610333575f92610328575b50505f19600383901b1c191690881b1787555b80156102e357600680546001600160a01b03191691909117905586519485116102cf57600754908682811c921680156102c5575b848310146102b15784821161026f575b50508192841160011461020f5750508192935f92610204575b50505f19600383901b1c191690821b176007555b60085560405161556f90816104e98239f35b015190505f806101de565b83929192169460075f52825f20925f905b87821061025857505083859610610240575b505050811b016007556101f2565b01515f1960f88460031b161c191690555f8080610232565b808785968294968601518155019501930190610220565b60075f52835f209085808801821c8301938689106102a8575b01901c019086905b82811061029d57506101c5565b5f8155018690610290565b93508293610288565b634e487b7160e01b5f52602260045260245ffd5b91607f16916101b5565b634e487b7160e01b5f52604160045260245ffd5b60405162461bcd60e51b815260048101859052601360248201527f41546f6b656e3a207a65726f20636f6c6f6e79000000000000000000000000006044820152606490fd5b015190505f8061016e565b90868b941691845f52885f20925f5b8a8282106103785750508411610360575b505050811b018755610181565b01515f1960f88460031b161c191690555f8080610353565b8385015186558e97909501949384019301610342565b909150895f52865f2088808501871c8201928986106103d1575b918c918695949301881c01915b8281106103c357505061015a565b5f81558594508c91016103b5565b925081926103a8565b91607f1691610148565b015190505f8061011b565b90878c9416915f8052895f20925f5b8b828210610434575050841161041c575b505050811b015f5561012e565b01515f1960f88460031b161c191690555f808061040f565b8385015186558f979095019493840193016103fe565b9091505f8052875f2089808501881c8201928a861061048d575b918d918695949301891c01915b82811061047f575050610107565b5f81558594508d9101610471565b92508192610464565b91607f16916100f5565b5f80fd5b60408051919082016001600160401b038111838210176102cf57604052565b6040519190601f01601f191682016001600160401b038111838210176102cf5760405256fe6080806040526004361015610012575f80fd5b5f3560e01c90816301cc7ad414613aa05750806301ffc9a714613a3257806306fdde031461399057806307ca660e146136bf5780630808e1881461358f578063081812fc14613553578063095ea7b3146134e45780630afb3c04146134895780631c935e76146134075780631c9cd2191461310957806323b872dd146130f357806328ab2218146130c95780632bdd7c20146130575780632ca62c2a14612dde57806333bbed0014612db4578063349ff77014612d8c5780633956cdfe14612c7f57806342842e0e14612c5b5780634662111214612c115780634f64b2be14612ba057806353b1a41114612afb57806353cfbaae14612923578063553c7e65146127625780635652b97d1461272f5780635a3f2672146126e35780635abae4f3146126415780635e617acd1461260457806361b8ce8c146125e75780636352211e146125b757806370a08231146125615780637a6e10281461250d57806395d89b411461243e578063993ca18914612414578063a22cb4651461239a578063ab9e611f146117f8578063ac823a7e1461233f578063ae02377114611c8c578063b58376d6146118ca578063b88d4fde1461184a578063b95aa42f146117f8578063beb8f8831461173f578063c301a01a14611724578063c590f3001461170b578063c87b56dd14610540578063ca55954c1461050b578063cc498f4e146103d2578063d224ca15146103af578063dde77f2b146102b9578063de146d19146102985763e985e9c514610242575f80fd5b346102945760403660031901126102945761025b613b71565b610263613b87565b9060018060a01b038091165f52600560205260405f2091165f52602052602060ff60405f2054166040519015158152f35b5f80fd5b346102945760206102b16102ab36613bc7565b906147db565b604051908152f35b34610294576102c736613bc7565b6102dc60018060a01b03600654163314613e3f565b815f52600960205260ff60405f206102f982600383015416613e81565b5416600581101561039b577f788f486facf15f8d493992d5c9122be3ef240a15e5abe0e9e94076c3c07360a891610334600160209314613ec0565b835f52600b825260405f208115158061038d575b61035190613f5b565b60018101610360838254613fb1565b905561036d828254613fb1565b8091551561037f575b604051908152a2005b61038884614820565b610376565b506001810154821115610348565b634e487b7160e01b5f52602160045260245ffd5b346102945760203660031901126102945760206102b16103cd613b71565b6146f0565b34610294576103e036613b9d565b6006546001600160a01b03906103f99082163314613e3f565b835f52600960205260405f2090600d60205260405f209061042060ff600385015416613e81565b61043060ff600284015416614110565b8085169261043f841515613f16565b61044a85151561415c565b5460081c16908183146104cd5780610466859254968489614b53565b55847fcb4c47f88dd41d1e7fd20efad84f85620ec9476cad0f65a9b3ba4135a03e570d6020604051878152a481810361049b57005b7f9dae2ddac3a1a911f3ae41718d027fab81ef970ccb1c31cb9000a95d086d4aff9160409182519182526020820152a2005b60405162461bcd60e51b815260206004820152601660248201527520aa37b5b2b71d1030b63932b0b23c903437b63232b960511b6044820152606490fd5b34610294576020366003190112610294576004355f526009602052602060018060a01b0360405f205460081c16604051908152f35b346102945760203660031901126102945761055c600435614b19565b506004355f52600960205260405f20805461057960ff8216614e4d565b9060ff6003840154165f146116fd576105906146d0565b925b60206105aa600884901c6001600160a01b0316614f78565b94604051957f5b7b2274726169745f74797065223a22466f726d222c2276616c7565223a22008388015282865180828901603f8b015e880162089f4b60ea1b9384603f8301527f7b2274726169745f74797065223a22416374697665222c2276616c7565223a226042830152805192839101606283015e019160628301527f7b2274726169745f74797065223a22486f6c646572222c2276616c7565223a226065830152805192839101608583015e0161067b60878661227d60f01b93846085820152036067810188520186613ce3565b8490600560ff85161015928361039b5760209660ff86166001036112ec575050856107e2609b61080d946021946004355f52600b85528460405f20816106c18254615043565b91816106e76106d36001840154615043565b6002909301546001600160a01b0316614f78565b936040519a888c995191829101848b015e8801907f2c7b2274726169745f74797065223a22546f74616c205374616b652028627073838301526b149116113b30b63ab2911d1160a11b6040830152805192839101604c83015e019085604c8301527f2c7b2274726169745f74797065223a22566573746564202862707329222c2276604e8301526630b63ab2911d1160c91b606e830152805192839101607583015e01908360758301527f2c7b2274726169745f74797065223a22436f6d70616e79222c2276616c7565226077830152611d1160f11b6097830152805192839101609983015e0190609982015203607b810184520182613ce3565b604051968188925191829101602084015e8101605d60f81b6020820152036001810187520185613ce3565b61039b5760ff16611279576004355f52601660205261082e60405f20613d04565b916004355f52600a602052610850670de0b6b3a764000060405f205404615043565b83519092901561120c576040516108a560268287518060208a01602084015e810163010615b960e51b60208201528751908160208a01602483015e0161205360f01b6024820152036006810184520182613ce3565b926004355f52600a60205260405f2085511515906040516108c581613cad565b5f815260018201549182151580806111fe575b156110c95750505090602061093f60186108f28395615043565b6040519384916109038284016151aa565b90805192839101825e017f206b672020266d6964646f743b202041493c2f746578743e0000000000000000815203600719810184520182613ce3565b965b61097f6021610951600435615043565b604051958691602360f81b828401528051918291018484015e81015f83820152036001810186520184613ce3565b81156110a85760405161099181613cc8565b6002815261313560f01b6020820152915b1561107a57925b604051937f3c73766720786d6c6e733d22687474703a2f2f7777772e77332e6f72672f323060208601527f30302f737667222077696474683d2234303022206865696768743d223430302260408601527f2076696577426f783d223020302034303020343030223e00000000000000000060608601527f3c726563742077696474683d2234303022206865696768743d2234303022206660778601526e34b6361e911198309830983091179f60891b60978601527f3c7265637420783d2232302220793d223230222077696474683d22333630222060a68601527f6865696768743d22333630222066696c6c3d226e6f6e6522207374726f6b653d60c68601527f222342383836304222207374726f6b652d77696474683d2231222072783d223860e68601526211179f60e91b6101068601527f3c7465787420783d223230302220793d2237362220666f6e742d66616d696c796101098601527f3d226d6f6e6f73706163652220666f6e742d73697a653d223133222066696c6c6101298601527f3d22234238383630422220746578742d616e63686f723d226d6964646c652220610149860152723632ba3a32b916b9b830b1b4b7339e911a111f60691b6101698601525f600754610b7b81613c3f565b90600181169081156110555750600114610ffc575b50610fec976020603d9881610ee26045610ff89f839f989c610e806101ce610fa29f879f610e809f60619f610e85978b9f8c809361205360f01b82808d9a817f3c7465787420783d223230302220793d223336382220666f6e742d66616d696c97661e17ba32bc3a1f60c91b9b8c82527f3c7465787420783d223230302220793d223233322220666f6e742d66616d696c60078301527f793d226d6f6e6f73706163652220666f6e742d73697a653d223134302220666960278301527f6c6c3d22234238383630422220746578742d616e63686f723d226d6964646c6560478301527f22206f7061636974793d22302e3038223e413c2f746578743e0000000000000060678301527f3c7465787420783d223230302220793d223235322220666f6e742d66616d696c60808301527f793d226d6f6e6f73706163652220666f6e742d73697a653d220000000000000060a083015280519283910160b983015e01907f222066696c6c3d22236666666666662220746578742d616e63686f723d226d6960b98301526532323632911f60d11b60d983015280519283910160df83015e018860df8201527f3c7465787420783d223230302220793d223330302220666f6e742d66616d696c60e68201527f793d226d6f6e6f73706163652220666f6e742d73697a653d223332222066696c6101068201527f6c3d22234238383630422220746578742d616e63686f723d226d6964646c6522610126820152601f60f91b610146820152610147938051928391018583015e019182015285610149820152610150938051928391018583015e01918201527f793d226d6f6e6f73706163652220666f6e742d73697a653d223131222066696c6101708201527f6c3d22233333332220746578742d616e63686f723d226d6964646c6522206c65610190820152703a3a32b916b9b830b1b4b7339e911a111f60791b6101b082015283516101c19490928391018583015e0191820152651e17b9bb339f60d11b6101c8820152036101ae810184520182613ce3565b615343565b6040519384917f22696d616765223a22646174613a696d6167652f7376672b786d6c3b6261736582840152620d8d0b60ea1b6040840152805191829101604384015e810161088b60f21b6043820152036025810184520182613ce3565b82604051998a97683d913730b6b2911d1160b91b828a015280519182910160298a015e870161088b60f21b938460298301527f226465736372697074696f6e223a22535049434520436f6c6f6e7920412d546f602b83015265035b2b71016960d51b604b830152805192839101605183015e01916051830152805192839101605383015e01906c1130ba3a3934b13aba32b9911d60991b6053830152805192839101606083015e01607d60f81b6060820152036041810184520182613ce3565b6040519384917f646174613a6170706c69636174696f6e2f6a736f6e3b6261736536342c000000828401528051918291018484015e81015f8382015203601d810184520182613ce3565b60405191829182613b47565b0390f35b905060075f527fa66cc928b5edb82af9bd49922954155ab7b0942694bea4ce44661d9a8736c6885f905b82821061103d575050850161017c01610fec610b90565b6001816020925461017c858c01015201910190611026565b60ff191661017c808a019190915282151590920288019091019150610fec9050610b90565b5060405161108781613cc8565b600e81526d14121654d250d053081054d4d15560921b6020820152926109a9565b6040516110b481613cc8565b6002815261313160f01b6020820152916109a2565b1561112257505090602061111c600a6110e28395615043565b6040519384916110f38284016151aa565b90805192839101825e01691035b39e17ba32bc3a1f60b11b815203601519810184520182613ce3565b96610941565b60ff91989250600201541661113b575b90602091610941565b955060209060405161114c81613c77565b608581527f3c7465787420783d223230302220793d223334302220666f6e742d66616d696c838201527f793d226d6f6e6f73706163652220666f6e742d73697a653d223131222066696c60408201527f6c3d22233535352220746578742d616e63686f723d226d6964646c6522206c6560608201527f747465722d73706163696e673d2232223e4155544f4e4f4d4f55532041493c2f6080820152643a32bc3a1f60d91b60a082015296909150611132565b5060ff6002830154166108d8565b6020611274602d61121e600435615043565b604051938491664173736574202360c81b82840152805191829101602784015e810163010615b960e51b60278201528751908160208a01602b83015e0161205360f01b602b82015203600d810184520182613ce3565b6108a5565b610fec603d610fa26020610e806061829683610ff89981806112d760296112a1600435615043565b60405193849168412d546f6b656e202360b81b828401528051918291018484015e81015f83820152036009810184520182613ce3565b936040516112e481613cad565b5f8152610ee2565b9293505f929060ff86166114f05750506021908661080d93946004355f52600a8252611450609c60405f208461132c670de0b6b3a7640000835404615043565b9160ff600261133e6001840154615043565b92015416156114e157816113506146d0565b915b604051988995818088019a8051918291018c5e8701907f2c7b2274726169745f74797065223a2256616c756520285329222c2276616c75838301526332911d1160e11b6040830152805192839101604483015e01908a60448301527f2c7b2274726169745f74797065223a2257656967687420286b6729222c227661604683015265363ab2911d1160d11b6066830152805192839101606c83015e019088606c8301527f2c7b2274726169745f74797065223a22486173204175746f6e6f6d6f75732041606e8301526b249116113b30b63ab2911d1160a11b608e830152805192839101609a83015e0186609a82015203607c810185520183613ce3565b816004355f5260168a5261146660405f20613d04565b938451611479575b50505090505b6107e2565b6114d893508a604293956040519687945180918487015e8401907f2c7b2274726169745f74797065223a224c6162656c222c2276616c7565223a2283830152805192839101604083015e01906040820152036022810184520182613ce3565b8088808061146e565b816114ea6146af565b91611352565b5f9493509060ff861660040361164e5750508561147460a061080d946021946004355f52600c85528460405f2081611532670de0b6b3a7640000835404615043565b918161154e60026115466001850154615043565b930154615043565b936040519a888c995191829101848b015e8801907f2c7b2274726169745f74797065223a224d6f6e74686c7920416d6f756e742028838301526c29949116113b30b63ab2911d1160991b6040830152805192839101604d83015e019085604d8301527f2c7b2274726169745f74797065223a22546f74616c2045706f636873222c2276604f8301526630b63ab2911d1160c91b606f830152805192839101607683015e01908360768301527f2c7b2274726169745f74797065223a2245706f6368732050616964222c227661607883015265363ab2911d1160d11b6098830152805192839101609e83015e0190609e820152036080810184520182613ce3565b61080d939194506021925f95600360ff89161461166e575b5050506107e2565b600101548993506116f59260449290918590611692906001600160a01b0316614f78565b6040519684889551918291018487015e8401907f2c7b2274726169745f74797065223a224f626c69676f72222c2276616c75652283830152611d1160f11b6040830152805192839101604283015e01906042820152036024810184520182613ce3565b878080611666565b6117056146af565b92610592565b346102945760206102b161171e36613bc7565b90614618565b34610294575f36600319011261029457602060405160328152f35b3461029457602036600319011261029457600435805f52600960205260ff60405f205416600581101561039b5760016117789114613ec0565b5f52600b60205260405f2080546001820154916117ee60018060a01b036002830154166117e06005840154936117bc60046117b560038401613df1565b9201613df1565b9260405197889788526020880152604087015260c0606087015260c0860190613b14565b908482036080860152613b14565b9060a08301520390f35b34610294576020366003190112610294576004355f52600d60205260405f208054610ff860ff600260018501549401541660405193849384919260409194936060840195845260208401521515910152565b3461029457608036600319011261029457611863613b71565b5061186c613b87565b506064356001600160401b03811161029457366023820112156102945780600401359061189882613dd6565b916118a66040519384613ce3565b8083523660248284010111610294575f9281602460209401848301370101526141ea565b346102945760a0366003190112610294576118e3613b71565b6118eb613b87565b6064356001600160401b0381116102945761190a903690600401613da6565b916084356001600160401b0381116102945761192a903690600401613da6565b939061194160018060a01b03600654163314613e3f565b6001600160a01b03861615611c50576119646001600160a01b03841615156141a8565b60443515611c1657848203611bd25781611b4e575b61198286614ca5565b9361198e85888661490c565b958315611b45575f905b6119e2604051946119a886613c77565b6044358652602086019384526001600160a01b038b1660408701908152946119d390369089906145ca565b926060870193845236916145ca565b906080850191825260a08501935f8552895f52600b60205260405f2095518655600193516001870155600286019060018060a01b039051166001600160601b0360a01b825416179055600385019051908151916001600160401b038311611b1e57602090611a508484614065565b01905f5260205f20845f5b848110611b32575050505050600484019051908151916001600160401b038311611b1e57602090611a8c8484614065565b01905f5260205f205f5b838110611b0b57505050505060606040978694889460057f6468119657454ae108a2def13838f817f302d27edf79111c34be9cbf5ddc76cf9551910155611add8583614ab8565b89516001600160a01b0397881681526044356020820152901515818b0152951694a482519182526020820152f35b8490602084519401938184015501611a96565b634e487b7160e01b5f52604160045260245ffd5b6020845194019381840155018590611a5b565b60443590611998565b5f805b868110611bb75750604435146119795760405162461bcd60e51b815260206004820152602860248201527f41546f6b656e3a207472616e63686520627073206d7573742073756d20746f206044820152677374616b6542707360c01b6064820152608490fd5b90611bcb6001918360051b850135906140f5565b9101611b51565b606460405162461bcd60e51b815260206004820152602060248201527f41546f6b656e3a207363686564756c65206c656e677468206d69736d617463686044820152fd5b60405162461bcd60e51b815260206004820152601260248201527141546f6b656e3a207a65726f207374616b6560701b6044820152606490fd5b60405162461bcd60e51b815260206004820152601460248201527341546f6b656e3a207a65726f20636f6d70616e7960601b6044820152606490fd5b346102945760c036600319011261029457611ca5613b71565b611cad613b87565b90604490606460849260a43594611ccf60018060a01b03600654163314613e3f565b6001600160a01b03841615612305576001600160a01b038116156122cc5781351561228a5782351561225257843515958680612249575b6121d9575b50851561203a575b60085493611d2085614102565b600855604051611d2f81613c92565b6004815260018060a01b038316602082015260018060a01b03821660408201525f606082015260016080820152855f52600960205260405f20815191600583101561039b5781546020820151610100600160a81b0360089190911b1660ff949094166001600160a81b031990911617929092178155611df2916003906080905b6001840160018060a01b036040830151166001600160601b0360a01b825416179055606081015160028501550151151591019060ff801983541691151516179055565b611dfc8583615305565b6001600160a01b03611e0e8684615482565b166120225760085495611e2087614102565b600855604051611e2f81613c92565b6003815260018060a01b038316602082015260018060a01b038416604082015286606082015260016080820152875f52600960205260405f20815191600583101561039b5781546020820151610100600160a81b0360089190911b1660ff949094166001600160a81b031990911617929092178155611eb391600390608090611daf565b611ebd8783615305565b6001600160a01b03611ecf8884615482565b1661202257855f52600960205286600260405f200155611f52604051611ef481613c92565b8535815260046020820188358152604083015f815260608401908635825260808501925f84528c5f52600c60205260405f209551865551600186015551600285015551600384015551151591019060ff801983541691151516179055565b8715611fff575b506012549060136020528160405f2055600160401b821015611b1e57604097869588957faa45e66205470dd78318a0cf957a20ffda9a2871fc2b4cb33bc41bbf76566bfe95611fcc89611fb488600160a09a01601255614097565b90919082549060031b91821b915f19901b1916179055565b8b515f196001881b0195861681529416602085015235838b0152356060830152156080820152a382519182526020820152f35b80355f5260146020528560405f2055855f5260156020523560405f205587611f59565b6040516339e3563760e11b81525f6004820152602490fd5b84355f5260206009815260405f2060ff6003820154161561218b575460ff8116600581101561039b57612133576001600160a01b0383811660089290921c16036120e25785355f526014815260405f20546120955750611d13565b85906363726f7760e01b857f41546f6b656e3a20636f6c6c61746572616c20616c726561647920696e206573866040519462461bcd60e51b86526004860152602480860152840152820152fd5b8590661b185d195c985b60ca1b857f41546f6b656e3a206f626c69676f72206d757374206f776e2074686520636f6c866040519462461bcd60e51b8652600486015260276024860152840152820152fd5b60405162461bcd60e51b815260048101839052602d60248201527f41546f6b656e3a20636f6c6c61746572616c206d757374206265206120756e69818601526c1b185d195c985b08185cdcd95d609a1b818701528790fd5b60405162461bcd60e51b8152600481018390526024808201527f41546f6b656e3a20636f6c6c61746572616c20746f6b656e20697320696e616381860152637469766560e01b818701528790fd5b6121ec83356121e7846146f0565b6140f5565b116121f75786611d0b565b50660554249206361760cc1b84927f41546f6b656e3a206f626c69676174696f6e20776f756c6420657863656564206040519362461bcd60e51b85526020600486015260276024860152840152820152fd5b50801515611d06565b507241546f6b656e3a207a65726f2065706f63687360681b6040519162461bcd60e51b83526020600484015260136024840152820152fd5b507f41546f6b656e3a207a65726f207061796d656e7420616d6f756e7400000000006040519162461bcd60e51b835260206004840152601b6024840152820152fd5b507320aa37b5b2b71d103d32b9379037b13634b3b7b960611b6040519162461bcd60e51b83526020600484015260146024840152820152fd5b507420aa37b5b2b71d103d32b9379031b932b234ba37b960591b6040519162461bcd60e51b83526020600484015260156024840152820152fd5b34610294576020366003190112610294576004355f52600a60205260a060405f2080549060018101549060ff600282015416600460038301549201549260405194855260208501521515604084015260608301526080820152f35b34610294576040366003190112610294576123b3613b71565b50602435801515036102945760405162461bcd60e51b815260206004820152602760248201527f41546f6b656e3a20617070726f76616c732064697361626c6564202d2075736560448201526620436f6c6f6e7960c81b6064820152608490fd5b34610294576020366003190112610294576004355f526014602052602060405f2054604051908152f35b34610294575f366003190112610294576040515f6001805461245f81613c3f565b80855291602091600181169081156124e3575060011461248a575b610ff885610fec81870382613ce3565b60015f90815293507fb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf65b8385106124d057505050508101602001610fec82610ff861247a565b80548686018401529382019381016124b4565b869550610ff896935060209250610fec94915060ff191682840152151560051b820101929361247a565b34610294576020366003190112610294576004355f52600b602052608060405f20805490600181015490600560018060a01b0360028301541691015491604051938452602084015260408301526060820152f35b34610294576020366003190112610294576001600160a01b03612582613b71565b16801561259f575f526003602052602060405f2054604051908152f35b6040516322718ad960e21b81525f6004820152602490fd5b346102945760203660031901126102945760206125d5600435614b19565b6040516001600160a01b039091168152f35b34610294575f366003190112610294576020600854604051908152f35b346102945760203660031901126102945761262a60018060a01b03600654163314613e3f565b60206126376004356143e4565b6040519015158152f35b3461029457602036600319011261029457600435805f52600960205260405f2080549060ff821690600582101561039b5760e0936126836004600194146142b5565b5f52600c60205260405f2090828060a01b03928391015416815460018301549060028401549260ff6004600387015496015416956040519760081c168752602087015260408601526060850152608084015260a0830152151560c0820152f35b34610294576020366003190112610294576001600160a01b03612704613b71565b165f52600e602052610ff861271b60405f20613df1565b604051918291602083526020830190613b14565b346102945760203660031901126102945761275560018060a01b03600654163314613e3f565b60206102b160043561430d565b346102945760403660031901126102945760043561277e613b87565b6006546001600160a01b03906127979082163314613e3f565b825f526020906009825260405f20926127b660ff600386015416613e81565b60ff845416600581101561039b5760046127d091146142b5565b845f52600c835260405f20936004850180549560ff87166128de57600301549586156128865760027fd0fa2de7f7d21d53843fbb0cb827be6fe5665338bcb0765f90a84b1c931cce4e979593604097959360016128709460ff1916179055865f526009865261284884868a5f205460081c1689614b53565b865f52601486525f88812055895f52601586525f88812055015461286b89614820565b614820565b61287987614c01565b84519384521690820152a2005b60405162461bcd60e51b815260048101879052602a60248201527f41546f6b656e3a20756e73656375726564202d206e6f20636f6c6c61746572616044820152696c20746f207365697a6560b01b6064820152608490fd5b60405162461bcd60e51b815260048101879052601960248201527f41546f6b656e3a20616c72656164792064656661756c746564000000000000006044820152606490fd5b3461029457602080600319360112610294576001600160a01b039081612947613b71565b165f526010815260405f205f808254915b828110612ab0575061296981613fd2565b936129776040519586613ce3565b81855261298382613fd2565b8582019390601f19013685376129a161299b84613fe9565b93613fe9565b945f90815b838310612a165750505050604051958695606087019060608852518091526080870194915f905b8282106129f957888703858a01528880610ff88a6129eb8b8b613b14565b908382036040850152613b14565b8351811687528998509584019592840192600191909101906129cd565b89612a2784849b9798999a9b6140e0565b919054600392831b1c91825f526009895260ff60405f20918201541615612aa4579160019391612a95935460081c16612a60838a6142a1565b52805f52600b90818a5260405f2054612a79848d6142a1565b525f5288528260405f200154612a8f828d6142a1565b52614102565b925b01919796959493976129a6565b50505091600190612a97565b60ff612ac08286979495966140e0565b9054600391821b1c5f526009845260405f20015416612ae7575b6001019392919093612958565b91612af3600191614102565b929050612ada565b34610294575f366003190112610294576040515f600754612b1b81613c3f565b808452906020906001908181169081156124e35750600114612b4757610ff885610fec81870382613ce3565b60075f90815293507fa66cc928b5edb82af9bd49922954155ab7b0942694bea4ce44661d9a8736c6885b838510612b8d57505050508101602001610fec82610ff861247a565b8054868601840152938201938101612b71565b34610294576020366003190112610294576004355f52600960205260405f20805460ff81169160018060a01b03908160018201541660ff60036002840154930154169260405194600587101561039b5760a096865260081c1660208501526040840152606083015215156080820152f35b34610294576020366003190112610294576004355f52600b602052606060405f20805490600181015490600260018060a01b03910154169060405192835260208301526040820152f35b3461029457612c6936613c0a565b5050505f604051612c7981613cad565b526141ea565b3461029457612c8d36613b9d565b6006546001600160a01b03939190612ca89085163314613e3f565b815f52600960205260405f20612cc460ff600383015416613e81565b549360ff8516600581101561039b57612cdd9015614255565b825f52601460205260405f2054612d47577ff3ece9284d33275d9c297a27c91c816d5543b99eb1a60525f3cee810ed72009191612d3182602093871697612d25891515613f16565b60081c16958686614b53565b835f52600a82528060405f2055604051908152a4005b60405162461bcd60e51b815260206004820152601a60248201527f41546f6b656e3a20746f6b656e20697320696e20657363726f770000000000006044820152606490fd5b34610294575f366003190112610294576006546040516001600160a01b039091168152602090f35b34610294576020366003190112610294576004355f526016602052610ff8610fec60405f20613d04565b3461029457608036600319011261029457612df7613b71565b6001600160401b0360243581811161029457612e17903690600401613bdd565b929060443592606435612e5760018060a01b03612e3981600654163314613e3f565b851694612e478615156141a8565b612e5287151561415c565b614a18565b9460405193612e6585613c92565b5f8552602097888601955f87526004898b612ebd604085015f8152600a60608701935f855260808801958c87525f525260405f209551865560019b518c870155511515600286019060ff801983541691151516179055565b5160038401555191015580612f5b575b5050604051936060850193841185851017611b1e57869460028994612f4c937f6c96f21f0d48881f19859561dc00eb95e4ca177c49329b14757f453a80632314976040528584528684019182526040840191818352895f52600d885260405f2094518555519084015551151591019060ff801983541691151516179055565b604051908152a3604051908152f35b6016895260405f2091858211611b1e578190612f778454613c3f565b8b601f821161301d575b50505f90601f8311600114612fbc575f92612fb1575b50505f19600383901b1c191690861b1790555b8780612ecd565b013590508a80612f97565b5f8581528c81208a95509290601f198516908e5b8282106130065750508411612fed575b505050811b019055612faa565b01355f19600384901b60f8161c191690558a8080612fe0565b8385013586558c979095019492830192018e612fd0565b61304691865f52815f2090601f860160051c820192861061304d575b601f0160051c019061402e565b8b8b612f81565b9091508190613039565b346102945760207fb17c70d92f1780ea5ad52847b248514caeb1b9ae5ae7d140519f5b97d5f15beb61308836613bc7565b6130a060018060a09694961b03600654163314613e3f565b835f52600d825280600160405f206130be60ff600283015416614110565b0155604051908152a2005b34610294576020366003190112610294576004355f526015602052602060405f2054604051908152f35b346102945761310136613c0a565b5050506141ea565b346102945760e036600319011261029457613122613b71565b6001600160401b0360243581811161029457613142903690600401613bdd565b6064359260843592918315159060443590828603610294576006546001600160a01b03906131739082163314613e3f565b8816956131818715156141a8565b681b1ae4d6e2ef50000083119081156133fc575b81156133f4575b50156133a3576131ad600498614a18565b9687946040516131bc81613c92565b84815260209a8b96878301948552604083019081526060830160a4358152613217608085019260c43584528b5f52600a8b5260405f2095518655600197516001870155511515600286019060ff801983541691151516179055565b516003840155519101558261325d575b5050507fac3dcdc20bb35a0f2b39fb2ddbe12a30d20c4795d2026bf2fc48df3ce84ca67d929350604051908152a3604051908152f35b919450926016905260405f20908411611b1e578693889361327e8354613c3f565b601f8111613375575b505f90601f83116001146132ea575081907fac3dcdc20bb35a0f2b39fb2ddbe12a30d20c4795d2026bf2fc48df3ce84ca67d96975f926132df575b50508160011b915f199060031b1c19161790555b83928880613227565b013590508a806132c2565b919690601f198816845f52865f20935f905b82821061335b5750509160019391897fac3dcdc20bb35a0f2b39fb2ddbe12a30d20c4795d2026bf2fc48df3ce84ca67d999a9410613342575b505050811b0190556132d6565b01355f19600384901b60f8161c191690558a8080613335565b8484013586558c99509485019492880192908801906132fc565b61339d90845f52865f20601f850160051c81019188861061304d57601f0160051c019061402e565b8a613287565b60405162461bcd60e51b8152602060048201526024808201527f41546f6b656e3a2062656c6f7720726567697374726174696f6e2074687265736044820152631a1bdb1960e21b6064820152608490fd5b90508961319c565b603289119150613195565b346102945760407f9dae2ddac3a1a911f3ae41718d027fab81ef970ccb1c31cb9000a95d086d4aff61343836613bc7565b61345060018060a09694961b03600654163314613e3f565b835f52600d602052815f209061346c60ff600284015416614110565b61347781151561415c565b808254925582519182526020820152a2005b34610294576020366003190112610294576004355f52600c60205260a060405f20805490600181015490600281015460ff60046003840154930154169260405194855260208501526040840152606083015215156080820152f35b34610294576040366003190112610294576134fd613b71565b5060405162461bcd60e51b815260206004820152602760248201527f41546f6b656e3a20617070726f76616c732064697361626c6564202d2075736560448201526620436f6c6f6e7960c81b6064820152608490fd5b346102945760203660031901126102945760043561357081614b19565b505f526004602052602060018060a01b0360405f205416604051908152f35b346102945761359d36613bc7565b906135b360018060a01b03600654163314613e3f565b5f91815f52602091600960205260405f209260ff6003946135d982600383015416613e81565b5416600581101561039b576135f16001809214613ec0565b825f52600b60205260405f2094600586019560038101836001600484019301945b613622575b60208a604051908152f35b885482548110806136a6575b156136a0578761363e82866140e0565b905490871b1c9b8c80895490613653916140f5565b895561365e916140f5565b9b604051908382528982015260407fa8244a340c825298b79cfc32334fed512284c91d293cc65ee0e37ba288687d1291a261369890614102565b895580613612565b50613617565b50886136b282856140e0565b905490871b1c111561362e565b34610294576136cd36613b9d565b6136e560018060a09594951b03600654163314613e3f565b815f52600960205260405f209161370260ff600385015416613e81565b825460ff8116600581101561039b57600161371d9114613ec0565b6137316001600160a01b0386161515613f16565b60081c6001600160a01b039081169085161461395357805f52600b60205260405f209382151580613945575b61376690613f5b565b6137a960018060a01b03600287015416956002860154906001810161378c878254613fb1565b9055613799868254613fb1565b80915515613937575b868361490c565b93604051956137b787613cad565b5f87526040516137c681613cad565b5f8152604051976137d689613c77565b868952602089019187835260408a019084825260608b0192835260808b01525f60a08b0152885f52600b60205260405f20928a518455516001840155600283019060018060a01b039051166001600160601b0360a01b825416179055600382019051908151916001600160401b038311611b1e576020906138578484614065565b01905f5260205f205f5b8381106139235750505050600481019760808101518051906001600160401b038211611b1e57602090613894838d614065565b01995f5260205f20995f905b82821061390f5750505060209850926138ea8860409481989794600560a07f6dfb44ecd6d25774bd51e42e44a046178b5ca77e149cd347083ca6bf286a04ee990151910155614ab8565b5482516001600160a01b0392831681528981019790975260081c1694a4604051908152f35b80518c8301556001909101906020016138a0565b600190602084519401938184015501613861565b61394084614820565b6137a2565b50600185015483111561375d565b60405162461bcd60e51b815260206004820152601560248201527420aa37b5b2b71d1039b2b63316ba3930b739b332b960591b6044820152606490fd5b34610294575f366003190112610294576040515f80546139af81613c3f565b808452906020906001908181169081156124e357506001146139db57610ff885610fec81870382613ce3565b5f80805293507f290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e5635b838510613a1f57505050508101602001610fec82610ff861247a565b8054868601840152938201938101613a03565b346102945760203660031901126102945760043563ffffffff60e01b8116809103610294576020906380ac58cd60e01b8114908115613a8f575b8115613a7e575b506040519015158152f35b6301ffc9a760e01b14905082613a73565b635b5e139f60e01b81149150613a6c565b34610294575f366003190112610294576012549081815260208082019260125f527fbb8a6a4669ba250d26cd7a459eca9d215f8307e33aebe50379bc5a3617ec3444915f905b828210613afd57610ff88561271b81890382613ce3565b835486529485019460019384019390910190613ae6565b9081518082526020808093019301915f5b828110613b33575050505090565b835185529381019392810192600101613b25565b602060409281835280519182918282860152018484015e5f828201840152601f01601f1916010190565b600435906001600160a01b038216820361029457565b602435906001600160a01b038216820361029457565b606090600319011261029457600435906024356001600160a01b0381168103610294579060443590565b6040906003190112610294576004359060243590565b9181601f84011215610294578235916001600160401b038311610294576020838186019501011161029457565b6060906003190112610294576001600160a01b0390600435828116810361029457916024359081168103610294579060443590565b90600182811c92168015613c6d575b6020831014613c5957565b634e487b7160e01b5f52602260045260245ffd5b91607f1691613c4e565b60c081019081106001600160401b03821117611b1e57604052565b60a081019081106001600160401b03821117611b1e57604052565b602081019081106001600160401b03821117611b1e57604052565b604081019081106001600160401b03821117611b1e57604052565b90601f801991011681019081106001600160401b03821117611b1e57604052565b9060405191825f8254613d1681613c3f565b908184526020946001916001811690815f14613d845750600114613d46575b505050613d4492500383613ce3565b565b5f90815285812095935091905b818310613d6c575050613d4493508201015f8080613d35565b85548884018501529485019487945091830191613d53565b92505050613d4494925060ff191682840152151560051b8201015f8080613d35565b9181601f84011215610294578235916001600160401b038311610294576020808501948460051b01011161029457565b6001600160401b038111611b1e57601f01601f191660200190565b90604051918281549182825260209260208301915f5260205f20935f905b828210613e2557505050613d4492500383613ce3565b855484526001958601958895509381019390910190613e0f565b15613e4657565b60405162461bcd60e51b815260206004820152601360248201527241546f6b656e3a206f6e6c7920436f6c6f6e7960681b6044820152606490fd5b15613e8857565b60405162461bcd60e51b815260206004820152601060248201526f41546f6b656e3a20696e61637469766560801b6044820152606490fd5b15613ec757565b60405162461bcd60e51b815260206004820152602160248201527f41546f6b656e3a206e6f7420616e2065717569747920617373657420746f6b656044820152603760f91b6064820152608490fd5b15613f1d57565b60405162461bcd60e51b815260206004820152601660248201527510551bdad95b8e881e995c9bc81c9958da5c1a595b9d60521b6044820152606490fd5b15613f6257565b60405162461bcd60e51b815260206004820152602160248201527f41546f6b656e3a20696e73756666696369656e7420766573746564207374616b6044820152606560f81b6064820152608490fd5b91908203918211613fbe57565b634e487b7160e01b5f52601160045260245ffd5b6001600160401b038111611b1e5760051b60200190565b90613ff382613fd2565b6140006040519182613ce3565b8281528092614011601f1991613fd2565b0190602036910137565b81810292918115918404141715613fbe57565b818110614039575050565b5f815560010161402e565b80545f825580614052575050565b613d44915f5260205f209081019061402e565b90600160401b8111611b1e5781549080835581811061408357505050565b613d44925f5260205f20918201910161402e565b6012548110156140cc5760125f527fbb8a6a4669ba250d26cd7a459eca9d215f8307e33aebe50379bc5a3617ec344401905f90565b634e487b7160e01b5f52603260045260245ffd5b80548210156140cc575f5260205f2001905f90565b91908201809211613fbe57565b5f198114613fbe5760010190565b1561411757565b60405162461bcd60e51b815260206004820152601860248201527f41546f6b656e3a206e6f742061206c616e6420746f6b656e00000000000000006044820152606490fd5b1561416357565b60405162461bcd60e51b815260206004820152601b60248201527f41546f6b656e3a207a65726f206465636c617265642076616c756500000000006044820152606490fd5b156141af57565b60405162461bcd60e51b815260206004820152601360248201527220aa37b5b2b71d103d32b937903437b63232b960691b6044820152606490fd5b60405162461bcd60e51b815260206004820152603960248201527f41546f6b656e3a2075736520436f6c6f6e792e7472616e73666572417373657460448201527f206f7220436f6c6f6e792e7472616e73666572457175697479000000000000006064820152608490fd5b1561425c57565b60405162461bcd60e51b815260206004820152601a60248201527f41546f6b656e3a206e6f7420616e20617373657420746f6b656e0000000000006044820152606490fd5b80518210156140cc5760209160051b010190565b156142bc57565b60405162461bcd60e51b815260206004820152602360248201527f41546f6b656e3a206e6f7420616e206f626c69676174696f6e206c696162696c60448201526269747960e81b6064820152608490fd5b90815f52600960205260405f209161432b60ff600385015416613e81565b60ff835416600581101561039b5760016143459114613ec0565b805f52600b60205260405f209283549361436460018201548096613fb1565b9485156143db57815561437960038201614044565b61438560048201614044565b5f19600582015554156143cd575b60018060a01b03905460081c16907f30b1e484d2ca7dc7dbe479de5ccedb0be1ee291551f3ffb6b3a635a8e0b314406020604051868152a3565b6143d682614820565b614393565b505f9450505050565b805f526020600981526040805f2061440260ff600383015416613e81565b60ff815416600581101561039b57600461441c91146142b5565b835f52600c8352815f2060ff600482015416614557576002810180549160018101549283811015614507578588926144747f906356bce80317bc059cb2958e7e6fe33866824109516f5c5fc466b348171ab193614102565b8095555481519085825289820152a21461449057505050505f90565b6144b692600292855f5260158252805f2054806144e8575b505050015461286b83614820565b6144bf81614c01565b7f22f92762dfcedccf1f7ea1669a43c1407c423106d379901d3187ba7d544de5905f80a2600190565b5f926015918452601481528383812055878452528120555f80806144a8565b855162461bcd60e51b8152600481018890526024808201527f41546f6b656e3a206f626c69676174696f6e20616c726561647920636f6d706c604482015263195d195960e21b6064820152608490fd5b825162461bcd60e51b8152600481018590526024808201527f41546f6b656e3a206f626c69676174696f6e20616c72656164792064656661756044820152631b1d195960e21b6064820152608490fd5b90815491600160401b831015611b1e5782611fb4916001613d44950181556140e0565b92916145d582613fd2565b916145e36040519384613ce3565b829481845260208094019160051b810192831161029457905b8282106146095750505050565b813581529083019083016145fc565b805f52600960205260ff60405f205416600581101561039b5761463b9015614255565b5f52600a60205260405f20906003820154801580156146a1575b61469b5761466b61467092600485015490613fb1565b61401b565b61271091828210156146945754908203828111613fbe576146909161401b565b0490565b5050505f90565b50505490565b506004830154821115614655565b604051906146bc82613cc8565b600582526466616c736560d81b6020830152565b604051906146dd82613cc8565b60048252637472756560e01b6020830152565b6001600160a01b03165f908152600e6020908152604080832080549394939190855b838110614720575050505050565b61472a81836140e0565b9054600391821b1c805f5260098752845f209060ff9182808583015416159182156147c3575b50506147b8575f52600c8752845f20918201541590816147a9575b5080614798575b614782575b506001905b01614712565b600191976147919154906140f5565b9690614777565b506002810154600182015411614772565b9050600482015416155f61476b565b50505060019061477c565b54169050600581101561039b5760041415825f614750565b5f52600d60205260405f209060ff600283015416158015614812575b61480c57600161480992015490613fb1565b90565b50505f90565b5060018201548111156147f7565b805f5260096020526040805f206003810180549060ff82161561490557915460ff199091169091556001600160a01b039061486190849060081c8316615239565b825f526002602052815f205416825f82159283156148d6575b828252600260205284822080546001600160a01b03191690557fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef8280a46148bf575050565b602492505190637e27328960e01b82526004820152fd5b60046020528482206001600160601b0360a01b815416905580825260036020528482208219815401905561487a565b5050505050565b92919260085461491b81614102565b600855809460405161492c81613c92565b60018152602081019060018060a01b03958686169384845287604084019216825260608301908152608083019060018252865f52600960205260405f20935192600584101561039b57845495516001600160a81b031990961660ff9094169390931794891660081b610100600160a81b03169490941783556149e1936003925b89600186019151166001600160601b0360a01b82541617905551600284015551151591019060ff801983541691151516179055565b6149eb8284615305565b15614a00576149f991615482565b1661202257565b604051633250574960e11b81525f6004820152602490fd5b90600854614a2581614102565b600855809260405191614a3783613c92565b5f8352602083019260018060a01b039384841691828252604081015f8152606082015f8152608083019060018252865f52600960205260405f20935192600584101561039b57845495516001600160a81b031990961660ff9094169390931794891660081b610100600160a81b03169490941783556149e1936003926149ac565b60018060a01b031690815f52601160205260405f20815f5260205260ff60405f20541615614ae4575050565b81613d44925f52601160205260405f20825f5260205260405f20600160ff198254161790555f52601060205260405f206145a7565b5f818152600260205260409020546001600160a01b0316908115614b3b575090565b60249060405190637e27328960e01b82526004820152fd5b91614b5e8383615239565b5f8381526009602052604090208054610100600160a81b031916600883901b610100600160a81b0316179055614b948382615305565b6001600160a01b039080821615614a0057614bb0848392615482565b169182614bd057604051637e27328960e01b815260048101859052602490fd5b1691828203614bde57505050565b60649350604051926364283d7b60e01b8452600484015260248301526044820152fd5b805f52601360205260405f2054601254905f1991828101908111613fbe57808203614c75575b50506012548015614c615701614c4f614c3f82614097565b8154905f199060031b1b19169055565b6012555f5260136020525f6040812055565b634e487b7160e01b5f52603160045260245ffd5b614c7e90614097565b90549060031b1c614c9281611fb484614097565b5f52601360205260405f20555f80614c27565b60018060a01b039081811691825f52602091600e602052604092835f20905f918054925b838110614de2575050505060085493614ce185614102565b6008558351614cef81613c92565b6002815260208101908282528581015f8152606082015f8152608083019060018252895f526009602052885f20935192600584101561039b57845495516001600160a81b031990961660ff9094169390931794881660081b610100600160a81b0316949094178355614d939360039288600186019151166001600160601b0360a01b82541617905551600284015551151591019060ff801983541691151516179055565b614d9d8583615305565b15614dcb5783614dac91615482565b16614db5575090565b516339e3563760e11b81525f6004820152602490fd5b8251633250574960e11b81525f6004820152602490fd5b614dec81836140e0565b9054600391821b1c90815f5260099081865260ff90818b5f205416600581101561039b576002149283614e36575b505050614e2a5750600101614cc9565b97505050505050505090565b90919250835f528652895f200154165f8080614e1a565b600581101561039b578015614f515760018114614f285760028114614efb5760038114614ece57600414614e9e57604051614e8781613cc8565b60078152662aa725a727aba760c91b602082015290565b604051614eaa81613cc8565b60148152734f424c49474154494f4e5f4c494142494c49545960601b602082015290565b50604051614edb81613cc8565b601081526f13d0931251d0551253d397d054d4d15560821b602082015290565b50604051614f0881613cc8565b601081526f4551554954595f4c494142494c49545960801b602082015290565b50604051614f3581613cc8565b600c81526b11545552551657d054d4d15560a21b602082015290565b50604051614f5e81613cc8565b600a8152691553925310551154905360b21b602082015290565b8060405191606083018381106001600160401b03821117611b1e57604052602a8352602080840160403682378451156140cc5760309053835190600191600110156140cc5790607860218601536029915b818311614ffa57505050614fdb575090565b6044906040519063e22e27eb60e01b8252600482015260146024820152fd5b909192600f811660108110156140cc5786518510156140cc576f181899199a1a9b1b9c1cb0b131b232b360811b901a86850183015360041c928015613fbe575f19019190614fc9565b805f917a184f03e93ff9f4daa797ed6e38ed64bf6a1f0100000000000000008082101561519c575b506d04ee2d6d415b85acef81000000008083101561518d575b50662386f26fc100008083101561517e575b506305f5e1008083101561516f575b5061271080831015615160575b506064821015615150575b600a80921015615146575b60019081602160018601956150dc87613dd6565b966150ea6040519889613ce3565b8088526150f9601f1991613dd6565b01366020890137860101905b615111575b5050505090565b5f19019083906f181899199a1a9b1b9c1cb0b131b232b360811b8282061a83530491821561514157919082615105565b61510a565b91600101916150c8565b91906064600291049101916150bd565b6004919392049101915f6150b2565b6008919392049101915f6150a5565b6010919392049101915f615096565b6020919392049101915f615084565b60409350810491505f61506b565b7f3c7465787420783d223230302220793d223334302220666f6e742d66616d696c81527f793d226d6f6e6f73706163652220666f6e742d73697a653d223131222066696c60208201527f6c3d22233535352220746578742d616e63686f723d226d6964646c6522206c656040820152703a3a32b916b9b830b1b4b7339e9119111f60791b606082015260710190565b6001600160a01b03165f818152600f60209081526040808320858452825280832054848452600e835292819020545f19959194919390868101908111613fbe578082036152ba575b5050805f52600e8252835f208054958615614c61575f9601906152a7614c3f83836140e0565b558452600f815282842091845252812055565b6152cd90835f52600e8552865f206140e0565b90549060031b1c825f52600e84526152eb81611fb484895f206140e0565b825f52600f8452855f20905f528352845f20555f80615281565b90613d449160018060a01b0316805f52600e60205260405f2054600f60205260405f20835f5260205260405f20555f52600e60205260405f206145a7565b80511561546f578051916002808401809411613fbe57600393849004600281901b91906001600160fe1b03811603613fbe5793604051937f4142434445464748494a4b4c4d4e4f505152535455565758595a616263646566601f52603f917f6768696a6b6c6d6e6f707172737475767778797a303132333435363738392b2f603f5260208601928291835184019160208301998a51945f8c525b8481106154335750505050509060039160209596975251068060011461541e57600214615411575b50808452830101604052565b603d905f1901535f615405565b50603d90815f1982015360011901535f615405565b836004919c95989c019b838d51818160121c165183538181600c1c16516001840153818160061c1651858401531651858201530196939a6153dd565b5060405161547c81613cad565b5f815290565b5f828152600260205260409020546001600160a01b03908116929183615508575b16806154f0575b815f52600260205260405f20816001600160601b0360a01b825416179055827fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef5f80a490565b805f52600360205260405f20600181540190556154aa565b600460205260405f206001600160601b0360a01b8154169055835f52600360205260405f205f1981540190556154a356fea2646970667358221220f1aabe2bd4835536bff6811b03b797cfe96500207acb35c0c1b3ccc5d8224d9364736f6c63430008190033"
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
    "bytecode": "0x608034606f57601f6109e238819003918201601f19168301916001600160401b03831184841017607357808492602094604052833981010312606f57516001600160a01b03811690819003606f575f80546001600160a01b03191691909117905560405161095a90816100888239f35b5f80fd5b634e487b7160e01b5f52604160045260245ffdfe608060409080825260049081361015610016575f80fd5b5f3560e01c908163050ff707146107b857508063078d4c2b14610666578063158905e8146104d8578063349ff770146104b15780633f0e5ada146103ad5780637a522e021461031657806390e2d2cc146102f8578063916b6c4b1461025b5763ebe71a5f14610083575f80fd5b3461025757816003193601126102575767ffffffffffffffff8135818111610257576100b29036908401610802565b929091602490602435908111610257576100cf9036908401610802565b95909160018060a01b0393845f54169783518099634d853ee560e01b8252818460209c8d935afa90811561024d576101139188915f91610220575b50163314610888565b8088036101dd575f5b88811061012557005b6101308183886108ec565b35670de0b6b3a764000090818102908082048314901517156101cb578861016061015b858e8e6108ec565b610910565b165f5260018c52865f205561017961015b838c8c6108ec565b61018483858a6108ec565b358281029281840414901517156101cb57907f5464440453fc39b658a9b561093845a38ca97029be9942ab109286c83ab820a28c8a600195948a519485521692a20161011c565b85601186634e487b7160e01b5f52525ffd5b835162461bcd60e51b81528083018a9052601b60248201527f4d434342696c6c696e673a206c656e677468206d69736d6174636800000000006044820152606490fd5b61024091508c8d3d10610246575b6102388183610833565b810190610869565b5f61010a565b503d61022e565b85513d5f823e3d90fd5b5f80fd5b5034610257575f366003190112610257575f548251634d853ee560e01b81526001600160a01b039290916020918391829086165afa9081156102ee576102ab93505f916102d55750163314610888565b5f6002557f90101c41c01c8c5597abff0f6dfac9deda2262990f3a32bca35cca06b3b9ec255f80a1005b610240915060203d602011610246576102388183610833565b83513d5f823e3d90fd5b8234610257575f366003190112610257576020906002549051908152f35b5034610257576020366003190112610257576103306107ec565b5f548351634d853ee560e01b8152926001600160a01b0392916020918591829086165afa80156103a35782610370915f9586916102d55750163314610888565b169182825260016020528120557fcb2977ef021a9b6164dd76c1a65eb5f89dc79216151911b46665d48b49d5434a5f80a2005b84513d5f823e3d90fd5b50346102575760208060031936011261025757813567ffffffffffffffff811161025757826103e0859236908301610802565b9390916103ec856108d4565b946103f985519687610833565b808652610405816108d4565b8684019490601f19013686375f5b82811061045a575050505082519384938285019183865251809252840192915f5b82811061044357505050500390f35b835185528695509381019392810192600101610434565b959694956001600160a01b0361047461015b8386866108ec565b165f5260018552875f2054865182101561049e57600582901b870186015294969594600101610413565b603285634e487b7160e01b5f525260245ffd5b8234610257575f366003190112610257575f5490516001600160a01b039091168152602090f35b5090346102575780600319360112610257576104f26107ec565b5f548251634d853ee560e01b81526001600160a01b0391821693602093602435939192858189818a5afa9081156103a3578387939261053a925f9161064f5750163314610888565b602484518094819363f3caad0360e01b83521698898b8301525afa908115610645575f9161060f575b50156105cd57670de0b6b3a7640000918281029281840414901517156105ba57837f5464440453fc39b658a9b561093845a38ca97029be9942ab109286c83ab820a29495505f526001835281815f205551908152a2005b601185634e487b7160e01b5f525260245ffd5b5162461bcd60e51b8152808501839052601960248201527f4d434342696c6c696e673a206e6f74206120636974697a656e000000000000006044820152606490fd5b90508381813d831161063e575b6106268183610833565b8101031261025757518015158103610257575f610563565b503d61061c565b82513d5f823e3d90fd5b6102409150853d8711610246576102388183610833565b50346102575760209081600319360112610257576106826107ec565b5f548451634d853ee560e01b81526001600160a01b039291859082908690829087165afa9081156107ae576106c29184915f916107975750163314610888565b1692835f5260018352805f2054918215610756576002549083820180921161074357506002555f84815260018452818120555190815282917f8d40b1e890ced9adf397d25a06046df796e132dd75cbfb5a21c868c2b4a4a75e91a27fcb2977ef021a9b6164dd76c1a65eb5f89dc79216151911b46665d48b49d5434a5f80a2005b601190634e487b7160e01b5f525260245ffd5b83606492519162461bcd60e51b8352820152601f60248201527f4d434342696c6c696e673a206e6f206f75747374616e64696e672062696c6c006044820152fd5b6102409150873d8911610246576102388183610833565b86513d5f823e3d90fd5b839034610257576020366003190112610257576020916001600160a01b036107de6107ec565b165f52600183525f20548152f35b600435906001600160a01b038216820361025757565b9181601f840112156102575782359167ffffffffffffffff8311610257576020808501948460051b01011161025757565b90601f8019910116810190811067ffffffffffffffff82111761085557604052565b634e487b7160e01b5f52604160045260245ffd5b9081602091031261025757516001600160a01b03811681036102575790565b1561088f57565b60405162461bcd60e51b815260206004820152601760248201527f4d434342696c6c696e673a206e6f7420666f756e6465720000000000000000006044820152606490fd5b67ffffffffffffffff81116108555760051b60200190565b91908110156108fc5760051b0190565b634e487b7160e01b5f52603260045260245ffd5b356001600160a01b0381168103610257579056fea2646970667358221220574bb95c11a7069f7fdc654ae45b2abf017569d181231ffeb63be4290da8e95464736f6c63430008190033"
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
    "bytecode": "0x608034606f57601f6110b138819003918201601f19168301916001600160401b03831184841017607357808492602094604052833981010312606f57516001600160a01b03811690819003606f575f80546001600160a01b03191691909117905560405161102990816100888239f35b5f80fd5b634e487b7160e01b5f52604160045260245ffdfe60808060405260049081361015610014575f80fd5b5f3560e01c9081630623752614610bb957508063349ff77014610b925780633f9b49461461070b5780635d8e843a14610312578063754178511461013a57639b66b13914610060575f80fd5b34610136576020366003190112610136575f54604051634d853ee560e01b815282359290916001600160a01b0391602091849190829085165afa801561012b576100b4925f916100fc575b50163314610cc6565b6100c16001548210610e75565b60036100cc82610d58565b5001805460ff191690557f419a91c001167ea76233ed548fd1a02c21b5b63f8b6eaa7dd5747aac879148925f80a2005b61011e915060203d602011610124575b6101168183610c71565b810190610ca7565b5f6100ab565b503d61010c565b6040513d5f823e3d90fd5b5f80fd5b34610136575f36600319011261013657600180545f90815b8181106102dc575061016382610edc565b916101716040519384610c71565b80835261017d81610edc565b60208481019591601f190136873761019483610ef4565b916101a76101a185610ef4565b94610ef4565b945f805b82811061022557505050604051956080870190608088525180915260a0870197925f5b8281106102125750878061020e896102008a6101f28f8c8782036020890152610c01565b908582036040870152610c01565b908382036060850152610c01565b0390f35b84518a52988101989381019383016101ce565b928360ff600361023784989c97610d58565b5001541661024a575b01979392976101ab565b91808361025a6102d69388610f3d565b5261026d61026785610d58565b50610f51565b610277828a610f3d565b526102828189610f3d565b506102978361029086610d58565b5001610f51565b6102a1828b610f3d565b526102ac818a610f3d565b506102bb600261029086610d58565b6102c5828c610f3d565b526102d0818b610f3d565b50610eba565b91610240565b60ff60036102ec83969596610d58565b500154166102ff575b8201929192610152565b9261030a8391610eba565b9390506102f5565b50346101365760803660031901126101365780356024359167ffffffffffffffff92838111610136576103489036908301610bd3565b91604435858111610136576103609036908301610bd3565b9590606435828111610136576103799036908501610bd3565b97909360018060a01b0392835f5416604051948591634d853ee560e01b8352828560209889935afa801561012b576103ba925f916106f45750163314610cc6565b6001926103c984548b10610e75565b60ff60036103d68c610d58565b50015416156106b0576103e88a610d58565b50868a1161062c576104048a6103fe8354610da4565b83610ddc565b5f8a601f811160011461064a5780610430925f9161063f575b508160011b915f199060031b1c19161790565b90555b8361043d8b610d58565b50019186821161062c5761045b826104558554610da4565b85610ddc565b5f90601f83116001146105cc5761048992915f91836105c1575b50508160011b915f199060031b1c19161790565b90555b600261049789610d58565b50019389116105ae57506104af886104558554610da4565b5f91601f8911600114610524575050918691610505837f6e5513e8628895f1ea4671eaffcf4e0a879285edf1a0d5135d5f1c5b1148a4179899610514965f9161051957508160011b915f199060031b1c19161790565b90555b60405194859485610e4b565b0390a2005b90508401355f61041d565b9091601f198916845f52825f20925f905b828210610597575050916105149593918a7f6e5513e8628895f1ea4671eaffcf4e0a879285edf1a0d5135d5f1c5b1148a4179a9b96941061057e575b505083811b019055610508565b8401355f19600387901b60f8161c191690555f80610571565b808685968294968b01358155019501930190610535565b604190634e487b7160e01b5f525260245ffd5b013590505f80610475565b90859291601f19831691855f52885f20925f5b8a82821061061657505084116105fd575b505050811b01905561048c565b01355f19600384901b60f8161c191690555f80806105f0565b8385013586558a979095019492830192016105df565b604184634e487b7160e01b5f525260245ffd5b90508b01355f61041d565b50601f198b1690825f528b885f20928c8a8a5f925b84841061069757505050501061067e575b5050848a811b019055610433565b8a01355f1960038d901b60f8161c191690555f80610670565b860135875590950194938401938f9350018a8a8f61065f565b60405162461bcd60e51b8152808401869052601c60248201527f4d434353657276696365733a20736572766963652072656d6f766564000000006044820152606490fd5b61011e9150873d8911610124576101168183610c71565b50346101365760603660031901126101365767ffffffffffffffff81358181116101365761073c9036908401610bd3565b602492919235828111610136576107569036908601610bd3565b939092604435818111610136576107709036908801610bd3565b918760018060a01b036020815f541660405193848092634d853ee560e01b82525afa801561012b576107ab925f916100fc5750163314610cc6565b8415610b4e5760015495604051976080890189811084821117610b16576040526107e491906107db368989610d12565b8a523691610d12565b60208801526107f4368484610d12565b60408801526001606088015268010000000000000000861015610b3b576001860160015561082186610d58565b919091610b29578751805190828211610b1657610848826108428654610da4565b86610ddc565b602090601f8311600114610ab25761087692915f91836109835750508160011b915f199060031b1c19161790565b82555b600182016020890151805190838211610a9f5761089a826104558554610da4565b602090601f8311600114610a37576108c892915f91836109835750508160011b915f199060031b1c19161790565b90555b60408801518051918211610a2457602099506108f7826108ee6002860154610da4565b60028601610ddc565b8990601f831160011461098e5760037fddcfb03769e1dafa409f0203646fccd45573c7e7ee64130e14f26454b70eb97a989796946109548561097898968d9e966060965f926109835750508160011b915f199060031b1c19161790565b60028201555b01910151151560ff8019835416911617905560405194859485610e4b565b0390a2604051908152f35b015190505f80610475565b90601f19831691600285015f528b5f20925f5b818110610a0d5750946001858c9d956060956003956109789b997fddcfb03769e1dafa409f0203646fccd45573c7e7ee64130e14f26454b70eb97a9f9e9d9b106109f6575b505050811b01600282015561095a565b01515f1983871b60f8161c191690555f80806109e6565b92938d6001819287860151815501950193016109a1565b60418a634e487b7160e01b5f525260245ffd5b9190835f5260205f20905f935b601f1984168510610a84576001945083601f19811610610a6c575b505050811b0190556108cb565b01515f1960f88460031b161c191690555f8080610a5f565b81810151835560209485019460019093019290910190610a44565b60418c634e487b7160e01b5f525260245ffd5b90601f19831691855f5260205f20925f5b818110610afe5750908460019594939210610ae6575b505050811b018255610879565b01515f1960f88460031b161c191690555f8080610ad9565b92936020600181928786015181550195019301610ac3565b60418b634e487b7160e01b5f525260245ffd5b5f89634e487b7160e01b82525260245ffd5b604188634e487b7160e01b5f525260245ffd5b60405162461bcd60e51b81526020818a0152601a60248201527f4d434353657276696365733a206e616d652072657175697265640000000000006044820152606490fd5b34610136575f366003190112610136575f546040516001600160a01b039091168152602090f35b34610136575f366003190112610136576020906001548152f35b9181601f840112156101365782359167ffffffffffffffff8311610136576020838186019501011161013657565b908082519081815260208091019281808460051b8301019501935f915b848310610c2e5750505050505090565b909192939495848080600193601f1980878303018852601f838d518051918291828752018686015e5f858286010152011601019801930193019194939290610c1e565b90601f8019910116810190811067ffffffffffffffff821117610c9357604052565b634e487b7160e01b5f52604160045260245ffd5b9081602091031261013657516001600160a01b03811681036101365790565b15610ccd57565b60405162461bcd60e51b815260206004820152601f60248201527f4d434353657276696365733a206e6f7420636f6c6f6e7920666f756e646572006044820152606490fd5b92919267ffffffffffffffff8211610c935760405191610d3c601f8201601f191660200184610c71565b829481845281830111610136578281602093845f960137010152565b600154811015610d905760015f5260021b7fb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf601905f90565b634e487b7160e01b5f52603260045260245ffd5b90600182811c92168015610dd2575b6020831014610dbe57565b634e487b7160e01b5f52602260045260245ffd5b91607f1691610db3565b601f8211610de957505050565b5f5260205f20906020601f840160051c83019310610e21575b601f0160051c01905b818110610e16575050565b5f8155600101610e0b565b9091508190610e02565b908060209392818452848401375f828201840152601f01601f1916010190565b9290610e6490610e729593604086526040860191610e2b565b926020818503910152610e2b565b90565b15610e7c57565b60405162461bcd60e51b81526020600482015260166024820152751350d0d4d95c9d9a58d95cce881b9bdd08199bdd5b9960521b6044820152606490fd5b5f198114610ec85760010190565b634e487b7160e01b5f52601160045260245ffd5b67ffffffffffffffff8111610c935760051b60200190565b90610efe82610edc565b610f0b6040519182610c71565b8281528092610f1c601f1991610edc565b01905f5b828110610f2c57505050565b806060602080938501015201610f20565b8051821015610d905760209160051b010190565b9060405191825f8254610f6381610da4565b908184526020946001916001811690815f14610fd15750600114610f93575b505050610f9192500383610c71565b565b5f90815285812095935091905b818310610fb9575050610f9193508201015f8080610f82565b85548884018501529485019487945091830191610fa0565b92505050610f9194925060ff191682840152151560051b8201015f8080610f8256fea2646970667358221220cab6b6ba14df34603725757fbcd951560e3abad855f706e6201c7dff860b040164736f6c63430008190033"
  },
  "Governance": {
    "abi": [
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "colony_",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "initialCeo",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "initialCfo",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "initialCoo",
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
            "name": "candidate",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "nominatedBy",
            "type": "address"
          }
        ],
        "name": "CandidateNominated",
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
            "internalType": "uint8",
            "name": "role",
            "type": "uint8"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "newHolder",
            "type": "address"
          }
        ],
        "name": "ElectionExecuted",
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
            "internalType": "uint8",
            "name": "role",
            "type": "uint8"
          },
          {
            "indexed": false,
            "internalType": "string",
            "name": "reason",
            "type": "string"
          }
        ],
        "name": "ElectionFailed",
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
            "internalType": "uint8",
            "name": "role",
            "type": "uint8"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "winner",
            "type": "address"
          }
        ],
        "name": "ElectionFinalised",
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
            "internalType": "uint8",
            "name": "role",
            "type": "uint8"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "openedBy",
            "type": "address"
          }
        ],
        "name": "ElectionOpened",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "newCeo",
            "type": "address"
          }
        ],
        "name": "MccOTokenAutoHandedOver",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "oToken",
            "type": "address"
          }
        ],
        "name": "OTokenLinked",
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
            "internalType": "uint256",
            "name": "assetId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "liabilityId",
            "type": "uint256"
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
            "name": "id",
            "type": "uint256"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "proposer",
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
            "internalType": "address",
            "name": "obligor",
            "type": "address"
          }
        ],
        "name": "ObligationProposed",
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
            "name": "signer",
            "type": "address"
          }
        ],
        "name": "ObligationSigned",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint8",
            "name": "role",
            "type": "uint8"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "previousHolder",
            "type": "address"
          }
        ],
        "name": "RoleVacated",
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
            "name": "voter",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "candidate",
            "type": "address"
          }
        ],
        "name": "VoteCast",
        "type": "event"
      },
      {
        "inputs": [],
        "name": "NOMINATION_WINDOW",
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
        "name": "OBLIGATION_EXPIRY",
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
        "name": "TERM",
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
        "name": "TIMELOCK",
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
        "name": "VOTING_WINDOW",
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
            "internalType": "uint8",
            "name": "",
            "type": "uint8"
          }
        ],
        "name": "activeElectionForRole",
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
          },
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "name": "candidateVotes",
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
        "inputs": [],
        "name": "ceoActive",
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
        "name": "ceoTermEnd",
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
        "name": "cfo",
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
        "name": "cfoTermEnd",
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
            "internalType": "contract IColony",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "coo",
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
        "name": "cooTermEnd",
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
          },
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "electionCandidates",
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
        "name": "elections",
        "outputs": [
          {
            "internalType": "uint8",
            "name": "role",
            "type": "uint8"
          },
          {
            "internalType": "address",
            "name": "openedBy",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "openedAt",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "nominationEndsAt",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "votingEndsAt",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "timelockEndsAt",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "winner",
            "type": "address"
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
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "electionId",
            "type": "uint256"
          }
        ],
        "name": "executeElection",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "electionId",
            "type": "uint256"
          }
        ],
        "name": "finaliseElection",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "electionId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "candidate",
            "type": "address"
          }
        ],
        "name": "getCandidateVotes",
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
            "name": "electionId",
            "type": "uint256"
          }
        ],
        "name": "getCandidates",
        "outputs": [
          {
            "internalType": "address[]",
            "name": "",
            "type": "address[]"
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
        "name": "hasVoted",
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
          },
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "name": "isCandidate",
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
            "name": "electionId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "candidate",
            "type": "address"
          }
        ],
        "name": "nominateCandidate",
        "outputs": [],
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
        "inputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "obligations",
        "outputs": [
          {
            "internalType": "address",
            "name": "proposer",
            "type": "address"
          },
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
            "name": "expiresAt",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "creditorSigned",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "obligorSigned",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "executed",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint8",
            "name": "role",
            "type": "uint8"
          }
        ],
        "name": "openElection",
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
            "name": "party",
            "type": "address"
          }
        ],
        "name": "pendingSignaturesFor",
        "outputs": [
          {
            "internalType": "uint256[]",
            "name": "ids",
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
        "name": "proposeObligation",
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
            "internalType": "uint8",
            "name": "role",
            "type": "uint8"
          }
        ],
        "name": "resign",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint8",
            "name": "role",
            "type": "uint8"
          }
        ],
        "name": "roleHolder",
        "outputs": [
          {
            "internalType": "address",
            "name": "holder",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "termEnd",
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
            "name": "oToken_",
            "type": "address"
          }
        ],
        "name": "setOToken",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "obligationId",
            "type": "uint256"
          }
        ],
        "name": "signObligation",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "electionId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "candidate",
            "type": "address"
          }
        ],
        "name": "vote",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ],
    "bytecode": "0x60803461012a57601f6124b138819003918201601f19168301916001600160401b0383118484101761012e5780849260809460405283398101031261012a5761004781610142565b61005360208301610142565b9061006c606061006560408601610142565b9401610142565b60016008556001600160a01b039182169283156100f257829060018060a01b031994855f5416175f55168360015416176001556301e133804201938442116100de5782908560025516836003541617600355836004551690600554161760055560065560405161235a90816101578239f35b634e487b7160e01b5f52601160045260245ffd5b60405162461bcd60e51b815260206004820152601060248201526f476f763a207a65726f20636f6c6f6e7960801b6044820152606490fd5b5f80fd5b634e487b7160e01b5f52604160045260245ffd5b51906001600160a01b038216820361012a5756fe6080604090808252600480361015610015575f80fd5b5f915f3560e01c908162fb3054146119785750806302d947ef1461171d578063054cf5291461170057806305ea879c146116c057806307cdee49146116985780630cb59be3146116645780631a32aad61461163c5780631e352475146113775780631ed203471461134f57806328a67b76146111af5780633173cd2614611193578063349ff7701461116c57806335552ed314610ef35780633e39a7a514610e435780634254582514610dfc578063504b822314610dbc57806353d4d0cd14610ac05780635e6fef0114610a2f5780635ea25e2814610a1057806361b8ce8c146109f157806375a7e6b2146109ac5780637aadef8b1461098f578063824544ab146109725780638bfb1628146109535780638ddc0f57146108b1578063906cc19714610656578063908921fc1461062d5780639dfb05281461060e578063a42c56f7146105bc578063afa9c5b01461057c578063b6899b281461055e578063be299e5614610427578063c5b00e7614610384578063eba108281461028a5763f3151327146101a1575f80fd5b34610286576020366003190112610286576101ba611afb565b600754906001600160a01b0390818316610243571691821561020d57506001600160a01b03191681176007557f366831389f4f096bb0803a95937c9f4e3d41bedc9011b018494030ead45f46208280a280f35b606490602086519162461bcd60e51b8352820152601060248201526f23b7bb1d103d32b9379037aa37b5b2b760811b6044820152fd5b855162461bcd60e51b8152602081860152601760248201527f476f763a206f546f6b656e20616c7265616479207365740000000000000000006044820152606490fd5b5080fd5b50829034610380576020366003190112610380578035808452600960205282842080549193916102c79060081c6001600160a01b03161515611b3a565b6003810154421115610344576005015460ff8160a01c16159081610335575b50156102f957836102f684611fff565b80f35b906020606492519162461bcd60e51b8352820152601660248201527511dbdd8e88185b1c9958591e48199a5b985b1a5cd95960521b6044820152fd5b60ff915060a81c1615856102e6565b815162461bcd60e51b8152602081850152601660248201527523b7bb1d103b37ba34b7339039ba34b6361037b832b760511b6044820152606490fd5b8280fd5b508234610380576020366003190112610380578060ff916101409484358152600f6020522060018060a01b039182825416948360018401541693600284015416906003840154908401549160058501549360076006870154960154968151998a5260208a01528801526060870152608086015260a085015260c0840152818116151560e0840152818160081c16151561010084015260101c161515610120820152f35b503461028657602080600319360112610380579291610444611afb565b9181906001600854905b818110610527575061047761046284611d1c565b9361046f88519586611c1b565b808552611d1c565b8388019590601f1901368737849060015b8381106104cf57505050505083519485948186019282875251809352850193925b8281106104b857505050500390f35b8351855286955093810193928101926001016104a9565b6104df82829b9897999a9b612283565b6104f2575b600101989796949598610488565b6104fb83611bc9565b9288518110156105145760051b880187018190526104e4565b634e487b7160e01b875260328652602487fd5b6105378682999695979899612283565b61054a575b60010196959492939661044e565b94610556600191611bc9565b95905061053c565b8284346102865781600319360112610286576020905162278d008152f35b508290346103805781600319360112610380578160209361059b611ae5565b92358152600b8552209060018060a01b03165f528252805f20549051908152f35b5091903461060b578160031936011261060b5760243592358152600a60205281812090815484101561060b57506020926105f591611b11565b905491519160018060a01b039160031b1c168152f35b80fd5b8284346102865781600319360112610286576020906006549051908152f35b82843461028657816003193601126102865760015490516001600160a01b039091168152602090f35b508234610380578060031936011261038057813591610673611ae5565b908385526020926009845280862092600260018060a01b039461069d86825460081c161515611b3a565b6106ba600582015460ff8160a01c161590816108a2575b50611b86565b0154421161085f576024858589541684519283809263f3caad0360e01b825233898301525afa908115610855578592916106fb918a91610828575b50611cdb565b169384156107f157858752600c8152818720855f52815260ff825f2054166107b757600a90868852600c8152828820865f528152825f20600160ff19825416179055868852528520805491680100000000000000008310156107a457509061076891600182018155611b11565b819291549060031b9184831b921b191617905533917f7c005744a93de4ee44ed13ecdfb6ffd9bf3760a3c6773260c364a930b85a3a778480a480f35b634e487b7160e01b875260419052602486fd5b905162461bcd60e51b815291820152601660248201527511dbdd8e88185b1c9958591e481b9bdb5a5b985d195960521b6044820152606490fd5b905162461bcd60e51b8152918201526013602482015272476f763a207a65726f2063616e64696461746560681b6044820152606490fd5b6108489150883d8a1161084e575b6108408183611c1b565b810190611cc3565b8a6106f5565b503d610836565b83513d8a823e3d90fd5b815162461bcd60e51b8152808401869052601c60248201527f476f763a206e6f6d696e6174696f6e20706861736520636c6f736564000000006044820152606490fd5b60ff915060a81c16158b6106b4565b50823461038057602036600319011261038057813560ff811680910361094f57606093508061091e575060015460025492506001600160a01b03165b6001600160a01b0316918215159081610913575b82519384526020840152151590820152f35b809150421090610901565b600103610939576003549154916001600160a01b03166108ed565b60055460065492506001600160a01b03166108ed565b8380fd5b8284346102865781600319360112610286576020906002549051908152f35b828434610286578160031936011261028657602090516103848152f35b8284346102865781600319360112610286576020905161012c8152f35b50829034610380578160031936011261038057816020936109cb611ae5565b92358152600c8552209060018060a01b03165f52825260ff815f20541690519015158152f35b8284346102865781600319360112610286576020906008549051908152f35b828434610286578160031936011261028657602090516301e133808152f35b508234610380576020366003190112610380578060ff9161012094843581526009602052209283549360018060a01b03916001820154600283015490600560038501549385015494015495858151998981168b5260081c1660208a01528801526060870152608086015260a0850152811660c0840152818160a01c16151560e084015260a81c161515610100820152f35b50829034610380576020928360031936011261060b5781359260ff84168094036102865760028411610d86578154815163f3caad0360e01b815233858201526001600160a01b039187908290602490829086165afa908115610d795790610b2d918591610d5c5750611cdb565b848352600e86528183205480610cc5575b5060085493610b4c85611bc9565b600855610384420190814211610cb257610a8c420191828111610c9f57845192610120840184811067ffffffffffffffff821117610c8c57928a9592899592899589528b845287840191338352898501428152606086019182526080860192835260a086019388855260c087019a898c5260e088019a8a8c5261010089019a808c5252600990528b8d20965160ff16875491600160a81b6101009003905160081b16916affffffffffffffffffffff60a81b1617178655516001860155516002850155516003840155519082015560050193511683549260ff60a01b9051151560a01b169160ff60a81b9051151560a81b169269ffffffffffffffffffff60b01b161717179055838252600e855282818320555192823392807fedeb90c67e377696fdd5d3652b1f7d21ddf6999cbd3f037b3438d5b0e94f051791a48152f35b604184634e487b7160e01b5f525260245ffd5b634e487b7160e01b865260118252602486fd5b634e487b7160e01b855260119052602484fd5b80845260098752828420600581015460ff8160a01c16159081610d4d575b50610cef575b50610b3e565b60030154421115610d0a57610d0390611fff565b8680610ce9565b825162461bcd60e51b8152808601889052601c60248201527f476f763a20656c656374696f6e20616c726561647920616374697665000000006044820152606490fd5b60ff915060a81c161589610ce3565b610d739150883d8a1161084e576108408183611c1b565b886106f5565b50505051903d90823e3d90fd5b5162461bcd60e51b81528083018590526011602482015270476f763a20696e76616c696420726f6c6560781b6044820152606490fd5b8284346102865781600319360112610286576001546020916001600160a01b0390911615159081610df0575b519015158152f35b60025442109150610de8565b82843461028657806003193601126102865760209160ff9082906001600160a01b03610e26611afb565b168152600d85528181206024358252855220541690519015158152f35b50903461060b576020918260031936011261028657929192358152600a8352818120908251808584549182815201908194845286842090845b818110610ed65750505081610e92910382611c1b565b83519485948186019282875251809352850193925b828110610eb657505050500390f35b83516001600160a01b031685528695509381019392810192600101610ea7565b82546001600160a01b031684529288019260019283019201610e7c565b5082903461108957602036600319011261108957803590815f526009602052825f20918183015480156111375742106110fd5760058301928354610f3d60ff8260a01c1615611c3d565b60ff60a01b1916600160a01b178455805460ff165f908152600e60205285812055426301e1338081019081106110ea579060ff918282541680155f1461109a575060018060a01b038654166001600160601b0360a01b60015416176001556002555b54169360018060a01b0394858554169081818451957f8d0f476fe0ab918996e66d3fcc86613080cc5ae2ced0bc6e000b1bc91bf8338b5f80a4158061108d575b610fe7578680f35b8560075416803b15611089576044845f81938195635bf6197960e11b845260018a85015260248401525af19283611056575b505050611029575b808080808680f35b54167f451a3a32dd4e763575b9d9242e8f61d1d75c567096bbcbf2c69bf41cbab657178280a28180611021565b909192955067ffffffffffffffff83116110765750525f92848080611019565b604190634e487b7160e01b5f525260245ffd5b5f80fd5b5085600754161515610fdf565b6001036110c55760018060a01b038654166001600160601b0360a01b60035416176003558455610f9f565b60018060a01b038654166001600160601b0360a01b6005541617600555600655610f9f565b601184634e487b7160e01b5f525260245ffd5b835162461bcd60e51b81526020818401526014602482015273476f763a2074696d656c6f636b2061637469766560601b6044820152606490fd5b845162461bcd60e51b8152602081850152600f60248201526e11dbdd8e881b9bdd081c185cdcd959608a1b6044820152606490fd5b8334611089575f366003190112611089575f5490516001600160a01b039091168152602090f35b8334611089575f36600319011261108957602090516107088152f35b8382346110895760203660031901126110895780355f818152600f602052839020600181015491926001600160a01b039283169190821561130c57600782019384549361120260ff8660101c1615611c3d565b600684015442116112da57331490819382156112c9575b505015611293575061127094501561127257506001815461123d60ff821615611c81565b60ff19161790555b33817f16567314ed943b038abae67538fdb6a167765cae5f965f06481b5dd7d08460835f80a3611ebf565b005b8061128660ff6101009360081c1615611c81565b61ff001916179055611245565b606490602087519162461bcd60e51b8352820152601060248201526f476f763a206e6f74206120706172747960801b6044820152fd5b600291925001541633148780611219565b875162461bcd60e51b8152602081850152600c60248201526b11dbdd8e88195e1c1a5c995960a21b6044820152606490fd5b606490602087519162461bcd60e51b8352820152601760248201527f476f763a2070726f706f73616c206e6f7420666f756e640000000000000000006044820152fd5b8334611089575f3660031901126110895760035490516001600160a01b039091168152602090f35b5082346110895760a036600319011261108957611392611afb565b9061139b611ae5565b606435926001600160a01b0390811691604435919083151580611631575b156115fa578116918284146115c557801561158f57851561155957600854956113e187611bc9565b60085562278d0042019182421161154657865193610140850185811067ffffffffffffffff82111761153357948694898c8a98968d9a968b96849d998552338752602087018a8152858801918a835260608901938452608089019485528060a08a0197608435895260c08b01998a5260e08b01809e331490526101008b019c33148d526101208b019b5f8d525f52600f6020525f20995116916001600160601b0360a01b92838b5416178a558160018b019151168382541617905560028901925116908254161790555160038601555190840155516005830155516006820155600701925115159183549051151560081b61ff00169151151560101b62ff0000169260ff169062ffffff191617171790558351918252602082015233927ffc07e33483690dbe3d63813fd50fc9bd0c6f25df2fb24f2bae9ae5153ef5eab791a361152a82611ebf565b51908152602090f35b60418b634e487b7160e01b5f525260245ffd5b601189634e487b7160e01b5f525260245ffd5b845162461bcd60e51b8152602081890152601060248201526f476f763a207a65726f2065706f63687360801b6044820152606490fd5b845162461bcd60e51b8152602081890152601060248201526f11dbdd8e881e995c9bc8185b5bdd5b9d60821b6044820152606490fd5b845162461bcd60e51b8152602081890152600f60248201526e476f763a2073616d6520706172747960881b6044820152606490fd5b845162461bcd60e51b81526020818901526011602482015270476f763a207a65726f206164647265737360781b6044820152606490fd5b5081811615156113b9565b8334611089575f3660031901126110895760075490516001600160a01b039091168152602090f35b83823461108957602036600319011261108957359060ff8216809203611089576020915f52600e8252805f20549051908152f35b8334611089575f3660031901126110895760055490516001600160a01b039091168152602090f35b5082346110895780600319360112611089576020916116dd611ae5565b90355f52600b8352815f209060018060a01b03165f528252805f20549051908152f35b508234611089575f36600319011261108957602091549051908152f35b50823461108957806003193601126110895781359061173a611ae5565b92825f5260209060098252825f2060018060a01b0361176081835460081c161515611b3a565b61177c600583015460ff8160a01c161590816119695750611b86565b600282015442111561192657600382015442116118ee57855f52600c8452845f20961695865f52835260ff845f205416156118b55760016117bf91015433611d34565b1561187457335f52600d8252825f20845f52825260ff835f20541661183e5750335f52600d8152815f20835f528152815f20600160ff19825416179055600b8152815f2090845f52525f206118148154611bc9565b905533907fcfff1651bcea794952a516ce970ab17518a85210bd939aaeaac670a8d3e65ec75f80a4005b915162461bcd60e51b815291820152601260248201527111dbdd8e88185b1c9958591e481d9bdd195960721b6044820152606490fd5b915162461bcd60e51b815291820152601960248201527f476f763a206e6f7420656c696769626c6520746f20766f7465000000000000006044820152606490fd5b50915162461bcd60e51b8152918201526014602482015273476f763a206e6f7420612063616e64696461746560601b6044820152606490fd5b845162461bcd60e51b8152808401859052601260248201527111dbdd8e881d9bdd1a5b99c818db1bdcd95960721b6044820152606490fd5b845162461bcd60e51b8152808401859052601a60248201527f476f763a206e6f6d696e6174696f6e207374696c6c206f70656e0000000000006044820152606490fd5b60ff915060a81c1615896106b4565b8285346110895760203660031901126110895781359260ff84168094036110895783611a22575060015491906001600160a01b03831633036119f05750506001600160a01b0319166001555f6002555b33907f9a79253d9b7be4b969e0c884499b4cf29ff030d71513cf2a794a0ce6ac148acc5f80a3005b906020606492519162461bcd60e51b8352820152600c60248201526b476f763a206e6f742043454f60a01b6044820152fd5b60018403611a865750600354906001600160a01b0382163303611a5557506001600160a01b0319166003555f90556119c8565b5162461bcd60e51b8152602081840152600c60248201526b476f763a206e6f742043464f60a01b6044820152606490fd5b600554929091506001600160a01b0383163303611ab55750506001600160a01b0319166005555f6006556119c8565b62461bcd60e51b8252602090820152600c60248201526b476f763a206e6f7420434f4f60a01b6044820152606490fd5b602435906001600160a01b038216820361108957565b600435906001600160a01b038216820361108957565b8054821015611b26575f5260205f2001905f90565b634e487b7160e01b5f52603260045260245ffd5b15611b4157565b60405162461bcd60e51b815260206004820152601760248201527f476f763a20656c656374696f6e206e6f7420666f756e640000000000000000006044820152606490fd5b15611b8d57565b60405162461bcd60e51b815260206004820152601460248201527311dbdd8e88195b1958dd1a5bdb8818db1bdcd95960621b6044820152606490fd5b5f198114611bd75760010190565b634e487b7160e01b5f52601160045260245ffd5b6040810190811067ffffffffffffffff821117611c0757604052565b634e487b7160e01b5f52604160045260245ffd5b90601f8019910116810190811067ffffffffffffffff821117611c0757604052565b15611c4457565b60405162461bcd60e51b815260206004820152601560248201527411dbdd8e88185b1c9958591e48195e1958dd5d1959605a1b6044820152606490fd5b15611c8857565b60405162461bcd60e51b815260206004820152601360248201527211dbdd8e88185b1c9958591e481cda59db9959606a1b6044820152606490fd5b90816020910312611089575180151581036110895790565b15611ce257565b60405162461bcd60e51b815260206004820152601260248201527123b7bb1d103737ba10309031b4ba34bd32b760711b6044820152606490fd5b67ffffffffffffffff8111611c075760051b60200190565b5f546040805163f3caad0360e01b81526001600160a01b039384166004820181905291949390921691602091908281602481875afa908115611e98575f91611ea2575b5015611e585784516327c2781760e21b8152600481018290528281602481875afa908115611e98575f91611e6b575b508015611e61576107b26301e1338042048101809111611bd75760128201809211611bd75710611e58578190602486518095819363ab34c9e960e01b835260048301525afa938415611e4f57505f93611e1f575b50508115159182611e15575b5050611e1157600190565b5f90565b1190505f80611e06565b9080929350813d8311611e48575b611e378183611c1b565b810103126110895751905f80611dfa565b503d611e2d565b513d5f823e3d90fd5b50505050505f90565b5050505050505f90565b90508281813d8311611e91575b611e828183611c1b565b8101031261108957515f611da6565b503d611e78565b86513d5f823e3d90fd5b611eb99150833d851161084e576108408183611c1b565b5f611d77565b805f52600f6020526040805f209060078201805460ff8116158015611ff1575b611fea57620100009062ff000019161790558060018060a01b0360a4815f5416915f81600188015416916002880154169360038801549760056004820154910154908751998a97889663abaafd5d60e01b8852600488015260248701526044860152606485015260848401525af18015611fe0575f905f90611f8c575b7ff4e1cd9103c3fc01d73753b86a383ab06ed248a706a741fbf44b90b362a1c2f2935082519182526020820152a2565b50508082813d8311611fd9575b611fa38183611c1b565b81010312611089578160207ff4e1cd9103c3fc01d73753b86a383ab06ed248a706a741fbf44b90b362a1c2f29351910151611f5c565b503d611f99565b50513d5f823e3d90fd5b5050505050565b5060ff8160081c1615611edf565b805f526020600981526040805f2091600a8152815f20805415612209575f905f80915f81545b808210612178575050501580918115612170575b506120a457506005840180546001600160a01b0319166001600160a01b0390921691821790554261012c8101908110611bd7578460ff9160047f59cbc640648b8bac21e2030b7478e317b2afa5c7085d4f26e7e60eab5cc9c3a49701555416918351928352820152a2565b90506060919260ff8560057f520dd80ce0eeb010d8b337869396480515b159773381903474a07c9043d1eaed9701600160a81b8360a81b19825416179055818154165f52600e86525f838120555416915f1461215057805161210581611beb565b600d81526c1b9bc81d9bdd195cc818d85cdd609a1b85820152905b805194859384528181850152825192838093860152018484015e5f828201840152601f01601f19168101030190a2565b805161215b81611beb565b600381526274696560e81b8582015290612120565b90505f612039565b9194909392895f52600b8752875f20916121928688611b11565b95909360018060a01b03809554600398891b1c165f528952895f2054928084115f146121da57505050926121c68587611b11565b9054911b1c169360015f945b019091612025565b9550959185919793501480612200575b6121f7575b6001906121d2565b600194506121ef565b508315156121ea565b5060058301805460ff60a81b1916600160a81b179055825460ff9081165f908152600e83528381205592548251931683528201819052600d908201526c6e6f2063616e6469646174657360981b60608201527f520dd80ce0eeb010d8b337869396480515b159773381903474a07c9043d1eaed90608090a2565b5f52600f60205260405f209060018060a01b03806001840154169182158015612313575b61230b576006840154421161230b578116918214806122fc575b6122f4576002830154161490816122e1575b506122dc575f90565b600190565b60ff91506007015460081c16155f6122d3565b505050600190565b5060ff600784015416156122c1565b505050505f90565b5060ff600785015460101c166122a756fea264697066735822122065d155cc54fd1676fad1940753bcba9cfcfd244e33d2f2c18a70f5f0fbe2ac5264736f6c63430008190033"
  }
};
