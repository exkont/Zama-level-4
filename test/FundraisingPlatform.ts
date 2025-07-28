import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { FundraisingPlatform } from "../types";

describe("FundraisingPlatform", function () {
    let fundraisingPlatform: FundraisingPlatform;
    let owner: HardhatEthersSigner;
    let addr1: HardhatEthersSigner;
    let addr2: HardhatEthersSigner;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        const FundraisingPlatformFactory = await ethers.getContractFactory("FundraisingPlatform");
        fundraisingPlatform = await FundraisingPlatformFactory.deploy();
        await fundraisingPlatform.waitForDeployment();
    });

    describe("Campaign Creation", function () {
        it("Should create a campaign successfully", async function () {
            const title = "Помощь Анне";
            const description = "Анна нуждается в помощи для лечения";
            const targetAmount = ethers.parseEther("5");
            const duration = 30 * 24 * 60 * 60; // 30 days

            const tx = await fundraisingPlatform.createCampaign(title, description, targetAmount, duration);
            await tx.wait();

            const campaignInfo = await fundraisingPlatform.getCampaignBasicInfo(0);
            expect(campaignInfo.creator).to.equal(owner.address);
            expect(campaignInfo.title).to.equal(title);
            expect(campaignInfo.description).to.equal(description);
            expect(campaignInfo.targetAmount).to.equal(targetAmount);
            expect(campaignInfo.active).to.be.true;
        });

        it("Should fail with empty title", async function () {
            await expect(
                fundraisingPlatform.createCampaign("", "Valid description", ethers.parseEther("1"), 86400)
            ).to.be.revertedWith("Title required");
        });

        it("Should fail with empty description", async function () {
            await expect(
                fundraisingPlatform.createCampaign("Valid title", "", ethers.parseEther("1"), 86400)
            ).to.be.revertedWith("Description required");
        });

        it("Should fail with zero target amount", async function () {
            await expect(
                fundraisingPlatform.createCampaign("Valid title", "Valid description", 0, 86400)
            ).to.be.revertedWith("Target amount must be greater than 0");
        });

        it("Should fail with zero duration", async function () {
            await expect(
                fundraisingPlatform.createCampaign("Valid title", "Valid description", ethers.parseEther("1"), 0)
            ).to.be.revertedWith("Duration must be greater than 0");
        });
    });

    describe("Campaign Management", function () {
        beforeEach(async function () {
            await fundraisingPlatform.createCampaign(
                "Test Campaign",
                "Test Description for campaign",
                ethers.parseEther("1"),
                86400
            );
        });

        it("Should return active campaigns", async function () {
            const activeCampaigns = await fundraisingPlatform.getActiveCampaigns();
            expect(activeCampaigns.length).to.equal(1);
            expect(activeCampaigns[0]).to.equal(0);
        });

        it("Should return total campaigns count", async function () {
            const totalCampaigns = await fundraisingPlatform.getTotalCampaigns();
            expect(totalCampaigns).to.equal(1);
        });

        it("Should return all campaigns", async function () {
            await fundraisingPlatform.createCampaign(
                "Second Campaign",
                "Second Description",
                ethers.parseEther("2"),
                86400
            );

            const allCampaigns = await fundraisingPlatform.getAllCampaigns();
            expect(allCampaigns.length).to.equal(2);
            expect(allCampaigns[0]).to.equal(0);
            expect(allCampaigns[1]).to.equal(1);
        });

        it("Should allow creator to end campaign", async function () {
            await fundraisingPlatform.endCampaign(0);
            const campaignInfo = await fundraisingPlatform.getCampaignBasicInfo(0);
            expect(campaignInfo.active).to.be.false;
        });

        it("Should not allow non-creator to end campaign", async function () {
            await expect(
                fundraisingPlatform.connect(addr1).endCampaign(0)
            ).to.be.revertedWith("Only campaign creator");
        });

        it("Should not allow ending already ended campaign", async function () {
            await fundraisingPlatform.endCampaign(0);
            await expect(
                fundraisingPlatform.endCampaign(0)
            ).to.be.revertedWith("Campaign already ended");
        });
    });

    describe("FHEVM Donations", function () {
        let mockEncryptedAmount: string;
        let mockProof: string;

        beforeEach(async function () {
            await fundraisingPlatform.createCampaign(
                "Test Campaign",
                "Test Description for campaign",
                ethers.parseEther("1"),
                86400
            );

            // Mock encrypted data for tests
            mockEncryptedAmount = "0x" + "0".repeat(64); // 32 bytes
            mockProof = "0x" + "0".repeat(128); // 64 bytes
        });

        it("Should reject donation with insufficient gas fee", async function () {
            await expect(
                fundraisingPlatform.connect(addr1).donate(0, mockEncryptedAmount, mockProof, {
                    value: ethers.parseEther("0.0005") // less than 0.001 ETH
                })
            ).to.be.revertedWith("Minimum ETH for gas required");
        });

        it("Should reject donation to non-existent campaign", async function () {
            await expect(
                fundraisingPlatform.connect(addr1).donate(999, mockEncryptedAmount, mockProof, {
                    value: ethers.parseEther("0.001")
                })
            ).to.be.revertedWith("Campaign does not exist");
        });

        it("Should accept valid FHE donation", async function () {
            const gasAmount = ethers.parseEther("0.001");

            const tx = await fundraisingPlatform.connect(addr1).donate(0, mockEncryptedAmount, mockProof, {
                value: gasAmount
            });

            await expect(tx)
                .to.emit(fundraisingPlatform, "DonationMade")
                .withArgs(0, addr1.address);

            expect(await fundraisingPlatform.getDonorsCount(0)).to.equal(1);

            // Check campaign balance (ETH for gas/withdrawal)
            const campaignInfo = await fundraisingPlatform.getCampaignBasicInfo(0);
            expect(campaignInfo.currentAmount).to.equal(gasAmount);

            // Check campaign is initialized after first donation
            const isInitialized = await fundraisingPlatform.isCampaignInitialized(0);
            expect(isInitialized).to.be.true;
        });

        it("Should handle multiple donations from same donor", async function () {
            const gasAmount1 = ethers.parseEther("0.001");
            const gasAmount2 = ethers.parseEther("0.002");

            await fundraisingPlatform.connect(addr1).donate(0, mockEncryptedAmount, mockProof, {
                value: gasAmount1
            });

            await fundraisingPlatform.connect(addr1).donate(0, mockEncryptedAmount, mockProof, {
                value: gasAmount2
            });

            // Should still be 1 unique donor
            expect(await fundraisingPlatform.getDonorsCount(0)).to.equal(1);

            // Campaign should show total ETH balance
            const campaignInfo = await fundraisingPlatform.getCampaignBasicInfo(0);
            expect(campaignInfo.currentAmount).to.equal(gasAmount1 + gasAmount2);

            // Encrypted donation amount should be accessible by donor
            const donationAmount = await fundraisingPlatform.connect(addr1).getDonationAmount(0, addr1.address);
            expect(donationAmount).to.not.equal(0); // Should return euint64, not 0
        });

        it("Should handle donations from multiple donors", async function () {
            const gasAmount1 = ethers.parseEther("0.001");
            const gasAmount2 = ethers.parseEther("0.002");

            await fundraisingPlatform.connect(addr1).donate(0, mockEncryptedAmount, mockProof, {
                value: gasAmount1
            });

            await fundraisingPlatform.connect(addr2).donate(0, mockEncryptedAmount, mockProof, {
                value: gasAmount2
            });

            expect(await fundraisingPlatform.getDonorsCount(0)).to.equal(2);

            // Check total balance
            const campaignInfo = await fundraisingPlatform.getCampaignBasicInfo(0);
            expect(campaignInfo.currentAmount).to.equal(gasAmount1 + gasAmount2);

            // Individual donations should be accessible (encrypted)
            const donation1Amount = await fundraisingPlatform.connect(addr1).getDonationAmount(0, addr1.address);
            const donation2Amount = await fundraisingPlatform.connect(addr2).getDonationAmount(0, addr2.address);

            expect(donation1Amount).to.not.equal(0);
            expect(donation2Amount).to.not.equal(0);
        });

        it("Should calculate progress percentage from ETH balance", async function () {
            // Campaign target is 1 ETH, donate 0.5 ETH in gas
            const gasAmount = ethers.parseEther("0.5");

            await fundraisingPlatform.connect(addr1).donate(0, mockEncryptedAmount, mockProof, {
                value: gasAmount
            });

            const progress = await fundraisingPlatform.getProgressPercentage(0);
            expect(progress).to.equal(50); // 0.5/1.0 * 100 = 50%
        });

        it("Should track campaign initialization properly", async function () {
            // Before donation, campaign should not be initialized
            expect(await fundraisingPlatform.isCampaignInitialized(0)).to.be.false;

            await fundraisingPlatform.connect(addr1).donate(0, mockEncryptedAmount, mockProof, {
                value: ethers.parseEther("0.001")
            });

            // After donation, campaign should be initialized
            expect(await fundraisingPlatform.isCampaignInitialized(0)).to.be.true;
        });

        it("Should reject donation to inactive campaign", async function () {
            await fundraisingPlatform.endCampaign(0);

            await expect(
                fundraisingPlatform.connect(addr1).donate(0, mockEncryptedAmount, mockProof, {
                    value: ethers.parseEther("0.001")
                })
            ).to.be.revertedWith("Campaign not active");
        });

        it("Should restrict access to encrypted donation amounts", async function () {
            await fundraisingPlatform.connect(addr1).donate(0, mockEncryptedAmount, mockProof, {
                value: ethers.parseEther("0.001")
            });

            // Donor should access their own donation
            const donorAmount = await fundraisingPlatform.connect(addr1).getDonationAmount(0, addr1.address);
            expect(donorAmount).to.not.equal(0);

            // Creator should access any donation
            const creatorViewAmount = await fundraisingPlatform.getDonationAmount(0, addr1.address);
            expect(creatorViewAmount).to.not.equal(0);

            // Random address should not access
            await expect(
                fundraisingPlatform.connect(addr2).getDonationAmount(0, addr1.address)
            ).to.be.revertedWith("Not authorized");
        });

        it("Should allow creator to view encrypted total raised", async function () {
            await fundraisingPlatform.connect(addr1).donate(0, mockEncryptedAmount, mockProof, {
                value: ethers.parseEther("0.001")
            });

            // Creator should access encrypted total
            const totalRaised = await fundraisingPlatform.getEncryptedTotalRaised(0);
            expect(totalRaised).to.not.equal(0);

            // Non-creator should not access
            await expect(
                fundraisingPlatform.connect(addr1).getEncryptedTotalRaised(0)
            ).to.be.revertedWith("Only creator can view");
        });
    });

    describe("Fund Management", function () {
        beforeEach(async function () {
            await fundraisingPlatform.createCampaign(
                "Test Campaign",
                "Test Description",
                ethers.parseEther("1"),
                86400
            );

            // Add some donations
            const mockEncryptedAmount = "0x" + "0".repeat(64);
            const mockProof = "0x" + "0".repeat(128);

            await fundraisingPlatform.connect(addr1).donate(0, mockEncryptedAmount, mockProof, {
                value: ethers.parseEther("0.5")
            });
        });

        it("Should allow creator to withdraw funds after campaign ends", async function () {
            await fundraisingPlatform.endCampaign(0);

            const initialBalance = await ethers.provider.getBalance(owner.address);
            const tx = await fundraisingPlatform.withdrawFunds(0);
            const receipt = await tx.wait();
            const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
            const finalBalance = await ethers.provider.getBalance(owner.address);

            // Should withdraw the campaign balance minus gas
            expect(finalBalance + gasUsed - initialBalance).to.equal(ethers.parseEther("0.5"));
        });

        it("Should not allow withdrawal from active campaign", async function () {
            await expect(
                fundraisingPlatform.withdrawFunds(0)
            ).to.be.revertedWith("Campaign still active");
        });

        it("Should not allow non-creator to withdraw", async function () {
            await fundraisingPlatform.endCampaign(0);

            await expect(
                fundraisingPlatform.connect(addr1).withdrawFunds(0)
            ).to.be.revertedWith("Only campaign creator");
        });

        it("Should not allow double withdrawal", async function () {
            await fundraisingPlatform.endCampaign(0);
            await fundraisingPlatform.withdrawFunds(0);

            await expect(
                fundraisingPlatform.withdrawFunds(0)
            ).to.be.revertedWith("Funds already withdrawn");
        });
    });

    describe("Edge Cases", function () {
        it("Should handle empty campaigns list", async function () {
            const activeCampaigns = await fundraisingPlatform.getActiveCampaigns();
            expect(activeCampaigns.length).to.equal(0);

            const allCampaigns = await fundraisingPlatform.getAllCampaigns();
            expect(allCampaigns.length).to.equal(0);

            expect(await fundraisingPlatform.getTotalCampaigns()).to.equal(0);
        });

        it("Should handle progress calculation for campaign with no donations", async function () {
            await fundraisingPlatform.createCampaign(
                "Empty Campaign",
                "No donations yet",
                ethers.parseEther("1"),
                86400
            );

            const progress = await fundraisingPlatform.getProgressPercentage(0);
            expect(progress).to.equal(0);
        });

        it("Should cap progress at 100%", async function () {
            await fundraisingPlatform.createCampaign(
                "Small Target Campaign",
                "Easy to exceed",
                ethers.parseEther("0.001"), // Very small target
                86400
            );

            const mockEncryptedAmount = "0x" + "0".repeat(64);
            const mockProof = "0x" + "0".repeat(128);

            await fundraisingPlatform.connect(addr1).donate(0, mockEncryptedAmount, mockProof, {
                value: ethers.parseEther("0.01") // Much larger than target
            });

            const progress = await fundraisingPlatform.getProgressPercentage(0);
            expect(progress).to.equal(100);
        });
    });
}); 