import {PropSimpleViewState} from 'src/app/prop-simple/prop-simple-view-state';
import {SFPropSimple} from 'src/app/schema-types';
import {PropArrayViewState} from 'src/app/prop-array/prop-array-view-state';
import {PropComplexViewState} from 'src/app/prop-complex/prop-complex-view-state';

export function getOrCreateViewState(parentViewState, propPath: Array<string | number>): any {
  let viewState = parentViewState;
  let schema = parentViewState.schema;

  propPath.forEach(prop => {
    switch (schema.type) {
      case 'array':
        schema = schema.items;
        break;
      case 'object':
        schema = schema.properties[prop];
        break;
      default:
        throw new Error('Intermediate schema is not valid: ' + JSON.stringify(schema));
    }

    const existingViewState = viewState.getViewState(prop);

    if (existingViewState) {
      viewState = existingViewState;
    } else {
      switch (schema.type) {
        case 'array':
          viewState = viewState.addViewState(prop, new PropArrayViewState(schema));
          break;
        case 'object':
          viewState = viewState.addViewState(prop, new PropComplexViewState(schema));
          break;
        default:
          viewState = viewState.addViewState(prop, new PropSimpleViewState(schema as SFPropSimple));
          break;
      }
    }
  });

  return viewState;
}
