// Custom Notification System

class NotificationManager {
    constructor() {
        this.createContainer();
        this.notifications = [];
    }

    createContainer() {
        if (document.getElementById('notificationContainer')) return;

        const container = document.createElement('div');
        container.id = 'notificationContainer';
        container.className = 'notification-container';
        document.body.appendChild(container);
    }

    show(options) {
        const {
            title = 'Notification',
            message = '',
            type = 'info', // success, error, warning, info
            duration = 5000,
            address = null
        } = options;

        const notification = this.createNotification(title, message, type, address);
        const container = document.getElementById('notificationContainer');
        container.appendChild(notification);

        this.notifications.push(notification);

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => this.remove(notification), duration);
        }

        return notification;
    }

    createNotification(title, message, type, address) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        const icon = this.getIcon(type);
        const addressHTML = address ? 
            `<div class="notification-address">${this.shortenAddress(address)}</div>` : '';

        notification.innerHTML = `
            <div class="notification-icon">${icon}</div>
            <div class="notification-content">
                <h4 class="notification-title">${title}</h4>
                <p class="notification-message">${message}</p>
                ${addressHTML}
            </div>
            <button class="notification-close">&times;</button>
            <div class="notification-progress" style="animation-duration: ${5}s;"></div>
        `;

        // Close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => this.remove(notification));

        return notification;
    }

    getIcon(type) {
        const icons = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }

    remove(notification) {
        notification.classList.add('hiding');
        setTimeout(() => {
            notification.remove();
            this.notifications = this.notifications.filter(n => n !== notification);
        }, 300);
    }

    shortenAddress(address) {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }

    // Convenience methods
    success(title, message, address = null) {
        return this.show({ title, message, type: 'success', address });
    }

    error(title, message) {
        return this.show({ title, message, type: 'error', duration: 7000 });
    }

    warning(title, message) {
        return this.show({ title, message, type: 'warning', duration: 6000 });
    }

    info(title, message) {
        return this.show({ title, message, type: 'info' });
    }

    // Clear all notifications
    clearAll() {
        this.notifications.forEach(n => this.remove(n));
    }
}

// Initialize
let notify;
document.addEventListener('DOMContentLoaded', () => {
    notify = new NotificationManager();
});

window.NotificationManager = NotificationManager;
window.notify = notify;