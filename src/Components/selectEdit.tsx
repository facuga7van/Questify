import React, { Component } from "react";
import { components, SingleValueProps } from "react-select";
import CreatableSelect from "react-select/creatable";
import { Option, Props, State } from '../Data/Interfaces/selectEdit';
import '../Styles/SelectEdit.css';

export default class SingleSelect extends Component<Props, State> {
  state: State = {
    createdOption: null,
    value: null,
  };

  onEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { createdOption } = this.state;
    if (!createdOption) return;

    e.stopPropagation();
    const newOption = { ...createdOption, label: e.target.value, value: e.target.value };

    this.setState({ value: newOption });
    this.props.onChange(newOption);
  };

  SingleValue = (props: SingleValueProps<Option>) => {
    return (
      <components.SingleValue {...props}>
        <input
          className="selectInlineInput"
          type="text"
          value={props.data.value}
          onChange={this.onEditChange}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.currentTarget.value === "") {
              e.stopPropagation();
              this.setState({ value: null });
              this.props.onChange(null);
            }
          }}
        />
      </components.SingleValue>
    );
  };

  onChange = (option: Option | null) => {
    if (!option) {
      this.setState({ value: null });
      this.props.onChange(null);
      return;
    }
    const newOption = { ...option };

    this.setState({ value: newOption });
    this.props.onChange(newOption);
  };

  render() {
    return (
      <div className="selectDiv">
        <CreatableSelect
          className="basic-single"
          classNamePrefix="select"
          name="color"
          options={this.props.options}
          onChange={(value) => this.onChange(value as Option)}
          value={this.state.value}
          components={{ SingleValue: this.SingleValue }}
          isClearable
          placeholder={this.props.placeholder ?? "Clase"}
          menuPortalTarget={document.body} // Renderiza el menú en el cuerpo del documento
          styles={{
            // Importante: el sidebar (z-index alto) debe quedar por encima del dropdown
            menuPortal: (base) => ({ ...base, zIndex: 400 }),
            control: (base, state) => ({
              ...base,
              backgroundColor: "var(--q-panel-2)",
              borderColor: state.isFocused ? "rgba(215, 180, 106, 0.75)" : "rgba(121, 86, 73, 0.35)",
              boxShadow: state.isFocused
                ? "0 0 0 2px rgba(215, 180, 106, 0.20), var(--q-shadow-inset)"
                : "var(--q-shadow-inset)",
              minHeight: 40,
            }),
            placeholder: (base) => ({
              ...base,
              color: "rgba(255, 255, 255, 0.55)",
            }),
            singleValue: (base) => ({
              ...base,
              color: "rgba(255, 255, 255, 0.92)",
            }),
            input: (base) => ({
              ...base,
              color: "rgba(255, 255, 255, 0.92)",
            }),
            menu: (base) => ({
              ...base,
              backgroundColor: "var(--q-parchment)",
              border: "1px solid var(--q-border)",
              boxShadow: "var(--q-shadow)",
              overflow: "hidden",
            }),
            option: (base, state) => ({
              ...base,
              color: "var(--q-ink)",
              backgroundColor: state.isSelected
                ? "rgba(215, 180, 106, 0.35)"
                : state.isFocused
                  ? "rgba(0, 0, 0, 0.08)"
                  : "transparent",
            }),
          }}
        />
      </div>
    );
  }
}
