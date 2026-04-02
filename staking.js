// Staking Contract Functions — ElysonStaking v13

const STAKING_ABI = [
    // State variables
    'function stakingEnabled() view returns (bool)',
    'function stakingClosed() view returns (bool)',
    'function stakingStartTime() view returns (uint256)',
    'function totalStaked() view returns (uint256)',
    'function totalPenaltyBurned() view returns (uint256)',
    'function tradingStartTime() view returns (uint256)',
    'function tradingStartSet() view returns (bool)',
    'function loyaltyWinnerCount() view returns (uint256)',

    // Constants
    'function MIN_STAKE() view returns (uint256)',
    'function MAX_STAKING_POOL() view returns (uint256)',
    'function PHASE_DURATION() view returns (uint256)',
    'function WINDOW_DURATION() view returns (uint256)',
    'function CLAIM_INTERVAL() view returns (uint256)',
    'function EARLY_PENALTY_PERCENT() view returns (uint256)',
    'function MAX_PHASES() view returns (uint256)',
    'function LOYALTY_BONUS_AMOUNT() view returns (uint256)',
    'function LOYALTY_MAX_WINNERS() view returns (uint256)',
    'function LOYALTY_MIN_DAYS() view returns (uint256)',
    'function LOYALTY_MIN_STAKE() view returns (uint256)',

    // Per-phase
    'function phaseRewardPool(uint256) view returns (uint256)',
    'function dailyRewardPerPhase(uint256) view returns (uint256)',

    // Per-user mappings
    'function userFirstStakeTime(address) view returns (uint256)',
    'function userLastClaimTime(address) view returns (uint256)',
    'function loyaltyQualified(address) view returns (bool)',
    'function loyaltyBonusClaimed(address) view returns (bool)',
    'function isContributionContract(address) view returns (bool)',

    // View functions — v13 uses getStakePosition + getStakeTimings (replaces old getStakeInfo)
    'function getStakePosition(address user) view returns (uint256 totalStakedAmt, uint256 currentPhase, uint256 phaseEnds, uint256 windowCloses, bool inPenaltyFreeWindow, uint256 depositCount, bool autoReturnEligible)',
    'function getStakeTimings(address user) view returns (uint256 daysUntilWindow, uint256 secondsUntilWindow, uint256 earlyExitPenalty, uint256 claimUnlocksAt, uint256 secondsUntilClaim, bool claimableNow, uint256 pendingRewardsTotal, uint256[5] pendingByPhase)',
    'function getRewardDisplay(address user) view returns (uint256 todayAccrued, uint256 totalAccrued, uint256[5] byPhase, uint256 daysSinceLastClaim, uint256 daysUntilNextClaim, uint256 secondsUntilNextClaim, bool claimableNow, uint256 projectedMonthly)',
    'function getDepositBreakdown(address user) view returns (uint256[] depositNumbers, uint256[] amounts, uint256[] depositTimes, bool[] isAutoStaked)',
    'function getProtocolPhaseInfo() view returns (uint256 phaseIndex, uint256 dailyEmission, uint256 monthlyEmission, uint256 phasePoolUsed, uint256 currentPhaseEndsAt, uint256 nextWindowOpensAt, uint256 nextWindowClosesAt)',
    'function getPoolInfo() view returns (uint256 totalStakedNow, uint256 poolCap, uint256 remainingCapacity, uint256 poolFullPercent)',
    'function getLoyaltyInfo(address user) view returns (uint256 loyaltyDays, uint256 daysRemaining, uint256 userRank, bool minStakeMet, bool qualified, bool fcfsSlotAvailable, uint256 winnersCount, bool claimed, uint256 bonusAmount, uint256 loyaltyEffectiveStart)',
    'function getLoyaltyWinners() view returns (address[])',
    'function calculateRewards(address user) view returns (uint256 total, uint256[5] byPhase)',
    'function isClaimable(address user) view returns (bool unlocked, uint256 secondsLeft)',
    'function totalStakers() view returns (uint256)',
    'function allPhasesComplete() view returns (bool)',

    // Write functions
    'function stake(uint256 amount)',
    'function unstake()',
    'function claimRewards()',
    'function claimLoyaltyBonus()',
    'function checkLoyaltyStatus()',
    'function triggerAutoReturn(address user)',

    // Events
    'event Staked(address indexed user, uint256 amount, uint256 depositNumber, uint256 currentPhase, bool isAutoStaked)',
    'event PhaseAdvanced(address indexed user, uint256 newPhase)',
    'event RewardsClaimed(address indexed user, uint256 totalRewards, uint256[5] rewardsByPhase, uint256 claimNumber)',
    'event Unstaked(address indexed user, uint256 principalReturned, uint256 penaltyBurned, uint256 rewardsPaid, bool earlyExit)',
    'event AutoReturned(address indexed user, uint256 principalReturned, uint256 rewardsPaid)',
    'event EmergencyExitProcessed(address indexed user, uint256 principalReturned, uint256 rewardsPaid)',
    'event LoyaltyQualified(address indexed user, uint256 rank, uint256 timestamp)',
    'event LoyaltyBonusClaimed(address indexed user, uint256 amount)',
    'event StakingEnabled(uint256 timestamp)',
    'event StakingClosed(uint256 timestamp)'
];

class StakingContract {
    constructor(signer) {
        this.contract = new ethers.Contract(
            CONFIG.CONTRACTS.STAKING,
            STAKING_ABI,
            signer
        );
    }

    async isEnabled() {
        try { return await this.contract.stakingEnabled(); }
        catch (e) { console.error('stakingEnabled:', e); return false; }
    }

    async isClosed() {
        try { return await this.contract.stakingClosed(); }
        catch (e) { console.error('stakingClosed:', e); return false; }
    }

    async getStartTime() {
        try { return await this.contract.stakingStartTime(); }
        catch (e) { console.error('stakingStartTime:', e); return ethers.BigNumber.from(0); }
    }

    async getTotalStaked() {
        try { return await this.contract.totalStaked(); }
        catch (e) { console.error('totalStaked:', e); return ethers.BigNumber.from(0); }
    }

    async getTotalStakers() {
        try { return await this.contract.totalStakers(); }
        catch (e) { console.error('totalStakers:', e); return ethers.BigNumber.from(0); }
    }

    async getProtocolPhaseInfo() {
        try { return await this.contract.getProtocolPhaseInfo(); }
        catch (e) {
            console.error('getProtocolPhaseInfo:', e);
            return { phaseIndex: ethers.BigNumber.from(0), dailyEmission: ethers.BigNumber.from(0), monthlyEmission: ethers.BigNumber.from(0), phasePoolUsed: ethers.BigNumber.from(0), currentPhaseEndsAt: ethers.BigNumber.from(0), nextWindowOpensAt: ethers.BigNumber.from(0), nextWindowClosesAt: ethers.BigNumber.from(0) };
        }
    }

    // Pool cap info — for dApp pool bar
    async getPoolInfo() {
        try { return await this.contract.getPoolInfo(); }
        catch (e) {
            console.error('getPoolInfo:', e);
            return { totalStakedNow: ethers.BigNumber.from(0), poolCap: ethers.utils.parseEther('900000'), remainingCapacity: ethers.utils.parseEther('900000'), poolFullPercent: ethers.BigNumber.from(0) };
        }
    }

    // v13: replaces old monolithic getStakeInfo
    async getStakePosition(address) {
        try { return await this.contract.getStakePosition(address); }
        catch (e) {
            console.error('getStakePosition:', e);
            return { totalStakedAmt: ethers.BigNumber.from(0), currentPhase: ethers.BigNumber.from(0), phaseEnds: ethers.BigNumber.from(0), windowCloses: ethers.BigNumber.from(0), inPenaltyFreeWindow: false, depositCount: ethers.BigNumber.from(0), autoReturnEligible: false };
        }
    }

    async getStakeTimings(address) {
        try { return await this.contract.getStakeTimings(address); }
        catch (e) {
            console.error('getStakeTimings:', e);
            return { daysUntilWindow: ethers.BigNumber.from(0), secondsUntilWindow: ethers.BigNumber.from(0), earlyExitPenalty: ethers.BigNumber.from(0), claimUnlocksAt: ethers.BigNumber.from(0), secondsUntilClaim: ethers.BigNumber.from(0), claimableNow: false, pendingRewardsTotal: ethers.BigNumber.from(0), pendingByPhase: [0,0,0,0,0] };
        }
    }

    async getRewardDisplay(address) {
        try { return await this.contract.getRewardDisplay(address); }
        catch (e) {
            console.error('getRewardDisplay:', e);
            return { todayAccrued: ethers.BigNumber.from(0), totalAccrued: ethers.BigNumber.from(0), byPhase: [0,0,0,0,0], daysSinceLastClaim: ethers.BigNumber.from(0), daysUntilNextClaim: ethers.BigNumber.from(0), secondsUntilNextClaim: ethers.BigNumber.from(0), claimableNow: false, projectedMonthly: ethers.BigNumber.from(0) };
        }
    }

    async getDepositBreakdown(address) {
        try { return await this.contract.getDepositBreakdown(address); }
        catch (e) { console.error('getDepositBreakdown:', e); return { depositNumbers: [], amounts: [], depositTimes: [], isAutoStaked: [] }; }
    }

    // Loyalty info — powers loyalty panel on dApp
    async getLoyaltyInfo(address) {
        try { return await this.contract.getLoyaltyInfo(address); }
        catch (e) {
            console.error('getLoyaltyInfo:', e);
            return { loyaltyDays: ethers.BigNumber.from(0), daysRemaining: ethers.BigNumber.from(250), userRank: ethers.BigNumber.from(0), minStakeMet: false, qualified: false, fcfsSlotAvailable: true, winnersCount: ethers.BigNumber.from(0), claimed: false, bonusAmount: ethers.utils.parseEther('500'), loyaltyEffectiveStart: ethers.BigNumber.from(0) };
        }
    }

    async getLoyaltyWinners() {
        try { return await this.contract.getLoyaltyWinners(); }
        catch (e) { console.error('getLoyaltyWinners:', e); return []; }
    }

    async calculateRewards(address) {
        try { const r = await this.contract.calculateRewards(address); return r.total; }
        catch (e) { console.error('calculateRewards:', e); return ethers.BigNumber.from(0); }
    }

    async isClaimable(address) {
        try { return await this.contract.isClaimable(address); }
        catch (e) { console.error('isClaimable:', e); return { unlocked: false, secondsLeft: ethers.BigNumber.from(0) }; }
    }

    async stake(amount) {
        try { return await this.contract.stake(amount); }
        catch (e) { console.error('stake:', e); throw e; }
    }

    async unstake() {
        try { return await this.contract.unstake(); }
        catch (e) { console.error('unstake:', e); throw e; }
    }

    async claimRewards() {
        try { return await this.contract.claimRewards(); }
        catch (e) { console.error('claimRewards:', e); throw e; }
    }

    async claimLoyaltyBonus() {
        try { return await this.contract.claimLoyaltyBonus(); }
        catch (e) { console.error('claimLoyaltyBonus:', e); throw e; }
    }

    async checkLoyaltyStatus() {
        try { return await this.contract.checkLoyaltyStatus(); }
        catch (e) { console.error('checkLoyaltyStatus:', e); throw e; }
    }

    async triggerAutoReturn(userAddress) {
        try { return await this.contract.triggerAutoReturn(userAddress); }
        catch (e) { console.error('triggerAutoReturn:', e); throw e; }
    }
}

window.StakingContract = StakingContract;
