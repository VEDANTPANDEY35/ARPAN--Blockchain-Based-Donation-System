// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Donation
 * @notice A production-ready smart contract for decentralized crowdfunding and donations.
 * @dev Implements gas-efficient storage usage, reentrancy protection, and custom error handling.
 */
contract Donation is ReentrancyGuard {
    // --- Errors ---
    error InvalidGoal();
    error DeadlinePassed();
    error DeadlineNotPassed();
    error CampaignNotFound();
    error NotCreator();
    error GoalNotReached();
    error GoalMet();
    error AlreadyWithdrawn();
    error NoDonation();
    error RefundAlreadyClaimed();
    error ZeroDonation();
    error TransferFailed();

    // --- Structs ---
    struct Campaign {
        uint256 id;
        address payable creator;
        string title;
        string description;
        uint256 goal;        // stored in wei
        uint256 deadline;    // unix timestamp
        uint256 raised;
        bool withdrawn;
    }

    // --- State Variables ---
    /// @notice Maps campaign ID to Campaign details
    mapping(uint256 => Campaign) public campaigns;
    /// @notice Maps campaign ID to donor address to donation amount
    mapping(uint256 => mapping(address => uint256)) public donations;
    /// @notice Maps campaign ID to donor address to refund claim status
    mapping(uint256 => mapping(address => bool)) public refundClaimed;
    /// @notice Total number of campaigns created
    uint256 public campaignCount;

    // --- Modifiers ---
    /**
     * @dev Reverts if the campaign does not exist.
     * @param id The ID of the campaign
     */
    modifier campaignExists(uint256 id) {
        if (id == 0 || id > campaignCount) revert CampaignNotFound();
        _;
    }

    /**
     * @dev Reverts if the caller is not the campaign creator.
     * @param id The ID of the campaign
     */
    modifier onlyCreator(uint256 id) {
        if (campaigns[id].creator != msg.sender) revert NotCreator();
        _;
    }

    /**
     * @dev Reverts if the current time is after the campaign deadline.
     * @param id The ID of the campaign
     */
    modifier beforeDeadline(uint256 id) {
        if (block.timestamp >= campaigns[id].deadline) revert DeadlinePassed();
        _;
    }

    /**
     * @dev Reverts if the current time is before the campaign deadline.
     * @param id The ID of the campaign
     */
    modifier afterDeadline(uint256 id) {
        if (block.timestamp < campaigns[id].deadline) revert DeadlineNotPassed();
        _;
    }

    // --- Events ---
    event CampaignCreated(uint256 indexed id, address creator, uint256 goal, uint256 deadline);
    event DonationReceived(uint256 indexed campaignId, address donor, uint256 amount);
    event FundsWithdrawn(uint256 indexed campaignId, address creator, uint256 amount);
    event RefundIssued(uint256 indexed campaignId, address donor, uint256 amount);

    // --- Core Functions ---

    /**
     * @notice Creates a new donation campaign
     * @param title Title of the campaign
     * @param description Brief description of the campaign
     * @param goal Funding goal in wei
     * @param deadline Unix timestamp for the campaign end date
     */
    function createCampaign(
        string calldata title,
        string calldata description,
        uint256 goal,
        uint256 deadline
    ) external {
        if (goal == 0) revert InvalidGoal();
        if (deadline <= block.timestamp) revert DeadlinePassed();
        
        unchecked {
            campaignCount++;
        }
        
        Campaign storage newCampaign = campaigns[campaignCount];
        newCampaign.id = campaignCount;
        newCampaign.creator = payable(msg.sender);
        newCampaign.title = title;
        newCampaign.description = description;
        newCampaign.goal = goal;
        newCampaign.deadline = deadline;

        emit CampaignCreated(campaignCount, msg.sender, goal, deadline);
    }

    /**
     * @notice Donate funds to a specific campaign
     * @param id The ID of the campaign
     */
    function donate(uint256 id) 
        external 
        payable 
        nonReentrant 
        campaignExists(id)
        beforeDeadline(id) 
    {
        if (msg.value == 0) revert ZeroDonation();

        Campaign storage campaign = campaigns[id];
        donations[id][msg.sender] += msg.value;
        campaign.raised += msg.value;

        emit DonationReceived(id, msg.sender, msg.value);
    }

    /**
     * @notice Withdraw funds to the campaign creator if goal is met and deadline passed
     * @param id The ID of the campaign
     */
    function withdrawFunds(uint256 id) 
        external 
        nonReentrant 
        campaignExists(id)
        onlyCreator(id)
        afterDeadline(id) 
    {
        Campaign storage campaign = campaigns[id];
        if (campaign.withdrawn) revert AlreadyWithdrawn();
        if (campaign.raised < campaign.goal) revert GoalNotReached();

        campaign.withdrawn = true;
        uint256 amount = campaign.raised;
        
        (bool success, ) = campaign.creator.call{value: amount}("");
        if (!success) revert TransferFailed();

        emit FundsWithdrawn(id, msg.sender, amount);
    }

    /**
     * @notice Claim a refund if the campaign failed to reach its goal
     * @param id The ID of the campaign
     */
    function claimRefund(uint256 id) 
        external 
        nonReentrant 
        campaignExists(id)
        afterDeadline(id) 
    {
        Campaign storage campaign = campaigns[id];
        if (campaign.raised >= campaign.goal) revert GoalMet();
        
        uint256 donatedAmount = donations[id][msg.sender];
        if (donatedAmount == 0) revert NoDonation();
        if (refundClaimed[id][msg.sender]) revert RefundAlreadyClaimed();

        refundClaimed[id][msg.sender] = true;
        
        (bool success, ) = msg.sender.call{value: donatedAmount}("");
        if (!success) revert TransferFailed();

        emit RefundIssued(id, msg.sender, donatedAmount);
    }

    // --- View Functions ---

    /**
     * @notice Get all details of a campaign
     * @param id The ID of the campaign
     * @return The Campaign struct containing campaign details
     */
    function getCampaign(uint256 id) 
        external 
        view 
        campaignExists(id) 
        returns (Campaign memory) 
    {
        return campaigns[id];
    }

    /**
     * @notice Get all campaigns in a single call
     * @return An array of Campaign structs
     */
    function getAllCampaigns() external view returns (Campaign[] memory) {
        uint256 count = campaignCount;
        Campaign[] memory allCampaigns = new Campaign[](count);
        for (uint256 i = 1; i <= count; ) {
            allCampaigns[i - 1] = campaigns[i];
            unchecked { i++; }
        }
        return allCampaigns;
    }

    /**
     * @notice Get the amount donated by a specific user to a campaign
     * @param id The ID of the campaign
     * @param user The address of the user
     * @return The amount donated in wei
     */
    function getUserDonation(uint256 id, address user)
        external
        view
        campaignExists(id)
        returns (uint256)
    {
        return donations[id][user];
    }

    /**
     * @notice Check if a user has claimed their refund for a failed campaign
     * @param id The ID of the campaign
     * @param user The address of the user
     * @return True if the refund has been claimed, false otherwise
     */
    function hasUserClaimedRefund(uint256 id, address user)
        external
        view
        campaignExists(id)
        returns (bool)
    {
        return refundClaimed[id][user];
    }
}
