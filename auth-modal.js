// 通用登录/注册模块
// 使用方法：在页面中引入此文件，然后调用 openAuthModal() 打开登录弹窗

const API_BASE_URL = 'https://fish-rabbit.site/api';

// 创建登录/注册弹窗HTML
function createAuthModal() {
    const modalHTML = `
    <!-- 登录弹窗 -->
    <div id="authLoginModal" class="hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full">
            <div class="sticky top-0 bg-gradient-to-r from-blue-400 to-pink-400 text-white p-6 rounded-t-3xl">
                <h2 class="text-2xl font-bold text-center">登录</h2>
            </div>
            
            <div class="p-6">
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">用户名</label>
                    <input type="text" id="authLoginUsername" placeholder="请输入用户名" class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none transition-all">
                </div>

                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-700 mb-2">密码</label>
                    <input type="password" id="authLoginPassword" placeholder="请输入密码" class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none transition-all">
                </div>

                <div class="flex gap-3">
                    <button onclick="closeAuthModal()" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-all duration-300">
                        取消
                    </button>
                    <button onclick="submitAuthLogin()" class="flex-1 bg-gradient-to-r from-blue-400 to-pink-400 hover:from-blue-300 hover:to-pink-300 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 shadow-lg">
                        登录
                    </button>
                </div>

                <div class="mt-4 text-center">
                    <span class="text-sm text-gray-600">还没有账号？</span>
                    <button onclick="switchToAuthRegister()" class="text-sm text-blue-500 hover:text-blue-600 font-medium">
                        立即注册
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- 注册弹窗 -->
    <div id="authRegisterModal" class="hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div class="sticky top-0 bg-gradient-to-r from-blue-400 to-pink-400 text-white p-6 rounded-t-3xl">
                <h2 class="text-2xl font-bold text-center">注册</h2>
            </div>
            
            <div class="p-6">
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">用户名</label>
                    <input type="text" id="authRegisterUsername" placeholder="请输入用户名" maxlength="50" class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none transition-all">
                </div>

                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">密码</label>
                    <input type="password" id="authRegisterPassword" placeholder="请输入密码" class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none transition-all">
                </div>

                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">昵称</label>
                    <input type="text" id="authRegisterNickname" placeholder="请输入昵称" maxlength="50" class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none transition-all">
                </div>

                <!-- 头像选择 -->
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">选择头像</label>
                    <div class="flex gap-3 flex-wrap justify-center">
                        <div class="auth-avatar-option w-16 h-16 rounded-full bg-gradient-to-br from-blue-300 to-blue-400 flex items-center justify-center cursor-pointer border-4 border-transparent hover:border-blue-400 transition-all" data-avatar="fish">
                            <i class="fas fa-fish text-white text-2xl"></i>
                        </div>
                        <div class="auth-avatar-option w-16 h-16 rounded-full bg-gradient-to-br from-pink-300 to-pink-400 flex items-center justify-center cursor-pointer border-4 border-transparent hover:border-pink-400 transition-all" data-avatar="rabbit">
                            <i class="fas fa-heart text-white text-2xl"></i>
                        </div>
                        <div class="auth-avatar-option w-16 h-16 rounded-full bg-gradient-to-br from-purple-300 to-purple-400 flex items-center justify-center cursor-pointer border-4 border-transparent hover:border-purple-400 transition-all" data-avatar="star">
                            <i class="fas fa-star text-white text-2xl"></i>
                        </div>
                        <div class="auth-avatar-option w-16 h-16 rounded-full bg-gradient-to-br from-green-300 to-green-400 flex items-center justify-center cursor-pointer border-4 border-transparent hover:border-green-400 transition-all" data-avatar="leaf">
                            <i class="fas fa-leaf text-white text-2xl"></i>
                        </div>
                        <div class="auth-avatar-option w-16 h-16 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-400 flex items-center justify-center cursor-pointer border-4 border-transparent hover:border-yellow-400 transition-all" data-avatar="sun">
                            <i class="fas fa-sun text-white text-2xl"></i>
                        </div>
                        <div class="auth-avatar-option w-16 h-16 rounded-full bg-gradient-to-br from-pink-300 to-pink-400 flex items-center justify-center cursor-pointer border-4 border-transparent hover:border-pink-400 transition-all" data-avatar="cloud">
                            <i class="fas fa-cloud text-white text-2xl"></i>
                        </div>
                    </div>
                </div>

                <!-- 上传自定义头像 -->
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-700 mb-2">或上传自定义头像</label>
                    <div class="flex items-center gap-4">
                        <div class="flex-shrink-0">
                            <div id="authAvatarPreview" class="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200">
                                <i class="fas fa-image text-gray-400 text-2xl"></i>
                            </div>
                        </div>
                        <div class="flex-grow">
                            <input type="file" id="authAvatarUpload" accept="image/*" class="hidden">
                            <button type="button" onclick="document.getElementById('authAvatarUpload').click()" class="bg-blue-100 hover:bg-blue-200 text-blue-600 font-medium py-2 px-4 rounded-lg transition-all duration-300 text-sm">
                                <i class="fas fa-upload mr-1"></i>选择图片
                            </button>
                            <p class="text-xs text-gray-500 mt-1">支持 JPG、PNG、GIF，最大 5MB</p>
                        </div>
                    </div>
                </div>

                <div class="flex gap-3">
                    <button onclick="closeAuthModal()" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-all duration-300">
                        取消
                    </button>
                    <button onclick="submitAuthRegister()" class="flex-1 bg-gradient-to-r from-blue-400 to-pink-400 hover:from-blue-300 hover:to-pink-300 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 shadow-lg">
                        注册
                    </button>
                </div>

                <div class="mt-4 text-center">
                    <span class="text-sm text-gray-600">已有账号？</span>
                    <button onclick="switchToAuthLogin()" class="text-sm text-blue-500 hover:text-blue-600 font-medium">
                        立即登录
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Toast 提示 -->
    <div id="authToast" class="hidden fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[60]">
        <div class="bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg">
            <span id="authToastMessage"></span>
        </div>
    </div>
    `;
    
    // 将模态框添加到页面
    const container = document.createElement('div');
    container.innerHTML = modalHTML;
    document.body.appendChild(container);
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    createAuthModal();
    initAuthEventListeners();
});

// 全局变量
let authSelectedAvatar = 'fish';
let authUploadedAvatar = null;

// 初始化事件监听
function initAuthEventListeners() {
    // 头像选择
    document.querySelectorAll('.auth-avatar-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.auth-avatar-option').forEach(opt => {
                opt.classList.remove('ring-4', 'ring-blue-400');
            });
            this.classList.add('ring-4', 'ring-blue-400');
            authSelectedAvatar = this.dataset.avatar;
            authUploadedAvatar = null;
            document.getElementById('authAvatarPreview').innerHTML = '<i class="fas fa-image text-gray-400 text-2xl"></i>';
        });
    });

    // 头像上传
    document.getElementById('authAvatarUpload').addEventListener('change', handleAuthAvatarUpload);
    
    // 回车键登录
    document.getElementById('authLoginUsername').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') submitAuthLogin();
    });
    document.getElementById('authLoginPassword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') submitAuthLogin();
    });
}

// 处理头像上传
async function handleAuthAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
        showAuthToast('请选择图片文件', 'error');
        return;
    }

    // 验证文件大小
    if (file.size > 5 * 1024 * 1024) {
        showAuthToast('图片大小不能超过 5MB', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
        const response = await fetch(`${API_BASE_URL}/upload/avatar`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            authUploadedAvatar = data.avatarUrl;
            // 显示预览
            const preview = document.getElementById('authAvatarPreview');
            preview.innerHTML = `<img src="${data.avatarUrl}" alt="头像预览" class="w-full h-full object-cover">`;
            // 取消预设头像选择
            document.querySelectorAll('.auth-avatar-option').forEach(opt => {
                opt.classList.remove('ring-4', 'ring-blue-400');
            });
            showAuthToast('头像上传成功', 'success');
        } else {
            showAuthToast(data.error || '上传失败', 'error');
        }
    } catch (error) {
        console.error('上传头像失败:', error);
        showAuthToast('上传失败，请重试', 'error');
    }
}

// 打开登录弹窗
function openAuthModal(type = 'login') {
    if (type === 'register') {
        openAuthRegisterModal();
    } else {
        openAuthLoginModal();
    }
}

// 打开登录弹窗
function openAuthLoginModal() {
    document.getElementById('authLoginModal').classList.remove('hidden');
    document.getElementById('authLoginUsername').value = '';
    document.getElementById('authLoginPassword').value = '';
    setTimeout(() => {
        document.getElementById('authLoginUsername').focus();
    }, 100);
}

// 打开注册弹窗
function openAuthRegisterModal() {
    document.getElementById('authRegisterModal').classList.remove('hidden');
    document.getElementById('authRegisterUsername').value = '';
    document.getElementById('authRegisterPassword').value = '';
    document.getElementById('authRegisterNickname').value = '';
    authUploadedAvatar = null;
    document.getElementById('authAvatarPreview').innerHTML = '<i class="fas fa-image text-gray-400 text-2xl"></i>';
    authSelectedAvatar = 'fish';
    // 选中第一个头像
    document.querySelectorAll('.auth-avatar-option').forEach((opt, index) => {
        if (index === 0) {
            opt.classList.add('ring-4', 'ring-blue-400');
        } else {
            opt.classList.remove('ring-4', 'ring-blue-400');
        }
    });
}

// 关闭弹窗
function closeAuthModal() {
    document.getElementById('authLoginModal').classList.add('hidden');
    document.getElementById('authRegisterModal').classList.add('hidden');
}

// 切换到注册
function switchToAuthRegister() {
    closeAuthModal();
    openAuthRegisterModal();
}

// 切换到登录
function switchToAuthLogin() {
    closeAuthModal();
    openAuthLoginModal();
}

// 提交登录
async function submitAuthLogin() {
    const username = document.getElementById('authLoginUsername').value.trim();
    const password = document.getElementById('authLoginPassword').value;

    if (!username || !password) {
        showAuthToast('请输入用户名和密码', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || '登录失败');
        }

        // 保存用户信息到本地
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        
        closeAuthModal();
        showAuthToast('登录成功！', 'success');
        
        // 更新页面UI
        if (typeof updateUserUI === 'function') {
            setTimeout(() => {
                updateUserUI();
            }, 500);
        }
        
        // 触发自定义事件，通知页面登录成功
        window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: data.user }));
        
    } catch (error) {
        console.error('登录失败:', error);
        showAuthToast(error.message || '登录失败', 'error');
    }
}

// 提交注册
async function submitAuthRegister() {
    const username = document.getElementById('authRegisterUsername').value.trim();
    const password = document.getElementById('authRegisterPassword').value;
    const nickname = document.getElementById('authRegisterNickname').value.trim();

    if (!username || !password || !nickname) {
        showAuthToast('请填写所有必填项', 'error');
        return;
    }

    // 确定头像
    let avatar;
    if (authUploadedAvatar) {
        avatar = authUploadedAvatar;
    } else {
        const avatarMap = {
            'fish': 'https://api.dicebear.com/7.x/bottts/svg?seed=fish&backgroundColor=99CCF3',
            'rabbit': 'https://api.dicebear.com/7.x/bottts/svg?seed=rabbit&backgroundColor=FFC2D1',
            'star': 'https://api.dicebear.com/7.x/bottts/svg?seed=star&backgroundColor=DDA0DD',
            'leaf': 'https://api.dicebear.com/7.x/bottts/svg?seed=leaf&backgroundColor=90EE90',
            'sun': 'https://api.dicebear.com/7.x/bottts/svg?seed=sun&backgroundColor=FFD700',
            'cloud': 'https://api.dicebear.com/7.x/bottts/svg?seed=cloud&backgroundColor=FFB6C1'
        };
        avatar = avatarMap[authSelectedAvatar];
    }

    try {
        const response = await fetch(`${API_BASE_URL}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, nickname, avatar })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || '注册失败');
        }

        // 保存用户信息到本地
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        
        closeAuthModal();
        showAuthToast('注册成功！', 'success');
        
        // 更新页面UI
        if (typeof updateUserUI === 'function') {
            setTimeout(() => {
                updateUserUI();
            }, 500);
        }
        
        // 触发自定义事件，通知页面注册成功
        window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: data.user }));
        
    } catch (error) {
        console.error('注册失败:', error);
        showAuthToast(error.message || '注册失败', 'error');
    }
}

// 显示提示
function showAuthToast(message, type = 'info') {
    const toast = document.getElementById('authToast');
    const toastMessage = document.getElementById('authToastMessage');
    
    toastMessage.textContent = message;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

