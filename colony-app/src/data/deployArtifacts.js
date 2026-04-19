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
    "bytecode": "0x608034609557601f61115d38819003918201601f19168301916001600160401b0383118484101760995780849260609460405283398101031260955760428160ad565b906057604060516020840160ad565b920160ad565b60018060a01b0380928160018060a01b03199516855f5416175f55168360015416176001551690600254161760025560405161109c90816100c18239f35b5f80fd5b634e487b7160e01b5f52604160045260245ffd5b51906001600160a01b038216820360955756fe6080806040526004361015610012575f80fd5b5f905f3560e01c9081631a32aad614610a7357508063349ff77014610a4c5780633b56fd44146101b657806357d13917146100a957806359659e901461008057638e75dd4714610060575f80fd5b3461007d578060031936011261007d576020600354604051908152f35b80fd5b503461007d578060031936011261007d576002546040516001600160a01b039091168152602090f35b503461007d576020806003193601126101b2576100c7600435610ba0565b509060018060a01b0391600192806001830154169060028301541660038301549160048401549360405196888254926100ff84610bd9565b808b52936001811690811561018e5750600114610155575b5050505061012a8661013e980387610b07565b60405196879660a0885260a0880190610ac7565b948601526040850152606084015260808301520390f35b90809a50528689205b828a1061017b5750505061012a868661013e99820101985f610117565b8054898b0189015298870198810161015e565b60ff19168a8c015250505050151560051b86018501965061012a8661013e5f610117565b5080fd5b50346108375760803660031901126108375760043567ffffffffffffffff811161083757366023820112156108375767ffffffffffffffff816004013511610837573660248260040135830101116108375760243567ffffffffffffffff811161083757610228903690600401610a96565b9060443567ffffffffffffffff811161083757610249903690600401610a96565b91906064359260ff84168403610837575f5460405163f3caad0360e01b81523360048201526001600160a01b0390911690602081602481855afa90811561082c575f91610a11575b50156109cc57866004013515610987578515610942578186036108fd575f805b8382106108c95761271091500361086f5760405190630f76f81b60e31b602083015260248201526060604482015261030e816102f8608482018a6004013560248c01610b4d565b336064830152601f198282030182520382610b07565b60025460405191906001600160a01b031667ffffffffffffffff6104558401908111908411176106fd57829161035e91610455610c12853961045584019081526040602082018190520190610ac7565b03905ff094851561082c5760206103ba60ff96895f8a60018060a01b03825416936040519b8c96879586946321ff05c760e01b865260018060a01b03166004860152606060248601526064850190602481600401359101610b4d565b9116604483015203925af194851561082c575f9561083b575b505f546001600160a01b0316803b156108375760405163b63e8d1560e01b81526001600160a01b0388166004820152905f908290602490829084905af1801561082c5761080f575b5087546001600160a01b031690885b81811061071157505050505050600354926040519060a0820182811067ffffffffffffffff8211176106fd57806040526104726020601f19601f856004013501160182610b07565b60048201358082526024830160c08501376004820135830160c00187905282526001600160a01b038416602083015233604083015260608201839052426080830152680100000000000000008510156106e957600185016003556104d585610ba0565b6106d55782519283519367ffffffffffffffff85116106c1576104f88354610bd9565b601f8111610680575b5060209888949392918a916001601f8911146105f1579680608093600495937fdfb72d7c9bc6f5c82e4fdfa88d06f1a6cfc5e09231d89fd9f778c761b12e737d999a926105e6575b50508160011b915f199060031b1c19161784555b808b01516001850180546001600160a01b03199081166001600160a01b039384161790915560408084015160028801805490931693169290921790556060820151600386015591015191909201558051818152916105c691830190600481013590602401610b4d565b8188019490945233946001600160a01b03169381900390a4604051908152f35b015190505f80610549565b9691908488528b8820975b601f19841681106106665750827fdfb72d7c9bc6f5c82e4fdfa88d06f1a6cfc5e09231d89fd9f778c761b12e737d979860049593600193608096601f1981161061064e575b505050811b01845561055d565b01515f1960f88460031b161c191690555f8080610641565b8282015189556001909801978b9750918c01918c016105fc565b838a5260208a20601f870160051c8101602088106106ba575b601f830160051c820181106106af575050610501565b8b8155600101610699565b5080610699565b634e487b7160e01b89526041600452602489fd5b634e487b7160e01b87526004879052602487fd5b634e487b7160e01b86526041600452602486fd5b634e487b7160e01b5f52604160045260245ffd5b61071c818388610b29565b356001600160a01b038116810361080b57604061073a838789610b29565b358c82519361074885610aeb565b8185528c6107b8855161075a81610aeb565b8481528651633f5f75cd60e01b81526001600160a01b039384166004820152929093166024830152604482019490945260a06064820152948593849283926107a69060a4850190610b6d565b83810360031901608485015290610b6d565b0391885af18015610800576107d1575b5060010161042a565b604090813d83116107f9575b6107e78183610b07565b810103126107f5575f6107c8565b8980fd5b503d6107dd565b6040513d8d823e3d90fd5b8a80fd5b90975067ffffffffffffffff81116106fd576040525f965f61041b565b6040513d5f823e3d90fd5b5f80fd5b9094506020813d602011610867575b8161085760209383610b07565b810103126108375751935f6103d3565b3d915061084a565b60405162461bcd60e51b815260206004820152602c60248201527f436f6d70616e79466163746f72793a207374616b6573206d7573742073756d2060448201526b746f2031303030302062707360a01b6064820152608490fd5b6108d4828587610b29565b3581018091116108e9576001909101906102b1565b634e487b7160e01b5f52601160045260245ffd5b60405162461bcd60e51b815260206004820152601f60248201527f436f6d70616e79466163746f72793a206c656e677468206d69736d61746368006044820152606490fd5b60405162461bcd60e51b815260206004820152601a60248201527f436f6d70616e79466163746f72793a206e6f20686f6c646572730000000000006044820152606490fd5b60405162461bcd60e51b815260206004820152601d60248201527f436f6d70616e79466163746f72793a206e616d652072657175697265640000006044820152606490fd5b60405162461bcd60e51b815260206004820152601d60248201527f436f6d70616e79466163746f72793a206e6f74206120636974697a656e0000006044820152606490fd5b90506020813d602011610a44575b81610a2c60209383610b07565b8101031261083757518015158103610837575f610291565b3d9150610a1f565b34610837575f366003190112610837575f546040516001600160a01b039091168152602090f35b34610837575f366003190112610837576001546001600160a01b03168152602090f35b9181601f840112156108375782359167ffffffffffffffff8311610837576020808501948460051b01011161083757565b805180835260209291819084018484015e5f828201840152601f01601f1916010190565b6020810190811067ffffffffffffffff8211176106fd57604052565b90601f8019910116810190811067ffffffffffffffff8211176106fd57604052565b9190811015610b395760051b0190565b634e487b7160e01b5f52603260045260245ffd5b908060209392818452848401375f828201840152601f01601f1916010190565b9081518082526020808093019301915f5b828110610b8c575050505090565b835185529381019392810192600101610b7e565b600354811015610b395760059060035f52027fc2575a0e9e593c00f959f8c92f12db2869c3395a3b0502d05e2516446f71f85b01905f90565b90600182811c92168015610c07575b6020831014610bf357565b634e487b7160e01b5f52602260045260245ffd5b91607f1691610be856fe60a060409080825261045580380380916100198285610265565b833981019082818303126101a35761003081610288565b916020918281015160018060401b03918282116101a3570182601f820112156101a357805191821161025157855192610072601f8401601f1916860185610265565b8284528483830101116101a357815f92858093018386015e83010152823b15610231577fa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d5080546001600160a01b0319166001600160a01b038581169182179092558551635c60da1b60e01b8082529194928382600481895afa918215610227575f926101f0575b50813b156101d75750508551847f1cf3b03a6cf19fa2baba4df148e9dcabedea7f8a5c07840e207e5c089be95d3e5f80a28351156101b857508190600487518096819382525afa9081156101ae575f91610173575b50610159925061029c565b505b60805251610127908161032e82396080518160180152f35b905082813d83116101a7575b6101898183610265565b810103126101a35761019d61015992610288565b5f61014e565b5f80fd5b503d61017f565b85513d5f823e3d90fd5b9350505050346101c8575061015b565b63b398979f60e01b8152600490fd5b8751634c9c8ce360e01b81529116600482015260249150fd5b9091508381813d8311610220575b6102088183610265565b810103126101a35761021990610288565b905f6100f9565b503d6101fe565b88513d5f823e3d90fd5b8351631933b43b60e21b81526001600160a01b0384166004820152602490fd5b634e487b7160e01b5f52604160045260245ffd5b601f909101601f19168101906001600160401b0382119082101761025157604052565b51906001600160a01b03821682036101a357565b905f8091602081519101845af4808061031a575b156102d05750506040513d81523d5f602083013e60203d82010160405290565b156102f757604051639996b31560e01b81526001600160a01b039091166004820152602490fd5b3d15610308576040513d5f823e3d90fd5b60405163d6bda27560e01b8152600490fd5b503d1515806102b05750813b15156102b056fe60806040819052635c60da1b60e01b81526020816004817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa90811560a6575f916053575b5060d5565b905060203d60201160a0575b601f8101601f191682019167ffffffffffffffff831181841017608c576087926040520160b1565b5f604e565b634e487b7160e01b5f52604160045260245ffd5b503d605f565b6040513d5f823e3d90fd5b602090607f19011260d1576080516001600160a01b038116810360d15790565b5f80fd5b5f8091368280378136915af43d5f803e1560ed573d5ff35b3d5ffdfea264697066735822122085b8a810c1a55ac85d077ad9eb450e666900850fe4e60939e127edac4ead932564736f6c63430008190033a264697066735822122027f6accd7943c2877562f388472b48f7235da26e654ca824b0926fc39aff170f64736f6c63430008190033"
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
    "bytecode": "0x6080604052346104a05761532e80380380610019816104c3565b9283398101906040818303126104a05780516001600160a01b03811691908290036104a0576020818101516001600160401b03928382116104a0570190601f918583820112156104a05780518481116102cf57601f199161007f828601841685016104c3565b978289528483830101116104a057815f9285809301838b015e880101526100a46104a4565b94600d86526c29a824a1a2902096aa37b5b2b760991b838701526100c66104a4565b906005918281526441544f4b4560d81b8582015287518781116102cf575f546001998a82811c92168015610496575b888310146102b157818984931161044a575b5087908983116001146103ef575f926103e4575b50505f19600383901b1c191690891b175f555b8051908782116102cf578854908982811c921680156103da575b878310146102b157818884931161038e575b508690888311600114610333575f92610328575b50505f19600383901b1c191690881b1787555b80156102e357600680546001600160a01b03191691909117905586519485116102cf57600754908682811c921680156102c5575b848310146102b15784821161026f575b50508192841160011461020f5750508192935f92610204575b50505f19600383901b1c191690821b176007555b600855604051614e4590816104e98239f35b015190505f806101de565b83929192169460075f52825f20925f905b87821061025857505083859610610240575b505050811b016007556101f2565b01515f1960f88460031b161c191690555f8080610232565b808785968294968601518155019501930190610220565b60075f52835f209085808801821c8301938689106102a8575b01901c019086905b82811061029d57506101c5565b5f8155018690610290565b93508293610288565b634e487b7160e01b5f52602260045260245ffd5b91607f16916101b5565b634e487b7160e01b5f52604160045260245ffd5b60405162461bcd60e51b815260048101859052601360248201527f41546f6b656e3a207a65726f20636f6c6f6e79000000000000000000000000006044820152606490fd5b015190505f8061016e565b90868b941691845f52885f20925f5b8a8282106103785750508411610360575b505050811b018755610181565b01515f1960f88460031b161c191690555f8080610353565b8385015186558e97909501949384019301610342565b909150895f52865f2088808501871c8201928986106103d1575b918c918695949301881c01915b8281106103c357505061015a565b5f81558594508c91016103b5565b925081926103a8565b91607f1691610148565b015190505f8061011b565b90878c9416915f8052895f20925f5b8b828210610434575050841161041c575b505050811b015f5561012e565b01515f1960f88460031b161c191690555f808061040f565b8385015186558f979095019493840193016103fe565b9091505f8052875f2089808501881c8201928a861061048d575b918d918695949301891c01915b82811061047f575050610107565b5f81558594508d9101610471565b92508192610464565b91607f16916100f5565b5f80fd5b60408051919082016001600160401b038111838210176102cf57604052565b6040519190601f01601f191682016001600160401b038111838210176102cf5760405256fe6080806040526004361015610012575f80fd5b5f3560e01c90816301cc7ad4146135735750806301ffc9a71461350557806306fdde031461346357806307ca660e146131925780630808e18814613062578063081812fc14613026578063095ea7b314612fb75780630afb3c0414612f5c5780631c9cd21914612b7d57806323b872dd14612b6757806328ab221814612b3d57806333bbed0014612b13578063349ff77014612aeb5780633956cdfe146129de57806342842e0e146129ba57806346621112146129705780634f64b2be146128ff57806353b1a4111461285a57806353cfbaae14612682578063553c7e65146124c15780635652b97d1461248e5780635a3f2672146124085780635abae4f3146123665780635e617acd1461232957806361b8ce8c1461230c5780636352211e146122dc57806370a08231146122865780637a6e10281461223257806395d89b4114612163578063993ca18914612139578063a22cb465146120bf578063ac823a7e14612064578063ae023771146119b1578063b58376d6146115ef578063b88d4fde1461156f578063c590f30014611556578063c87b56dd1461038b578063ca55954c14610356578063d224ca151461032b578063dde77f2b146102355763e985e9c5146101df575f80fd5b34610231576040366003190112610231576101f8613658565b61020061366e565b9060018060a01b038091165f52600560205260405f2091165f52602052602060ff60405f2054166040519015158152f35b5f80fd5b3461023157610243366136ae565b61025860018060a01b036006541633146138ab565b815f52600960205260ff60405f20610275826003830154166138ed565b54166005811015610317577f788f486facf15f8d493992d5c9122be3ef240a15e5abe0e9e94076c3c07360a8916102b060016020931461392c565b835f52600b825260405f2081151580610309575b6102cd906139c7565b600181016102dc838254613a1d565b90556102e9828254613a1d565b809155156102fb575b604051908152a2005b610304846141af565b6102f2565b5060018101548211156102c4565b634e487b7160e01b5f52602160045260245ffd5b3461023157602036600319011261023157602061034e610349613658565b6140c4565b604051908152f35b34610231576020366003190112610231576004355f526009602052602060018060a01b0360405f205460081c16604051908152f35b34610231576020366003190112610231576103a76004356143ef565b506004355f52600960205260405f2080546103c460ff8216614723565b9060ff6003840154165f14611548576103db6140a4565b925b60206103f5600884901c6001600160a01b031661484e565b94604051957f5b7b2274726169745f74797065223a22466f726d222c2276616c7565223a22008388015282865180828901603f8b015e880162089f4b60ea1b9384603f8301527f7b2274726169745f74797065223a22416374697665222c2276616c7565223a226042830152805192839101606283015e019160628301527f7b2274726169745f74797065223a22486f6c646572222c2276616c7565223a226065830152805192839101608583015e016104c660878661227d60f01b9384608582015203606781018852018661379d565b8490600560ff8516101592836103175760209660ff86166001036111375750508561062d609b610658946021946004355f52600b85528460405f208161050c8254614919565b918161053261051e6001840154614919565b6002909301546001600160a01b031661484e565b936040519a888c995191829101848b015e8801907f2c7b2274726169745f74797065223a22546f74616c205374616b652028627073838301526b149116113b30b63ab2911d1160a11b6040830152805192839101604c83015e019085604c8301527f2c7b2274726169745f74797065223a22566573746564202862707329222c2276604e8301526630b63ab2911d1160c91b606e830152805192839101607583015e01908360758301527f2c7b2274726169745f74797065223a22436f6d70616e79222c2276616c7565226077830152611d1160f11b6097830152805192839101609983015e0190609982015203607b81018452018261379d565b604051968188925191829101602084015e8101605d60f81b602082015203600181018752018561379d565b6103175760ff166110c4576004355f52601560205261067960405f206137be565b916004355f52600a60205261069b670de0b6b3a764000060405f205404614919565b835190929015611057576040516106f060268287518060208a01602084015e810163010615b960e51b60208201528751908160208a01602483015e0161205360f01b602482015203600681018452018261379d565b926004355f52600a60205260405f20855115159060405161071081613767565b5f81526001820154918215158080611049575b15610f145750505090602061078a601861073d8395614919565b60405193849161074e828401614a80565b90805192839101825e017f206b672020266d6964646f743b202041493c2f746578743e000000000000000081520360071981018452018261379d565b965b6107ca602161079c600435614919565b604051958691602360f81b828401528051918291018484015e81015f8382015203600181018652018461379d565b8115610ef3576040516107dc81613782565b6002815261313560f01b6020820152915b15610ec557925b604051937f3c73766720786d6c6e733d22687474703a2f2f7777772e77332e6f72672f323060208601527f30302f737667222077696474683d2234303022206865696768743d223430302260408601527f2076696577426f783d223020302034303020343030223e00000000000000000060608601527f3c726563742077696474683d2234303022206865696768743d2234303022206660778601526e34b6361e911198309830983091179f60891b60978601527f3c7265637420783d2232302220793d223230222077696474683d22333630222060a68601527f6865696768743d22333630222066696c6c3d226e6f6e6522207374726f6b653d60c68601527f222342383836304222207374726f6b652d77696474683d2231222072783d223860e68601526211179f60e91b6101068601527f3c7465787420783d223230302220793d2237362220666f6e742d66616d696c796101098601527f3d226d6f6e6f73706163652220666f6e742d73697a653d223133222066696c6c6101298601527f3d22234238383630422220746578742d616e63686f723d226d6964646c652220610149860152723632ba3a32b916b9b830b1b4b7339e911a111f60691b6101698601525f6007546109c6816136f9565b9060018116908115610ea05750600114610e47575b50610e37976020603d9881610d2d6045610e439f839f989c610ccb6101ce610ded9f879f610ccb9f60619f610cd0978b9f8c809361205360f01b82808d9a817f3c7465787420783d223230302220793d223336382220666f6e742d66616d696c97661e17ba32bc3a1f60c91b9b8c82527f3c7465787420783d223230302220793d223233322220666f6e742d66616d696c60078301527f793d226d6f6e6f73706163652220666f6e742d73697a653d223134302220666960278301527f6c6c3d22234238383630422220746578742d616e63686f723d226d6964646c6560478301527f22206f7061636974793d22302e3038223e413c2f746578743e0000000000000060678301527f3c7465787420783d223230302220793d223235322220666f6e742d66616d696c60808301527f793d226d6f6e6f73706163652220666f6e742d73697a653d220000000000000060a083015280519283910160b983015e01907f222066696c6c3d22236666666666662220746578742d616e63686f723d226d6960b98301526532323632911f60d11b60d983015280519283910160df83015e018860df8201527f3c7465787420783d223230302220793d223330302220666f6e742d66616d696c60e68201527f793d226d6f6e6f73706163652220666f6e742d73697a653d223332222066696c6101068201527f6c3d22234238383630422220746578742d616e63686f723d226d6964646c6522610126820152601f60f91b610146820152610147938051928391018583015e019182015285610149820152610150938051928391018583015e01918201527f793d226d6f6e6f73706163652220666f6e742d73697a653d223131222066696c6101708201527f6c3d22233333332220746578742d616e63686f723d226d6964646c6522206c65610190820152703a3a32b916b9b830b1b4b7339e911a111f60791b6101b082015283516101c19490928391018583015e0191820152651e17b9bb339f60d11b6101c8820152036101ae81018452018261379d565b614c19565b6040519384917f22696d616765223a22646174613a696d6167652f7376672b786d6c3b6261736582840152620d8d0b60ea1b6040840152805191829101604384015e810161088b60f21b604382015203602581018452018261379d565b82604051998a97683d913730b6b2911d1160b91b828a015280519182910160298a015e870161088b60f21b938460298301527f226465736372697074696f6e223a22535049434520436f6c6f6e7920412d546f602b83015265035b2b71016960d51b604b830152805192839101605183015e01916051830152805192839101605383015e01906c1130ba3a3934b13aba32b9911d60991b6053830152805192839101606083015e01607d60f81b606082015203604181018452018261379d565b6040519384917f646174613a6170706c69636174696f6e2f6a736f6e3b6261736536342c000000828401528051918291018484015e81015f8382015203601d81018452018261379d565b6040519182918261362e565b0390f35b905060075f527fa66cc928b5edb82af9bd49922954155ab7b0942694bea4ce44661d9a8736c6885f905b828210610e88575050850161017c01610e376109db565b6001816020925461017c858c01015201910190610e71565b60ff191661017c808a019190915282151590920288019091019150610e3790506109db565b50604051610ed281613782565b600e81526d14121654d250d053081054d4d15560921b6020820152926107f4565b604051610eff81613782565b6002815261313160f01b6020820152916107ed565b15610f6d575050906020610f67600a610f2d8395614919565b604051938491610f3e828401614a80565b90805192839101825e01691035b39e17ba32bc3a1f60b11b81520360151981018452018261379d565b9661078c565b60ff919892506002015416610f86575b9060209161078c565b9550602090604051610f9781613731565b608581527f3c7465787420783d223230302220793d223334302220666f6e742d66616d696c838201527f793d226d6f6e6f73706163652220666f6e742d73697a653d223131222066696c60408201527f6c3d22233535352220746578742d616e63686f723d226d6964646c6522206c6560608201527f747465722d73706163696e673d2232223e4155544f4e4f4d4f55532041493c2f6080820152643a32bc3a1f60d91b60a082015296909150610f7d565b5060ff600283015416610723565b60206110bf602d611069600435614919565b604051938491664173736574202360c81b82840152805191829101602784015e810163010615b960e51b60278201528751908160208a01602b83015e0161205360f01b602b82015203600d81018452018261379d565b6106f0565b610e37603d610ded6020610ccb6061829683610e4399818061112260296110ec600435614919565b60405193849168412d546f6b656e202360b81b828401528051918291018484015e81015f8382015203600981018452018261379d565b9360405161112f81613767565b5f8152610d2d565b9293505f929060ff861661133b5750506021908661065893946004355f52600a825261129b609c60405f2084611177670de0b6b3a7640000835404614919565b9160ff60026111896001840154614919565b920154161561132c578161119b6140a4565b915b604051988995818088019a8051918291018c5e8701907f2c7b2274726169745f74797065223a2256616c756520285329222c2276616c75838301526332911d1160e11b6040830152805192839101604483015e01908a60448301527f2c7b2274726169745f74797065223a2257656967687420286b6729222c227661604683015265363ab2911d1160d11b6066830152805192839101606c83015e019088606c8301527f2c7b2274726169745f74797065223a22486173204175746f6e6f6d6f75732041606e8301526b249116113b30b63ab2911d1160a11b608e830152805192839101609a83015e0186609a82015203607c81018552018361379d565b816004355f5260158a526112b160405f206137be565b9384516112c4575b50505090505b61062d565b61132393508a604293956040519687945180918487015e8401907f2c7b2274726169745f74797065223a224c6162656c222c2276616c7565223a2283830152805192839101604083015e0190604082015203602281018452018261379d565b808880806112b9565b81611335614083565b9161119d565b5f9493509060ff8616600403611499575050856112bf60a0610658946021946004355f52600c85528460405f208161137d670de0b6b3a7640000835404614919565b918161139960026113916001850154614919565b930154614919565b936040519a888c995191829101848b015e8801907f2c7b2274726169745f74797065223a224d6f6e74686c7920416d6f756e742028838301526c29949116113b30b63ab2911d1160991b6040830152805192839101604d83015e019085604d8301527f2c7b2274726169745f74797065223a22546f74616c2045706f636873222c2276604f8301526630b63ab2911d1160c91b606f830152805192839101607683015e01908360768301527f2c7b2274726169745f74797065223a2245706f6368732050616964222c227661607883015265363ab2911d1160d11b6098830152805192839101609e83015e0190609e82015203608081018452018261379d565b610658939194506021925f95600360ff8916146114b9575b50505061062d565b6001015489935061154092604492909185906114dd906001600160a01b031661484e565b6040519684889551918291018487015e8401907f2c7b2274726169745f74797065223a224f626c69676f72222c2276616c75652283830152611d1160f11b6040830152805192839101604283015e0190604282015203602481018452018261379d565b8780806114b1565b611550614083565b926103dd565b3461023157602061034e611569366136ae565b90613fec565b3461023157608036600319011261023157611588613658565b5061159161366e565b506064356001600160401b0381116102315736602382011215610231578060040135906115bd82613890565b916115cb604051938461379d565b8083523660248284010111610231575f928160246020940184830137010152613bbe565b346102315760a036600319011261023157611608613658565b61161061366e565b6064356001600160401b0381116102315761162f903690600401613860565b916084356001600160401b0381116102315761164f903690600401613860565b939061166660018060a01b036006541633146138ab565b6001600160a01b03861615611975576116896001600160a01b0384161515613b7c565b6044351561193b578482036118f75781611873575b6116a78661457b565b936116b385888661429b565b95831561186a575f905b611707604051946116cd86613731565b6044358652602086019384526001600160a01b038b1660408701908152946116f89036908990613f9e565b92606087019384523691613f9e565b906080850191825260a08501935f8552895f52600b60205260405f2095518655600193516001870155600286019060018060a01b039051166001600160601b0360a01b825416179055600385019051908151916001600160401b038311611843576020906117758484613ad1565b01905f5260205f20845f5b848110611857575050505050600484019051908151916001600160401b038311611843576020906117b18484613ad1565b01905f5260205f205f5b83811061183057505050505060606040978694889460057f6468119657454ae108a2def13838f817f302d27edf79111c34be9cbf5ddc76cf9551910155611802858361438e565b89516001600160a01b0397881681526044356020820152901515818b0152951694a482519182526020820152f35b84906020845194019381840155016117bb565b634e487b7160e01b5f52604160045260245ffd5b6020845194019381840155018590611780565b604435906116bd565b5f805b8681106118dc57506044351461169e5760405162461bcd60e51b815260206004820152602860248201527f41546f6b656e3a207472616e63686520627073206d7573742073756d20746f206044820152677374616b6542707360c01b6064820152608490fd5b906118f06001918360051b85013590613b61565b9101611876565b606460405162461bcd60e51b815260206004820152602060248201527f41546f6b656e3a207363686564756c65206c656e677468206d69736d617463686044820152fd5b60405162461bcd60e51b815260206004820152601260248201527141546f6b656e3a207a65726f207374616b6560701b6044820152606490fd5b60405162461bcd60e51b815260206004820152601460248201527341546f6b656e3a207a65726f20636f6d70616e7960601b6044820152606490fd5b346102315760c0366003190112610231576119ca613658565b6119d261366e565b90604490606460849260a435946119f460018060a01b036006541633146138ab565b6001600160a01b0384161561202a576001600160a01b03811615611ff157813515611faf57823515611f7757843515958680611f6e575b611efe575b508515611d5f575b60085493611a4585613b6e565b600855604051611a548161374c565b6004815260018060a01b038316602082015260018060a01b03821660408201525f606082015260016080820152855f52600960205260405f2081519160058310156103175781546020820151610100600160a81b0360089190911b1660ff949094166001600160a81b031990911617929092178155611b17916003906080905b6001840160018060a01b036040830151166001600160601b0360a01b825416179055606081015160028501550151151591019060ff801983541691151516179055565b611b218583614bdb565b6001600160a01b03611b338684614d58565b16611d475760085495611b4587613b6e565b600855604051611b548161374c565b6003815260018060a01b038316602082015260018060a01b038416604082015286606082015260016080820152875f52600960205260405f2081519160058310156103175781546020820151610100600160a81b0360089190911b1660ff949094166001600160a81b031990911617929092178155611bd891600390608090611ad4565b611be28783614bdb565b6001600160a01b03611bf48884614d58565b16611d4757855f52600960205286600260405f200155611c77604051611c198161374c565b8535815260046020820188358152604083015f815260608401908635825260808501925f84528c5f52600c60205260405f209551865551600186015551600285015551600384015551151591019060ff801983541691151516179055565b8715611d24575b506011549060126020528160405f2055600160401b82101561184357604097869588957faa45e66205470dd78318a0cf957a20ffda9a2871fc2b4cb33bc41bbf76566bfe95611cf189611cd988600160a09a01601155613b03565b90919082549060031b91821b915f19901b1916179055565b8b515f196001881b0195861681529416602085015235838b0152356060830152156080820152a382519182526020820152f35b80355f5260136020528560405f2055855f5260146020523560405f205587611c7e565b6040516339e3563760e11b81525f6004820152602490fd5b84355f5260206009815260405f2060ff60038201541615611eb0575460ff8116600581101561031757611e58576001600160a01b0383811660089290921c1603611e075785355f526013815260405f2054611dba5750611a38565b85906363726f7760e01b857f41546f6b656e3a20636f6c6c61746572616c20616c726561647920696e206573866040519462461bcd60e51b86526004860152602480860152840152820152fd5b8590661b185d195c985b60ca1b857f41546f6b656e3a206f626c69676f72206d757374206f776e2074686520636f6c866040519462461bcd60e51b8652600486015260276024860152840152820152fd5b60405162461bcd60e51b815260048101839052602d60248201527f41546f6b656e3a20636f6c6c61746572616c206d757374206265206120756e69818601526c1b185d195c985b08185cdcd95d609a1b818701528790fd5b60405162461bcd60e51b8152600481018390526024808201527f41546f6b656e3a20636f6c6c61746572616c20746f6b656e20697320696e616381860152637469766560e01b818701528790fd5b611f118335611f0c846140c4565b613b61565b11611f1c5786611a30565b50660554249206361760cc1b84927f41546f6b656e3a206f626c69676174696f6e20776f756c6420657863656564206040519362461bcd60e51b85526020600486015260276024860152840152820152fd5b50801515611a2b565b507241546f6b656e3a207a65726f2065706f63687360681b6040519162461bcd60e51b83526020600484015260136024840152820152fd5b507f41546f6b656e3a207a65726f207061796d656e7420616d6f756e7400000000006040519162461bcd60e51b835260206004840152601b6024840152820152fd5b507320aa37b5b2b71d103d32b9379037b13634b3b7b960611b6040519162461bcd60e51b83526020600484015260146024840152820152fd5b507420aa37b5b2b71d103d32b9379031b932b234ba37b960591b6040519162461bcd60e51b83526020600484015260156024840152820152fd5b34610231576020366003190112610231576004355f52600a60205260a060405f2080549060018101549060ff600282015416600460038301549201549260405194855260208501521515604084015260608301526080820152f35b34610231576040366003190112610231576120d8613658565b50602435801515036102315760405162461bcd60e51b815260206004820152602760248201527f41546f6b656e3a20617070726f76616c732064697361626c6564202d2075736560448201526620436f6c6f6e7960c81b6064820152608490fd5b34610231576020366003190112610231576004355f526013602052602060405f2054604051908152f35b34610231575f366003190112610231576040515f60018054612184816136f9565b808552916020916001811690811561220857506001146121af575b610e4385610e378187038261379d565b60015f90815293507fb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf65b8385106121f557505050508101602001610e3782610e4361219f565b80548686018401529382019381016121d9565b869550610e4396935060209250610e3794915060ff191682840152151560051b820101929361219f565b34610231576020366003190112610231576004355f52600b602052608060405f20805490600181015490600560018060a01b0360028301541691015491604051938452602084015260408301526060820152f35b34610231576020366003190112610231576001600160a01b036122a7613658565b1680156122c4575f526003602052602060405f2054604051908152f35b6040516322718ad960e21b81525f6004820152602490fd5b346102315760203660031901126102315760206122fa6004356143ef565b6040516001600160a01b039091168152f35b34610231575f366003190112610231576020600854604051908152f35b346102315760203660031901126102315761234f60018060a01b036006541633146138ab565b602061235c600435613db8565b6040519015158152f35b3461023157602036600319011261023157600435805f52600960205260405f2080549060ff82169060058210156103175760e0936123a8600460019414613c89565b5f52600c60205260405f2090828060a01b03928391015416815460018301549060028401549260ff6004600387015496015416956040519760081c168752602087015260408601526060850152608084015260a0830152151560c0820152f35b3461023157602080600319360112610231576001600160a01b0361242a613658565b165f52600d815260405f20906040518083838295549384815201905f52835f20925f5b85828210612478575050506124649250038361379d565b610e436040519282849384528301906135fb565b855484526001958601958895509301920161244d565b34610231576020366003190112610231576124b460018060a01b036006541633146138ab565b602061034e600435613ce1565b34610231576040366003190112610231576004356124dd61366e565b6006546001600160a01b03906124f690821633146138ab565b825f526020906009825260405f209261251560ff6003860154166138ed565b60ff845416600581101561031757600461252f9114613c89565b845f52600c835260405f20936004850180549560ff871661263d57600301549586156125e55760027fd0fa2de7f7d21d53843fbb0cb827be6fe5665338bcb0765f90a84b1c931cce4e979593604097959360016125cf9460ff1916179055865f52600986526125a784868a5f205460081c1689614429565b865f52601386525f88812055895f52601486525f8881205501546125ca896141af565b6141af565b6125d8876144d7565b84519384521690820152a2005b60405162461bcd60e51b815260048101879052602a60248201527f41546f6b656e3a20756e73656375726564202d206e6f20636f6c6c61746572616044820152696c20746f207365697a6560b01b6064820152608490fd5b60405162461bcd60e51b815260048101879052601960248201527f41546f6b656e3a20616c72656164792064656661756c746564000000000000006044820152606490fd5b3461023157602080600319360112610231576001600160a01b0390816126a6613658565b165f52600f815260405f205f808254915b82811061280f57506126c881613a3e565b936126d6604051958661379d565b8185526126e282613a3e565b8582019390601f19013685376127006126fa84613a55565b93613a55565b945f90815b8383106127755750505050604051958695606087019060608852518091526080870194915f905b82821061275857888703858a01528880610e438a61274a8b8b6135fb565b9083820360408501526135fb565b83518116875289985095840195928401926001919091019061272c565b8961278684849b9798999a9b613b4c565b919054600392831b1c91825f526009895260ff60405f209182015416156128035791600193916127f4935460081c166127bf838a613c75565b52805f52600b90818a5260405f20546127d8848d613c75565b525f5288528260405f2001546127ee828d613c75565b52613b6e565b925b0191979695949397612705565b505050916001906127f6565b60ff61281f828697949596613b4c565b9054600391821b1c5f526009845260405f20015416612846575b60010193929190936126b7565b91612852600191613b6e565b929050612839565b34610231575f366003190112610231576040515f60075461287a816136f9565b8084529060209060019081811690811561220857506001146128a657610e4385610e378187038261379d565b60075f90815293507fa66cc928b5edb82af9bd49922954155ab7b0942694bea4ce44661d9a8736c6885b8385106128ec57505050508101602001610e3782610e4361219f565b80548686018401529382019381016128d0565b34610231576020366003190112610231576004355f52600960205260405f20805460ff81169160018060a01b03908160018201541660ff6003600284015493015416926040519460058710156103175760a096865260081c1660208501526040840152606083015215156080820152f35b34610231576020366003190112610231576004355f52600b602052606060405f20805490600181015490600260018060a01b03910154169060405192835260208301526040820152f35b34610231576129c8366136c4565b5050505f6040516129d881613767565b52613bbe565b34610231576129ec36613684565b6006546001600160a01b03939190612a0790851633146138ab565b815f52600960205260405f20612a2360ff6003830154166138ed565b549360ff8516600581101561031757612a3c9015613c29565b825f52601360205260405f2054612aa6577ff3ece9284d33275d9c297a27c91c816d5543b99eb1a60525f3cee810ed72009191612a9082602093871697612a84891515613982565b60081c16958686614429565b835f52600a82528060405f2055604051908152a4005b60405162461bcd60e51b815260206004820152601a60248201527f41546f6b656e3a20746f6b656e20697320696e20657363726f770000000000006044820152606490fd5b34610231575f366003190112610231576006546040516001600160a01b039091168152602090f35b34610231576020366003190112610231576004355f526015602052610e43610e3760405f206137be565b34610231576020366003190112610231576004355f526014602052602060405f2054604051908152f35b3461023157612b75366136c4565b505050613bbe565b346102315760e036600319011261023157612b96613658565b6001600160401b038060243511610231573660236024350112156102315760243560040135116102315736602480356004013581350101116102315760843590811515820361023157612bf460018060a01b036006541633146138ab565b612c086001600160a01b0382161515613b7c565b681b1ae4d6e2ef500000604435118015612f50575b8015612f49575b15612ef85760085490612c3682613b6e565b600855604051612c458161374c565b5f815260018060a01b03821660208201525f60408201525f606082015260016080820152825f52600960205260405f2081519160058310156103175781546020820151610100600160a81b0360089190911b1660ff949094166001600160a81b031990911617929092178155612cc091600390608090611ad4565b612cca8282614bdb565b6001600160a01b03811615612ee0576001600160a01b03612ceb8383614d58565b16611d4757602092600460405191612d028361374c565b6044358352858301906064358252604084019015158152612d5d606085019160a4358352608086019360c4358552885f52600a8a5260405f2096518755516001870155511515600286019060ff801983541691151516179055565b5160038401555191015560243560040135612db1575b817fac3dcdc20bb35a0f2b39fb2ddbe12a30d20c4795d2026bf2fc48df3ce84ca67d8460405193604435855260018060a01b031693a3604051908152f35b6015835260405f20612dc381546136f9565b601f8111612e9b575b505f601f6024356004013511600114612e1f575f9060243560040135612e10575b506024356004013560011b905f196024356004013560031b1c1916179055612d73565b60248092503501013585612ded565b601f19602435600401351690825f52855f20915f5b818110612e8057506024356004013511612e5e575b5050600160243560040135811b019055612d73565b60245f1960f882356004013560031b161c199181350101351690558480612e49565b91928760018192602487813501013581550194019201612e34565b612ed090825f52855f20601f602435600401350160051c810191876024356004013510612ed6575b601f0160051c0190613a9a565b84612dcc565b9091508190612ec3565b604051633250574960e11b81525f6004820152602490fd5b60405162461bcd60e51b8152602060048201526024808201527f41546f6b656e3a2062656c6f7720726567697374726174696f6e2074687265736044820152631a1bdb1960e21b6064820152608490fd5b5081612c24565b50603260643511612c1d565b34610231576020366003190112610231576004355f52600c60205260a060405f20805490600181015490600281015460ff60046003840154930154169260405194855260208501526040840152606083015215156080820152f35b3461023157604036600319011261023157612fd0613658565b5060405162461bcd60e51b815260206004820152602760248201527f41546f6b656e3a20617070726f76616c732064697361626c6564202d2075736560448201526620436f6c6f6e7960c81b6064820152608490fd5b3461023157602036600319011261023157600435613043816143ef565b505f526004602052602060018060a01b0360405f205416604051908152f35b3461023157613070366136ae565b9061308660018060a01b036006541633146138ab565b5f91815f52602091600960205260405f209260ff6003946130ac826003830154166138ed565b54166005811015610317576130c4600180921461392c565b825f52600b60205260405f2094600586019560038101836001600484019301945b6130f5575b60208a604051908152f35b88548254811080613179575b1561317357876131118286613b4c565b905490871b1c9b8c8089549061312691613b61565b895561313191613b61565b9b604051908382528982015260407fa8244a340c825298b79cfc32334fed512284c91d293cc65ee0e37ba288687d1291a261316b90613b6e565b8955806130e5565b506130ea565b50886131858285613b4c565b905490871b1c1115613101565b34610231576131a036613684565b6131b860018060a09594951b036006541633146138ab565b815f52600960205260405f20916131d560ff6003850154166138ed565b825460ff811660058110156103175760016131f0911461392c565b6132046001600160a01b0386161515613982565b60081c6001600160a01b039081169085161461342657805f52600b60205260405f209382151580613418575b613239906139c7565b61327c60018060a01b03600287015416956002860154906001810161325f878254613a1d565b905561326c868254613a1d565b8091551561340a575b868361429b565b936040519561328a87613767565b5f875260405161329981613767565b5f8152604051976132a989613731565b868952602089019187835260408a019084825260608b0192835260808b01525f60a08b0152885f52600b60205260405f20928a518455516001840155600283019060018060a01b039051166001600160601b0360a01b825416179055600382019051908151916001600160401b0383116118435760209061332a8484613ad1565b01905f5260205f205f5b8381106133f65750505050600481019760808101518051906001600160401b03821161184357602090613367838d613ad1565b01995f5260205f20995f905b8282106133e25750505060209850926133bd8860409481989794600560a07f6dfb44ecd6d25774bd51e42e44a046178b5ca77e149cd347083ca6bf286a04ee99015191015561438e565b5482516001600160a01b0392831681528981019790975260081c1694a4604051908152f35b80518c830155600190910190602001613373565b600190602084519401938184015501613334565b613413846141af565b613275565b506001850154831115613230565b60405162461bcd60e51b815260206004820152601560248201527420aa37b5b2b71d1039b2b63316ba3930b739b332b960591b6044820152606490fd5b34610231575f366003190112610231576040515f8054613482816136f9565b8084529060209060019081811690811561220857506001146134ae57610e4385610e378187038261379d565b5f80805293507f290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e5635b8385106134f257505050508101602001610e3782610e4361219f565b80548686018401529382019381016134d6565b346102315760203660031901126102315760043563ffffffff60e01b8116809103610231576020906380ac58cd60e01b8114908115613562575b8115613551575b506040519015158152f35b6301ffc9a760e01b14905082613546565b635b5e139f60e01b8114915061353f565b34610231575f366003190112610231576011549081815260208082019260115f527f31ecc21a745e3968a04e9570e4425bc18fa8019c68028196b546d1669c200c68915f905b8282106135e457610e43856135d08189038261379d565b6040519182916020835260208301906135fb565b8354865294850194600193840193909101906135b9565b9081518082526020808093019301915f5b82811061361a575050505090565b83518552938101939281019260010161360c565b602060409281835280519182918282860152018484015e5f828201840152601f01601f1916010190565b600435906001600160a01b038216820361023157565b602435906001600160a01b038216820361023157565b606090600319011261023157600435906024356001600160a01b0381168103610231579060443590565b6040906003190112610231576004359060243590565b6060906003190112610231576001600160a01b0390600435828116810361023157916024359081168103610231579060443590565b90600182811c92168015613727575b602083101461371357565b634e487b7160e01b5f52602260045260245ffd5b91607f1691613708565b60c081019081106001600160401b0382111761184357604052565b60a081019081106001600160401b0382111761184357604052565b602081019081106001600160401b0382111761184357604052565b604081019081106001600160401b0382111761184357604052565b90601f801991011681019081106001600160401b0382111761184357604052565b9060405191825f82546137d0816136f9565b908184526020946001916001811690815f1461383e5750600114613800575b5050506137fe9250038361379d565b565b5f90815285812095935091905b8183106138265750506137fe93508201015f80806137ef565b8554888401850152948501948794509183019161380d565b925050506137fe94925060ff191682840152151560051b8201015f80806137ef565b9181601f84011215610231578235916001600160401b038311610231576020808501948460051b01011161023157565b6001600160401b03811161184357601f01601f191660200190565b156138b257565b60405162461bcd60e51b815260206004820152601360248201527241546f6b656e3a206f6e6c7920436f6c6f6e7960681b6044820152606490fd5b156138f457565b60405162461bcd60e51b815260206004820152601060248201526f41546f6b656e3a20696e61637469766560801b6044820152606490fd5b1561393357565b60405162461bcd60e51b815260206004820152602160248201527f41546f6b656e3a206e6f7420616e2065717569747920617373657420746f6b656044820152603760f91b6064820152608490fd5b1561398957565b60405162461bcd60e51b815260206004820152601660248201527510551bdad95b8e881e995c9bc81c9958da5c1a595b9d60521b6044820152606490fd5b156139ce57565b60405162461bcd60e51b815260206004820152602160248201527f41546f6b656e3a20696e73756666696369656e7420766573746564207374616b6044820152606560f81b6064820152608490fd5b91908203918211613a2a57565b634e487b7160e01b5f52601160045260245ffd5b6001600160401b0381116118435760051b60200190565b90613a5f82613a3e565b613a6c604051918261379d565b8281528092613a7d601f1991613a3e565b0190602036910137565b81810292918115918404141715613a2a57565b818110613aa5575050565b5f8155600101613a9a565b80545f825580613abe575050565b6137fe915f5260205f2090810190613a9a565b90600160401b811161184357815490808355818110613aef57505050565b6137fe925f5260205f209182019101613a9a565b601154811015613b385760115f527f31ecc21a745e3968a04e9570e4425bc18fa8019c68028196b546d1669c200c6801905f90565b634e487b7160e01b5f52603260045260245ffd5b8054821015613b38575f5260205f2001905f90565b91908201809211613a2a57565b5f198114613a2a5760010190565b15613b8357565b60405162461bcd60e51b815260206004820152601360248201527220aa37b5b2b71d103d32b937903437b63232b960691b6044820152606490fd5b60405162461bcd60e51b815260206004820152603960248201527f41546f6b656e3a2075736520436f6c6f6e792e7472616e73666572417373657460448201527f206f7220436f6c6f6e792e7472616e73666572457175697479000000000000006064820152608490fd5b15613c3057565b60405162461bcd60e51b815260206004820152601a60248201527f41546f6b656e3a206e6f7420616e20617373657420746f6b656e0000000000006044820152606490fd5b8051821015613b385760209160051b010190565b15613c9057565b60405162461bcd60e51b815260206004820152602360248201527f41546f6b656e3a206e6f7420616e206f626c69676174696f6e206c696162696c60448201526269747960e81b6064820152608490fd5b90815f52600960205260405f2091613cff60ff6003850154166138ed565b60ff8354166005811015610317576001613d19911461392c565b805f52600b60205260405f2092835493613d3860018201548096613a1d565b948515613daf578155613d4d60038201613ab0565b613d5960048201613ab0565b5f1960058201555415613da1575b60018060a01b03905460081c16907f30b1e484d2ca7dc7dbe479de5ccedb0be1ee291551f3ffb6b3a635a8e0b314406020604051868152a3565b613daa826141af565b613d67565b505f9450505050565b805f526020600981526040805f20613dd660ff6003830154166138ed565b60ff8154166005811015610317576004613df09114613c89565b835f52600c8352815f2060ff600482015416613f2b576002810180549160018101549283811015613edb57858892613e487f906356bce80317bc059cb2958e7e6fe33866824109516f5c5fc466b348171ab193613b6e565b8095555481519085825289820152a214613e6457505050505f90565b613e8a92600292855f5260148252805f205480613ebc575b50505001546125ca836141af565b613e93816144d7565b7f22f92762dfcedccf1f7ea1669a43c1407c423106d379901d3187ba7d544de5905f80a2600190565b5f926014918452601381528383812055878452528120555f8080613e7c565b855162461bcd60e51b8152600481018890526024808201527f41546f6b656e3a206f626c69676174696f6e20616c726561647920636f6d706c604482015263195d195960e21b6064820152608490fd5b825162461bcd60e51b8152600481018590526024808201527f41546f6b656e3a206f626c69676174696f6e20616c72656164792064656661756044820152631b1d195960e21b6064820152608490fd5b90815491600160401b8310156118435782611cd99160016137fe95018155613b4c565b9291613fa982613a3e565b91613fb7604051938461379d565b829481845260208094019160051b810192831161023157905b828210613fdd5750505050565b81358152908301908301613fd0565b805f52600960205260ff60405f20541660058110156103175761400f9015613c29565b5f52600a60205260405f2090600382015480158015614075575b61406f5761403f61404492600485015490613a1d565b613a87565b61271091828210156140685754908203828111613a2a5761406491613a87565b0490565b5050505f90565b50505490565b506004830154821115614029565b6040519061409082613782565b600582526466616c736560d81b6020830152565b604051906140b182613782565b60048252637472756560e01b6020830152565b6001600160a01b03165f908152600d6020908152604080832080549394939190855b8381106140f4575050505050565b6140fe8183613b4c565b9054600391821b1c805f5260098752845f209060ff918280858301541615918215614197575b505061418c575f52600c8752845f209182015415908161417d575b508061416c575b614156575b506001905b016140e6565b60019197614165915490613b61565b969061414b565b506002810154600182015411614146565b9050600482015416155f61413f565b505050600190614150565b5416905060058110156103175760041415825f614124565b805f5260096020526040805f206003810180549060ff82161561429457915460ff199091169091556001600160a01b03906141f090849060081c8316614b0f565b825f526002602052815f205416825f8215928315614265575b828252600260205284822080546001600160a01b03191690557fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef8280a461424e575050565b602492505190637e27328960e01b82526004820152fd5b60046020528482206001600160601b0360a01b8154169055808252600360205284822082198154019055614209565b5050505050565b9291926008546142aa81613b6e565b60085580946040516142bb8161374c565b60018152602081019060018060a01b03958686169384845287604084019216825260608301908152608083019060018252865f52600960205260405f20935192600584101561031757845495516001600160a81b031990961660ff9094169390931794891660081b610100600160a81b031694909417835561436f9360039289600186019151166001600160601b0360a01b82541617905551600284015551151591019060ff801983541691151516179055565b6143798284614bdb565b15612ee05761438791614d58565b16611d4757565b60018060a01b031690815f52601060205260405f20815f5260205260ff60405f205416156143ba575050565b816137fe925f52601060205260405f20825f5260205260405f20600160ff198254161790555f52600f60205260405f20613f7b565b5f818152600260205260409020546001600160a01b0316908115614411575090565b60249060405190637e27328960e01b82526004820152fd5b916144348383614b0f565b5f8381526009602052604090208054610100600160a81b031916600883901b610100600160a81b031617905561446a8382614bdb565b6001600160a01b039080821615612ee057614486848392614d58565b1691826144a657604051637e27328960e01b815260048101859052602490fd5b16918282036144b457505050565b60649350604051926364283d7b60e01b8452600484015260248301526044820152fd5b805f52601260205260405f2054601154905f1991828101908111613a2a5780820361454b575b50506011548015614537570161452561451582613b03565b8154905f199060031b1b19169055565b6011555f5260126020525f6040812055565b634e487b7160e01b5f52603160045260245ffd5b61455490613b03565b90549060031b1c61456881611cd984613b03565b5f52601260205260405f20555f806144fd565b60018060a01b039081811691825f52602091600d602052604092835f20905f918054925b8381106146b85750505050600854936145b785613b6e565b60085583516145c58161374c565b6002815260208101908282528581015f8152606082015f8152608083019060018252895f526009602052885f20935192600584101561031757845495516001600160a81b031990961660ff9094169390931794881660081b610100600160a81b03169490941783556146699360039288600186019151166001600160601b0360a01b82541617905551600284015551151591019060ff801983541691151516179055565b6146738583614bdb565b156146a1578361468291614d58565b1661468b575090565b516339e3563760e11b81525f6004820152602490fd5b8251633250574960e11b81525f6004820152602490fd5b6146c28183613b4c565b9054600391821b1c90815f5260099081865260ff90818b5f205416600581101561031757600214928361470c575b505050614700575060010161459f565b97505050505050505090565b90919250835f528652895f200154165f80806146f0565b600581101561031757801561482757600181146147fe57600281146147d157600381146147a4576004146147745760405161475d81613782565b60078152662aa725a727aba760c91b602082015290565b60405161478081613782565b60148152734f424c49474154494f4e5f4c494142494c49545960601b602082015290565b506040516147b181613782565b601081526f13d0931251d0551253d397d054d4d15560821b602082015290565b506040516147de81613782565b601081526f4551554954595f4c494142494c49545960801b602082015290565b5060405161480b81613782565b600c81526b11545552551657d054d4d15560a21b602082015290565b5060405161483481613782565b600a8152691553925310551154905360b21b602082015290565b8060405191606083018381106001600160401b0382111761184357604052602a835260208084016040368237845115613b38576030905383519060019160011015613b385790607860218601536029915b8183116148d0575050506148b1575090565b6044906040519063e22e27eb60e01b8252600482015260146024820152fd5b909192600f81166010811015613b38578651851015613b38576f181899199a1a9b1b9c1cb0b131b232b360811b901a86850183015360041c928015613a2a575f1901919061489f565b805f917a184f03e93ff9f4daa797ed6e38ed64bf6a1f01000000000000000080821015614a72575b506d04ee2d6d415b85acef810000000080831015614a63575b50662386f26fc1000080831015614a54575b506305f5e10080831015614a45575b5061271080831015614a36575b506064821015614a26575b600a80921015614a1c575b60019081602160018601956149b287613890565b966149c0604051988961379d565b8088526149cf601f1991613890565b01366020890137860101905b6149e7575b5050505090565b5f19019083906f181899199a1a9b1b9c1cb0b131b232b360811b8282061a835304918215614a17579190826149db565b6149e0565b916001019161499e565b9190606460029104910191614993565b6004919392049101915f614988565b6008919392049101915f61497b565b6010919392049101915f61496c565b6020919392049101915f61495a565b60409350810491505f614941565b7f3c7465787420783d223230302220793d223334302220666f6e742d66616d696c81527f793d226d6f6e6f73706163652220666f6e742d73697a653d223131222066696c60208201527f6c3d22233535352220746578742d616e63686f723d226d6964646c6522206c656040820152703a3a32b916b9b830b1b4b7339e9119111f60791b606082015260710190565b6001600160a01b03165f818152600e60209081526040808320858452825280832054848452600d835292819020545f19959194919390868101908111613a2a57808203614b90575b5050805f52600d8252835f208054958615614537575f960190614b7d6145158383613b4c565b558452600e815282842091845252812055565b614ba390835f52600d8552865f20613b4c565b90549060031b1c825f52600d8452614bc181611cd984895f20613b4c565b825f52600e8452855f20905f528352845f20555f80614b57565b906137fe9160018060a01b0316805f52600d60205260405f2054600e60205260405f20835f5260205260405f20555f52600d60205260405f20613f7b565b805115614d45578051916002808401809411613a2a57600393849004600281901b91906001600160fe1b03811603613a2a5793604051937f4142434445464748494a4b4c4d4e4f505152535455565758595a616263646566601f52603f917f6768696a6b6c6d6e6f707172737475767778797a303132333435363738392b2f603f5260208601928291835184019160208301998a51945f8c525b848110614d0957505050505090600391602095969752510680600114614cf457600214614ce7575b50808452830101604052565b603d905f1901535f614cdb565b50603d90815f1982015360011901535f614cdb565b836004919c95989c019b838d51818160121c165183538181600c1c16516001840153818160061c1651858401531651858201530196939a614cb3565b50604051614d5281613767565b5f815290565b5f828152600260205260409020546001600160a01b03908116929183614dde575b1680614dc6575b815f52600260205260405f20816001600160601b0360a01b825416179055827fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef5f80a490565b805f52600360205260405f2060018154019055614d80565b600460205260405f206001600160601b0360a01b8154169055835f52600360205260405f205f198154019055614d7956fea2646970667358221220447f530006b52b85deb2fffff1bdb315bc78405cb18a1f4af39ca6f80703d6a964736f6c63430008190033"
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
    "bytecode": "0x608034606f57601f6109e238819003918201601f19168301916001600160401b03831184841017607357808492602094604052833981010312606f57516001600160a01b03811690819003606f575f80546001600160a01b03191691909117905560405161095a90816100888239f35b5f80fd5b634e487b7160e01b5f52604160045260245ffdfe608060409080825260049081361015610016575f80fd5b5f3560e01c908163050ff707146107b857508063078d4c2b14610666578063158905e8146104d8578063349ff770146104b15780633f0e5ada146103ad5780637a522e021461031657806390e2d2cc146102f8578063916b6c4b1461025b5763ebe71a5f14610083575f80fd5b3461025757816003193601126102575767ffffffffffffffff8135818111610257576100b29036908401610802565b929091602490602435908111610257576100cf9036908401610802565b95909160018060a01b0393845f54169783518099634d853ee560e01b8252818460209c8d935afa90811561024d576101139188915f91610220575b50163314610888565b8088036101dd575f5b88811061012557005b6101308183886108ec565b35670de0b6b3a764000090818102908082048314901517156101cb578861016061015b858e8e6108ec565b610910565b165f5260018c52865f205561017961015b838c8c6108ec565b61018483858a6108ec565b358281029281840414901517156101cb57907f5464440453fc39b658a9b561093845a38ca97029be9942ab109286c83ab820a28c8a600195948a519485521692a20161011c565b85601186634e487b7160e01b5f52525ffd5b835162461bcd60e51b81528083018a9052601b60248201527f4d434342696c6c696e673a206c656e677468206d69736d6174636800000000006044820152606490fd5b61024091508c8d3d10610246575b6102388183610833565b810190610869565b5f61010a565b503d61022e565b85513d5f823e3d90fd5b5f80fd5b5034610257575f366003190112610257575f548251634d853ee560e01b81526001600160a01b039290916020918391829086165afa9081156102ee576102ab93505f916102d55750163314610888565b5f6002557f90101c41c01c8c5597abff0f6dfac9deda2262990f3a32bca35cca06b3b9ec255f80a1005b610240915060203d602011610246576102388183610833565b83513d5f823e3d90fd5b8234610257575f366003190112610257576020906002549051908152f35b5034610257576020366003190112610257576103306107ec565b5f548351634d853ee560e01b8152926001600160a01b0392916020918591829086165afa80156103a35782610370915f9586916102d55750163314610888565b169182825260016020528120557fcb2977ef021a9b6164dd76c1a65eb5f89dc79216151911b46665d48b49d5434a5f80a2005b84513d5f823e3d90fd5b50346102575760208060031936011261025757813567ffffffffffffffff811161025757826103e0859236908301610802565b9390916103ec856108d4565b946103f985519687610833565b808652610405816108d4565b8684019490601f19013686375f5b82811061045a575050505082519384938285019183865251809252840192915f5b82811061044357505050500390f35b835185528695509381019392810192600101610434565b959694956001600160a01b0361047461015b8386866108ec565b165f5260018552875f2054865182101561049e57600582901b870186015294969594600101610413565b603285634e487b7160e01b5f525260245ffd5b8234610257575f366003190112610257575f5490516001600160a01b039091168152602090f35b5090346102575780600319360112610257576104f26107ec565b5f548251634d853ee560e01b81526001600160a01b0391821693602093602435939192858189818a5afa9081156103a3578387939261053a925f9161064f5750163314610888565b602484518094819363f3caad0360e01b83521698898b8301525afa908115610645575f9161060f575b50156105cd57670de0b6b3a7640000918281029281840414901517156105ba57837f5464440453fc39b658a9b561093845a38ca97029be9942ab109286c83ab820a29495505f526001835281815f205551908152a2005b601185634e487b7160e01b5f525260245ffd5b5162461bcd60e51b8152808501839052601960248201527f4d434342696c6c696e673a206e6f74206120636974697a656e000000000000006044820152606490fd5b90508381813d831161063e575b6106268183610833565b8101031261025757518015158103610257575f610563565b503d61061c565b82513d5f823e3d90fd5b6102409150853d8711610246576102388183610833565b50346102575760209081600319360112610257576106826107ec565b5f548451634d853ee560e01b81526001600160a01b039291859082908690829087165afa9081156107ae576106c29184915f916107975750163314610888565b1692835f5260018352805f2054918215610756576002549083820180921161074357506002555f84815260018452818120555190815282917f8d40b1e890ced9adf397d25a06046df796e132dd75cbfb5a21c868c2b4a4a75e91a27fcb2977ef021a9b6164dd76c1a65eb5f89dc79216151911b46665d48b49d5434a5f80a2005b601190634e487b7160e01b5f525260245ffd5b83606492519162461bcd60e51b8352820152601f60248201527f4d434342696c6c696e673a206e6f206f75747374616e64696e672062696c6c006044820152fd5b6102409150873d8911610246576102388183610833565b86513d5f823e3d90fd5b839034610257576020366003190112610257576020916001600160a01b036107de6107ec565b165f52600183525f20548152f35b600435906001600160a01b038216820361025757565b9181601f840112156102575782359167ffffffffffffffff8311610257576020808501948460051b01011161025757565b90601f8019910116810190811067ffffffffffffffff82111761085557604052565b634e487b7160e01b5f52604160045260245ffd5b9081602091031261025757516001600160a01b03811681036102575790565b1561088f57565b60405162461bcd60e51b815260206004820152601760248201527f4d434342696c6c696e673a206e6f7420666f756e6465720000000000000000006044820152606490fd5b67ffffffffffffffff81116108555760051b60200190565b91908110156108fc5760051b0190565b634e487b7160e01b5f52603260045260245ffd5b356001600160a01b0381168103610257579056fea2646970667358221220314fe9bb6d8378d3fbeddd7e0252dc621bc0fae921fa67f5822423220b60a56164736f6c63430008190033"
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
    "bytecode": "0x608034606f57601f6110b138819003918201601f19168301916001600160401b03831184841017607357808492602094604052833981010312606f57516001600160a01b03811690819003606f575f80546001600160a01b03191691909117905560405161102990816100888239f35b5f80fd5b634e487b7160e01b5f52604160045260245ffdfe60808060405260049081361015610014575f80fd5b5f3560e01c9081630623752614610bb957508063349ff77014610b925780633f9b49461461070b5780635d8e843a14610312578063754178511461013a57639b66b13914610060575f80fd5b34610136576020366003190112610136575f54604051634d853ee560e01b815282359290916001600160a01b0391602091849190829085165afa801561012b576100b4925f916100fc575b50163314610cc6565b6100c16001548210610e75565b60036100cc82610d58565b5001805460ff191690557f419a91c001167ea76233ed548fd1a02c21b5b63f8b6eaa7dd5747aac879148925f80a2005b61011e915060203d602011610124575b6101168183610c71565b810190610ca7565b5f6100ab565b503d61010c565b6040513d5f823e3d90fd5b5f80fd5b34610136575f36600319011261013657600180545f90815b8181106102dc575061016382610edc565b916101716040519384610c71565b80835261017d81610edc565b60208481019591601f190136873761019483610ef4565b916101a76101a185610ef4565b94610ef4565b945f805b82811061022557505050604051956080870190608088525180915260a0870197925f5b8281106102125750878061020e896102008a6101f28f8c8782036020890152610c01565b908582036040870152610c01565b908382036060850152610c01565b0390f35b84518a52988101989381019383016101ce565b928360ff600361023784989c97610d58565b5001541661024a575b01979392976101ab565b91808361025a6102d69388610f3d565b5261026d61026785610d58565b50610f51565b610277828a610f3d565b526102828189610f3d565b506102978361029086610d58565b5001610f51565b6102a1828b610f3d565b526102ac818a610f3d565b506102bb600261029086610d58565b6102c5828c610f3d565b526102d0818b610f3d565b50610eba565b91610240565b60ff60036102ec83969596610d58565b500154166102ff575b8201929192610152565b9261030a8391610eba565b9390506102f5565b50346101365760803660031901126101365780356024359167ffffffffffffffff92838111610136576103489036908301610bd3565b91604435858111610136576103609036908301610bd3565b9590606435828111610136576103799036908501610bd3565b97909360018060a01b0392835f5416604051948591634d853ee560e01b8352828560209889935afa801561012b576103ba925f916106f45750163314610cc6565b6001926103c984548b10610e75565b60ff60036103d68c610d58565b50015416156106b0576103e88a610d58565b50868a1161062c576104048a6103fe8354610da4565b83610ddc565b5f8a601f811160011461064a5780610430925f9161063f575b508160011b915f199060031b1c19161790565b90555b8361043d8b610d58565b50019186821161062c5761045b826104558554610da4565b85610ddc565b5f90601f83116001146105cc5761048992915f91836105c1575b50508160011b915f199060031b1c19161790565b90555b600261049789610d58565b50019389116105ae57506104af886104558554610da4565b5f91601f8911600114610524575050918691610505837f6e5513e8628895f1ea4671eaffcf4e0a879285edf1a0d5135d5f1c5b1148a4179899610514965f9161051957508160011b915f199060031b1c19161790565b90555b60405194859485610e4b565b0390a2005b90508401355f61041d565b9091601f198916845f52825f20925f905b828210610597575050916105149593918a7f6e5513e8628895f1ea4671eaffcf4e0a879285edf1a0d5135d5f1c5b1148a4179a9b96941061057e575b505083811b019055610508565b8401355f19600387901b60f8161c191690555f80610571565b808685968294968b01358155019501930190610535565b604190634e487b7160e01b5f525260245ffd5b013590505f80610475565b90859291601f19831691855f52885f20925f5b8a82821061061657505084116105fd575b505050811b01905561048c565b01355f19600384901b60f8161c191690555f80806105f0565b8385013586558a979095019492830192016105df565b604184634e487b7160e01b5f525260245ffd5b90508b01355f61041d565b50601f198b1690825f528b885f20928c8a8a5f925b84841061069757505050501061067e575b5050848a811b019055610433565b8a01355f1960038d901b60f8161c191690555f80610670565b860135875590950194938401938f9350018a8a8f61065f565b60405162461bcd60e51b8152808401869052601c60248201527f4d434353657276696365733a20736572766963652072656d6f766564000000006044820152606490fd5b61011e9150873d8911610124576101168183610c71565b50346101365760603660031901126101365767ffffffffffffffff81358181116101365761073c9036908401610bd3565b602492919235828111610136576107569036908601610bd3565b939092604435818111610136576107709036908801610bd3565b918760018060a01b036020815f541660405193848092634d853ee560e01b82525afa801561012b576107ab925f916100fc5750163314610cc6565b8415610b4e5760015495604051976080890189811084821117610b16576040526107e491906107db368989610d12565b8a523691610d12565b60208801526107f4368484610d12565b60408801526001606088015268010000000000000000861015610b3b576001860160015561082186610d58565b919091610b29578751805190828211610b1657610848826108428654610da4565b86610ddc565b602090601f8311600114610ab25761087692915f91836109835750508160011b915f199060031b1c19161790565b82555b600182016020890151805190838211610a9f5761089a826104558554610da4565b602090601f8311600114610a37576108c892915f91836109835750508160011b915f199060031b1c19161790565b90555b60408801518051918211610a2457602099506108f7826108ee6002860154610da4565b60028601610ddc565b8990601f831160011461098e5760037fddcfb03769e1dafa409f0203646fccd45573c7e7ee64130e14f26454b70eb97a989796946109548561097898968d9e966060965f926109835750508160011b915f199060031b1c19161790565b60028201555b01910151151560ff8019835416911617905560405194859485610e4b565b0390a2604051908152f35b015190505f80610475565b90601f19831691600285015f528b5f20925f5b818110610a0d5750946001858c9d956060956003956109789b997fddcfb03769e1dafa409f0203646fccd45573c7e7ee64130e14f26454b70eb97a9f9e9d9b106109f6575b505050811b01600282015561095a565b01515f1983871b60f8161c191690555f80806109e6565b92938d6001819287860151815501950193016109a1565b60418a634e487b7160e01b5f525260245ffd5b9190835f5260205f20905f935b601f1984168510610a84576001945083601f19811610610a6c575b505050811b0190556108cb565b01515f1960f88460031b161c191690555f8080610a5f565b81810151835560209485019460019093019290910190610a44565b60418c634e487b7160e01b5f525260245ffd5b90601f19831691855f5260205f20925f5b818110610afe5750908460019594939210610ae6575b505050811b018255610879565b01515f1960f88460031b161c191690555f8080610ad9565b92936020600181928786015181550195019301610ac3565b60418b634e487b7160e01b5f525260245ffd5b5f89634e487b7160e01b82525260245ffd5b604188634e487b7160e01b5f525260245ffd5b60405162461bcd60e51b81526020818a0152601a60248201527f4d434353657276696365733a206e616d652072657175697265640000000000006044820152606490fd5b34610136575f366003190112610136575f546040516001600160a01b039091168152602090f35b34610136575f366003190112610136576020906001548152f35b9181601f840112156101365782359167ffffffffffffffff8311610136576020838186019501011161013657565b908082519081815260208091019281808460051b8301019501935f915b848310610c2e5750505050505090565b909192939495848080600193601f1980878303018852601f838d518051918291828752018686015e5f858286010152011601019801930193019194939290610c1e565b90601f8019910116810190811067ffffffffffffffff821117610c9357604052565b634e487b7160e01b5f52604160045260245ffd5b9081602091031261013657516001600160a01b03811681036101365790565b15610ccd57565b60405162461bcd60e51b815260206004820152601f60248201527f4d434353657276696365733a206e6f7420636f6c6f6e7920666f756e646572006044820152606490fd5b92919267ffffffffffffffff8211610c935760405191610d3c601f8201601f191660200184610c71565b829481845281830111610136578281602093845f960137010152565b600154811015610d905760015f5260021b7fb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf601905f90565b634e487b7160e01b5f52603260045260245ffd5b90600182811c92168015610dd2575b6020831014610dbe57565b634e487b7160e01b5f52602260045260245ffd5b91607f1691610db3565b601f8211610de957505050565b5f5260205f20906020601f840160051c83019310610e21575b601f0160051c01905b818110610e16575050565b5f8155600101610e0b565b9091508190610e02565b908060209392818452848401375f828201840152601f01601f1916010190565b9290610e6490610e729593604086526040860191610e2b565b926020818503910152610e2b565b90565b15610e7c57565b60405162461bcd60e51b81526020600482015260166024820152751350d0d4d95c9d9a58d95cce881b9bdd08199bdd5b9960521b6044820152606490fd5b5f198114610ec85760010190565b634e487b7160e01b5f52601160045260245ffd5b67ffffffffffffffff8111610c935760051b60200190565b90610efe82610edc565b610f0b6040519182610c71565b8281528092610f1c601f1991610edc565b01905f5b828110610f2c57505050565b806060602080938501015201610f20565b8051821015610d905760209160051b010190565b9060405191825f8254610f6381610da4565b908184526020946001916001811690815f14610fd15750600114610f93575b505050610f9192500383610c71565b565b5f90815285812095935091905b818310610fb9575050610f9193508201015f8080610f82565b85548884018501529485019487945091830191610fa0565b92505050610f9194925060ff191682840152151560051b8201015f8080610f8256fea2646970667358221220e6896bb176657289eaa987ad18c00e9aaf76e5669433b856ee63c51bdeb161c564736f6c63430008190033"
  }
};
