import { type TRowData } from "../types/typeUtils";

export const USER_INPUT = {
  jurisdiction: "cnt",
  websiteURL: "http://scw.pjn.gov.ar/scw/home.seam",
  websiteKey: "6LcTJ1kUAAAAAJT1Xqu3gzANPfCbQG0nke9O5b6K",
  exp: "13540",
  year: "2019"
};

export const mapData = (data: TRowData[]) => {
  // skip first value because allways is empty
  return data.slice(0).map((element, index) => {
    return {
      [element.date ?? index.toString()]: {
        office: element.office,
        type: element.actuation,
        detail: element.detail
      }
    };
  });
};

export const scrapeFunction = () => {
  enum ECells {
    office = 1,
    date = 2,
    actuation = 3,
    detail = 4
  }
  type TCellsKeys = keyof typeof ECells;
  type TRowData = Record<TCellsKeys, string | undefined>;

  // Get table reference
  const table = document.querySelector("#expediente\\:action-table");
  // Initialize the array to store the JSON
  const data: TRowData[] = [];
  if (table != null) {
    // Iterate through the rows in the table
    const rows = table.querySelectorAll("tr");
    if (rows != null) {
      rows.forEach((row) => {
        const rowData: TRowData = {
          office: undefined,
          date: undefined,
          actuation: undefined,
          detail: undefined
        };
        const cells = row.querySelectorAll("td");
        cells.forEach((cell, index) => {
          if (Object.values(ECells).includes(index)) {
            const textCell = cell.innerText
              .split("\n")
              .slice(1)
              .join(" ")
              .trim();
            rowData[ECells[index] as TCellsKeys] = textCell;
          }
          data.push(rowData);
        });
        console.log({ rowData });
      });
    }
  }
  return data;
};
