// Airdrop Contract Functions — AirdropClaim

const AIRDROP_ABI = [
    // Constants
    'function TOTAL_POOL() view returns (uint256)',
    'function MAX_RECIPIENTS() view returns (uint256)',
    'function SHARE_PER_USER() view returns (uint256)',
    'function TGE_PERCENT() view returns (uint256)',
    'function STAKE_PERCENT() view returns (uint256)',

    // State
    'function merkleRoot() view returns (bytes32)',
    'function claimDeadline() view returns (uint256)',
    'function totalClaimed() view returns (uint256)',
    'function hasClaimed(address) view returns (bool)',
    'function paused() view returns (bool)',

    // View helpers
    'function isEligible(address user, bytes32[] proof) view returns (bool eligible, string reason)',
    'function poolBalance() view returns (uint256)',
    'function getStatus() view returns (uint256 pool, uint256 share, uint256 tgePerUser, uint256 stakePerUser, uint256 claimed, uint256 remaining, bool claimsOpen, uint256 deadline)',

    // Write
    'function claim(bytes32[] proof)',

    // Events
    'event Claimed(address indexed user, uint256 tgeAmount, uint256 stakedAmount)',
    'event MerkleRootSet(bytes32 indexed root)',
    'event ClaimDeadlineSet(uint256 deadline)'
];

class AirdropClaimContract {
    constructor(signer) {
        this.contract = new ethers.Contract(
            CONFIG.CONTRACTS.AIRDROP,
            AIRDROP_ABI,
            signer
        );
    }

    async getStatus() {
        try {
            return await this.contract.getStatus();
        } catch (e) {
            console.error('getStatus:', e);
            return {
                pool:        ethers.BigNumber.from(0),
                share:       ethers.BigNumber.from(0),
                tgePerUser:  ethers.BigNumber.from(0),
                stakePerUser:ethers.BigNumber.from(0),
                claimed:     ethers.BigNumber.from(0),
                remaining:   ethers.BigNumber.from(0),
                claimsOpen:  false,
                deadline:    ethers.BigNumber.from(0)
            };
        }
    }

    async hasClaimed(address) {
        try { return await this.contract.hasClaimed(address); }
        catch (e) { console.error('hasClaimed:', e); return false; }
    }

    async isEligible(address, proof) {
        try { return await this.contract.isEligible(address, proof); }
        catch (e) {
            console.error('isEligible:', e);
            return { eligible: false, reason: e.message || 'Unknown error' };
        }
    }

    async poolBalance() {
        try { return await this.contract.poolBalance(); }
        catch (e) { console.error('poolBalance:', e); return ethers.BigNumber.from(0); }
    }

    async claim(proof) {
        try { return await this.contract.claim(proof); }
        catch (e) { console.error('claim:', e); throw e; }
    }
}

window.AirdropClaimContract = AirdropClaimContract;
