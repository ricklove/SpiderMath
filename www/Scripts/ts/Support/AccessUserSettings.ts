/// <reference path="../../typings/jQuery/jQuery.d.ts" />

module Told.TableMath.Data {

    export interface IUserSettings {
        //bookChoice: string;
        //chapterChoice: string;
    }

    export interface ILevelState {
        levelID: string;
        stars: number;
    }

    export interface IUserState {
        levels: ILevelState[];
    }

    export class UserSettings_LocalStorage implements IUserSettings {

        /*
         * Get User Settings from local storage provider
         *
         * @param key which setting to retrieve
         * @returns the value, or null if not found
         */
        static getUserSetting(key: string): string {
            var value = localStorage.getItem(key);
            console.log("Get User Setting:" + key + "=" + value);
            return value;
        }

        static setUserSetting(key: string, value: string) {
            localStorage.setItem(key, value);
            console.log("Set User Setting:" + key + "=" + value);
        }

        get userList() {
            var valueStr = UserSettings_LocalStorage.getUserSetting("userList");
            return valueStr.split(";");
        }
        set userList(value: string[]) {
            var valueStr = value.join(";");
            UserSettings_LocalStorage.setUserSetting("userList", valueStr);
        }

        get currentUserId() {
            var valueStr = UserSettings_LocalStorage.getUserSetting("currentUserId");
            return parseInt(valueStr || "0");
        }
        set currentUserId(value: number) {
            var valueStr = "" + value;
            UserSettings_LocalStorage.setUserSetting("currentUserId", valueStr);
        }

        get currentUserState() {
            var userId = this.currentUserId;
            var valueStr = UserSettings_LocalStorage.getUserSetting("User" + userId + "_State") || "{levels:[]}";
            return JSON.parse(valueStr);
        }
        set currentUserState(value: IUserState) {
            var userId = this.currentUserId;
            var valueStr = JSON.stringify(value);
            UserSettings_LocalStorage.setUserSetting("User" + userId + "_State", valueStr);
        }

    }
}