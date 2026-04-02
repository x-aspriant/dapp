// Utility Functions

// Format address to short version
function shortenAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Format number with token decimals
function formatTokenAmount(amount, decimals = 18, maxDecimals = 2) {
    try {
        const formatted = ethers.utils.formatUnits(amount, decimals);
        const number = parseFloat(formatted);
        return number.toLocaleString('en-US', {
            maximumFractionDigits: maxDecimals,
            minimumFractionDigits: 0
        });
    } catch (error) {
        console.error('Error formatting token amount:', error);
        return '0';
    }
}

// Format ETH amount
function formatEthAmount(amount, maxDecimals = 4) {
    try {
        const formatted = ethers.utils.formatEther(amount);
        return parseFloat(formatted).toFixed(maxDecimals);
    } catch (error) {
        console.error('Error formatting ETH amount:', error);
        return '0';
    }
}

// Get explorer link
function getExplorerLink(address, type = 'address') {
    return `${CONFIG.EXPLORER_URL}/${type}/${address}`;
}

// Calculate time remaining
function getTimeRemaining(timestamp) {
    const now = Math.floor(Date.now() / 1000);
    const diff = timestamp - now;
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

// Format date
function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Parse ETH input
function parseEthInput(value) {
    try {
        return ethers.utils.parseEther(value.toString());
    } catch (error) {
        console.error('Error parsing ETH input:', error);
        return ethers.BigNumber.from(0);
    }
}

// Parse token input
function parseTokenInput(value, decimals = 18) {
    try {
        return ethers.utils.parseUnits(value.toString(), decimals);
    } catch (error) {
        console.error('Error parsing token input:', error);
        return ethers.BigNumber.from(0);
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // You can replace this with a proper notification library
    const className = type === 'error' ? 'error' : type === 'success' ? 'success' : 'info';
    console.log(`[${className.toUpperCase()}] ${message}`);
    alert(message); // Simple alert for now
}

// Show loading state
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.add('loading');
        element.disabled = true;
    }
}

// Hide loading state
function hideLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.remove('loading');
        element.disabled = false;
    }
}

// Wait for transaction
async function waitForTransaction(tx, successMessage = 'Transaction successful!') {
    try {
        showNotification('Transaction submitted! Waiting for confirmation...', 'info');
        const receipt = await tx.wait();
        showNotification(successMessage, 'success');
        return receipt;
    } catch (error) {
        console.error('Transaction failed:', error);
        showNotification('Transaction failed: ' + error.message, 'error');
        throw error;
    }
}

// Calculate percentage
function calculatePercentage(part, whole) {
    if (!whole || whole.isZero()) return 0;
    try {
        return part.mul(10000).div(whole).toNumber() / 100;
    } catch (error) {
        return 0;
    }
}

// Update progress bar
function updateProgressBar(elementId, percentage) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.width = Math.min(percentage, 100) + '%';
    }
}

// Copy to clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showNotification('Copied to clipboard!', 'success');
    } catch (error) {
        console.error('Failed to copy:', error);
        showNotification('Failed to copy', 'error');
    }
}

// Validate ETH amount
function validateEthAmount(amount, min = 0.01) {
    const value = parseFloat(amount);
    if (isNaN(value) || value < min) {
        return { valid: false, error: `Minimum amount is ${min} ETH` };
    }
    return { valid: true };
}

// Validate token amount
function validateTokenAmount(amount, min = 100) {
    const value = parseFloat(amount);
    if (isNaN(value) || value < min) {
        return { valid: false, error: `Minimum amount is ${min} tokens` };
    }
    return { valid: true };
}

// Export functions
window.Utils = {
    shortenAddress,
    formatTokenAmount,
    formatEthAmount,
    getExplorerLink,
    getTimeRemaining,
    formatDate,
    parseEthInput,
    parseTokenInput,
    showNotification,
    showLoading,
    hideLoading,
    waitForTransaction,
    calculatePercentage,
    updateProgressBar,
    copyToClipboard,
    validateEthAmount,
    validateTokenAmount
};