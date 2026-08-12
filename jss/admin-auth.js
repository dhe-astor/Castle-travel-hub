/**
 * Castle Travel Hub - Admin Authentication Guard
 */

window.CastleAuth = {
    async getCurrentUser() {
        if (!window.CastleDB) return null;
        try {
            return await window.CastleDB.auth.getUser();
        } catch (e) {
            return null;
        }
    },

    async login(email, password) {
        if (!window.CastleDB) throw new Error('Database layer not initialized.');
        return await window.CastleDB.auth.login(email, password);
    },

    async logout() {
        if (window.CastleDB) {
            await window.CastleDB.auth.logout();
        }
        window.location.href = '/admin/login.html';
    },

    async requireAuth() {
        const user = await this.getCurrentUser();
        if (!user) {
            // Save redirect destination
            sessionStorage.setItem('castle_redirect_after_login', window.location.pathname);
            window.location.href = '/admin/login.html';
            return null;
        }
        return user;
    }
};
