import { EnumStorageKey } from '@/enum';
import { setLocal, getLocal, removeLocal } from '../storage';

/** 设置token */
export function setToken(token: string) {
  setLocal(EnumStorageKey.token, token);
}

/** 获取token */
export function getToken() {
  return getLocal<string>(EnumStorageKey.token) || '';
}

/** 去除token */
export function removeToken() {
  removeLocal(EnumStorageKey.token);
}

/** 获取refresh token */
export function getRefreshToken() {
  return getLocal<string>(EnumStorageKey['refresh-token']) || '';
}

/** 设置refresh token */
export function setRefreshToken(token: string) {
  setLocal(EnumStorageKey['refresh-token'], token);
}

/** 去除refresh token */
export function removeRefreshToken() {
  removeLocal(EnumStorageKey['refresh-token']);
}

/** 获取用户信息 */
export function getUserInfo() {
  const emptyInfo: Auth.UserInfo = {
    userId: '',
    userName: '',
    userRole: 'admin'
  };
  const userInfo: Auth.UserInfo = getLocal<Auth.UserInfo>(EnumStorageKey['user-info']) || emptyInfo;
  return userInfo;
}

export function getElUserInfo() {
  const emptyInfo: Auth.ElAdminUserInfo = {
    authorities: [],
    dataScopes: [],
    roles: "admin",
    user: {
      avatarName: '',
      avatarPath: '',
      createTime: '',
      dept: {
        id: 0,
        name: ''
      },
      email: '',
      enabled: false,
      gender: '男',
      id: 0,
      isAdmin: true,
      jobs: {
        id: 0,
        name: "开发"
      },
      nickName: "",
      password: "",
      phone: "",
      pwdResetTime: "",
      roles:[],
      updateBy: "",
      updateTime: "",
      username: ""
    }
  }
  const userInfo: Auth.ElAdminUserInfo = getLocal<Auth.ElAdminUserInfo>(EnumStorageKey['el-user-info']) || emptyInfo;
  return userInfo;
}

/** 设置用户信息 */
export function setUserInfo(userInfo: Auth.UserInfo) {
  setLocal(EnumStorageKey['user-info'], userInfo);
}
export function setElUserInfo(userInfo: Auth.ElAdminUserInfo){
  setLocal(EnumStorageKey['el-user-info'],userInfo);
}

/** 去除用户信息 */
export function removeUserInfo() {
  removeLocal(EnumStorageKey['user-info']);
}
export function removeElUserInfo() {
  removeLocal(EnumStorageKey['el-user-info']);
}

/** 去除用户相关缓存 */
export function clearAuthStorage() {
  removeToken();
  removeRefreshToken();
  removeUserInfo();
}
