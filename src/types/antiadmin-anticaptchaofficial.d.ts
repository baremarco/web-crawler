// @antiadmin/anticaptchaofficial.d.ts

declare module "@antiadmin/anticaptchaofficial" {
  export function setAPIKey(key: string): void;
  export function getBalance(): Promise<number>;
  export function solveRecaptchaV2Proxyless(
    websiteURL: string,
    websiteKey: string,
    isInvisible?: boolean
  ): Promise<string>;
}
