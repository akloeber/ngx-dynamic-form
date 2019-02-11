import {getOrCreateViewState} from 'src/app/view-state-accessor';
import {PropSimpleViewState} from 'src/app/prop-simple/prop-simple-view-state';
import {PropComplexViewState} from 'src/app/prop-complex/prop-complex-view-state';
import {PropArrayViewState} from 'src/app/prop-array/prop-array-view-state';
import {SFPropArray, SFPropComplex, SFPropSimple} from 'src/app/schema-types';

describe('view state accessor', () => {

  it('should create view state for simple prop', () => {
    const parentSchema = {
      type: 'object',
      properties: {
        foo: {
          type: 'number',
        }
      }
    };
    const parentViewState = new PropComplexViewState(parentSchema as SFPropComplex);
    const expectedViewState = new PropSimpleViewState(parentSchema.properties.foo as SFPropSimple);

    expect(
      getOrCreateViewState(parentViewState, ['foo'])
    ).toEqual(expectedViewState);

    expect(parentViewState).toEqual(new PropComplexViewState(parentSchema as SFPropComplex, {
      foo: expectedViewState,
    }));
  });

  it('should create view state for complex prop', () => {
    const parentSchema = {
      type: 'object',
      properties: {
        foo: {
          type: 'object',
          properties: {},
        }
      }
    };
    const parentViewState = new PropComplexViewState(parentSchema as SFPropComplex);
    const expectedViewState = new PropComplexViewState(parentSchema.properties.foo as SFPropComplex);

    expect(
      getOrCreateViewState(parentViewState, ['foo'])
    ).toEqual(expectedViewState);

    expect(parentViewState).toEqual(new PropComplexViewState(parentSchema as SFPropComplex, {
      foo: expectedViewState,
    }));
  });

  it('should create view state for array prop', () => {
    const parentSchema = {
      type: 'object',
      properties: {
        foo: {
          type: 'array',
          items: {
            type: 'number'
          },
        }
      }
    };
    const parentViewState = new PropComplexViewState(parentSchema as SFPropComplex);
    const expectedViewState = new PropArrayViewState(parentSchema.properties.foo as SFPropArray);

    expect(
      getOrCreateViewState(parentViewState, ['foo'])
    ).toEqual(expectedViewState);

    expect(parentViewState).toEqual(new PropComplexViewState(parentSchema as SFPropComplex, {
      foo: expectedViewState,
    }));
  });

  it('should throw error if intermediate schema is invalid', () => {
    expect(
      () => getOrCreateViewState(new PropSimpleViewState( {type: 'number'}), ['foo'])
    ).toThrow(new Error('Intermediate schema is not valid: {"type":"number"}'));
  });

  it('should create intermediate view states', () => {
    const parentSchema = {
      type: 'object',
      properties: {
        foo: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              bar: {
                type: 'number'
              }
            }
          },
        }
      }
    };
    const parentViewState = new PropComplexViewState(parentSchema as SFPropComplex);
    const expectedViewState = new PropSimpleViewState({type: 'number'});

    expect(
      getOrCreateViewState(parentViewState, ['foo', 0, 'bar'])
    ).toEqual(expectedViewState);

    expect(parentViewState).toEqual(new PropComplexViewState(parentSchema as SFPropComplex, {
      foo: new PropArrayViewState(parentSchema.properties.foo as SFPropArray, [
        new PropComplexViewState(parentSchema.properties.foo.items as SFPropComplex, {
          bar: expectedViewState,
        })
      ]),
    }));
  });

  it('should get existing view state', () => {
    const parentSchema = {
      type: 'object',
      properties: {
        foo: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              bar: {
                type: 'number'
              }
            }
          },
        }
      }
    };
    const leafViewState = new PropSimpleViewState(parentSchema.properties.foo.items.properties.bar as SFPropSimple, true);

    const parentViewState = new PropComplexViewState(parentSchema as SFPropComplex, {
      foo: new PropArrayViewState(parentSchema.properties.foo as SFPropArray, [
        new PropComplexViewState(parentSchema.properties.foo.items as SFPropComplex, {
          bar: leafViewState,
        })
      ]),
    });

    expect(
      getOrCreateViewState(parentViewState, ['foo', 0, 'bar'])
    ).toBe(leafViewState);

    expect(parentViewState).toEqual(new PropComplexViewState(parentSchema as SFPropComplex, {
      foo: new PropArrayViewState(parentSchema.properties.foo as SFPropArray, [
        new PropComplexViewState(parentSchema.properties.foo.items as SFPropComplex, {
          bar: leafViewState,
        })
      ]),
    }));
  });

  it('should extend existing complex view state', () => {
    const parentSchema = {
      type: 'object',
      properties: {
        foo: {
          type: 'object',
          properties: {
            bar: {
              type: 'number'
            },
            bazz: {
              type: 'string'
            }
          }
        }
      }
    };
    const parentViewState = new PropComplexViewState(parentSchema as SFPropComplex, {
      foo: new PropComplexViewState(parentSchema.properties.foo as SFPropComplex, {
        bar: new PropSimpleViewState(parentSchema.properties.foo.properties.bar as SFPropSimple, true),
      })
    });

    expect(
      getOrCreateViewState(parentViewState, ['foo', 'bazz'])
    ).toEqual(new PropSimpleViewState(parentSchema.properties.foo.properties.bazz as SFPropSimple));

    expect(parentViewState).toEqual(new PropComplexViewState(parentSchema as SFPropComplex, {
      foo: new PropComplexViewState(parentSchema.properties.foo as SFPropComplex, {
        bar: new PropSimpleViewState(parentSchema.properties.foo.properties.bar as SFPropSimple, true),
        bazz: new PropSimpleViewState(parentSchema.properties.foo.properties.bazz as SFPropSimple),
      })
    }));
  });

  it('should extend existing array view state', () => {
    const parentSchema = {
      type: 'object',
      properties: {
        foo: {
          type: 'array',
          items: {
            type: 'number'
          }
        }
      }
    };
    const parentViewState = new PropComplexViewState(parentSchema as SFPropComplex, {
      foo: new PropArrayViewState(parentSchema.properties.foo as SFPropArray, [
        new PropSimpleViewState(parentSchema.properties.foo.items as SFPropSimple, true)
      ])
    });

    expect(
      getOrCreateViewState(parentViewState, ['foo', 1])
    ).toEqual(new PropSimpleViewState(parentSchema.properties.foo.items as SFPropSimple));

    expect(parentViewState).toEqual(new PropComplexViewState(parentSchema as SFPropComplex, {
      foo: new PropArrayViewState(parentSchema.properties.foo as SFPropArray, [
        new PropSimpleViewState(parentSchema.properties.foo.items as SFPropSimple, true),
        new PropSimpleViewState(parentSchema.properties.foo.items as SFPropSimple),
      ])
    }));
  });

});
