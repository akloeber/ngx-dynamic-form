import {SFPropComplex} from './schema-types';

export const SCHEMA: SFPropComplex = {
  type: 'object',
  description: 'Person',
  controls: [
    {
      type: 'AddressPicker',
      config: {
        mapping: {
          id: 'address.id',
          city: 'address.city',
          street: 'address.street',
        }
      },
    },
  ],
  properties: {
    sex: {
      type: 'string',
      widget: 'radio',
      description: 'Sex',
      oneOf: [
        {text: 'Male', value: 'M'},
        {text: 'Female', value: 'F'},
        {text: 'Div.', value: 'D'}
      ],
    },
    title: {
      type: 'string',
      description: 'Title',
      minOccurs: 0,
      explanation: 'Value must not container characters other than letters, blank or dot',
      pattern : '[a-zA-Z .]*',
    },
    name: {
      type: 'string',
      description: 'Name',
      readonly: true,
    },
    age: {
      type: 'number',
      description: 'Age',
    },
    birthday: {
      type: 'string',
      datatype: 'date',
      description: 'Birthday',
    },
    nationalities: {
      type: 'string',
      widget: 'multi-select',
      description: 'Nationalities',
      minOccurs: 2,
      maxOccurs: 3,
      anyOf: [
        {text: 'Italy', value: 'IT'},
        {text: 'Germany', value: 'DE'},
        {text: 'France', value: 'FR'},
        {text: 'Spain', value: 'ES'}
      ],
    },
    address: {
      type: 'object',
      description: 'Address',
      explanation: 'Activate checkbox to expand address details',
      properties: {
        id: {
          type: 'number',
          widget: 'hidden',
          minOccurs: 0,
        },
        city: {
          type: 'string',
          description: 'City',
        },
        street: {
          type: 'string',
          description: 'Street',
        },
      }
    },
    employers: {
      type: 'array',
      description: 'Employers',
      explanation: 'Activate checkbox to expand list of employers',
      initialView: 'collapsed',
      minOccurs: 0,
      maxOccurs: 4,
      items: {
        type: 'object',
        description: 'Employer',
        properties: {
          company: {
            type: 'string',
            description: 'Company',
          },
          country: {
            type: 'string',
            description: 'Country code',
            default: 'DE',
            minLength: 2,
            maxLength: 3,
          }
        }
      }
    },
    channel: {
      type: 'string',
      widget: 'select',
      description: 'Channel',
      anyOf: [
        {text: 'Email', value: 'EMAIL'},
        {text: 'SMS', value: 'SMS'},
        {text: 'Letter', value: 'LETTER'}
      ],
    },
  },
};
