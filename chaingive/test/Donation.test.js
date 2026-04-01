const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Donation Contract", function () {
    let Donation;
    let donation;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
        Donation = await ethers.getContractFactory("Donation");
        [owner, addr1, addr2] = await ethers.getSigners();
        donation = await Donation.deploy();
    });

    describe("Deployment", function () {
        it("Deploy contract successfully", async function () {
            expect(await donation.campaignCount()).to.equal(0);
        });
    });

    describe("Create Campaign", function () {
        it("Create a campaign with valid inputs", async function () {
            const deadline = (await time.latest()) + 86400; // 1 day
            const goal = ethers.parseEther("1.0");

            await expect(donation.createCampaign("Test", "Desc", goal, deadline))
                .to.emit(donation, "CampaignCreated")
                .withArgs(1, owner.address, goal, deadline);

            const campaign = await donation.getCampaign(1);
            expect(campaign.title).to.equal("Test");
        });

        it("Reject campaign creation with deadline in the past", async function () {
            const deadline = (await time.latest()) - 86400;
            const goal = ethers.parseEther("1.0");

            await expect(donation.createCampaign("Test", "Desc", goal, deadline))
                .to.be.revertedWithCustomError(donation, "DeadlinePassed");
        });

        it("Reject campaign with goal of 0", async function () {
            const deadline = (await time.latest()) + 86400;

            await expect(donation.createCampaign("Test", "Desc", 0, deadline))
                .to.be.revertedWithCustomError(donation, "InvalidGoal");
        });
    });

    describe("Donate", function () {
        let deadline;
        let goal;

        beforeEach(async function () {
            deadline = (await time.latest()) + 86400;
            goal = ethers.parseEther("1.0");
            await donation.connect(owner).createCampaign("Test", "Desc", goal, deadline);
        });

        it("Donate to a campaign and verify raised amount increases", async function () {
            const amount = ethers.parseEther("0.5");
            await expect(donation.connect(addr1).donate(1, { value: amount }))
                .to.emit(donation, "DonationReceived")
                .withArgs(1, addr1.address, amount);

            const campaign = await donation.getCampaign(1);
            expect(campaign.raised).to.equal(amount);

            const donated = await donation.donations(1, addr1.address);
            expect(donated).to.equal(amount);
        });

        it("Reject zero-value donations", async function () {
            await expect(donation.connect(addr1).donate(1, { value: 0 }))
                .to.be.revertedWithCustomError(donation, "ZeroDonation");
        });

        it("Reject donation after deadline", async function () {
            await time.increaseTo(deadline + 1);

            const amount = ethers.parseEther("0.5");
            await expect(donation.connect(addr1).donate(1, { value: amount }))
                .to.be.revertedWithCustomError(donation, "DeadlinePassed");
        });
    });

    describe("Withdraw Funds", function () {
        let deadline;
        let goal;

        beforeEach(async function () {
            deadline = (await time.latest()) + 86400;
            goal = ethers.parseEther("1.0");
            await donation.connect(owner).createCampaign("Test", "Desc", goal, deadline);
        });

        it("Withdraw funds when goal met and deadline passed", async function () {
            const amount = ethers.parseEther("1.5");
            await donation.connect(addr1).donate(1, { value: amount });

            await time.increaseTo(deadline + 1);

            await expect(donation.connect(owner).withdrawFunds(1))
                .to.emit(donation, "FundsWithdrawn")
                .withArgs(1, owner.address, amount);

            const campaign = await donation.getCampaign(1);
            expect(campaign.withdrawn).to.be.true;
        });

        it("Reject withdrawal if goal not met", async function () {
            const amount = ethers.parseEther("0.5");
            await donation.connect(addr1).donate(1, { value: amount });

            await time.increaseTo(deadline + 1);

            await expect(donation.connect(owner).withdrawFunds(1))
                .to.be.revertedWithCustomError(donation, "GoalNotReached");
        });

        it("Reject withdrawal before deadline", async function () {
            const amount = ethers.parseEther("1.5");
            await donation.connect(addr1).donate(1, { value: amount });

            await expect(donation.connect(owner).withdrawFunds(1))
                .to.be.revertedWithCustomError(donation, "DeadlineNotPassed");
        });

        it("Reject withdrawal by non-creator", async function () {
            const amount = ethers.parseEther("1.5");
            await donation.connect(addr1).donate(1, { value: amount });

            await time.increaseTo(deadline + 1);

            await expect(donation.connect(addr1).withdrawFunds(1))
                .to.be.revertedWithCustomError(donation, "NotCreator");
        });
    });

    describe("Claim Refund", function () {
        let deadline;
        let goal;

        beforeEach(async function () {
            deadline = (await time.latest()) + 86400;
            goal = ethers.parseEther("1.0");
            await donation.connect(owner).createCampaign("Test", "Desc", goal, deadline);
        });

        it("Claim refund when goal not met after deadline", async function () {
            const amount = ethers.parseEther("0.5");
            await donation.connect(addr1).donate(1, { value: amount });

            await time.increaseTo(deadline + 1);

            await expect(donation.connect(addr1).claimRefund(1))
                .to.emit(donation, "RefundIssued")
                .withArgs(1, addr1.address, amount);

            const claimed = await donation.refundClaimed(1, addr1.address);
            expect(claimed).to.be.true;
        });

        it("Reject refund if goal was met", async function () {
            const amount = ethers.parseEther("1.5");
            await donation.connect(addr1).donate(1, { value: amount });

            await time.increaseTo(deadline + 1);

            await expect(donation.connect(addr1).claimRefund(1))
                .to.be.revertedWithCustomError(donation, "GoalMet");
        });

        it("Reject double refund attempt", async function () {
            const amount = ethers.parseEther("0.5");
            await donation.connect(addr1).donate(1, { value: amount });

            await time.increaseTo(deadline + 1);

            await donation.connect(addr1).claimRefund(1);

            await expect(donation.connect(addr1).claimRefund(1))
                .to.be.revertedWithCustomError(donation, "RefundAlreadyClaimed");
        });

        it("Verify RefundIssued event is emitted", async function () {
            const amount = ethers.parseEther("0.5");
            await donation.connect(addr1).donate(1, { value: amount });
            await time.increaseTo(deadline + 1);
            await expect(donation.connect(addr1).claimRefund(1))
                .to.emit(donation, "RefundIssued")
                .withArgs(1, addr1.address, amount);
        });
    });

    describe("Events", function () {
        let deadline;
        let goal;

        beforeEach(async function () {
            deadline = (await time.latest()) + 86400;
            goal = ethers.parseEther("1.0");
        });

        it("Verify CampaignCreated event is emitted", async function () {
            await expect(donation.connect(owner).createCampaign("Test", "Desc", goal, deadline))
                .to.emit(donation, "CampaignCreated")
                .withArgs(1, owner.address, goal, deadline);
        });

        it("Verify DonationReceived event is emitted", async function () {
            await donation.connect(owner).createCampaign("Test", "Desc", goal, deadline);
            const amount = ethers.parseEther("0.5");
            await expect(donation.connect(addr1).donate(1, { value: amount }))
                .to.emit(donation, "DonationReceived")
                .withArgs(1, addr1.address, amount);
        });

        it("Verify FundsWithdrawn event is emitted", async function () {
            await donation.connect(owner).createCampaign("Test", "Desc", goal, deadline);
            const amount = ethers.parseEther("1.5");
            await donation.connect(addr1).donate(1, { value: amount });
            await time.increaseTo(deadline + 1);
            await expect(donation.connect(owner).withdrawFunds(1))
                .to.emit(donation, "FundsWithdrawn")
                .withArgs(1, owner.address, amount);
        });
    });
});
