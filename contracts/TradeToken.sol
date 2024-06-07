// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;
import "./interfaces/IPollutionToken.sol";
error Trade__Only_Receiver_Allowed();
error Trade__Need_Receiver_Differ_From_Sender();

/// @title Contract for trading PollutionTokens for ETH
/// @author Giuseppe La Vecchia
/// @notice It can be possible to start a new trade by a sender, accept or refuse it by a receiver.
/// @custom:experimental This is an experimental contract.
contract TradeToken {
    struct TradeData {
        address sender;
        address receiver;
        uint256 ptAmount;
        uint256 id;
    }

    mapping(address => TradeData[]) private receiverTrades;
    IPollutionToken private immutable tokenAddress;
    uint256 private id = 1; //used for trades instance identification
    event TradeCompleted(uint256 indexed id, bool hasSucceded);

    constructor(IPollutionToken _tokenAddress) {
        tokenAddress = IPollutionToken(_tokenAddress);
        tokenAddress.storeContractAddress(address(this), msg.sender);
    }

    /**
     * Begin a PollutionToken trade
     *
     * Allows 'sender' to start a trade of 'ptAmount' of tokens with the 'receiver'
     *
     * @param ptAmount amount of PollutionToken that you want to trade
     * @param receiver the receiver address
     */

    function startTrade(uint256 ptAmount, address receiver) public {
        require(
            tokenAddress.balanceOf(msg.sender) >= ptAmount,
            "Not enough tokens"
        );
        if (msg.sender == receiver) {
            revert Trade__Need_Receiver_Differ_From_Sender();
        }
        TradeData memory tdInstance = TradeData(
            msg.sender,
            receiver,
            ptAmount,
            id
        );
        id = id + 1;
        receiverTrades[receiver].push(tdInstance);
    }

    /**
     * Returning instances of all the trades of the 'receiver'
     *
     * @param receiver the receiver address
     */

    function returnTrades(
        address receiver
    ) public view returns (TradeData[] memory) {
        TradeData[] memory _receiverTrades = receiverTrades[receiver];
        return _receiverTrades;
    }

    function getTradeById(
        uint256 _id,
        address receiver
    ) public view returns (TradeData memory) {
        TradeData memory tdInstance;
        for (uint256 i = 0; i < receiverTrades[receiver].length; i++) {
            if (receiverTrades[receiver][i].id == _id) {
                tdInstance = receiverTrades[receiver][i];
                break;
            }
        }
        return tdInstance;
    }

    /**
     * Ending the trade instance
     *
     * This follow the startTrade execution. When a startTrade is called by a sender, the receiver must respond to the request, accepting and paying in ETH that ptAmount.
     * or refusing, simply emitting an event. In both cases the trade instance will be removed from the trade list.
     *
     * @param _id the trade identificator
     * @param receiver the receiver address
     * @param isSucceded true if 'receiver' accept the trade, false if he refuse
     * @dev a new require is added at before the transfer and payment because the sender can finish his tokens while waiting for receiver decision
     *
     */
    function endTrade(
        uint256 _id,
        address receiver,
        bool isSucceded
    ) public payable {
        if ((receiver != msg.sender)) {
            revert Trade__Only_Receiver_Allowed();
        }

        TradeData[] memory _receiverTrades = receiverTrades[receiver];
        TradeData memory tdInstance;
        //uint256 ethCost = tdInstance.ptAmount * tokenAddress.getPTtoEthRate();
        for (uint256 i = 0; i < _receiverTrades.length; i++) {
            if (_receiverTrades[i].id == _id) {
                tdInstance = _receiverTrades[i];
                removeIndex(i, receiver);
                break;
            }
        }

        if (isSucceded) {
            require(
                tokenAddress.balanceOf(tdInstance.sender) >=
                    tdInstance.ptAmount,
                "Sender hasn't got enough tokens"
            );
            //if accepted
            (bool sent, ) = payable(tdInstance.sender).call{value: msg.value}(
                ""
            );
            require(sent, "Failed to send Ether");

            tokenAddress.transferExtended(
                tdInstance.sender,
                receiver,
                tdInstance.ptAmount * 10 ** 18
            );

            emit TradeCompleted(tdInstance.id, true);
        } else {
            emit TradeCompleted(tdInstance.id, false);
        }
    }

    /**
     * Removing a specific index from a list
     *
     * For a better and safer delete without using the 'delete' keyword, the last element of the array replace the one in the 'index' position of the array.
     * Then the pop function is called, deleting the trade instance in the previous 'index' position.
     *
     * @param index the index of the array of trades of the trade instance that we want to delete
     * @param receiver the receiver address
     *
     */
    function removeIndex(uint256 index, address receiver) private {
        receiverTrades[receiver][index] = receiverTrades[receiver][
            receiverTrades[receiver].length - 1
        ];
        receiverTrades[receiver].pop();
    }
}
