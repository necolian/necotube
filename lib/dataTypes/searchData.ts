
export interface searchData {
    query: string;
    datas: any[];
    nextPageToken: string | "";
    prevpageToken: string | "";
}

// searchで返ってきたデータをパースするために使用
// 各要素に番号を振る→各データをget〇〇に通す
// またあつめて番号順にしてdataだけ取り出して元通り
export interface searchResponse {
    number: number;
    kind: string;
    data: any;
}