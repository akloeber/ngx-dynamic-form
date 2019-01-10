// TODO: datatype === 'string' is not necessary as it can be expressed via type
// TODO: fix typo in targetPLz
// TODO: move filter config for control into config
// TODO: use oneOf insteaof anyOf for radio groups / choices

export type SFProp =
  SFPropSimple |
  SFPropArray |
  SFPropComplex |
  SfPropChoiceBoolean |
  SfPropChoiceString |
  SfPropChoiceStringMasterData;

interface ChoiceOption<T> {
  text: string;
  value: T;
}

interface SFPropBase {
  type: string;
  datatype?: string;
  widget?: string;
  description?: string;
  explanation?: string;
  minLength?: number;
  maxLength?: number;
  minOccurs?: number;
  maxOccurs?: number | 'unbounded';
  dataModelPath?: string;
  masterDataKey?: string;

  initialView?: 'collapsed' | 'expanded';
  readonly?: boolean;
}

type DT_SF_PROP_SIMPLE_TYPE = 'string' | 'number';
type DT_SF_PROP_SIMPLE_DATATYPE = 'date' | 'string';
type DT_SF_PROP_SIMPLE_WIDGET = 'hidden' | 'date' | 'radio' | 'select' | 'multi-select';
type DT_SF_CHOICE_WIDGET = 'radio' | 'multi-select' | 'select';

export interface SFPropSimple extends SFPropBase {
  type: DT_SF_PROP_SIMPLE_TYPE;
  datatype?: DT_SF_PROP_SIMPLE_DATATYPE;
  widget?: DT_SF_PROP_SIMPLE_WIDGET;
  default?: string | number;
  anyOf?: Array<ChoiceOption<any>>;
  oneOf?: Array<ChoiceOption<any>>;
  pattern?: string;
}

export interface SFPropArray extends SFPropBase {
  type: 'array';
  items: SFProp;
}

export interface SFPropComplex extends SFPropBase {
  type: 'object';
  properties: {
    [propertyKey: string]: SFProp;
  };
  controls?: Array<{ type: string } & any>;
}

export interface SfPropChoiceBoolean extends SFPropBase {
  type: 'boolean';
  widget: DT_SF_CHOICE_WIDGET;
  anyOf: Array<ChoiceOption<boolean>>;
  default?: boolean;
}

export interface SfPropChoiceString extends SFPropBase {
  type: 'string';
  widget: DT_SF_CHOICE_WIDGET;
  anyOf: Array<ChoiceOption<string>>;
}

export interface SfPropChoiceStringMasterData extends SFPropBase {
  type: 'string';
  widget: DT_SF_CHOICE_WIDGET;
  masterDataKey: string;
}

export type SFSchema = SFProp;

export type SFInputType = 'text' | 'number' | 'date' | 'radio' | 'select' | 'multi-select' | 'hidden';

export function getInputType(schema: SFPropSimple): SFInputType {
  const type = schema.widget || schema.datatype || schema.type;
  switch (type) {
    case 'date':
    case 'number':
    case 'radio':
    case 'select':
    case 'multi-select':
      return type;
    default:
      return 'text';
  }
}


export function isRequired(prop: SFProp): boolean {
  return prop.minOccurs !== 0;
}

export function isReadonly(prop: SFProp): boolean {
  return prop.readonly === true;
}

export function getMaxOccurs(prop: SFPropArray | SFPropSimple): number {
  if (prop.maxOccurs === 'unbounded') {
    return Number.POSITIVE_INFINITY;
  }
  return prop.maxOccurs !== undefined ? prop.maxOccurs : Number.POSITIVE_INFINITY;
}

export function getMinOccurs(prop: SFPropArray | SFPropSimple): number {
  return prop.minOccurs !== undefined ? prop.minOccurs : 0;
}

export function getMinLength(prop: SFPropSimple): number {
  return prop.minLength !== undefined ? prop.minLength : 0;
}

export function getMaxLength(prop: SFPropSimple): number {
  return prop.maxLength !== undefined ? prop.maxLength : Number.POSITIVE_INFINITY;
}
