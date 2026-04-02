// Receipt Modal System - Professional Transaction Receipts

class ReceiptModal {
    constructor() {
        this.createModalHTML();
        this.setupEventListeners();
    }

    createModalHTML() {
        // Check if modal already exists
        if (document.getElementById('receiptModal')) return;

        const modalHTML = `
            <div id="receiptModal" class="receipt-modal">
                <div class="receipt-overlay"></div>
                <div class="receipt-container">
                    <div class="receipt-header">
                        <div class="receipt-logo">
                            <h2>Elyson Protocol ($EYSN)</h2>
                            <p class="receipt-subtitle">Transaction Receipt</p>
                        </div>
                        <button class="receipt-close" id="closeReceipt">&times;</button>
                    </div>
                    
                    <div class="receipt-body">
                        <div class="receipt-status" id="receiptStatus">
                            <div class="status-icon">⏳</div>
                            <h3 id="statusText">Processing Transaction...</h3>
                            <p id="statusSubtext">Please wait for confirmation</p>
                        </div>

                        <div class="receipt-details" id="receiptDetails">
                            <!-- Details will be injected here -->
                        </div>

                        <div class="receipt-actions" id="receiptActions" style="display: none;">
                            <a id="explorerLink" class="receipt-btn primary" target="_blank" rel="noopener">
                                View on Explorer 🔗
                            </a>
                            <button id="copyTxHash" class="receipt-btn secondary">
                                Copy Transaction Hash 📋
                            </button>
                            <button id="closeReceiptBtn" class="receipt-btn tertiary">
                                Close ✓
                            </button>
                        </div>
                    </div>

                    <div class="receipt-footer">
                        <p>Built on Utility, Secured by Immutability</p>
                        <p class="receipt-timestamp" id="receiptTimestamp"></p>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    setupEventListeners() {
        const modal = document.getElementById('receiptModal');
        const closeBtn = document.getElementById('closeReceipt');
        const closeReceiptBtn = document.getElementById('closeReceiptBtn');
        const overlay = modal?.querySelector('.receipt-overlay');

        const closeModal = () => {
            modal.classList.remove('active');
            setTimeout(() => modal.style.display = 'none', 300);
        };

        closeBtn?.addEventListener('click', closeModal);
        closeReceiptBtn?.addEventListener('click', closeModal);
        overlay?.addEventListener('click', closeModal);

        // Copy hash functionality
        document.getElementById('copyTxHash')?.addEventListener('click', () => {
            const hash = document.getElementById('copyTxHash').dataset.hash;
            navigator.clipboard.writeText(hash).then(() => {
                const btn = document.getElementById('copyTxHash');
                const originalText = btn.textContent;
                btn.textContent = 'Copied! ✓';
                setTimeout(() => btn.textContent = originalText, 2000);
            });
        });
    }

    show(transactionData) {
        const modal = document.getElementById('receiptModal');
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);

        this.showProcessing(transactionData);
    }

    showProcessing(data) {
        const statusIcon = document.querySelector('.status-icon');
        const statusText = document.getElementById('statusText');
        const statusSubtext = document.getElementById('statusSubtext');
        const detailsDiv = document.getElementById('receiptDetails');

        statusIcon.textContent = '⏳';
        statusIcon.className = 'status-icon processing';
        statusText.textContent = 'Processing Transaction...';
        statusSubtext.textContent = 'Waiting for blockchain confirmation';

        detailsDiv.innerHTML = this.buildDetails(data, false);
    }

    showSuccess(data) {
        const statusIcon = document.querySelector('.status-icon');
        const statusText = document.getElementById('statusText');
        const statusSubtext = document.getElementById('statusSubtext');
        const detailsDiv = document.getElementById('receiptDetails');
        const actionsDiv = document.getElementById('receiptActions');

        statusIcon.textContent = '✓';
        statusIcon.className = 'status-icon success';
        statusText.textContent = 'Transaction Confirmed!';
        statusSubtext.textContent = 'Your transaction was successful';

        detailsDiv.innerHTML = this.buildDetails(data, true);
        actionsDiv.style.display = 'flex';

        // Setup explorer link
        const explorerLink = document.getElementById('explorerLink');
        explorerLink.href = `${CONFIG.EXPLORER_URL}/tx/${data.txHash}`;

        // Setup copy button
        const copyBtn = document.getElementById('copyTxHash');
        copyBtn.dataset.hash = data.txHash;

        // Update timestamp
        document.getElementById('receiptTimestamp').textContent = 
            new Date().toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short'
            });

        // ────────────────────────────────────────────────────────────
        // UPDATED: Save to history
        // ────────────────────────────────────────────────────────────
        if (window.txHistory) {
            window.txHistory.saveTransaction({
                ...data,
                status: 'success'
            });
        }
    }

    showError(data, errorMessage) {
        const statusIcon = document.querySelector('.status-icon');
        const statusText = document.getElementById('statusText');
        const statusSubtext = document.getElementById('statusSubtext');
        const detailsDiv = document.getElementById('receiptDetails');

        statusIcon.textContent = '✗';
        statusIcon.className = 'status-icon error';
        statusText.textContent = 'Transaction Failed';
        
        // ────────────────────────────────────────────────────────────
        // UPDATED: Clean error message
        // ────────────────────────────────────────────────────────────
        const cleanError = this.parseError(errorMessage);
        statusSubtext.textContent = cleanError;

        detailsDiv.innerHTML = this.buildDetails(data, false);
        
        // Show close button only
        const actionsDiv = document.getElementById('receiptActions');
        actionsDiv.style.display = 'flex';
        document.getElementById('explorerLink').style.display = 'none';
        document.getElementById('copyTxHash').style.display = 'none';

        // ────────────────────────────────────────────────────────────
        // UPDATED: Save failed transaction to history
        // ────────────────────────────────────────────────────────────
        if (window.txHistory) {
            window.txHistory.saveTransaction({
                ...data,
                status: 'failed',
                errorMessage: cleanError
            });
        }
    }

    buildDetails(data, confirmed) {
        let detailsHTML = `
            <div class="receipt-section">
                <h4>Action</h4>
                <p class="receipt-action-type">${this.getActionIcon(data.action)} ${data.action}</p>
            </div>
        `;

        // Action-specific details
        switch(data.action) {
            case 'Contribution':
                detailsHTML += `
                    <div class="receipt-section">
                        <div class="receipt-row">
                            <span>ETH Contributed:</span>
                            <strong>${data.ethAmount} ETH</strong>
                        </div>
                        <div class="receipt-row">
                            <span>Tokens Received (Instant):</span>
                            <strong>${data.instantTokens} EYSN</strong>
                        </div>
                        <div class="receipt-row">
                            <span>Tokens Staked (Auto):</span>
                            <strong>${data.stakedTokens} EYSN</strong>
                        </div>
                        <div class="receipt-row highlight">
                            <span>Total Tokens:</span>
                            <strong>${data.totalTokens} EYSN</strong>
                        </div>
                    </div>
                `;
                break;

            case 'Stake Tokens':
                detailsHTML += `
                    <div class="receipt-section">
                        <div class="receipt-row">
                            <span>Amount Staked:</span>
                            <strong>${data.amount} EYSN</strong>
                        </div>
                        <div class="receipt-row">
                            <span>Start Quarter:</span>
                            <strong>Q${data.quarter}</strong>
                        </div>
                        <div class="receipt-row">
                            <span>Lock Period:</span>
                            <strong>${data.lockPeriod}</strong>
                        </div>
                        <div class="receipt-row">
                            <span>Expected APY:</span>
                            <strong class="highlight-green">${data.apy}%</strong>
                        </div>
                    </div>
                `;
                break;

            case 'Approve Tokens':
                detailsHTML += `
                    <div class="receipt-section">
                        <div class="receipt-row">
                            <span>Approved Amount:</span>
                            <strong>${data.amount} EYSN</strong>
                        </div>
                        <div class="receipt-row">
                            <span>Spender Contract:</span>
                            <strong>${Utils.shortenAddress(data.spender)}</strong>
                        </div>
                    </div>
                `;
                break;

            case 'Claim Rewards':
                detailsHTML += `
                    <div class="receipt-section">
                        <div class="receipt-row highlight">
                            <span>Rewards Claimed:</span>
                            <strong class="highlight-green">${data.rewards} EYSN</strong>
                        </div>
                        <div class="receipt-row">
                            <span>Quarters Claimed:</span>
                            <strong>${data.quarters}</strong>
                        </div>
                    </div>
                `;
                break;

            case 'Unstake Tokens':
                detailsHTML += `
                    <div class="receipt-section">
                        <div class="receipt-row">
                            <span>Amount Unstaked:</span>
                            <strong>${data.amount} EYSN</strong>
                        </div>
                        ${data.penalty ? `
                        <div class="receipt-row warning">
                            <span>Early Unstake Penalty:</span>
                            <strong>-${data.penalty} EYSN (15%)</strong>
                        </div>
                        <div class="receipt-row">
                            <span>Net Received:</span>
                            <strong>${data.netAmount} EYSN</strong>
                        </div>
                        ` : `
                        <div class="receipt-row">
                            <span>Penalty:</span>
                            <strong class="highlight-green">None ✓</strong>
                        </div>
                        `}
                    </div>
                `;
                break;

            case 'Claim Vesting':
                detailsHTML += `
                    <div class="receipt-section">
                        <div class="receipt-row">
                            <span>Vesting Type:</span>
                            <strong>${data.vestingType}</strong>
                        </div>
                        <div class="receipt-row highlight">
                            <span>Amount Claimed:</span>
                            <strong class="highlight-green">${data.amount} EYSN</strong>
                        </div>
                        <div class="receipt-row">
                            <span>Remaining Vested:</span>
                            <strong>${data.remaining} EYSN</strong>
                        </div>
                    </div>
                `;
                break;
        }

        // Transaction details (only if confirmed)
        if (confirmed && data.txHash) {
            detailsHTML += `
                <div class="receipt-section transaction-info">
                    <h4>Transaction Details</h4>
                    <div class="receipt-row">
                        <span>Transaction Hash:</span>
                        <code class="tx-hash">${this.formatHash(data.txHash)}</code>
                    </div>
                    <div class="receipt-row">
                        <span>From:</span>
                        <code>${Utils.shortenAddress(data.from)}</code>
                    </div>
                    ${data.to ? `
                    <div class="receipt-row">
                        <span>To:</span>
                        <code>${Utils.shortenAddress(data.to)}</code>
                    </div>
                    ` : ''}
                    <div class="receipt-row">
                        <span>Block Number:</span>
                        <strong>#${data.blockNumber}</strong>
                    </div>
                    <div class="receipt-row">
                        <span>Gas Used:</span>
                        <strong>${data.gasUsed}</strong>
                    </div>
                    <div class="receipt-row">
                        <span>Network:</span>
                        <strong>${CONFIG.CURRENT_NETWORK.chainName}</strong>
                    </div>
                </div>
            `;
        }

        return detailsHTML;
    }

    getActionIcon(action) {
        const icons = {
            'Contribution': '💰',
            'Stake Tokens': '🔒',
            'Approve Tokens': '✅',
            'Claim Rewards': '🎁',
            'Unstake Tokens': '🔓',
            'Claim Vesting': '📅'
        };
        return icons[action] || '📝';
    }

    formatHash(hash) {
        if (!hash) return '';
        return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
    }

    // ────────────────────────────────────────────────────────────
    // NEW: Parse and clean error messages
    // ────────────────────────────────────────────────────────────
    parseError(error) {
        if (!error) return 'Transaction failed. Please try again.';
        
        const errorStr = String(error);
        
        // Common error patterns with user-friendly messages
        if (errorStr.includes('insufficient funds') || 
            errorStr.includes('INSUFFICIENT_FUNDS')) {
            return 'Not enough ETH in your wallet to complete this transaction';
        }
        
        if (errorStr.includes('user rejected') || 
            errorStr.includes('User denied') ||
            errorStr.includes('user rejected transaction')) {
            return 'You rejected the transaction in your wallet';
        }
        
        if (errorStr.includes('gas required exceeds allowance') ||
            errorStr.includes('out of gas')) {
            return 'Transaction requires more gas. Try increasing gas limit.';
        }
        
        if (errorStr.includes('nonce too low')) {
            return 'Transaction nonce error. Please refresh the page and try again.';
        }
        
        if (errorStr.includes('already known') ||
            errorStr.includes('replacement transaction underpriced')) {
            return 'Transaction already pending. Please wait for confirmation.';
        }
        
        if (errorStr.includes('execution reverted')) {
            // Try to extract revert reason
            const reasonMatch = errorStr.match(/reason="([^"]+)"/);
            if (reasonMatch) {
                return `Transaction reverted: ${reasonMatch[1]}`;
            }
            return 'Transaction was reverted by the smart contract. Check requirements.';
        }
        
        if (errorStr.includes('network changed') ||
            errorStr.includes('chain')) {
            return 'Network changed during transaction. Please try again.';
        }
        
        if (errorStr.includes('timeout') ||
            errorStr.includes('timed out')) {
            return 'Transaction timed out. Please try again.';
        }
        
        // Default user-friendly message
        return 'Transaction failed. Please check your wallet and try again.';
    }
}

// Initialize receipt modal
let receiptModal;
document.addEventListener('DOMContentLoaded', () => {
    receiptModal = new ReceiptModal();
});

// Export for global use
window.ReceiptModal = ReceiptModal;
window.showReceipt = (data) => {
    if (!receiptModal) receiptModal = new ReceiptModal();
    receiptModal.show(data);
};