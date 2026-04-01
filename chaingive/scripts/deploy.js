const { ethers, run } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("Deploying Donation contract...");

    const Donation = await ethers.getContractFactory("Donation");
    const donation = await Donation.deploy();
    await donation.waitForDeployment();

    const address = await donation.getAddress();
    console.log(`✅ Donation deployed to: ${address}`);

    // Save ABI to frontend
    const artifactPath = path.join(
        __dirname, "../artifacts/contracts/Donation.sol/Donation.json"
    );
    if (fs.existsSync(artifactPath)) {
        const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

        const abiOutputPath = path.join(
            __dirname, "../frontend/src/utils/DonationABI.json"
        );
        // We will export address too so our frontend can use it or .env
        const exportData = {
            address: address,
            abi: artifact.abi
        };
        fs.writeFileSync(abiOutputPath, JSON.stringify(exportData, null, 2));
        console.log("✅ ABI saved to frontend/src/utils/DonationABI.json");
    }

    // Try to verify (only works on Sepolia, skip on localhost)
    const network = await ethers.provider.getNetwork();
    if (network.chainId !== 31337n) {
        console.log("Waiting 30 seconds before verification...");
        await new Promise(r => setTimeout(r, 30000));
        try {
            await run("verify:verify", {
                address: address,
                constructorArguments: [],
            });
            console.log("✅ Contract verified on Etherscan!");
        } catch (e) {
            console.log("Verification note:", e.message);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
