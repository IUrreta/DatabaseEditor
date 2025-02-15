import { TypeNotImplementedError } from './index';

class Factory {
  constructor() {
    this.Properties = {}
    this.Arrays = {}
  }
  create(obj) {
    let type = obj.Type

    if (this.Properties[type] === undefined)
      throw new TypeNotImplementedError(type);

    return this.Properties[type].from(obj);
  }
  createArray(obj) {
    let type = obj.Type

    if (this.Arrays[type] === undefined)
      throw new TypeNotImplementedError(type);

    return this.Arrays[type].from(obj);
  }
}

export const PropertyFactory = new Factory();