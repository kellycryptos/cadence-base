// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CadenceSavings
 * @dev Non-custodial USDC savings vault for Base network.
 *      Uses a mapping to track individual user balances.
 */
contract CadenceSavings is ReentrancyGuard {
    IERC20 public immutable usdcToken;
    
    // Mapping of user address to their saved balance
    mapping(address => uint256) public balances;
    
    // Total stats
    uint256 public totalValueLocked;
    
    event Deposited(address indexed user, uint256 amount, uint256 timestamp);
    event Withdrawn(address indexed user, uint256 amount, uint256 timestamp);
    
    constructor(address _usdcToken) {
        require(_usdcToken != address(0), "Invalid token address");
        usdcToken = IERC20(_usdcToken);
    }
    
    /**
     * @dev Deposit USDC to vault.
     * User must approve USDC transfer before calling.
     */
    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        
        bool success = usdcToken.transferFrom(msg.sender, address(this), amount);
        require(success, "USDC transfer failed");
        
        balances[msg.sender] += amount;
        totalValueLocked += amount;
        
        emit Deposited(msg.sender, amount, block.timestamp);
    }
    
    /**
     * @dev Withdraw USDC from vault.
     */
    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        balances[msg.sender] -= amount;
        totalValueLocked -= amount;
        
        bool success = usdcToken.transfer(msg.sender, amount);
        require(success, "USDC transfer failed");
        
        emit Withdrawn(msg.sender, amount, block.timestamp);
    }
    
    /**
     * @dev Get user stats (balance and total saved - simplified for now to just balance)
     */
    function getUserStats(address user) external view returns (uint256 balance, uint256 totalSaved) {
        return (balances[user], balances[user]); // For now totalSaved is same as current balance unless we track historical
    }
}