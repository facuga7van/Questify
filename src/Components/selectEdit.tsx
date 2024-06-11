import React, { Component } from "react";
import Select, { components, SingleValueProps } from "react-select";
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
          menuPortalTarget={document.body} // Renderiza el menú en el cuerpo del documento
          styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }} // Asegura que el menú esté encima de otros elementos
        />
      </div>
    );
  }
}
