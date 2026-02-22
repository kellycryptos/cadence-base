// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

/**
 * @title CadenceVault
 * @dev Simple non-custodial USDC savings vault for Cadence Base.
 * Users can deposit USDC anytime and withdraw their balance anytime.
 */
contract CadenceVault {
    IERC20 public immutable usdc;
    
    // mapping of user address to their USDC balance in the vault
    mapping(address => uint256) public balances;
    // historically tracked total saved per user (doesn't decrease on withdrawal)
    mapping(address => uint256) public totalSaved;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    /**
     * @dev Initialize with USDC token address (Base USDC: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913)
     */
    constructor(address _usdc) {
        require(_usdc != address(0), "Invalid USDC address");
        usdc = IERC20(_usdc);
    }

    /**
     * @dev Deposit USDC into the vault.
     * User must have approved this contract to spend USDC.
     */
    function deposit(uint256 _amount) external {
        require(_amount > 0, "Amount must be > 0");
        
        bool success = usdc.transferFrom(msg.sender, address(this), _amount);
        require(success, "Transfer failed");

        balances[msg.sender] += _amount;
        totalSaved[msg.sender] += _amount;

        emit Deposited(msg.sender, _amount);
    }

    /**
     * @dev Withdraw USDC from the vault.
     */
    function withdraw(uint256 _amount) external {
        require(_amount > 0, "Amount must be > 0");
        require(balances[msg.sender] >= _amount, "Insufficient balance");

        balances[msg.sender] -= _amount;
        
        bool success = usdc.transfer(msg.sender, _amount);
        require(success, "Transfer failed");

        emit Withdrawn(msg.sender, _amount);
    }

    /**
     * @dev Get user balance and total saved historically.
     */
    function getUserStats(address _user) external view returns (uint256 balance, uint256 historicalTotal) {
        return (balances[_user], totalSaved[_user]);
    }
}
