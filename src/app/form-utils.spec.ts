import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {collectModel} from './form-utils';

describe('form utils', () => {

  it('should collect and collapse empty model',  () => {
    const form = new FormGroup({
      undefinedValue: new FormControl(undefined),
      nullValue: new FormControl(null),
      emptyArray: new FormArray([]),
      emptyComplex: new FormGroup({}),
    });

    expect(collectModel(form, {
      type: 'object',
      properties: {
        undefinedValue: {type: 'number'},
        nullValue: {type: 'number'},
        emptyArray: {
          type: 'array',
          items: {type: 'number'},
        },
        emptyComplex: {
          type: 'object',
          properties: {
            foo: {type: 'number'},
          }

        }
      }
    }, true)).toBe(null);
  });

  it('should collect without collapse empty model',  () => {
    const form = new FormGroup({
      undefinedValue: new FormControl(undefined),
      nullValue: new FormControl(null),
      emptyArray: new FormArray([]),
      emptyComplex: new FormGroup({}),
    });

    expect(collectModel(form, {
      type: 'object',
      properties: {
        undefinedValue: {type: 'number'},
        nullValue: {type: 'number'},
        emptyArray: {
          type: 'array',
          items: {type: 'number'},
        },
        emptyComplex: {
          type: 'object',
          properties: {
            foo: {type: 'number'},
          }

        }
      }
    }, false)).toEqual({
      undefinedValue: null,
      nullValue: null,
      emptyArray: null,
      emptyComplex: null,
    });
  });

  it('should collect and collapse filled model',  () => {
    const form = new FormGroup({
      definedValue: new FormControl(0),
      undefinedValue: new FormControl(undefined),
      nullValue: new FormControl(null),
      emptyArray: new FormArray([]),
      filledArray: new FormArray([
        new FormControl(undefined),
        new FormControl(null),
        new FormControl(0),
      ]),
      emptyComplex: new FormGroup({}),
      filledComplex: new FormGroup({
        foo: new FormControl(undefined),
        bar: new FormControl(null),
        bazz: new FormControl(0),
      }),
    });

    expect(collectModel(form, {
      type: 'object',
      properties: {
        definedValue: {type: 'number'},
        undefinedValue: {type: 'number'},
        nullValue: {type: 'number'},
        emptyArray: {
          type: 'array',
          items: {type: 'number'},
        },
        filledArray: {
          type: 'array',
          items: {type: 'number'},
        },
        emptyComplex: {
          type: 'object',
          properties: {
            foo: {type: 'number'},
          }
        },
        filledComplex: {
          type: 'object',
          properties: {
            foo: {type: 'number'},
            bar: {type: 'number'},
            bazz: {type: 'number'},
          }
        }
      }
    }, true)).toEqual({
      definedValue: 0,
      filledArray: [0],
      filledComplex: {
        bazz: 0,
      }
    });
  });

  it('should collect without collapse filled model',  () => {
    const form = new FormGroup({
      definedValue: new FormControl(0),
      undefinedValue: new FormControl(undefined),
      nullValue: new FormControl(null),
      emptyArray: new FormArray([]),
      filledArray: new FormArray([
        new FormControl(undefined),
        new FormControl(null),
        new FormControl(0),
      ]),
      emptyComplex: new FormGroup({}),
      filledComplex: new FormGroup({
        foo: new FormControl(undefined),
        bar: new FormControl(null),
        bazz: new FormControl(0),
      }),
    });

    expect(collectModel(form, {
      type: 'object',
      properties: {
        definedValue: {type: 'number'},
        undefinedValue: {type: 'number'},
        nullValue: {type: 'number'},
        emptyArray: {
          type: 'array',
          items: {type: 'number'},
        },
        filledArray: {
          type: 'array',
          items: {type: 'number'},
        },
        emptyComplex: {
          type: 'object',
          properties: {
            foo: {type: 'number'},
          }
        },
        filledComplex: {
          type: 'object',
          properties: {
            foo: {type: 'number'},
            bar: {type: 'number'},
            bazz: {type: 'number'},
          }
        }
      }
    }, false)).toEqual({
      definedValue: 0,
      undefinedValue: null,
      nullValue: null,
      emptyArray: null,
      filledArray: [0],
      emptyComplex: null,
      filledComplex: {
        foo: null,
        bar: null,
        bazz: 0,
      }
    });
  });
});
