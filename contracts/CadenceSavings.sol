// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CadenceSavingsVault
 * @dev Non-custodial USDC savings vault for Base network
 * Features:
 * - Manual deposits only (no auto-pulling)
 * - Withdraw anytime
 * - No fees
 * - Simple and secure
 */
contract CadenceSavingsVault is Ownable {
    IERC20 public immutable usdcToken;
    address public immutable user;
    uint256 public totalSaved;
    
    event Deposited(address indexed user, uint256 amount, uint256 timestamp);
    event Withdrawn(address indexed user, uint256 amount, uint256 timestamp);
    
    constructor(address _user, address _usdcToken) Ownable(_user) {
        user = _user;
        usdcToken = IERC20(_usdcToken);
    }
    
    /**
     * @dev Deposit USDC to vault
     * User must approve USDC transfer before calling
     */
    function deposit(uint256 amount) external {
        require(msg.sender == user, "Only vault owner can deposit");
        require(amount > 0, "Amount must be greater than 0");
        
        bool success = usdcToken.transferFrom(msg.sender, address(this), amount);
        require(success, "USDC transfer failed");
        
        totalSaved += amount;
        emit Deposited(msg.sender, amount, block.timestamp);
    }
    
    /**
     * @dev Withdraw USDC from vault
     */
    function withdraw(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= totalSaved, "Insufficient balance");
        
        totalSaved -= amount;
        bool success = usdcToken.transfer(msg.sender, amount);
        require(success, "USDC transfer failed");
        
        emit Withdrawn(msg.sender, amount, block.timestamp);
    }
    
    /**
     * @dev Get vault balance
     */
    function getBalance() external view returns (uint256) {
        return usdcToken.balanceOf(address(this));
    }
}

/**
 * @title CadenceSavingsFactory
 * @dev Factory contract to deploy individual vaults
 */
contract CadenceSavingsFactory {
    address public immutable usdcToken;
    mapping(address => address) public userVaults;
    
    event VaultCreated(address indexed user, address vaultAddress, uint256 timestamp);
    
    constructor(address _usdcToken) {
        usdcToken = _usdcToken;
    }
    
    /**
     * @dev Create a new vault for the caller
     */
    function createVault() external returns (address vaultAddress) {
        require(!hasVault(msg.sender), "Vault already exists for this user");
        
        CadenceSavingsVault newVault = new CadenceSavingsVault(msg.sender, usdcToken);
        vaultAddress = address(newVault);
        userVaults[msg.sender] = vaultAddress;
        
        emit VaultCreated(msg.sender, vaultAddress, block.timestamp);
    }
    
    /**
     * @dev Check if user has a vault
     */
    function hasVault(address user) public view returns (bool) {
        return userVaults[user] != address(0);
    }
    
    /**
     * @dev Get user's vault address
     */
    function getUserVault(address user) external view returns (address) {
        return userVaults[user];
    }
}