// Contribution Contract Functions

const CONTRIBUTION_ABI = [
    'function contributionActive() view returns (bool)',
    'function contributionFinalized() view returns (bool)',
    'function startTime() view returns (uint256)',
    'function endTime() view returns (uint256)',
    'function totalETHRaised() view returns (uint256)',
    'function totalTokensDistributed() view returns (uint256)',
    'function CONTRIBUTION_ALLOCATION() view returns (uint256)',
    'function TOKEN_PRICE() view returns (uint256)',
    'function MIN_CONTRIBUTION() view returns (uint256)',
    'function contributions(address) view returns (uint256)',
    'function contribute() payable',
    'function getContributionInfo() view returns (uint256 raised, uint256 distributed, uint256 remaining, bool active, uint256 timeLeft)',
    'function getUserContribution(address) view returns (uint256 totalTokens, uint256 instant, uint256 staked, uint256 ethSpent, bool verified)',
    'function isVerified(address user) view returns (bool)',
    'function MIN_BUY_TOKENS() view returns (uint256)',
    'function MAX_BUY_TOKENS() view returns (uint256)',
    'event ContributionReceived(address indexed user, uint256 ethAmount, uint256 instantTokens, uint256 stakedTokens)'
];

class ContributionContract {
    constructor(signer) {
        this.contract = new ethers.Contract(
            CONFIG.CONTRACTS.CONTRIBUTION,
            CONTRIBUTION_ABI,
            signer
        );
    }

    async isActive() {
        try {
            return await this.contract.contributionActive();
        } catch (error) {
            console.error('Error checking contribution status:', error);
            return false;
        }
    }

    async isFinalized() {
        try {
            return await this.contract.contributionFinalized();
        } catch (error) {
            console.error('Error checking finalized status:', error);
            return false;
        }
    }

    async getInfo() {
        try {
            return await this.contract.getContributionInfo();
        } catch (error) {
            console.error('Error getting contribution info:', error);
            return {
                raised: ethers.BigNumber.from(0),
                distributed: ethers.BigNumber.from(0),
                remaining: ethers.BigNumber.from(0),
                active: false,
                timeLeft: ethers.BigNumber.from(0)
            };
        }
    }

    async getUserContribution(address) {
        try {
            return await this.contract.getUserContribution(address);
        } catch (error) {
            console.error('Error getting user contribution:', error);
            return { totalTokens: ethers.BigNumber.from(0), instant: ethers.BigNumber.from(0), staked: ethers.BigNumber.from(0), ethSpent: ethers.BigNumber.from(0), verified: false };
        }
    }

    // On-chain identity verification check (Binance SBT / Gitcoin ≥20 / Galxe SBT)
    async isVerified(address) {
        try {
            return await this.contract.isVerified(address);
        } catch (error) {
            console.error('Error checking verification:', error);
            return false;
        }
    }

    async getTotalRaised() {
        try {
            return await this.contract.totalETHRaised();
        } catch (error) {
            console.error('Error getting total raised:', error);
            return ethers.BigNumber.from(0);
        }
    }

    async getTotalDistributed() {
        try {
            return await this.contract.totalTokensDistributed();
        } catch (error) {
            console.error('Error getting total distributed:', error);
            return ethers.BigNumber.from(0);
        }
    }

    async contribute(ethAmount) {
        try {
            const tx = await this.contract.contribute({
                value: ethAmount
            });
            return tx;
        } catch (error) {
            console.error('Error contributing:', error);
            throw error;
        }
    }

    calculateTokenAmount(ethAmount) {
        // 1 ETH = 4,444 EYSN (contract: $2,000 / $0.45)
        return ethAmount * CONFIG.TOKEN_CONSTANTS.TOKEN_PRICE;
    }

    splitTokens(totalTokens) {
        const instant = totalTokens * 0.70; // 70% instant (ContributionPhase v3)
        const staked  = totalTokens * 0.30; // 30% auto-staked
        return { instant, staked };
    }
}

window.ContributionContract = ContributionContract;