import { MetaInfo } from "org-mode-ast";

export interface LinkedNote {
  id: string;
  title: string;
}

export interface Note {
  id: string;
  meta: MetaInfo;
  content: string;
}
