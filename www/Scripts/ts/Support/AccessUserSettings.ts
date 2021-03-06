﻿/// <reference path="../../typings/jQuery/jQuery.d.ts" />

module Told.TableMath.Data {

    export interface IUserSettings {
        hasModifiedUsers: boolean;
        userList: string[];
        currentUserId: number;
        currentUserName: string;
        currentUserState: IUserState;
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
            var names = (valueStr || "").split(";");

            names = names.map((n, i) => n.trim().length === 0 ? "Player " + (i + 1) : n.trim());

            return names
        }
        set userList(value: string[]) {
            var valueStr = value.join(";");
            UserSettings_LocalStorage.setUserSetting("userList", valueStr);
        }

        get currentUserId() {
            var valueStr = UserSettings_LocalStorage.getUserSetting("currentUserId");
            var id = parseInt(valueStr || "0");

            id = id < 0 ? 0 : id;
            id = id > this.userList.length - 1 ? 0 : id;

            return id;
        }
        set currentUserId(value: number) {
            var valueStr = "" + value;
            UserSettings_LocalStorage.setUserSetting("currentUserId", valueStr);
        }

        get currentUserName() {
            return this.userList[this.currentUserId];
        }
        set currentUserName(value: string) {
            var users = this.userList;
            var userId = users.indexOf(value);
            this.currentUserId = userId;
        }

        get currentUserState() {
            var userId = this.currentUserId;
            var valueStr = UserSettings_LocalStorage.getUserSetting("User" + userId + "_State") || JSON.stringify({ levels: [] });
            return JSON.parse(valueStr);
        }
        set currentUserState(value: IUserState) {
            var userId = this.currentUserId;
            var valueStr = JSON.stringify(value);
            UserSettings_LocalStorage.setUserSetting("User" + userId + "_State", valueStr);
        }

        get hasModifiedUsers() {
            var users = this.userList;

            return users.length !== 1
                || users[0] !== "Player 1";
        }
    }
}