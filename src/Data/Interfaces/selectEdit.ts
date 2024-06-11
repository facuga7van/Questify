export interface Option {
  label: string;
  value: string;
}

export interface Props {
  options: Option[];
  onChange: (selectedOption: Option | null) => void;
}

export interface State {
  createdOption: Option | null;
  value: Option | null;
}