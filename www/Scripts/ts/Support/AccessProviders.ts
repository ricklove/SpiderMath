/// <reference path="AccessUserSettings.ts" />


module Told.SpellWell.Data {

    export interface IProviders {
        userSettings: IUserSettings;
    }

    export function createDefaultProviders() {
        return {
            userSettings: new Data.UserSettings_LocalStorage(),
        };
    }

}