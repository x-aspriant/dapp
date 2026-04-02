// Vesting Contract Functions — TeamVesting / MarketingVesting v13

const VESTING_ABI = [
    'function vestingInitialized() view returns (bool)',
    'function beneficiary() view returns (address)',
    'function startTime() view returns (uint256)',
    'function tgeClaimed() view returns (uint256)',
    'function vestingClaimed() view returns (uint256)',
    'function lastClaimTime() view returns (uint256)',
    'function TOTAL_ALLOCATION() view returns (uint256)',
    'function TGE_AMOUNT() view returns (uint256)',
    'function AUTO_STAKE_AMOUNT() view returns (uint256)',
    'function VESTING_AMOUNT() view returns (uint256)',
    'function VESTING_DURATION() view returns (uint256)',
    'function CLAIM_INTERVAL() view returns (uint256)',
    'function claimableVesting() view returns (uint256)',
    'function dailyVestingAccrued() view returns (uint256)',
    'function nextClaimIn() view returns (uint256)',
    'function getVestingInfo() view returns (address beneficiaryAddress, uint256 totalAllocation, uint256 tgeAmount, uint256 autoStakeAmount, uint256 vestingAllocation, uint256 tgeClaimedAmt, uint256 vestingClaimedAmt, uint256 vestingClaimable, uint256 dailyAccrual, uint256 vestingStart, uint256 vestingEnd, uint256 secondsUntilNextClaim, bool initialized)',
    'function claimTGE()',
    'function claimVesting()',
    'event TGEClaimed(address indexed beneficiary, uint256 amount)',
    'event VestingClaimed(address indexed beneficiary, uint256 amount)'
];

class VestingContract {
    constructor(signer, contractAddress) {
        this.contract = new ethers.Contract(
            contractAddress,
            VESTING_ABI,
            signer
        );
    }

    async isInitialized() {
        try { return await this.contract.vestingInitialized(); }
        catch (e) { console.error('vestingInitialized:', e); return false; }
    }

    async getBeneficiary() {
        try { return await this.contract.beneficiary(); }
        catch (e) { console.error('beneficiary:', e); return ethers.constants.AddressZero; }
    }

    async getInfo() {
        try { return await this.contract.getVestingInfo(); }
        catch (e) {
            console.error('getVestingInfo:', e);
            return {
                beneficiaryAddress: ethers.constants.AddressZero,
                totalAllocation: ethers.BigNumber.from(0),
                tgeAmount: ethers.BigNumber.from(0),
                autoStakeAmount: ethers.BigNumber.from(0),
                vestingAllocation: ethers.BigNumber.from(0),
                tgeClaimedAmt: ethers.BigNumber.from(0),
                vestingClaimedAmt: ethers.BigNumber.from(0),
                vestingClaimable: ethers.BigNumber.from(0),
                dailyAccrual: ethers.BigNumber.from(0),
                vestingStart: ethers.BigNumber.from(0),
                vestingEnd: ethers.BigNumber.from(0),
                secondsUntilNextClaim: ethers.BigNumber.from(0),
                initialized: false
            };
        }
    }

    async claimableVesting() {
        try { return await this.contract.claimableVesting(); }
        catch (e) { console.error('claimableVesting:', e); return ethers.BigNumber.from(0); }
    }

    async nextClaimIn() {
        try { return await this.contract.nextClaimIn(); }
        catch (e) { console.error('nextClaimIn:', e); return ethers.BigNumber.from(0); }
    }

    // One-time 10% TGE release
    async claimTGE() {
        try { return await this.contract.claimTGE(); }
        catch (e) { console.error('claimTGE:', e); throw e; }
    }

    // Monthly linear vest claim (unlocks every 30 days)
    async claimVesting() {
        try { return await this.contract.claimVesting(); }
        catch (e) { console.error('claimVesting:', e); throw e; }
    }
}

class TeamVesting extends VestingContract {
    constructor(signer) {
        super(signer, CONFIG.CONTRACTS.TEAM_VESTING);
    }
}

class MarketingVesting extends VestingContract {
    constructor(signer) {
        super(signer, CONFIG.CONTRACTS.MARKETING_VESTING);
    }
}

window.VestingContract = VestingContract;
window.TeamVesting = TeamVesting;
window.MarketingVesting = MarketingVesting;