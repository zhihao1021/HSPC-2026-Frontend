export type CityType = "臺北市" | "新北市" | "桃園市" | "臺中市" | "臺南市" | "高雄市" | "新竹縣" | "苗栗縣" | "彰化縣" | "南投縣" | "雲林縣" | "嘉義縣" | "屏東縣" | "宜蘭縣" | "花蓮縣" | "臺東縣" | "澎湖縣" | "金門縣" | "連江縣" | "基隆市" | "新竹市" | "嘉義市" | "大石頭";
export type LunchType = "葷" | "素";
export type SIDVerifyStateText = "UNVERIFIED" | "PENDING" | "VERIFIED" | "FAILED";
export type SIDVerifyState = 0 | 1 | 2 | 3;
export const SIDVerifyStateMap: Record<SIDVerifyState, SIDVerifyStateText> = {
    0: "UNVERIFIED",
    1: "PENDING",
    2: "VERIFIED",
    3: "FAILED"
};
export const SIDVerifyStateTextMap: Record<SIDVerifyStateText, string> = {
    UNVERIFIED: "未驗證",
    PENDING: "審核中",
    VERIFIED: "已驗證",
    FAILED: "審核失敗"
}
