// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title CadenceSavingsVault
 * @notice Individual non-custodial savings vault for a single user
 * @dev Each user gets their own vault contract deployed via factory
 */
contract CadenceSavingsVault {
    address public immutable owner;
    IERC20 public immutable usdcToken;
    uint256 public totalSaved;

    event Deposited(address indexed user, uint256 amount, uint256 timestamp);
    event Withdrawn(address indexed user, uint256 amount, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    /**
     * @notice Initialize the vault with owner and USDC token address
     * @param _owner The address that owns this vault
     * @param _usdcToken The USDC token contract address on Base
     */
    constructor(address _owner, address _usdcToken) {
        require(_owner != address(0), "Invalid owner address");
        require(_usdcToken != address(0), "Invalid USDC token address");
        
        owner = _owner;
        usdcToken = IERC20(_usdcToken);
        totalSaved = 0;
    }

    /**
     * @notice Deposit USDC into the vault
     * @param amount Amount of USDC to deposit (in USDC's smallest unit)
     * @dev User must approve this contract to spend their USDC first
     */
    function deposit(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        
        bool success = usdcToken.transferFrom(msg.sender, address(this), amount);
        require(success, "USDC transfer failed");
        
        totalSaved += amount;
        
        emit Deposited(msg.sender, amount, block.timestamp);
    }

    /**
     * @notice Withdraw USDC from the vault
     * @param amount Amount of USDC to withdraw
     */
    function withdraw(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= getBalance(), "Insufficient balance");
        
        bool success = usdcToken.transfer(msg.sender, amount);
        require(success, "USDC transfer failed");
        
        emit Withdrawn(msg.sender, amount, block.timestamp);
    }

    /**
     * @notice Get the current USDC balance of the vault
     * @return Current balance in USDC's smallest unit
     */
    function getBalance() public view returns (uint256) {
        return usdcToken.balanceOf(address(this));
    }

    /**
     * @notice Get vault info
     * @return _owner The owner address
     * @return _balance Current USDC balance
     * @return _totalSaved Total amount saved historically
     */
    function getVaultInfo() external view returns (
        address _owner,
        uint256 _balance,
        uint256 _totalSaved
    ) {
        return (owner, getBalance(), totalSaved);
    }
}
