import { unref } from "vue";
import { defineStore } from "pinia";
import { router } from "@/router";
import { useRouterPush } from "@/composables";
import { fetchLogin, fetchLogout, fetchUserInfo } from "@/service";
import {
	getUserInfo,
	getToken,
	setUserInfo,
	setToken,
	setRefreshToken,
	clearAuthStorage,
	setElUserInfo,
	getElUserInfo,
} from "@/utils";
import { useTabStore } from "../tab";
import { useRouteStore } from "../route";

interface AuthState {
	/** 用户信息 */
	userInfo: Auth.UserInfo;
	elUserInfo: Auth.ElAdminUserInfo;
	/** 用户token */
	token: string;
	/** 登录的加载状态 */
	loginLoading: boolean;
}

export const useAuthStore = defineStore("auth-store", {
	state: (): AuthState => ({
		userInfo: getUserInfo(),
		elUserInfo: getElUserInfo(),
		token: getToken(),
		loginLoading: false,
	}),
	getters: {
		/** 是否登录 */
		isLogin(state) {
			return Boolean(state.token);
		},
	},
	actions: {
		/** 重置auth状态 */
		resetAuthStore() {
			const { toLogin } = useRouterPush(false);
			const { resetTabStore } = useTabStore();
			const { resetRouteStore } = useRouteStore();
			const route = unref(router.currentRoute);

			clearAuthStorage();
			this.$reset();

			resetTabStore();
			resetRouteStore();

      this.logout();

			if (route.meta.requiresAuth) {
				toLogin();
			}
		},
		/**
		 * 处理登录后成功或失败的逻辑
		 * @param backendToken - 返回的token
		 */
		async handleActionAfterLogin(backendToken: ApiAuth.Token) {
			const { toLoginRedirect } = useRouterPush(false);

			const loginSuccess = await this.loginByToken(backendToken);

			if (loginSuccess) {
				// 跳转登录后的地址
				toLoginRedirect();

				// 登录成功弹出欢迎提示
				window.$notification?.success({
					title: "登录成功!",
					content: `欢迎回来，${this.elUserInfo.user.nickName}!`,
					duration: 3000,
				});

				return;
			}

			// 不成功则重置状态
			this.resetAuthStore();
		},
		/**
		 * 根据token进行登录
		 * @param backendToken - 返回的token
		 */
		async loginByToken(backendToken: ApiAuth.Token) {
			let successFlag = false;

			// 先把token存储到缓存中(后面接口的请求头需要token)
			const { token, refreshToken } = backendToken;
			setToken(token);
			setRefreshToken(refreshToken);
			// 获取用户信息
			const { data } = await fetchUserInfo();

			const userInfo: Auth.UserInfo = {
				userId: "0",
				userName: "admin",
				userRole: "admin",
			};

			if (data) {
				// 成功后把用户信息存储到缓存中
				setUserInfo(userInfo);
				setElUserInfo(data);

				// 更新状态
				this.userInfo = userInfo;
				this.token = token;

				successFlag = true;
			}

			return successFlag;
		},
		/**
		 * 登录
		 * @param userName - 用户名
		 * @param password - 密码
		 */
		async login(userName: string, password: string) {
			this.loginLoading = true;
			const { data } = await fetchLogin(userName, password);
			if (data) {
				await this.handleActionAfterLogin(data);
			}
			this.loginLoading = false;
		},
		/**
		 * 更换用户权限(切换账号)
		 * @param userRole
		 */
		async updateUserRole(userRole: Auth.RoleType) {
			const { resetRouteStore, initAuthRoute } = useRouteStore();

			const accounts: Record<
				Auth.RoleType,
				{ userName: string; password: string }
			> = {
				admin: {
					userName: "admin",
					password: "123456",
				},
			};
			const { userName, password } = accounts[userRole];
			const { data } = await fetchLogin(userName, password);
			if (data) {
				await this.loginByToken(data);
				resetRouteStore();
				initAuthRoute();
			}
		},
    /**
     * 退出登录
     * @returns 
     */
		async logout() {
			return await fetchLogout();
		},
	},
});
