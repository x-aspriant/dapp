// Main DApp Coordinator - Updated for modular structure

// Global State
let provider = null;
let signer = null;
let userAddress = null;
let tokenContract = null;
let stakingContract = null;
let contributionContract = null;
let teamVestingContract = null;
let marketingVestingContract = null;
let airdropContract = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DApp initializing...');
    setupEventListeners();
    setupTabNavigation();
    updateContractLinks();
    await checkWalletConnection();
});

// Setup Event Listeners
function setupEventListeners() {
    const connectBtn = document.getElementById('connectWallet');
    const disconnectBtn = document.getElementById('disconnectWallet');
    
    if (connectBtn) {
        connectBtn.addEventListener('click', connectWallet);
    }
    
    if (disconnectBtn) {
        disconnectBtn.addEventListener('click', disconnectWallet);
    }
    
    // Contribution
    const ethAmountInput = document.getElementById('ethAmount');
    if (ethAmountInput) {
        ethAmountInput.addEventListener('input', updateTokenSplit);
    }

    const verifyContribBtn = document.getElementById('verifyContribBtn');
    if (verifyContribBtn) verifyContribBtn.addEventListener('click', handleVerifyContribution);

    const contributeBtn = document.getElementById('contributeBtn');
    if (contributeBtn) {
        contributeBtn.addEventListener('click', handleContribute);
    }
    
    // Staking
    const maxStakeBtn = document.getElementById('maxStakeBtn');
    if (maxStakeBtn) {
        maxStakeBtn.addEventListener('click', setMaxStake);
    }
    
    const approveStakeBtn = document.getElementById('approveStakeBtn');
    if (approveStakeBtn) {
        approveStakeBtn.addEventListener('click', handleApproveStaking);
    }
    
    const stakeBtn = document.getElementById('stakeBtn');
    if (stakeBtn) {
        stakeBtn.addEventListener('click', handleStake);
    }
    
    // Rewards
    const claimRewardsBtn = document.getElementById('claimRewardsBtn');
    if (claimRewardsBtn) {
        claimRewardsBtn.addEventListener('click', handleClaimRewards);
    }
    
    const unstakeBtn = document.getElementById('unstakeBtn');
    if (unstakeBtn) {
        unstakeBtn.addEventListener('click', handleUnstake);
    }

    const autoReturnBtn = document.getElementById('autoReturnBtn');
    if (autoReturnBtn) {
        autoReturnBtn.addEventListener('click', handleAutoReturn);
    }
    
    // Vesting
    const claimTeamBtn = document.getElementById('claimTeamBtn');
    if (claimTeamBtn) {
        claimTeamBtn.addEventListener('click', handleClaimTeam);
    }
    
    const claimMarketingBtn = document.getElementById('claimMarketingBtn');
    if (claimMarketingBtn) {
        claimMarketingBtn.addEventListener('click', handleClaimMarketing);
    }

    // Loyalty bonus buttons
    const checkLoyaltyBtn = document.getElementById('checkLoyaltyBtn');
    if (checkLoyaltyBtn) checkLoyaltyBtn.addEventListener('click', handleCheckLoyalty);

    const claimLoyaltyBtn = document.getElementById('claimLoyaltyBtn');
    if (claimLoyaltyBtn) claimLoyaltyBtn.addEventListener('click', handleClaimLoyalty);

    // Airdrop
    const claimAirdropBtn = document.getElementById('claimAirdropBtn');
    if (claimAirdropBtn) claimAirdropBtn.addEventListener('click', handleClaimAirdrop);
}

// Tab Navigation
function setupTabNavigation() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeTab) activeTab.classList.add('active');
    
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    const activeContent = document.getElementById(tabName);
    if (activeContent) activeContent.classList.add('active');
    
    if (userAddress) {
        loadTabData(tabName);
    }
}

async function loadTabData(tabName) {
    console.log('Loading tab data:', tabName);
    switch(tabName) {
        case 'home':
            await loadHomeData();
            break;
        case 'contribution':
            await loadContributionData();
            break;
        case 'staking':
            await loadStakingData();
            break;
        case 'rewards':
            await loadRewardsData();
            break;
        case 'vesting':
            await loadVestingData();
            break;
        case 'transparency':
            await loadTransparencyData();
            break;
        case 'airdrop':
            await loadAirdropData();
            break;
    }
}

// Wallet Connection
async function connectWallet() {
    console.log('Connecting wallet...');
    
    try {
        // ────────────────────────────────────────────────────────────
        // MOBILE DETECTION: Check if user is on mobile device
        // ────────────────────────────────────────────────────────────
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (typeof window.ethereum === 'undefined') {
            // No wallet detected
            if (isMobile) {
                // On mobile - redirect to MetaMask mobile app
                const dappUrl = window.location.href.replace(/^https?:\/\//, '');
                const metamaskDeepLink = `https://metamask.app.link/dapp/${dappUrl}`;
                
                if (confirm('MetaMask not detected!\n\nClick OK to open in MetaMask Mobile App\n(You will be redirected to install if you don\'t have it)')) {
                    window.location.href = metamaskDeepLink;
                }
                return;
            } else {
                // On desktop - show install prompt
                alert('Please install MetaMask!');
                window.open('https://metamask.io/download/', '_blank');
                return;
            }
        }
        
        // Request account access
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });
        
        console.log('Accounts:', accounts);
        
        if (accounts.length === 0) {
            alert('No accounts found. Please unlock MetaMask.');
            return;
        }
        
        // Initialize provider and signer
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        userAddress = await signer.getAddress();
        
        console.log('Connected address:', userAddress);
        
        // Check network
        const network = await provider.getNetwork();
        console.log('Current network chainId:', network.chainId);
        
        // FIXED: use config value (Base Sepolia = 84532)
        const correctChainId = Number(CONFIG.CURRENT_NETWORK.chainId);
        if (network.chainId !== correctChainId) {
            notify.warning(
                'Wrong Network',
                `Please switch to ${CONFIG.CURRENT_NETWORK.chainName} in your wallet`
            );
            await switchToCorrectNetwork();
            return;
        }
        
        // Initialize contracts
        initializeContracts();

        // FIXED: feedback if init failed
        if (!stakingContract || !tokenContract || !contributionContract) {
            Utils.showNotification('Failed to initialize contracts. Wrong network or invalid addresses.', 'error');
        }
        
        // Update UI
        const connectBtn = document.getElementById('connectWallet');
        const walletInfo = document.getElementById('walletInfo');
        const walletAddress = document.getElementById('walletAddress');
        
        console.log('Updating UI...', { connectBtn, walletInfo, walletAddress });
        
        if (connectBtn) {
            connectBtn.style.display = 'none';
            connectBtn.classList.add('hidden');
        }
        if (walletInfo) {
            walletInfo.style.display = 'flex';
            walletInfo.classList.remove('hidden');
        }
        if (walletAddress) {
            walletAddress.textContent = Utils.shortenAddress(userAddress);
        }
        
        // FIXED: enable action buttons after successful connect + chain check
        const buttonIds = ['contributeBtn','approveStakeBtn','stakeBtn','claimRewardsBtn','unstakeBtn','claimTeamBtn','claimMarketingBtn'];
        buttonIds.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.disabled = false;
        });

        // FIXED: direct await, no setTimeout
        await loadAllData();
        
        // Listen for changes
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', () => window.location.reload());
        
        notify.success(
            'Wallet Connected!',
            `Successfully connected`,
            userAddress
        );
        
    } catch (error) {
        console.error('Error connecting wallet:', error);
        
        // Better error messages
        if (error.code === 4001) {
            alert('Connection rejected. Please approve in your wallet.');
        } else if (error.code === -32002) {
            alert('Connection request pending. Please check MetaMask.');
        } else {
            notify.error(
                'Connection Failed',
                error.message || 'Please try again'
            );
        }
    }
}

async function switchToCorrectNetwork() {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: CONFIG.CURRENT_NETWORK.chainId }],
        });
        window.location.reload();
    } catch (switchError) {
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [CONFIG.CURRENT_NETWORK],
                });
                window.location.reload();
            } catch (addError) {
                console.error('Error adding network:', addError);
                Utils.showNotification('Failed to add network', 'error');
            }
        }
    }
}

function disconnectWallet() {
    provider = null;
    signer = null;
    userAddress = null;
    
    document.getElementById('connectWallet')?.classList.remove('hidden');
    document.getElementById('walletInfo')?.classList.add('hidden');
    
    window.location.reload();
}

async function checkWalletConnection() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                await connectWallet();
            }
        } catch (error) {
            console.error('Error checking wallet:', error);
        }
    }
}

function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        disconnectWallet();
    } else {
        window.location.reload();
    }
}

// Initialize Contracts
function initializeContracts() {
    console.log('Initializing contracts...');
    try {
        tokenContract = new TokenContract(signer);
        stakingContract = new StakingContract(signer);
        contributionContract = new ContributionContract(signer);
        teamVestingContract = new TeamVesting(signer);
        marketingVestingContract = new MarketingVesting(signer);
        if (CONFIG.CONTRACTS.AIRDROP) {
            airdropContract = new AirdropClaimContract(signer);
        }
        console.log('Contracts initialized');
    } catch (error) {
        console.error('Error initializing contracts:', error);
    }
}

// Update Contract Links
function updateContractLinks() {
    const links = [
        { id: 'tokenLink', address: CONFIG.CONTRACTS.TOKEN },
        { id: 'stakingLink', address: CONFIG.CONTRACTS.STAKING },
        { id: 'contributionLink', address: CONFIG.CONTRACTS.CONTRIBUTION },
        { id: 'teamVestingLink', address: CONFIG.CONTRACTS.TEAM_VESTING },
        { id: 'marketingVestingLink', address: CONFIG.CONTRACTS.MARKETING_VESTING },
        { id: 'airdropLink', address: CONFIG.CONTRACTS.AIRDROP }
    ];
    
    links.forEach(({ id, address }) => {
        const element = document.getElementById(id);
        if (element && address) {
            element.href = Utils.getExplorerLink(address);
            element.textContent = Utils.shortenAddress(address);
        } else if (element) {
            element.textContent = 'Pending deployment';
        }
    });
}

// FIXED: load key tabs after connect
async function loadAllData() {
    console.log('Loading all data...');
    await loadHomeData();
    await loadContributionData();
    await loadStakingData();
    await loadRewardsData();
    await loadVestingData();
    await loadAirdropData();
}

async function loadHomeData() {
    console.log('Loading home data...');

    try {
        if (!tokenContract || !stakingContract) {
            console.error('Contracts not initialized');
            // Set safe defaults
            document.getElementById('totalSupply').textContent = '4,000,000';
            document.getElementById('holders').textContent = 'N/A';
            document.getElementById('circulatingSupply').textContent = 'N/A';
            document.getElementById('totalStaked').textContent = 'N/A';
            return;
        }
        
        // Total Supply — fixed 4,000,000 (ElysonToken MAX_SUPPLY)
        document.getElementById('totalSupply').textContent = '4,000,000';
        
        // Get total staked - wrapped in try/catch
        try {
            console.log('Getting total staked...');
            const totalStaked = await stakingContract.getTotalStaked();
            console.log('Total staked:', totalStaked.toString());
            
            document.getElementById('totalStaked').textContent = Utils.formatTokenAmount(totalStaked);
            
            // Calculate circulating
            const totalSupply = ethers.utils.parseEther('4000000');
            const circulating = totalSupply.sub(totalStaked);
            document.getElementById('circulatingSupply').textContent = Utils.formatTokenAmount(circulating);
        } catch (err) {
            console.error('Error getting staked data:', err);
            document.getElementById('totalStaked').textContent = 'Error';
            document.getElementById('circulatingSupply').textContent = 'Error';
        }
        
        // ────────────────────────────────────────────────────────────────
        // FIXED: totalHolders is a public variable, not a function
        // ────────────────────────────────────────────────────────────────
        try {
            console.log('Getting holder count...');
            const holderCount = await tokenContract.totalHolders();
            console.log('Holder count:', holderCount.toString());
            document.getElementById('holders').textContent = holderCount.toString();
        } catch (err) {
            console.error('Error getting holder count:', err);
            document.getElementById('holders').textContent = 'N/A';
        }
        
        console.log('Home data loaded successfully');
        
    } catch (error) {
        console.error('Error loading home data:', error);
        document.getElementById('totalSupply').textContent = '4,000,000';
        document.getElementById('holders').textContent = 'N/A';
        document.getElementById('circulatingSupply').textContent = 'Error';
        document.getElementById('totalStaked').textContent = 'Error';
    }
}

// CONTRIBUTION FUNCTIONS
function updateTokenSplit() {
    const ethAmount = parseFloat(document.getElementById('ethAmount')?.value) || 0;
    const totalTokens = ethAmount * CONFIG.TOKEN_CONSTANTS.TOKEN_PRICE; // 4,444 per ETH
    const instant = totalTokens * 0.70; // 70% instant (ContributionPhase v3)
    const staked  = totalTokens * 0.30; // 30% auto-staked
    
    const instantEl = document.getElementById('instantTokens');
    const stakedEl = document.getElementById('stakedTokens');
    
    if (instantEl) instantEl.textContent = instant.toFixed(2) + ' EYSN';
    if (stakedEl) stakedEl.textContent = staked.toFixed(2) + ' EYSN';
}

async function loadContributionData() {
    try {
        if (!contributionContract) return;
        
        const info = await contributionContract.getInfo();
        const userContrib = await contributionContract.getUserContribution(userAddress);

        const statusEl = document.getElementById('contributionStatus');
        if (statusEl) {
            const statusText = info.active ?
                `Active — ${Utils.getTimeRemaining(info.timeLeft.toNumber())} remaining` :
                'Ended';
            statusEl.innerHTML = `
                <p><strong>Status:</strong> ${statusText}</p>
                <p><strong>Total Raised:</strong> ${Utils.formatEthAmount(info.raised)} ETH</p>
                <p><strong>Tokens Distributed:</strong> ${Utils.formatTokenAmount(info.distributed)} EYSN</p>
                <p><strong>Remaining:</strong> ${Utils.formatTokenAmount(info.remaining)} EYSN</p>
            `;
        }

        // Verification status (from getUserContribution verified field)
        const isVerified = userContrib.verified || false;
        _updateVerifyUI(isVerified);

        const userContribEl = document.getElementById('userContribution');
        const userEthEl = document.getElementById('userEthContributed');
        if (userContribEl) userContribEl.textContent = Utils.formatTokenAmount(userContrib.totalTokens) + ' EYSN';
        if (userEthEl) userEthEl.textContent = Utils.formatEthAmount(userContrib.ethSpent) + ' ETH';

    } catch (error) {
        console.error('Error loading contribution data:', error);
    }
}

// Update verification badge and Contribute button state
function _updateVerifyUI(isVerified) {
    const badge = document.getElementById('verifyStatusBadge');
    const verifyBtn = document.getElementById('verifyContribBtn');
    const contributeBtn = document.getElementById('contributeBtn');

    if (badge) {
        if (isVerified) {
            badge.textContent = '✅ Verified';
            badge.className = 'status-badge success';
        } else {
            badge.textContent = '❌ Not Verified';
            badge.className = 'status-badge error';
        }
    }
    if (verifyBtn) verifyBtn.disabled = isVerified;
    if (contributeBtn) contributeBtn.disabled = !isVerified;
}

async function handleContribute() {
    try {
        const ethAmountInput = document.getElementById('ethAmount');
        if (!ethAmountInput) return;

        const ethAmount = ethAmountInput.value;
        const validation = Utils.validateEthAmount(ethAmount, CONFIG.TOKEN_CONSTANTS.MIN_CONTRIBUTION);

        if (!validation.valid) {
            Utils.showNotification(validation.error, 'error');
            return;
        }

        // Guard: must be verified before contributing
        const isVerified = await contributionContract.isVerified(userAddress);
        if (!isVerified) {
            notify.error('Verification Required', 'You must hold a Binance SBT, Gitcoin Passport Score ≥ 20, or Galxe SBT to contribute. Click "Verify Identity" first.');
            return;
        }

        const totalTokens = parseFloat(ethAmount) * CONFIG.TOKEN_CONSTANTS.TOKEN_PRICE;

        // Per-transaction max: 10,000 EYSN (ContributionPhase v3 MAX_BUY_TOKENS)
        if (totalTokens > 10000) {
            notify.error('Exceeds Maximum', `Maximum purchase is 10,000 EYSN per transaction. Your amount would buy ${totalTokens.toFixed(0)} EYSN. Reduce ETH amount to ${(10000 / CONFIG.TOKEN_CONSTANTS.TOKEN_PRICE).toFixed(4)} ETH or less.`);
            return;
        }

        // Per-transaction min: 100 EYSN (ContributionPhase v3 MIN_BUY_TOKENS)
        if (totalTokens < 100) {
            notify.error('Below Minimum', `Minimum purchase is 100 EYSN per transaction. Your amount would buy ${totalTokens.toFixed(2)} EYSN.`);
            return;
        }

        const amount = Utils.parseEthInput(ethAmount);
        const instantTokens = (totalTokens * 0.70).toFixed(2); // 70% instant
        const stakedTokens  = (totalTokens * 0.30).toFixed(2); // 30% auto-staked

        // Show receipt with processing state
        window.showReceipt({
            action: 'Contribution',
            ethAmount: ethAmount,
            instantTokens: instantTokens,
            stakedTokens: stakedTokens,
            totalTokens: totalTokens.toFixed(2),
            from: userAddress
        });

        const tx = await contributionContract.contribute(amount);
        const receipt = await tx.wait();

        receiptModal.showSuccess({
            action: 'Contribution',
            ethAmount: ethAmount,
            instantTokens: instantTokens,
            stakedTokens: stakedTokens,
            totalTokens: totalTokens.toFixed(2),
            txHash: receipt.transactionHash,
            from: userAddress,
            to: CONFIG.CONTRACTS.CONTRIBUTION,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString()
        });

        await loadContributionData();
        await loadStakingData();

    } catch (error) {
        console.error('Error contributing:', error);
        if (receiptModal) {
            receiptModal.showError({ action: 'Contribution' }, error.message);
        }
    }
}

// STAKING FUNCTIONS
async function loadStakingData() {
    try {
        if (!stakingContract) return;

        // v13: two separate calls replace old monolithic getStakeInfo
        const pos       = await stakingContract.getStakePosition(userAddress);
        const timings   = await stakingContract.getStakeTimings(userAddress);
        const phaseInfo = await stakingContract.getProtocolPhaseInfo();
        const poolInfo  = await stakingContract.getPoolInfo();

        // Protocol-level stats
        const phaseNum = phaseInfo.phaseIndex.toNumber() + 1;
        document.getElementById('currentQuarter').textContent = `Phase ${phaseNum} of 5`;
        document.getElementById('quarterReward').textContent =
            Utils.formatTokenAmount(phaseInfo.dailyEmission) + ' EYSN/day';
        document.getElementById('totalStakedAmount').textContent =
            Utils.formatTokenAmount(poolInfo.totalStakedNow) + ' / 900,000 EYSN';

        // User-level stats
        document.getElementById('userStaked').textContent =
            Utils.formatTokenAmount(pos.totalStakedAmt) + ' EYSN';

        const userPhase = pos.totalStakedAmt.gt(0)
            ? `Phase ${pos.currentPhase.toNumber()} of 5`
            : '-';
        document.getElementById('userStartQuarter').textContent = userPhase;

        const depositCountEl = document.getElementById('depositCount');
        if (depositCountEl) depositCountEl.textContent = pos.depositCount.toNumber();

        // Penalty-free window status
        const windowEl = document.getElementById('canUnstake');
        if (windowEl) {
            if (pos.inPenaltyFreeWindow) {
                windowEl.textContent = 'Yes ✅ (penalty-free window open)';
            } else if (pos.totalStakedAmt.gt(0)) {
                const penaltyAmt = Utils.formatTokenAmount(timings.earlyExitPenalty);
                windowEl.textContent = `No — 30% penalty (${penaltyAmt} EYSN)`;
            } else {
                windowEl.textContent = 'No active stake';
            }
        }

        // Window countdown
        const windowCountdownEl = document.getElementById('windowCountdown');
        if (windowCountdownEl && pos.totalStakedAmt.gt(0)) {
            const secs = timings.secondsUntilWindow.toNumber();
            if (secs > 0) {
                const days = Math.floor(secs / 86400);
                const hrs  = Math.floor((secs % 86400) / 3600);
                windowCountdownEl.textContent = `${days}d ${hrs}h until window`;
            } else {
                windowCountdownEl.textContent = pos.inPenaltyFreeWindow ? 'Window open now!' : '-';
            }
        }

        // Auto-return button
        const autoReturnBtn = document.getElementById('autoReturnBtn');
        if (autoReturnBtn) {
            autoReturnBtn.style.display = pos.autoReturnEligible ? 'block' : 'none';
        }

        // Claim countdown
        const claimCountdownEl = document.getElementById('claimCountdown');
        if (claimCountdownEl && pos.totalStakedAmt.gt(0)) {
            if (timings.claimableNow) {
                claimCountdownEl.textContent = 'Claimable now!';
            } else {
                const secs = timings.secondsUntilClaim.toNumber();
                const days = Math.floor(secs / 86400);
                const hrs  = Math.floor((secs % 86400) / 3600);
                claimCountdownEl.textContent = `${days}d ${hrs}h until claim`;
            }
        }

        const claimRewardsBtn = document.getElementById('claimRewardsBtn');
        if (claimRewardsBtn) claimRewardsBtn.disabled = !timings.claimableNow;

    } catch (error) {
        console.error('Error loading staking data:', error);
    }
}

async function setMaxStake() {
    try {
        if (!tokenContract) return;
        const balance = await tokenContract.getBalance(userAddress);
        document.getElementById('stakeAmount').value = ethers.utils.formatEther(balance);
    } catch (error) {
        console.error('Error getting balance:', error);
    }
}

async function handleApproveStaking() {
    try {
        const amount = document.getElementById('stakeAmount')?.value;
        const validation = Utils.validateTokenAmount(amount, CONFIG.STAKING_CONSTANTS.MIN_STAKE);
        
        if (!validation.valid) {
            Utils.showNotification(validation.error, 'error');
            return;
        }
        
        const amountWei = Utils.parseTokenInput(amount);
        
        // Show receipt with processing state
        window.showReceipt({
            action: 'Approve Tokens',
            amount: amount,
            spender: CONFIG.CONTRACTS.STAKING,
            from: userAddress
        });
        
        const tx = await tokenContract.approve(CONFIG.CONTRACTS.STAKING, amountWei);
        const receipt = await tx.wait();
        
        // Update receipt with success
        receiptModal.showSuccess({
            action: 'Approve Tokens',
            amount: amount,
            spender: CONFIG.CONTRACTS.STAKING,
            txHash: receipt.transactionHash,
            from: userAddress,
            to: CONFIG.CONTRACTS.TOKEN,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString()
        });
        
        document.getElementById('stakeBtn').disabled = false;
        
    } catch (error) {
        console.error('Error approving:', error);
        if (receiptModal) {
            receiptModal.showError({ action: 'Approve Tokens' }, error.message);
        }
    }
}

async function handleStake() {
    try {
        const amountRaw = document.getElementById('stakeAmount')?.value;

        // Guard: must have a valid value
        if (!amountRaw || amountRaw.trim() === '' || isNaN(parseFloat(amountRaw))) {
            notify.error('Invalid Amount', 'Please enter a valid token amount.');
            return;
        }

        const validation = Utils.validateTokenAmount(amountRaw, CONFIG.STAKING_CONSTANTS.MIN_STAKE);
        if (!validation.valid) {
            Utils.showNotification(validation.error, 'error');
            return;
        }

        const amount = amountRaw.trim();
        // Fix: use ethers.utils.parseUnits directly (not Utils.parseTokenInput which may be broken)
        const amountWei = ethers.utils.parseUnits(amount, 18);

        const phaseInfo = await stakingContract.getProtocolPhaseInfo();
        const phaseNum = phaseInfo.phaseIndex.toNumber() + 1;
        const startQuarter = `Phase ${phaseNum} of 5`;
        const lockPeriod = '180-day phases x 5';

        window.showReceipt({
            action: 'Stake Tokens',
            amount: amount,
            startQuarter: startQuarter,
            lockPeriod: lockPeriod,
            from: userAddress
        });

        const tx = await stakingContract.stake(amountWei);
        const receipt = await tx.wait();

        receiptModal.showSuccess({
            action: 'Stake Tokens',
            amount: amount,
            startQuarter: startQuarter,
            lockPeriod: lockPeriod,
            txHash: receipt.transactionHash,
            from: userAddress,
            to: CONFIG.CONTRACTS.STAKING,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString()
        });

        await loadStakingData();
        document.getElementById('stakeBtn').disabled = true;

    } catch (error) {
        console.error('Error staking:', error);
        if (receiptModal) {
            receiptModal.showError({ action: 'Stake Tokens' }, error.message);
        }
    }
}

// REWARDS FUNCTIONS
async function loadRewardsData() {
    try {
        if (!stakingContract) return;

        const rd = await stakingContract.getRewardDisplay(userAddress);

        document.getElementById('pendingRewards').textContent =
            Utils.formatTokenAmount(rd.totalAccrued);

        const todayEl = document.getElementById('todayAccrued');
        if (todayEl) todayEl.textContent = Utils.formatTokenAmount(rd.todayAccrued) + ' EYSN';

        const projectedEl = document.getElementById('projectedMonthly');
        if (projectedEl) projectedEl.textContent = Utils.formatTokenAmount(rd.projectedMonthly) + ' EYSN';

        // 5 phases in v13
        const phaseLabels = ['phase1Reward','phase2Reward','phase3Reward','phase4Reward','phase5Reward'];
        rd.byPhase.forEach((amt, i) => {
            const el = document.getElementById(phaseLabels[i]);
            if (el) el.textContent = Utils.formatTokenAmount(amt) + ' EYSN';
        });

        const claimableEl = document.getElementById('claimableNow');
        if (claimableEl) {
            claimableEl.textContent = rd.claimableNow
                ? 'Claimable now ✅'
                : `${rd.daysUntilNextClaim.toNumber()} days until next claim`;
        }

        const claimBtn = document.getElementById('claimRewardsBtn');
        if (claimBtn) claimBtn.disabled = !rd.claimableNow;

        // Load loyalty panel
        await loadLoyaltyData();

    } catch (error) {
        console.error('Error loading rewards data:', error);
    }
}

async function handleClaimRewards() {
    try {
        // Guard: check claim lock before doing anything
        const { unlocked, secondsLeft } = await stakingContract.isClaimable(userAddress);
        if (!unlocked) {
            const days = Math.floor(secondsLeft.toNumber() / 86400);
            const hrs  = Math.floor((secondsLeft.toNumber() % 86400) / 3600);
            notify.warning('Claim Locked', `Next claim unlocks in ${days}d ${hrs}h`);
            return;
        }

        const rd = await stakingContract.getRewardDisplay(userAddress);
        const rewardsFormatted = Utils.formatTokenAmount(rd.totalAccrued);

        // Show receipt with processing state
        window.showReceipt({
            action: 'Claim Rewards',
            rewards: rewardsFormatted,
            phases: 'Phase 1–4 (all accrued)',
            from: userAddress
        });

        const tx = await stakingContract.claimRewards();
        const receipt = await tx.wait();

        // Update receipt with success
        receiptModal.showSuccess({
            action: 'Claim Rewards',
            rewards: rewardsFormatted,
            phases: 'Phase 1–4 (all accrued)',
            txHash: receipt.transactionHash,
            from: userAddress,
            to: CONFIG.CONTRACTS.STAKING,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString()
        });

        await loadRewardsData();
        await loadStakingData();

    } catch (error) {
        console.error('Error claiming rewards:', error);
        if (receiptModal) {
            receiptModal.showError({ action: 'Claim Rewards' }, error.message);
        }
    }
}

async function handleUnstake() {
    let pos, timings;
    try {
        pos     = await stakingContract.getStakePosition(userAddress);
        timings = await stakingContract.getStakeTimings(userAddress);
    } catch (error) {
        console.error('Error fetching stake info:', error);
        notify.error('Error', 'Could not load stake info. Please try again.');
        return;
    }

    if (!pos || pos.totalStakedAmt.eq(0)) {
        notify.warning('No Stake', 'You have no active stake to unstake.');
        return;
    }

    const hasPenalty = !pos.inPenaltyFreeWindow && !pos.autoReturnEligible;
    const penaltyAmt = hasPenalty ? Utils.formatTokenAmount(timings.earlyExitPenalty) : null;

    const confirmMsg = hasPenalty
        ? `⚠️ Early exit: 30% of your principal (${penaltyAmt} EYSN) will be burned.\n\nAre you sure?`
        : 'Unstake now with zero penalty. Confirm?';

    if (!confirm(confirmMsg)) return;

    try {
        const amount = Utils.formatTokenAmount(pos.totalStakedAmt);
        const netAmount = hasPenalty
            ? (parseFloat(amount) * 0.70).toFixed(2)
            : amount;

        window.showReceipt({
            action: 'Unstake Tokens',
            amount: amount,
            penalty: penaltyAmt,
            netAmount: netAmount,
            from: userAddress
        });

        const tx = await stakingContract.unstake();
        const receipt = await tx.wait();

        receiptModal.showSuccess({
            action: 'Unstake Tokens',
            amount: amount,
            penalty: penaltyAmt,
            netAmount: netAmount,
            txHash: receipt.transactionHash,
            from: userAddress,
            to: CONFIG.CONTRACTS.STAKING,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString()
        });

        await loadStakingData();
        await loadRewardsData();

    } catch (error) {
        console.error('Error unstaking:', error);
        if (receiptModal) receiptModal.showError({ action: 'Unstake Tokens' }, error.message);
    }
}

async function handleAutoReturn() {
    if (!confirm('Trigger auto-return? Your principal + all rewards will be sent to your wallet.')) return;

    try {
        window.showReceipt({ action: 'Auto Return', from: userAddress });

        const tx = await stakingContract.triggerAutoReturn(userAddress);
        const receipt = await tx.wait();

        receiptModal.showSuccess({
            action: 'Auto Return',
            txHash: receipt.transactionHash,
            from: userAddress,
            to: CONFIG.CONTRACTS.STAKING,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString()
        });

        await loadStakingData();
        await loadRewardsData();

    } catch (error) {
        console.error('Error triggering auto return:', error);
        if (receiptModal) {
            receiptModal.showError({ action: 'Auto Return' }, error.message);
        }
    }
}

// VESTING FUNCTIONS
async function loadVestingData() {
    try {
        if (!teamVestingContract || !marketingVestingContract) return;
        
        const teamInfo       = await teamVestingContract.getInfo();
        const marketingInfo  = await marketingVestingContract.getInfo();

        // Team vesting — v13 fields: tgeClaimedAmt, vestingClaimedAmt, vestingClaimable
        document.getElementById('teamVested').textContent =
            Utils.formatTokenAmount(teamInfo.vestingAllocation) + ' EYSN';
        document.getElementById('teamClaimed').textContent =
            Utils.formatTokenAmount(teamInfo.tgeClaimedAmt.add(teamInfo.vestingClaimedAmt)) + ' EYSN';
        document.getElementById('teamClaimable').textContent =
            Utils.formatTokenAmount(teamInfo.vestingClaimable) + ' EYSN';

        // Marketing vesting
        document.getElementById('marketingVested').textContent =
            Utils.formatTokenAmount(marketingInfo.vestingAllocation) + ' EYSN';
        document.getElementById('marketingClaimed').textContent =
            Utils.formatTokenAmount(marketingInfo.tgeClaimedAmt.add(marketingInfo.vestingClaimedAmt)) + ' EYSN';
        document.getElementById('marketingClaimable').textContent =
            Utils.formatTokenAmount(marketingInfo.vestingClaimable) + ' EYSN';
        
    } catch (error) {
        console.error('Error loading vesting data:', error);
    }
}

async function handleClaimTeam() {
    try {
        const teamInfo = await teamVestingContract.getInfo();
        const claimableAmount = Utils.formatTokenAmount(teamInfo.vestingClaimable);
        
        window.showReceipt({
            action: 'Claim Vesting',
            vestingType: 'Team Allocation',
            amount: claimableAmount,
            from: userAddress
        });
        
        // v13: claimVesting() for linear portion (TGE is separate via claimTGE)
        const tx = await teamVestingContract.claimVesting();
        const receipt = await tx.wait();
        
        receiptModal.showSuccess({
            action: 'Claim Vesting',
            vestingType: 'Team Allocation',
            amount: claimableAmount,
            txHash: receipt.transactionHash,
            from: userAddress,
            to: CONFIG.CONTRACTS.TEAM_VESTING,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString()
        });
        
        await loadVestingData();
    } catch (error) {
        console.error('Error claiming team vesting:', error);
        if (receiptModal) receiptModal.showError({ action: 'Claim Vesting', vestingType: 'Team Allocation' }, error.message);
    }
}

async function handleClaimMarketing() {
    try {
        const marketingInfo = await marketingVestingContract.getInfo();
        const claimableAmount = Utils.formatTokenAmount(marketingInfo.vestingClaimable);
        
        window.showReceipt({
            action: 'Claim Vesting',
            vestingType: 'Marketing Allocation',
            amount: claimableAmount,
            from: userAddress
        });
        
        const tx = await marketingVestingContract.claimVesting();
        const receipt = await tx.wait();
        
        receiptModal.showSuccess({
            action: 'Claim Vesting',
            vestingType: 'Marketing Allocation',
            amount: claimableAmount,
            txHash: receipt.transactionHash,
            from: userAddress,
            to: CONFIG.CONTRACTS.MARKETING_VESTING,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString()
        });
        
        await loadVestingData();
    } catch (error) {
        console.error('Error claiming marketing vesting:', error);
        if (receiptModal) receiptModal.showError({ action: 'Claim Vesting', vestingType: 'Marketing Allocation' }, error.message);
    }
}

// LOYALTY BONUS FUNCTIONS
async function loadLoyaltyData() {
    try {
        if (!stakingContract) return;
        const info = await stakingContract.getLoyaltyInfo(userAddress);

        const daysEl = document.getElementById('loyaltyDays');
        if (daysEl) daysEl.textContent = info.loyaltyDays.toNumber();

        const daysRemainingEl = document.getElementById('loyaltyDaysRemaining');
        if (daysRemainingEl) daysRemainingEl.textContent = info.daysRemaining.toNumber() + ' days remaining';

        const rankEl = document.getElementById('loyaltyRank');
        if (rankEl) rankEl.textContent = info.userRank.toNumber() > 0 ? `#${info.userRank.toNumber()}` : '-';

        const winnersEl = document.getElementById('loyaltyWinnersCount');
        if (winnersEl) winnersEl.textContent = `${info.winnersCount.toNumber()} / 400`;

        const slotsEl = document.getElementById('loyaltySlotsLeft');
        if (slotsEl) slotsEl.textContent = (400 - info.winnersCount.toNumber()) + ' slots remaining';

        const statusEl = document.getElementById('loyaltyStatus');
        if (statusEl) {
            if (info.qualified) {
                statusEl.textContent = '✅ Qualified — FCFS winner!';
            } else if (!info.minStakeMet) {
                statusEl.textContent = '❌ Need ≥ 1,000 EYSN staked';
            } else if (!info.fcfsSlotAvailable) {
                statusEl.textContent = '❌ All 400 slots filled';
            } else {
                statusEl.textContent = `⏳ ${info.loyaltyDays.toNumber()} / 250 days`;
            }
        }

        const claimLoyaltyBtn = document.getElementById('claimLoyaltyBtn');
        if (claimLoyaltyBtn) {
            claimLoyaltyBtn.disabled = !info.qualified || info.claimed;
            claimLoyaltyBtn.textContent = info.claimed
                ? 'Loyalty Bonus Claimed ✅'
                : 'Claim 500 EYSN Loyalty Bonus';
        }

        const checkLoyaltyBtn = document.getElementById('checkLoyaltyBtn');
        if (checkLoyaltyBtn) checkLoyaltyBtn.disabled = info.qualified;

    } catch (error) {
        console.error('Error loading loyalty data:', error);
    }
}

async function handleCheckLoyalty() {
    try {
        window.showReceipt({ action: 'Check Loyalty Status', from: userAddress });
        const tx = await stakingContract.checkLoyaltyStatus();
        const receipt = await tx.wait();
        receiptModal.showSuccess({
            action: 'Check Loyalty Status',
            txHash: receipt.transactionHash,
            from: userAddress,
            to: CONFIG.CONTRACTS.STAKING,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString()
        });
        await loadLoyaltyData();
    } catch (error) {
        console.error('Error checking loyalty:', error);
        if (receiptModal) receiptModal.showError({ action: 'Check Loyalty Status' }, error.message);
    }
}

async function handleClaimLoyalty() {
    try {
        window.showReceipt({ action: 'Claim Loyalty Bonus', from: userAddress });
        const tx = await stakingContract.claimLoyaltyBonus();
        const receipt = await tx.wait();
        receiptModal.showSuccess({
            action: 'Claim Loyalty Bonus',
            amount: '500',
            txHash: receipt.transactionHash,
            from: userAddress,
            to: CONFIG.CONTRACTS.STAKING,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString()
        });
        await loadLoyaltyData();
    } catch (error) {
        console.error('Error claiming loyalty bonus:', error);
        if (receiptModal) receiptModal.showError({ action: 'Claim Loyalty Bonus' }, error.message);
    }
}
// ── AIRDROP FUNCTIONS ──────────────────────────────────────────────────────

async function loadAirdropData() {
    try {
        // Update static allocation info from config (always visible)
        const poolEl = document.getElementById('airdropPool');
        if (poolEl) poolEl.textContent = CONFIG.AIRDROP_CONSTANTS.TOTAL_POOL.toLocaleString() + ' EYSN';

        const shareEl = document.getElementById('airdropShare');
        if (shareEl) shareEl.textContent = CONFIG.AIRDROP_CONSTANTS.SHARE_PER_USER + ' EYSN';

        const tgeEl = document.getElementById('airdropTGE');
        if (tgeEl) tgeEl.textContent = CONFIG.AIRDROP_CONSTANTS.TGE_AMOUNT + ' EYSN (30%)';

        const stakeEl = document.getElementById('airdropStake');
        if (stakeEl) stakeEl.textContent = CONFIG.AIRDROP_CONSTANTS.STAKE_AMOUNT + ' EYSN (70%)';

        // If no contract deployed yet, show pending state
        if (!airdropContract || !CONFIG.CONTRACTS.AIRDROP) {
            _setAirdropUI({ open: false, pending: true });
            return;
        }

        const status = await airdropContract.getStatus();

        // Claimed / remaining
        const claimedEl = document.getElementById('airdropClaimed');
        if (claimedEl) claimedEl.textContent = status.claimed.toNumber() + ' / 500';

        const remainingEl = document.getElementById('airdropRemaining');
        if (remainingEl) remainingEl.textContent = status.remaining.toNumber() + ' spots left';

        // Deadline
        const deadlineEl = document.getElementById('airdropDeadline');
        if (deadlineEl) {
            if (status.deadline.toNumber() === 0) {
                deadlineEl.textContent = 'No deadline set';
            } else {
                const d = new Date(status.deadline.toNumber() * 1000);
                deadlineEl.textContent = d.toUTCString();
            }
        }

        _setAirdropUI({ open: status.claimsOpen, pending: false });

        // Per-user state
        if (!userAddress) return;

        const alreadyClaimed = await airdropContract.hasClaimed(userAddress);

        const userStatusEl = document.getElementById('airdropUserStatus');
        if (userStatusEl) {
            if (alreadyClaimed) {
                userStatusEl.innerHTML = '✅ You have already claimed your airdrop.';
            } else if (!status.claimsOpen) {
                userStatusEl.innerHTML = '⏳ Claims are not open yet. Check back after the snapshot.';
            } else {
                userStatusEl.innerHTML = '🔍 Claims are open. Submit your Merkle proof to claim.';
            }
        }

        const claimBtn = document.getElementById('claimAirdropBtn');
        if (claimBtn) {
            claimBtn.disabled = alreadyClaimed || !status.claimsOpen;
            claimBtn.textContent = alreadyClaimed ? '✅ Already Claimed' : 'Claim Airdrop (Submit Proof)';
        }

    } catch (error) {
        console.error('Error loading airdrop data:', error);
    }
}

function _setAirdropUI({ open, pending }) {
    const statusBadge = document.getElementById('airdropStatusBadge');
    if (statusBadge) {
        if (pending) {
            statusBadge.textContent = '⏳ Pending Deployment';
            statusBadge.className = 'status-badge warning';
        } else if (open) {
            statusBadge.textContent = '🟢 Claims Open';
            statusBadge.className = 'status-badge success';
        } else {
            statusBadge.textContent = '🔴 Claims Closed';
            statusBadge.className = 'status-badge error';
        }
    }

    const claimBtn = document.getElementById('claimAirdropBtn');
    if (claimBtn && (pending || !open)) {
        claimBtn.disabled = true;
    }
}

async function handleClaimAirdrop() {
    try {
        if (!airdropContract || !CONFIG.CONTRACTS.AIRDROP) {
            notify.warning('Not Available', 'Airdrop contract not deployed yet.');
            return;
        }

        // Read proof from input
        const proofInput = document.getElementById('merkleProofInput');
        if (!proofInput || !proofInput.value.trim()) {
            notify.error('Proof Required', 'Paste your Merkle proof JSON array (e.g. ["0xabc...", "0xdef..."])');
            return;
        }

        let proof;
        try {
            proof = JSON.parse(proofInput.value.trim());
            if (!Array.isArray(proof)) throw new Error('Not an array');
        } catch {
            notify.error('Invalid Proof', 'Proof must be a JSON array of hex strings.');
            return;
        }

        // Check eligibility first (view call, free)
        const { eligible, reason } = await airdropContract.isEligible(userAddress, proof);
        if (!eligible) {
            notify.error('Not Eligible', reason);
            return;
        }

        window.showReceipt({
            action: 'Claim Airdrop',
            tgeAmount: CONFIG.AIRDROP_CONSTANTS.TGE_AMOUNT + ' EYSN (instant)',
            stakeAmount: CONFIG.AIRDROP_CONSTANTS.STAKE_AMOUNT + ' EYSN (auto-staked)',
            from: userAddress
        });

        const tx = await airdropContract.claim(proof);
        const receipt = await tx.wait();

        receiptModal.showSuccess({
            action: 'Claim Airdrop',
            tgeAmount: CONFIG.AIRDROP_CONSTANTS.TGE_AMOUNT + ' EYSN',
            stakeAmount: CONFIG.AIRDROP_CONSTANTS.STAKE_AMOUNT + ' EYSN',
            txHash: receipt.transactionHash,
            from: userAddress,
            to: CONFIG.CONTRACTS.AIRDROP,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString()
        });

        await loadAirdropData();

    } catch (error) {
        console.error('Error claiming airdrop:', error);
        if (receiptModal) receiptModal.showError({ action: 'Claim Airdrop' }, error.message);
    }
}

// ── CONTRIBUTION VERIFICATION ──────────────────────────────────────────────

async function handleVerifyContribution() {
    const verifyBtn = document.getElementById('verifyContribBtn');
    const badge     = document.getElementById('verifyStatusBadge');

    if (!contributionContract) {
        notify.warning('Not Ready', 'Please connect your wallet first.');
        return;
    }

    try {
        if (verifyBtn) {
            verifyBtn.disabled  = true;
            verifyBtn.textContent = 'Checking...';
        }
        if (badge) {
            badge.textContent = '⏳ Checking...';
            badge.className   = 'status-badge warning';
        }

        // Pure view call — free, no gas
        const isVerified = await contributionContract.isVerified(userAddress);

        _updateVerifyUI(isVerified);

        if (isVerified) {
            notify.success('Identity Verified ✅', 'Your wallet holds a valid SBT. You may now contribute.');
        } else {
            notify.error('Not Verified ❌', 'No Binance SBT, Gitcoin Passport Score ≥ 20, or Galxe SBT found on this wallet.');
        }

    } catch (error) {
        console.error('Error verifying identity:', error);
        if (badge) {
            badge.textContent = '⚠️ Check Failed';
            badge.className   = 'status-badge warning';
        }
        if (verifyBtn) {
            verifyBtn.disabled  = false;
            verifyBtn.textContent = 'Verify Identity 🔍';
        }
        notify.error('Verification Failed', error.message || 'Could not reach contract. Try again.');
    }
}
