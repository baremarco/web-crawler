export enum ECells {
  office = 1,
  date = 2,
  actuation = 3,
  detail = 4
}

export enum EErrors {
  FORM_SUBMIT = "Error submitting the form"
}

export type TCellsKeys = keyof typeof ECells;

export type TRowData = Record<TCellsKeys, string | undefined>;
export type TRowDataOptional = Record<string, string | undefined>;
