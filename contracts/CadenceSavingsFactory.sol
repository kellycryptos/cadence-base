// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./CadenceSavingsVault.sol";

/**
 * @title CadenceSavingsFactory
 * @notice Factory contract to deploy individual savings vaults for users
 * @dev Each user can create one vault which they fully control
 */
contract CadenceSavingsFactory {
    address public immutable usdcToken;
    
    // Mapping from user address to their vault address
    mapping(address => address) public userVaults;
    
    // Array to track all created vaults
    address[] public allVaults;

    event VaultCreated(address indexed user, address indexed vaultAddress, uint256 timestamp);

    /**
     * @notice Initialize factory with USDC token address
     * @param _usdcToken The USDC token contract address on Base
     */
    constructor(address _usdcToken) {
        require(_usdcToken != address(0), "Invalid USDC token address");
        usdcToken = _usdcToken;
    }

    /**
     * @notice Create a new savings vault for the caller
     * @return vaultAddress The address of the newly created vault
     */
    function createVault() external returns (address vaultAddress) {
        require(!hasVault(msg.sender), "Vault already exists for this user");
        
        // Deploy new vault contract
        CadenceSavingsVault newVault = new CadenceSavingsVault(msg.sender, usdcToken);
        vaultAddress = address(newVault);
        
        // Store vault address
        userVaults[msg.sender] = vaultAddress;
        allVaults.push(vaultAddress);
        
        emit VaultCreated(msg.sender, vaultAddress, block.timestamp);
        
        return vaultAddress;
    }

    /**
     * @notice Get the vault address for a specific user
     * @param user The user's address
     * @return The vault address (address(0) if no vault exists)
     */
    function getUserVault(address user) external view returns (address) {
        return userVaults[user];
    }

    /**
     * @notice Check if a user has created a vault
     * @param user The user's address
     * @return True if the user has a vault, false otherwise
     */
    function hasVault(address user) public view returns (bool) {
        return userVaults[user] != address(0);
    }

    /**
     * @notice Get the total number of vaults created
     * @return The total count of vaults
     */
    function getTotalVaults() external view returns (uint256) {
        return allVaults.length;
    }

    /**
     * @notice Get all vault addresses (use with caution for large arrays)
     * @return Array of all vault addresses
     */
    function getAllVaults() external view returns (address[] memory) {
        return allVaults;
    }

    /**
     * @notice Get a specific vault by index
     * @param index The index in the allVaults array
     * @return The vault address at that index
     */
    function getVaultByIndex(uint256 index) external view returns (address) {
        require(index < allVaults.length, "Index out of bounds");
        return allVaults[index];
    }
}
