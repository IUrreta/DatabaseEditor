import {IntArray, SoftObjectArray, StructArray} from './arrays'
import {PropertyFactory} from './factories';
import {
    ArrayProperty,
    BoolProperty,
    EnumProperty,
    FloatProperty,
    Guid,
    Int16Property,
    Int64Property,
    Int8Property,
    IntProperty,
    UInt32Property,
    ObjectProperty,
    SoftObjectProperty,
    StrProperty,
    StructProperty,
    Tuple
} from './properties'

PropertyFactory.Properties['ArrayProperty'] = ArrayProperty;
PropertyFactory.Properties['BoolProperty'] = BoolProperty;
PropertyFactory.Properties['EnumProperty'] = EnumProperty;
PropertyFactory.Properties['FloatProperty'] = FloatProperty;
PropertyFactory.Properties['IntProperty'] = IntProperty;
PropertyFactory.Properties['UInt32Property'] = UInt32Property;
PropertyFactory.Properties['Int64Property'] = Int64Property;
PropertyFactory.Properties['UInt64Property'] = Int64Property;
PropertyFactory.Properties['Int8Property'] = Int8Property;
PropertyFactory.Properties['Int16Property'] = Int16Property;
PropertyFactory.Properties['ObjectProperty'] = ObjectProperty;
PropertyFactory.Properties['SoftObjectProperty'] = SoftObjectProperty;
PropertyFactory.Properties['StrProperty'] = StrProperty;
PropertyFactory.Properties['StructProperty'] = StructProperty;
PropertyFactory.Properties['Tuple'] = Tuple;
PropertyFactory.Properties['Guid'] = Guid;
PropertyFactory.Arrays['IntArray'] = IntArray;
PropertyFactory.Arrays['SoftObjectArray'] = SoftObjectArray;
PropertyFactory.Arrays['StructProperty'] = StructArray;
PropertyFactory.Arrays['IntProperty'] = IntArray;
PropertyFactory.Arrays['IntProperty'] = IntArray;
PropertyFactory.Arrays['SoftObjectProperty'] = SoftObjectArray;

export { PropertyFactory }
export { Gvas } from './Gvas'
export { GvasHeader } from './GvasHeader'
export { Serializer } from './Serializer'
export * from './PropertyErrors'
export * from './properties'
export * from './arrays'
