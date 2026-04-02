// Configuration File - Update contract addresses here after deployment

// Contract Addresses - BASE SEPOLIA TESTNET
const CONTRACTS = {
    TOKEN: '0x320A42fC3f8c3468f220545D47a48e2d37C32bfA',
    STAKING: '0x699E80870Aaf2e2Ec25eD0d183806487B26Fc48f',
    CONTRIBUTION: '0x175491c1e436dE6199CaC8A2a00398F4D7A9D70d',
    TEAM_VESTING: '0xAc4236b9226b068FD9aE29655326a0D07cAa9F6C',
    MARKETING_VESTING: '0x5DaaEDc98314717A0DC91BbE864c33817e36b130',
    AIRDROP: '0xF024D2F0E5519f7308aAb288C784495306Ab6e32' // Set after deployment
};

// Network Configuration
const LINEA_MAINNET = {
    chainId: '0xe708', // 59144 in hex
    chainName: 'Linea Mainnet',
    nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18
    },
    rpcUrls: ['https://rpc.linea.build'],
    blockExplorerUrls: ['https://lineascan.build']
};

const LINEA_TESTNET = {
    chainId: '0xe704', // 59140 in hex
    chainName: 'Linea Sepolia Testnet',
    nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18
    },
    rpcUrls: ['https://rpc.sepolia.linea.build'],
    blockExplorerUrls: ['https://sepolia.lineascan.build']
};

const BASE_SEPOLIA = {
    chainId: '0x14a34', // FIXED: correct hex for 84532 (was wrong 0x14a34)
    chainName: 'Base Sepolia',
    nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18
    },
    rpcUrls: ['https://sepolia.base.org'],
    blockExplorerUrls: ['https://sepolia.basescan.org']
};

// Current Network - CHANGE THIS FOR MAINNET
const CURRENT_NETWORK = BASE_SEPOLIA; // Using Base Sepolia for testing
const EXPLORER_URL = CURRENT_NETWORK.blockExplorerUrls[0];

// Token Constants
const TOKEN_CONSTANTS = {
    MAX_SUPPLY: '4000000',
    MAX_WALLET_PERCENT: 4,
    COOLDOWN_PERIOD: 30,
    TOKEN_PRICE: 4444, // tokens per ETH (1 ETH = $2,000 / $0.45 ≈ 4,444 EYSN)
    MIN_CONTRIBUTION: 0.01,
    INSTANT_PERCENT: 70,   // 70% instant (ContributionPhase v3)
    STAKE_PERCENT: 30      // 30% auto-staked
};

// Staking Constants — ElysonStaking v13
const STAKING_CONSTANTS = {
    MIN_STAKE: 100,
    EARLY_PENALTY_PERCENT: 30,
    PHASE_DURATION_DAYS: 180,
    WINDOW_DURATION_DAYS: 7,
    MAX_PHASES: 5,
    MAX_TRANCHES: 20,
    MAX_STAKING_POOL: 900000,
    // Phase reward pools (total = 1,000,000)
    PHASE_POOLS: [335195, 268156, 201117, 145408, 50124],
    // Loyalty bonus
    LOYALTY_MIN_STAKE: 1000,
    LOYALTY_MIN_DAYS: 250,
    LOYALTY_BONUS_AMOUNT: 500,
    LOYALTY_MAX_WINNERS: 400,
    LOYALTY_BONUS_POOL: 200000
};

// Vesting Constants — TeamVesting / MarketingVesting v13
const VESTING_CONSTANTS = {
    TEAM_ALLOCATION: 480000,       // 12% of 4M supply
    MARKETING_ALLOCATION: 240000,  // 6% of 4M supply
    TGE_PERCENT: 10,               // 10% at TGE
    AUTO_STAKE_PERCENT: 40,        // 40% auto-staked on init
    VESTING_PERCENT: 50,           // 50% linear vest
    VESTING_DURATION_MONTHS: 30,
    CLAIM_INTERVAL_DAYS: 30
};

// Airdrop Constants — AirdropClaim
const AIRDROP_CONSTANTS = {
    TOTAL_POOL: 160000,       // 4% of 4M supply
    MAX_RECIPIENTS: 500,
    SHARE_PER_USER: 320,      // 160,000 / 500
    TGE_PERCENT: 30,          // 30% → 96 EYSN instant
    STAKE_PERCENT: 70,        // 70% → 224 EYSN auto-staked
    TGE_AMOUNT: 96,           // per user
    STAKE_AMOUNT: 224         // per user
};

// Social Links
const SOCIAL_LINKS = {
    TWITTER: 'https://twitter.com/0xErova',
    TELEGRAM: 'https://t.me/elysonprotocol',
    DISCORD: 'https://discord.gg/elyson',
    GITHUB: 'https://github.com/elysonprotocol',
    MEDIUM: 'https://medium.com/@elysonprotocol'
};

// Export configuration
window.CONFIG = {
    CONTRACTS,
    CURRENT_NETWORK,
    EXPLORER_URL,
    TOKEN_CONSTANTS,
    STAKING_CONSTANTS,
    VESTING_CONSTANTS,
    AIRDROP_CONSTANTS,
    SOCIAL_LINKS
};
