import {SFPropComplex} from './schema-types';

export const SCHEMA: SFPropComplex = {
  type: 'object',
  description: 'Person',
  controls: [
    {
      type: 'AddressPicker',
      config: {
        mapping: {
          city: 'address.city',
          street: 'address.street',
        }
      },
    },
  ],
  properties: {
    title: {
      type: 'string',
      description: 'Title',
      minOccurs: 0,
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
    hidden: {
      type: 'string',
      widget: 'hidden',
    },
    address: {
      type: 'object',
      description: 'Address',
      properties: {
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
      initialView: 'collapsed',
      minOccurs: 3,
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
    }
  },
};
