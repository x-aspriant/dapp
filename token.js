// Token Contract Functions

const TOKEN_ABI = [
    'function balanceOf(address) view returns (uint256)',
    'function totalSupply() view returns (uint256)',
    'function approve(address spender, uint256 amount) returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'function tradingEnabled() view returns (bool)',
    'function maxWalletAmount() view returns (uint256)',
    'function transfer(address to, uint256 amount) returns (bool)',
    'function owner() view returns (address)',
    'function totalHolders() view returns (uint256)',  // ← ADDED THIS LINE
    'event Transfer(address indexed from, address indexed to, uint256 value)',
    'event Approval(address indexed owner, address indexed spender, uint256 value)'
];

class TokenContract {
    constructor(signer) {
        this.contract = new ethers.Contract(
            CONFIG.CONTRACTS.TOKEN,
            TOKEN_ABI,
            signer
        );
    }

    async getBalance(address) {
        try {
            return await this.contract.balanceOf(address);
        } catch (error) {
            console.error('Error getting balance:', error);
            return ethers.BigNumber.from(0);
        }
    }

    async getTotalSupply() {
        try {
            return await this.contract.totalSupply();
        } catch (error) {
            console.error('Error getting total supply:', error);
            return ethers.BigNumber.from(0);
        }
    }

    async isTradingEnabled() {
        try {
            return await this.contract.tradingEnabled();
        } catch (error) {
            console.error('Error checking trading status:', error);
            return false;
        }
    }

    async getMaxWalletAmount() {
        try {
            return await this.contract.maxWalletAmount();
        } catch (error) {
            console.error('Error getting max wallet:', error);
            return ethers.BigNumber.from(0);
        }
    }

    async approve(spender, amount) {
        try {
            const tx = await this.contract.approve(spender, amount);
            return tx;
        } catch (error) {
            console.error('Error approving:', error);
            throw error;
        }
    }

    async getAllowance(owner, spender) {
        try {
            return await this.contract.allowance(owner, spender);
        } catch (error) {
            console.error('Error getting allowance:', error);
            return ethers.BigNumber.from(0);
        }
    }

    async getOwner() {
        try {
            return await this.contract.owner();
        } catch (error) {
            // If function doesn't exist or owner is renounced
            return ethers.constants.AddressZero;
        }
    }

    async isOwnerRenounced() {
        const owner = await this.getOwner();
        return owner === ethers.constants.AddressZero;
    }

    // ────────────────────────────────────────────────────────────────
    // ADDED: Get total holder count
    // ────────────────────────────────────────────────────────────────
    async totalHolders() {
        try {
            return await this.contract.totalHolders();
        } catch (error) {
            console.error('Error getting total holders:', error);
            return ethers.BigNumber.from(0);
        }
    }
}

window.TokenContract = TokenContract;